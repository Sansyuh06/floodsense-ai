"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { UserRole } from "@/components/AuthPage";

const AuthPage = dynamic(() => import("@/components/AuthPage"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
        <p className="mt-3 text-sm text-slate-500 font-mono">Loading...</p>
      </div>
    </div>
  ),
});

const CitizenDashboard = dynamic(() => import("@/components/CitizenDashboard"), {
  ssr: false,
});

const MapDashboard = dynamic(() => import("@/components/MapDashboard"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
        <p className="mt-4 text-lg text-slate-400 font-mono">
          Loading NDRF Command Station...
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const handleLogout = () => setUserRole(null);

  if (!userRole) {
    return <AuthPage onLogin={(role: UserRole) => setUserRole(role)} />;
  }

  if (userRole === "citizen") {
    return <CitizenDashboard onLogout={handleLogout} />;
  }

  return (
    <main className="w-full h-screen overflow-hidden bg-black">
      <MapDashboard onLogout={handleLogout} />
    </main>
  );
}
