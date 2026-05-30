"use client";

import React from "react";
import { useDashboardState, useDashboardActions } from "@/context/DashboardContext";
import { Sun, Moon, ChevronDown, LogOut, Menu, X } from "lucide-react";

export default function Header() {
  const {
    isMobile,
    isSidebarOpen,
    isRoadmapCollapsed,
    progressPercent,
    completedCount,
    totalSlots,
    user,
    isProfileDropdownOpen,
    progress,
    activeSection
  } = useDashboardState();

  const {
    setIsSidebarOpen,
    setIsRoadmapCollapsed,
    setIsProfileDropdownOpen,
    toggleTheme,
    handleLogout,
    profileDropdownRef
  } = useDashboardActions();

  return (
    <header className="relative z-40 shrink-0 w-full glass-panel border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {activeSection === "workspace" && (
          <button 
            onClick={() => {
              if (isMobile) {
                setIsSidebarOpen(!isSidebarOpen);
              } else {
                setIsRoadmapCollapsed(!isRoadmapCollapsed);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
            title={isRoadmapCollapsed ? "Expand Roadmap" : "Collapse Roadmap"}
          >
            <span className="lg:hidden">
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </span>
            <span className="hidden lg:inline-block">
              <Menu className="w-5 h-5" />
            </span>
          </button>
        )}
        
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <svg 
              className="w-4.5 h-4.5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              <circle cx="12" cy="7" r="2.5" className="fill-primary/20" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight font-sans text-foreground">Study With Me</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest hidden sm:block">Roadmap Planner</p>
          </div>
        </div>
      </div>

      {/* Global Progress Bar */}
      <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground font-medium">Overall Progress</span>
            <span className="text-primary font-bold">{progressPercent}% ({completedCount}/{totalSlots} Slots)</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-purple-500 transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-muted border border-border hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-200"
          title="Toggle theme"
        >
          {progress.theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-600" />}
        </button>

        {/* User Sign Out Profile Dropdown (if logged in) */}
        {user && (
          <div 
            ref={profileDropdownRef}
            className="relative"
            onMouseEnter={() => setIsProfileDropdownOpen(true)}
            onMouseLeave={() => setIsProfileDropdownOpen(false)}
          >
            {/* Trigger */}
            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg border border-border hover:bg-muted/50 transition-all duration-200 cursor-pointer select-none"
            >
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Avatar" 
                  className="w-6 h-6 border border-border shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 bg-primary/20 border border-primary/30 text-primary flex items-center justify-center text-xs font-bold font-sans rounded-md shrink-0">
                  {user.displayName ? user.displayName.charAt(0) : (user.email ? user.email.charAt(0).toUpperCase() : "U")}
                </div>
              )}
              <span className="hidden sm:inline-block text-xs font-semibold text-foreground truncate max-w-[120px]" title={user.displayName || user.email}>
                {user.displayName || user.email}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg z-50 py-1.5 origin-top-right animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Profile Info section */}
                <div className="px-3.5 py-2 border-b border-border/60">
                  <p className="text-xs font-bold text-foreground truncate">{user.displayName || "Student User"}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email}</p>
                </div>

                {/* Actions section */}
                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer font-bold justify-start"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
