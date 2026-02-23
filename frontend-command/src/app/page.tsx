"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { STATES_DATA, type StateData, type DistrictData } from "@/data/statesData";
import { ChevronRight, MapPin, Radio, Shield } from "lucide-react";
import type { UserRole } from "@/components/AuthPage";

const AuthPage = dynamic(() => import("@/components/AuthPage"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-[#f5f5f0]">
      <div className="text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#1a237e] border-t-transparent" />
        <p className="mt-3 text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  ),
});

const CitizenDashboard = dynamic(() => import("@/components/CitizenDashboard"), { ssr: false });

const MapDashboard = dynamic(() => import("@/components/MapDashboard"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-[#f5f5f0]">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#1a237e] border-t-transparent" />
        <p className="mt-4 text-base text-gray-500">Loading NDRF Command Station...</p>
      </div>
    </div>
  ),
});

// ─── LOCATION SELECTOR ───
function LocationSelector({ onSelect }: { onSelect: (state: StateData, district: DistrictData) => void }) {
  const [selectedState, setSelectedState] = useState<StateData | null>(null);

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <div className="w-full">
        <div className="flex h-1"><div className="flex-1" style={{ backgroundColor: '#FF9933' }} /><div className="flex-1 bg-white" /><div className="flex-1" style={{ backgroundColor: '#138808' }} /></div>
        <div className="bg-[#1a237e] text-white px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <h1 className="text-sm font-bold">FloodSense AI</h1>
              <p className="text-[10px] text-blue-200">NDRF · Ministry of Home Affairs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {!selectedState ? (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#1a237e]/10 mb-3">
                <MapPin className="w-7 h-7 text-[#1a237e]" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Select Your State</h2>
              <p className="text-sm text-gray-500 mt-1">Choose your state to receive personalized flood alerts and forecasts</p>
            </div>

            {/* SIM Location Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-600" />
              <div className="text-[11px] text-blue-700">
                <strong>SIM / Cell Tower Detection:</strong> Your approximate location is being detected via mobile network triangulation (like &quot;Where is my Train&quot;).
              </div>
            </div>

            <div className="space-y-2">
              {STATES_DATA.map(state => {
                const highCount = state.districts.filter(d => d.riskLevel === "HIGH").length;
                return (
                  <button key={state.code} onClick={() => setSelectedState(state)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-[#1a237e] transition-all group flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-sm font-bold text-[#1a237e]">{state.code}</div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-800 group-hover:text-[#1a237e]">{state.name}</h3>
                        <p className="text-[10px] text-gray-400">{state.districts.length} districts monitored</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {highCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 border border-red-200">
                          {highCount} High Risk
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1a237e]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#1a237e]/10 mb-3">
                <Shield className="w-7 h-7 text-[#1a237e]" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Select Your District</h2>
              <p className="text-sm text-gray-500 mt-1">{selectedState.name} — {selectedState.districts.length} districts</p>
            </div>

            <button onClick={() => setSelectedState(null)} className="text-[11px] text-[#1a237e] font-bold mb-3 hover:underline">
              ← Change State
            </button>

            <div className="space-y-2">
              {selectedState.districts.map(district => (
                <button key={district.name} onClick={() => onSelect(selectedState, district)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-[#1a237e] transition-all group flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 group-hover:text-[#1a237e]">{district.name}</h3>
                    <div className="flex gap-3 text-[10px] text-gray-400 mt-0.5">
                      <span>Pop: {(district.population / 100000).toFixed(1)}L</span>
                      <span>Rain: {district.rainfall}mm</span>
                      <span>Shelters: {district.shelters}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${district.riskLevel === "HIGH" ? "bg-red-100 text-red-600 border-red-200" :
                        district.riskLevel === "MODERATE" ? "bg-yellow-100 text-yellow-600 border-yellow-200" :
                          "bg-green-100 text-green-600 border-green-200"
                      }`}>
                      {district.riskLevel}
                    </span>
                    <span className="text-xs font-bold text-gray-500">{district.riskScore}/10</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function Home() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userLocation, setUserLocation] = useState<{ state: StateData; district: DistrictData } | null>(null);

  const handleLogout = () => { setUserRole(null); setUserLocation(null); };

  // Step 1: Auth
  if(!userRole) {
    return <AuthPage onLogin={(role: UserRole) => setUserRole(role)} />;
  }

  // Step 2: Location selection (citizen only)
  if(userRole === "citizen" && !userLocation) {
    return <LocationSelector onSelect={(state, district) => setUserLocation({ state, district })} />;
  }

  // Step 3: Citizen Dashboard with personalized location
  if(userRole === "citizen" && userLocation) {
    return <CitizenDashboard onLogout={handleLogout} userState={userLocation.state} userDistrict={userLocation.district} />;
  }

  // Authority dashboard
  return (
    <main className="w-full h-screen overflow-hidden bg-white">
      <MapDashboard onLogout={handleLogout} />
    </main>
  );
}
