"""
Weather Service — fetches real-time rainfall, soil moisture, temperature
from Open-Meteo API (free, no API key needed).

Includes retry logic, in-memory caching, and graceful fallback for
network failures (DNS resolution, timeouts, etc.).
"""
import httpx
import asyncio
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

OPEN_METEO_BASE = "https://api.open-meteo.com/v1"

# ─── In-memory cache (survives network outages) ─────────
_weather_cache: dict[str, dict] = {}
_discharge_cache: dict[str, dict] = {}
CACHE_TTL_SECONDS = 300  # 5 minutes


def _cache_key(lat: float, lon: float) -> str:
    return f"{round(lat, 2)},{round(lon, 2)}"


def _is_cache_valid(cached: Optional[dict]) -> bool:
    if not cached:
        return False
    ts = cached.get("_cached_at")
    if not ts:
        return False
    age = (datetime.now() - datetime.fromisoformat(ts)).total_seconds()
    return age < CACHE_TTL_SECONDS


async def _fetch_with_retry(client: httpx.AsyncClient, url: str, params: dict, retries: int = 3) -> dict:
    """Fetch URL with exponential backoff retry."""
    last_error = None
    for attempt in range(retries):
        try:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            return resp.json()
        except (httpx.ConnectError, httpx.TimeoutException, httpx.HTTPStatusError) as e:
            last_error = e
            if attempt < retries - 1:
                wait = (2 ** attempt) * 0.5  # 0.5s, 1s, 2s
                logger.warning(f"Retry {attempt + 1}/{retries} for {url} after {wait}s: {e}")
                await asyncio.sleep(wait)
    raise last_error  # type: ignore


async def get_current_weather(lat: float, lon: float) -> dict:
    """Fetch current weather + hourly forecast for a location.
    Falls back to cached data or defaults on network failure."""
    key = _cache_key(lat, lon)

    try:
        url = f"{OPEN_METEO_BASE}/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m",
            "hourly": "precipitation,soil_moisture_0_to_1cm,temperature_2m",
            "daily": "precipitation_sum,rain_sum",
            "timezone": "Asia/Kolkata",
            "forecast_days": 3,
            "past_days": 7,
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            data = await _fetch_with_retry(client, url, params)

        current = data.get("current", {})
        hourly = data.get("hourly", {})
        daily = data.get("daily", {})

        precip_hourly = hourly.get("precipitation", [])
        soil_moisture_hourly = hourly.get("soil_moisture_0_to_1cm", [])

        # Past 24h rainfall (7 past days * 24 = 168 past hours, + 3 forecast days * 24 = 72)
        total_hours = len(precip_hourly)
        now_idx = total_hours - 72  # end of past data
        past_24h = precip_hourly[max(0, now_idx - 24):now_idx] if now_idx > 0 else []
        rainfall_24h = sum(p for p in past_24h if p is not None)

        past_7d = precip_hourly[max(0, now_idx - 168):now_idx] if now_idx > 0 else []
        rainfall_7d = sum(p for p in past_7d if p is not None)

        valid_sm = [s for s in soil_moisture_hourly if s is not None]
        soil_moisture = valid_sm[-1] if valid_sm else 0.0

        result = {
            "lat": lat,
            "lon": lon,
            "temperature": current.get("temperature_2m", 0),
            "humidity": current.get("relative_humidity_2m", 0),
            "current_precipitation": current.get("precipitation", 0),
            "current_rain": current.get("rain", 0),
            "wind_speed": current.get("wind_speed_10m", 0),
            "weather_code": current.get("weather_code", 0),
            "rainfall_24h": round(rainfall_24h, 1),
            "rainfall_7d": round(rainfall_7d, 1),
            "soil_moisture": round(soil_moisture, 4),
            "daily_precipitation": daily.get("precipitation_sum", []),
            "daily_dates": daily.get("time", []),
            "source": "Open-Meteo",
            "timestamp": datetime.now().isoformat(),
        }

        # Cache successful result
        result["_cached_at"] = datetime.now().isoformat()
        _weather_cache[key] = result
        return result

    except Exception as e:
        logger.warning(f"Weather fetch failed for ({lat},{lon}): {e}")

        # Try cached data
        cached = _weather_cache.get(key)
        if cached:
            logger.info(f"Using cached weather for ({lat},{lon})")
            cached_copy = {**cached, "source": "Open-Meteo (cached)"}
            cached_copy.pop("_cached_at", None)
            return cached_copy

        # Return safe defaults so prediction can still work
        logger.warning(f"No cache available for ({lat},{lon}), using defaults")
        return {
            "lat": lat,
            "lon": lon,
            "temperature": 28.0,
            "humidity": 70,
            "current_precipitation": 0,
            "current_rain": 0,
            "wind_speed": 5.0,
            "weather_code": 0,
            "rainfall_24h": 0.0,
            "rainfall_7d": 0.0,
            "soil_moisture": 0.2,
            "daily_precipitation": [],
            "daily_dates": [],
            "source": "unavailable",
            "timestamp": datetime.now().isoformat(),
            "error": str(e),
        }


async def get_river_discharge(lat: float, lon: float) -> dict:
    """Fetch river discharge data from Open-Meteo Flood API.
    Falls back to cached data or defaults on network failure."""
    key = _cache_key(lat, lon)

    try:
        url = "https://flood-api.open-meteo.com/v1/flood"
        params = {
            "latitude": lat,
            "longitude": lon,
            "daily": "river_discharge",
            "past_days": 7,
            "forecast_days": 3,
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            data = await _fetch_with_retry(client, url, params)

        daily = data.get("daily", {})
        discharges = daily.get("river_discharge", [])
        dates = daily.get("time", [])
        valid = [d for d in discharges if d is not None]

        result = {
            "lat": lat,
            "lon": lon,
            "current_discharge": valid[-1] if valid else 0.0,
            "max_discharge_7d": max(valid) if valid else 0.0,
            "avg_discharge_7d": round(sum(valid) / len(valid), 2) if valid else 0.0,
            "discharge_trend": discharges,
            "dates": dates,
            "source": "Open-Meteo Flood API",
        }

        # Cache successful result
        result["_cached_at"] = datetime.now().isoformat()
        _discharge_cache[key] = result
        return result

    except Exception as e:
        logger.warning(f"Discharge fetch failed for ({lat},{lon}): {e}")

        # Try cached data
        cached = _discharge_cache.get(key)
        if cached:
            logger.info(f"Using cached discharge for ({lat},{lon})")
            cached_copy = {**cached, "source": "Open-Meteo Flood API (cached)"}
            cached_copy.pop("_cached_at", None)
            return cached_copy

        return {
            "lat": lat, "lon": lon,
            "current_discharge": 0.0, "max_discharge_7d": 0.0,
            "avg_discharge_7d": 0.0, "discharge_trend": [], "dates": [],
            "source": "unavailable", "error": str(e),
        }
