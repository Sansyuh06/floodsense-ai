from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="FloodSense AI Cortex")

class TranslationRequest(BaseModel):
    text: str
    target_lang: str

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "AI Cortex NLP & Hydrology"}

@app.post("/translate/mock")
def translate_mock(req: TranslationRequest):
    # Mocking Bulbul AI behavior for translated alerts
    return {
        "original": req.text,
        "translated": f"[Mock {req.target_lang}] Translated: {req.text}",
        "language": req.target_lang
    }

@app.post("/hydrology/predict")
def predict_runoff(rainfall: float, elevation: float, soil_moisture: float):
    # Dummy physics-informed inference mock
    risk_score = (rainfall * 0.8) + (soil_moisture * 0.4) - (elevation * 0.1)
    status = "High Risk" if risk_score > 5.0 else "Low Risk"
    return {
        "risk_score": round(risk_score, 2),
        "classification": status,
        "recommendation": "Evacuate" if risk_score > 5.0 else "Monitor"
    }
