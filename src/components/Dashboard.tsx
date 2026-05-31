"use client";

import React from "react";
import { 
  DashboardProvider, 
  useDashboardState, 
  useDashboardActions 
} from "@/context/DashboardContext";
import { Award, AlertTriangle } from "lucide-react";
import Header from "./dashboard/Header";
import RoadmapSidebar from "./dashboard/RoadmapSidebar";
import TimerSection from "./dashboard/TimerSection";
import PlannerSection from "./dashboard/PlannerSection";
import CalculatorsSection from "./dashboard/CalculatorsSection";
import ModalsContainer from "./dashboard/ModalsContainer";
import AdminPanel from "./dashboard/admin/AdminPanel";

interface StaticRowProps {
  word: string;
}

function StaticRow({ word }: StaticRowProps) {
  // Render exactly 2 repetitions of the word to fill the screen
  const repeatedText = Array(2).fill(word);
  return (
    <div className="w-full overflow-hidden flex whitespace-nowrap justify-start sm:justify-center">
      <div className="flex shrink-0 gap-4 sm:gap-6 md:gap-12">
        {repeatedText.map((w, idx) => (
          <span 
            key={idx}
            className="font-sans font-black text-4xl sm:text-6xl md:text-8xl lg:text-9xl tracking-tighter uppercase select-none"
            style={{ color: "#ffffff" }}
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

function DashboardContent({ initialAdminLoginOpen = false }: { initialAdminLoginOpen?: boolean }) {
  const {
    isMounted,
    authLoading,
    isAdminLoginOpen,
    isAdminMode,
    user,
    firebaseError,
    adminUsername,
    adminPassword,
    adminLoginError,
    isSidebarOpen,
    activeSection,
    selectedDayId,
    adminComments
  } = useDashboardState();

  const {
    handleLogin,
    handleAdminLogin,
    setAdminUsername,
    setAdminPassword,
    setIsAdminLoginOpen,
    setAdminLoginError,
    setIsSidebarOpen,
    handleLogout
  } = useDashboardActions();

  if (!isMounted) {
    return null;
  }

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary animate-spin" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse font-sans">Loading Planner...</h2>
        </div>
      </div>
    );
  }

  if (isAdminLoginOpen && !isAdminMode) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-foreground p-6 relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        
        <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 shadow-2xl flex flex-col gap-6 text-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm mb-2">
              <Award className="w-6 h-6 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-sans text-white uppercase">Admin Portal</h1>
            <p className="text-xs text-zinc-400 font-sans">
              Sign in with sunuhacker@gmail.com first, then enter admin credentials.
            </p>
          </div>

          <div className="flex flex-col gap-4 text-left">
            {/* Step 1: Firebase Auth */}
            {!user ? (
              <div className="p-4 bg-zinc-955 border border-zinc-850 space-y-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block font-sans">Step 1: Database Authentication</span>
                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold transition-colors cursor-pointer border-0 rounded-none font-sans"
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

            {!initialAdminLoginOpen && (
              <button
                type="button"
                onClick={() => {
                  setIsAdminLoginOpen(false);
                  setAdminLoginError(null);
                }}
                className="w-full py-2.5 px-4 bg-zinc-900 border border-zinc-800 text-zinc-450 font-semibold hover:bg-zinc-850 hover:text-white transition-colors cursor-pointer text-xs rounded-none font-sans text-center"
              >
                Back to Student Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!user && !isAdminMode) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-foreground p-6 relative overflow-hidden">
        {/* Repeating Static Text Background (STUDY WITH ME) */}
        <div className="absolute inset-0 flex flex-col justify-between py-6 md:py-12 opacity-15 select-none pointer-events-none overflow-hidden">
          <StaticRow word="STUDY WITH ME" />
          <StaticRow word="STUDY WITH ME" />
          <StaticRow word="STUDY WITH ME" />
          <StaticRow word="STUDY WITH ME" />
          <StaticRow word="STUDY WITH ME" />
          <StaticRow word="STUDY WITH ME" />
          <StaticRow word="STUDY WITH ME" />
          <StaticRow word="STUDY WITH ME" />
        </div>
        
        <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 shadow-2xl flex flex-col gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight font-sans text-white uppercase">Study With Me</h1>
            <p className="text-xs text-zinc-400">
              Sync your study plans and track progress across devices. Please sign in to continue.
            </p>
          </div>

          <div className="border-t border-zinc-800 my-1" />

          {firebaseError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{firebaseError}</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-zinc-950 font-bold hover:bg-zinc-100 transition-colors shadow-sm cursor-pointer border-0 rounded-none"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  style={{ fill: "#4285F4" }}
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  style={{ fill: "#34A853" }}
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  style={{ fill: "#FBBC05" }}
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  style={{ fill: "#EA4335" }}
                />
              </svg>
              <span>Sign in with Google ID</span>
            </button>
          </div>

          <div className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase">
            Secured by Firebase Authentication
          </div>
        </div>
      </div>
    );
  }

  if (isAdminMode) {
    return <AdminPanel />;
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground transition-colors duration-300 overflow-hidden">
      <Header />
      <div className="flex-1 flex relative overflow-hidden">
        {isSidebarOpen && activeSection === "workspace" && (
          <div 
            className="lg:hidden fixed inset-0 z-20 bg-black/45 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <RoadmapSidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 w-full">
          <div className="max-w-[760px] mx-auto space-y-6 w-full animate-in fade-in duration-200">
            {selectedDayId === "calculators" ? (
              <CalculatorsSection />
            ) : (
              <>
                {adminComments && (
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-foreground space-y-2 relative overflow-hidden animate-in slide-in-from-top duration-300">
                    <div className="relative z-10 flex items-start gap-3">
                      <div className="p-2 bg-primary/10 border border-primary/20 text-primary rounded-lg shrink-0">
                        <Award className="w-5 h-5 text-amber-500 animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary font-sans">
                          Feedback from Mentor
                        </h4>
                        <p className="text-xs text-foreground/90 mt-1 leading-relaxed font-sans whitespace-pre-wrap">
                          {adminComments}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <TimerSection />
                <PlannerSection />
              </>
            )}
          </div>
        </main>
      </div>
      <ModalsContainer />
    </div>
  );
}

interface DashboardProps {
  initialAdminLoginOpen?: boolean;
}

export default function Dashboard({ initialAdminLoginOpen = false }: DashboardProps = {}) {
  return (
    <DashboardProvider initialAdminLoginOpen={initialAdminLoginOpen}>
      <DashboardContent initialAdminLoginOpen={initialAdminLoginOpen} />
    </DashboardProvider>
  );
}
