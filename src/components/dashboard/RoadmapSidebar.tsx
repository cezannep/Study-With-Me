"use client";

import React from "react";
import { useDashboardState, useDashboardActions } from "@/context/DashboardContext";
import { Plus, BookOpen, ChevronRight, Trash, CheckCircle, Calculator, BarChart2 } from "lucide-react";

export default function RoadmapSidebar() {
  const {
    isSidebarOpen,
    activeSection,
    isEffectiveRoadmapCollapsed,
    activePlan,
    isPlansPanelOpen,
    plans,
    activePlanId,
    selectedDayId,
    progress,
    totalStudySeconds,
    totalBreakSeconds
  } = useDashboardState();

  const {
    setIsSidebarOpen,
    setIsAddPlanOpen,
    setIsPlansPanelOpen,
    handleSwitchPlan,
    handleDeletePlan,
    setSelectedDayId,
    setIsTimerRunning,
    setIsBreakActive,
    formatSecondsToMMSS,
    plansPanelRef
  } = useDashboardActions();

  if (activeSection !== "workspace") return null;

  return (
    <aside className={`
      fixed left-0 z-30 transform border-r border-border bg-card flex flex-col gap-4 transition-all duration-300 ease-in-out
      lg:static h-full overflow-visible shrink-0 lg:translate-x-0
      ${isSidebarOpen ? "translate-x-0 top-[57px] bottom-0 shadow-2xl border-r" : "-translate-x-full top-0 bottom-0"}
      ${isEffectiveRoadmapCollapsed ? "w-72 lg:w-20 p-4 lg:p-3 lg:items-center" : "w-72 lg:w-72 p-4 lg:flex lg:flex-col"}
    `}>
      <div className={`pb-3 border-b border-border shrink-0 relative w-full flex flex-col ${isEffectiveRoadmapCollapsed ? "items-center gap-2" : "space-y-2"}`} ref={plansPanelRef}>
        
        {/* Create New Plan Button */}
        <button
          type="button"
          onClick={() => setIsAddPlanOpen(true)}
          className={`flex items-center justify-center bg-muted/65 hover:bg-muted/90 border border-border text-foreground transition-all cursor-pointer shadow-xs ${
            isEffectiveRoadmapCollapsed 
              ? "w-10 h-10 rounded-xl mx-auto" 
              : "w-full py-1.5 px-3 rounded-lg gap-1.5 text-[10px] font-bold"
          }`}
          title={isEffectiveRoadmapCollapsed ? "Create New Study Plan" : undefined}
        >
          <Plus className="w-3.5 h-3.5" />
          {!isEffectiveRoadmapCollapsed && <span>Create New Plan</span>}
        </button>

        {/* Plan Selector Tag/Button */}
        {plans.length > 0 && (
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setIsPlansPanelOpen(!isPlansPanelOpen)}
              className={`flex items-center justify-center bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary transition-all cursor-pointer shadow-xs ${
                isEffectiveRoadmapCollapsed 
                  ? "w-10 h-10 rounded-xl mx-auto" 
                  : "w-full px-3 py-2 rounded-lg justify-between gap-2 text-xs font-bold"
              }`}
              title={isEffectiveRoadmapCollapsed ? `Plan: ${activePlan.name}` : undefined}
            >
              {isEffectiveRoadmapCollapsed ? (
                <BookOpen className="w-4 h-4 shrink-0" />
              ) : (
                <>
                  <span className="truncate">{activePlan.name}</span>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isPlansPanelOpen ? "rotate-90" : ""}`} />
                </>
              )}
            </button>
            
            {/* Custom Plans Panel / Dropdown */}
            {isPlansPanelOpen && (
              <div className={`absolute top-full z-50 bg-popover border border-border rounded-xl shadow-2xl p-3 space-y-2.5 max-h-72 overflow-y-auto text-foreground origin-top animate-in fade-in-50 slide-in-from-top-2 duration-150 ${
                isEffectiveRoadmapCollapsed ? "left-0 w-64 mt-2" : "left-0 right-0 mt-1.5"
              }`}>
                <div className="text-[9px] font-bold text-muted-foreground uppercase pb-1 border-b border-border">
                  Select Study Plan
                </div>
                <div className="space-y-1">
                  {plans.map((p) => {
                    const isActive = p.id === activePlanId;
                    return (
                      <div key={p.id} className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            handleSwitchPlan(p.id);
                            setIsPlansPanelOpen(false);
                          }}
                          className={`flex-1 text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isActive 
                              ? "bg-primary text-primary-foreground font-semibold shadow-xs" 
                              : "bg-muted/40 hover:bg-muted text-foreground"
                          }`}
                        >
                          {p.name}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlan(p.id);
                          }}
                          className="p-1.5 rounded-lg border border-transparent text-muted-foreground hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                          title="Delete Plan"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className={`flex-1 overflow-y-auto space-y-2.5 w-full ${isEffectiveRoadmapCollapsed ? "flex flex-col items-center" : "pr-1"}`}>
        {activePlan.days.map((day) => {
          const isSelected = day.id === selectedDayId;
          
          // Count completed slots for this day
          const daySlotIds = day.slots.filter(s => !progress.deletedSlots?.[s.id]).map(s => s.id);
          const dayTotalSlotsCount = daySlotIds.length;
          const completedOnDay = daySlotIds.filter(id => progress.completedSlots[id]).length;
          const isDayFinished = dayTotalSlotsCount > 0 && completedOnDay === dayTotalSlotsCount;
          
          // Delay on this day
          const dayDelay = progress.scheduleDelay[day.id] || 0;
          const delayMin = Math.floor(dayDelay / 60);

          return (
            <button
              key={day.id}
              onClick={() => {
                setSelectedDayId(day.id);
                setIsSidebarOpen(false); // Close mobile menu
                setIsTimerRunning(false);
                setIsBreakActive(false);
              }}
              className={`rounded-xl border transition-all duration-200 flex flex-col relative overflow-hidden group ${
                isEffectiveRoadmapCollapsed 
                  ? "w-11 h-11 items-center justify-center p-0" 
                  : "w-full p-3 text-left gap-1.5"
              } ${
                isSelected 
                  ? "bg-primary/10 border-primary shadow-sm" 
                  : "bg-muted/40 border-border hover:bg-muted/70"
              }`}
              title={isEffectiveRoadmapCollapsed ? `${day.title} (${completedOnDay}/${dayTotalSlotsCount} Slots)` : undefined}
            >
              {isSelected && (
                <div className={isEffectiveRoadmapCollapsed 
                  ? "absolute bottom-0 left-0 right-0 h-1 bg-[#14B8A6]"
                  : "absolute top-0 left-0 w-1.5 h-full bg-[#14B8A6]"
                } />
              )}

              {isEffectiveRoadmapCollapsed ? (
                <div className="relative flex flex-col items-center justify-center">
                  <span className={`text-xs font-black ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                    D{day.id}
                  </span>
                  {/* Compact completed indicator: small dot at top-right */}
                  {isDayFinished ? (
                    <div className="absolute -top-1.5 -right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  ) : completedOnDay > 0 ? (
                    <div className="absolute -top-1.5 -right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                  ) : null}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Day {day.id} • {day.date} ({day.dayName.substring(0, 3)})
                    </span>
                    {isDayFinished && (
                      <span className="p-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  
                  <span className="text-xs font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {day.title.split(":")[0]}
                  </span>
                  <span className="text-[10px] text-muted-foreground line-clamp-1">
                    {day.title.split(":")[1]?.trim() || day.title}
                  </span>

                  <div className="flex items-center justify-between text-[9px] mt-1 pt-1.5 border-t border-border w-full">
                    <span className="text-muted-foreground">
                      Slots: <span className="font-semibold text-foreground">{completedOnDay}/{dayTotalSlotsCount}</span>
                    </span>
                    {delayMin > 0 && (
                      <span className="text-amber-500 font-medium">
                        Delay: +{delayMin}m
                      </span>
                    )}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Calculators Sidebar Card */}
      {!isEffectiveRoadmapCollapsed ? (
        <button
          type="button"
          onClick={() => {
            setSelectedDayId("calculators");
            setIsSidebarOpen(false); // Close mobile menu
            setIsTimerRunning(false);
            setIsBreakActive(false);
          }}
          className={`rounded-xl border transition-all duration-200 flex flex-col relative overflow-hidden group w-full p-3 text-left gap-1.5 shrink-0 ${
            selectedDayId === "calculators"
              ? "bg-primary/10 border-primary shadow-sm animate-pulse-subtle"
              : "bg-muted/40 border-border hover:bg-muted/70"
          }`}
        >
          <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
            selectedDayId === "calculators"
              ? "bg-gradient-to-b from-primary via-secondary to-accent opacity-100"
              : "bg-transparent opacity-0 group-hover:opacity-40 group-hover:bg-gradient-to-b group-hover:from-primary group-hover:via-secondary group-hover:to-accent"
          }`} />

          <div className="flex justify-between items-start w-full">
            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              Utility Tools
            </span>
          </div>
          
          <span className="text-xs font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            Corporate Calculators
          </span>
          <span className="text-[10px] text-muted-foreground line-clamp-1">
            CSR, Board Compliance &amp; MR-3
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setSelectedDayId("calculators");
            setIsTimerRunning(false);
            setIsBreakActive(false);
          }}
          className={`w-11 h-11 rounded-xl border transition-all duration-200 flex items-center justify-center relative overflow-hidden group shrink-0 ${
            selectedDayId === "calculators"
              ? "bg-primary/10 border-primary shadow-sm"
              : "bg-muted/40 border-border hover:bg-muted/70"
          }`}
          title="Corporate Calculators"
        >
          <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
            selectedDayId === "calculators"
              ? "bg-gradient-to-b from-primary via-secondary to-accent opacity-100"
              : "bg-transparent opacity-0 group-hover:opacity-40 group-hover:bg-gradient-to-b group-hover:from-primary group-hover:via-secondary group-hover:to-accent"
          }`} />
          <Calculator className={`w-5 h-5 ${selectedDayId === "calculators" ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
        </button>
      )}

      {/* Quick Stats Panel */}
      <div className="p-3.5 rounded-xl bg-card border border-border space-y-3 mt-auto shadow-sm lg:hidden">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
          <BarChart2 className="w-3.5 h-3.5 text-primary" /> Preparation Stats
        </h3>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 rounded bg-muted border border-border">
            <span className="text-[9px] text-muted-foreground block uppercase font-sans">Study Time</span>
            <span className="text-xs font-bold text-primary font-mono">
              {formatSecondsToMMSS(totalStudySeconds)}
            </span>
          </div>
          <div className="p-2 rounded bg-muted border border-border">
            <span className="text-[9px] text-muted-foreground block uppercase font-sans">Break Time</span>
            <span className="text-xs font-bold text-secondary font-mono">
              {formatSecondsToMMSS(totalBreakSeconds)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
