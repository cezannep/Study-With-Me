"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  DashboardProvider, 
  useDashboardState, 
  useDashboardActions 
} from "@/context/DashboardContext";
import { Award, AlertTriangle, ArrowLeft } from "lucide-react";

function AdminLoginContent() {
  const router = useRouter();
  const {
    user,
    authLoading,
    isAdminMode,
    adminUsername,
    adminPassword,
    adminLoginError,
    firebaseError
  } = useDashboardState();

  const {
    handleLogin,
    handleAdminLogin,
    setAdminUsername,
    setAdminPassword,
    handleLogout
  } = useDashboardActions();

  // If login succeeds and isAdminMode becomes true, redirect to /admin-dashboard
  useEffect(() => {
    if (isAdminMode) {
      router.push("/admin-dashboard");
    }
  }, [isAdminMode, router]);

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary animate-spin" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse font-sans">Checking authorization...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-foreground p-6 relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      
      <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 shadow-2xl flex flex-col gap-6 text-center animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm mb-2 animate-bounce">
            <Award className="w-6 h-6 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-sans text-white uppercase">Admin Portal</h1>
          <p className="text-xs text-zinc-400 font-sans">
            Secure administrative login for student roadmaps
          </p>
        </div>

        <div className="flex flex-col gap-4 text-left">
          {/* Step 1: Firebase Auth */}
          {!user ? (
            <div className="p-4 bg-zinc-955 border border-zinc-850 space-y-3">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block font-sans">Step 1: Database Authentication</span>
              {firebaseError && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2 font-sans mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{firebaseError}</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold transition-colors cursor-pointer border-0 rounded-none font-sans"
              >
                Sign in with Google ID
              </button>
            </div>
          ) : (
            <div className="p-4 bg-zinc-955 border border-zinc-850 space-y-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block font-sans">Step 1: Database Authentication</span>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-zinc-300 font-sans truncate">
                  Authenticated: <span className="text-white font-semibold">{user.email}</span>
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider border-0 bg-transparent cursor-pointer font-sans shrink-0"
                >
                  Switch Account
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Admin Password */}
          <form onSubmit={handleAdminLogin} className={`space-y-4 ${!user ? "opacity-40 pointer-events-none" : ""}`}>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1 font-sans">Step 2: Admin Credentials</span>
            
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1 font-sans">Username</label>
              <input
                type="text"
                disabled={!user}
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-primary font-sans"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1 font-sans">Password</label>
              <input
                type="password"
                disabled={!user}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-primary font-sans"
                required
              />
            </div>

            {adminLoginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2 font-sans">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!user}
              className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer border-0 rounded-none font-sans disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Login as Admin
            </button>
          </form>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full flex items-center justify-center gap-1.5 mt-2 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors bg-transparent border-0 cursor-pointer font-sans"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <DashboardProvider>
      <AdminLoginContent />
    </DashboardProvider>
  );
}
