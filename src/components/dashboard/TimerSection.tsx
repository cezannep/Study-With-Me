"use client";

import React from "react";
import { useDashboardState, useDashboardActions } from "@/context/DashboardContext";
import { Clock, Award, Pause, Play, CheckCircle, RotateCcw, BarChart2 } from "lucide-react";

export default function TimerSection() {
  const {
    activeSlotId,
    activeSlot,
    activePlan,
    selectedDayId,
    selectedDay,
    isTimerOnBreak,
    timerPreset,
    timerRemaining,
    isTimerRunning,
    breakSeconds,
    isBreakActive,
    totalStudySeconds,
    totalBreakSeconds,
    progressPercent,
    completedCount,
    totalSlots
  } = useDashboardState();

  const {
    setTimerPreset,
    handleTogglePlay,
    handleCompleteSlot,
    handleResetTimer,
    formatSecondsToMMSS
  } = useDashboardActions();

  // If there's an active slot, check if it belongs to the selected day.
  const hasActiveSlotForSelectedDay = activeSlotId && activeSlot && activePlan.days.some(d => d.id === selectedDayId && d.slots.some(s => s.id === activeSlotId));

  return (
    <div className="space-y-6">
      {hasActiveSlotForSelectedDay ? (
        <div className="relative overflow-hidden p-6 rounded-2xl glass-panel border border-primary/20 bg-card text-foreground shadow-lg space-y-6">
          <div className="flex flex-col items-center justify-center text-center gap-4 pb-4 border-b border-border w-full">
            <div className="space-y-1 bg-transparent flex flex-col items-center">
              <div className="flex items-center justify-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                  isTimerOnBreak 
                    ? "bg-secondary/15 text-secondary border-secondary/20" 
                    : "bg-primary/10 text-primary border-primary/20"
                }`}>
                  {isTimerOnBreak ? "BREAK INTERVAL" : "ACTIVE SESSION"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedDay.date} • {selectedDay.dayName}
                </span>
              </div>
              <h2 className="text-sm sm:text-base md:text-lg font-bold font-sans text-center break-words px-4 w-full" title={`${activeSlot.name}: ${activeSlot.topics}`}>
                {activeSlot.name}: {activeSlot.topics.split(".")[0]}
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground text-center break-words px-4 w-full mt-1" title={activeSlot.topics}>
                {activeSlot.topics}
              </p>
            </div>
            
            {/* Timer presets */}
            <div className="flex items-center justify-center gap-1.5 bg-muted p-1 rounded-lg border border-border shrink-0 mt-1">
              <span className="text-[9px] text-muted-foreground px-2 uppercase font-semibold">Preset:</span>
              <button 
                type="button"
                onClick={() => setTimerPreset("full")}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${timerPreset === "full" ? "bg-primary text-primary-foreground font-sans shadow-xs" : "text-muted-foreground hover:text-foreground font-sans"}`}
              >
                {(() => {
                  const mins = activeSlot.baseEndMinutes - activeSlot.baseStartMinutes;
                  const hrs = Math.floor(mins / 60);
                  const remainingMins = mins % 60;
                  if (hrs > 0) {
                    return `${hrs}h${remainingMins > 0 ? ` ${remainingMins}m` : ""} Slot`;
                  }
                  return `${mins}m Slot`;
                })()}
              </button>
              {(() => {
                const isPomodoroDisabled = (activeSlot.baseEndMinutes - activeSlot.baseStartMinutes) < 25;
                return (
                  <button 
                    type="button"
                    onClick={() => !isPomodoroDisabled && setTimerPreset("pomodoro")}
                    disabled={isPomodoroDisabled}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                      isPomodoroDisabled 
                        ? "opacity-35 cursor-not-allowed text-muted-foreground/50" 
                        : timerPreset === "pomodoro" 
                        ? "bg-primary text-primary-foreground font-sans shadow-xs cursor-pointer" 
                        : "text-muted-foreground hover:text-foreground font-sans cursor-pointer"
                    }`}
                    title={isPomodoroDisabled ? "Slot duration is less than 25 minutes" : "25m Pomodoro"}
                  >
                    25m Pomodoro
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Timer Interface Grid */}
          <div className="grid grid-cols-1 gap-6 items-center">
            {/* Study/Break Countdown Display (Clickable to Toggle play/pause) */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className="flex flex-col items-center justify-center py-10 md:py-16 bg-muted/30 hover:bg-muted/50 border border-border/85 hover:border-primary/30 rounded-3xl cursor-pointer w-full transition-all duration-300 group focus:outline-none relative overflow-hidden shadow-inner"
            >
              {/* Ambient glow spotlight behind timer digits */}
              <div 
                className="absolute inset-0 w-full h-full opacity-5 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_center,var(--timer-glow)_0%,transparent_70%)]" 
                style={{ '--timer-glow': isTimerOnBreak ? 'var(--secondary)' : 'var(--primary)' } as React.CSSProperties}
              />
              
              <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 transition-colors relative z-10 ${isTimerOnBreak ? "text-secondary font-sans" : "text-primary font-sans"}`}>
                {isTimerOnBreak ? "Break Time Remaining" : "Remaining Time"}
              </span>
              <div className={`text-7xl sm:text-8xl md:text-[6.5rem] lg:text-[7.5rem] font-mono font-black tracking-tighter transition-all duration-300 group-hover:scale-[1.03] relative z-10 ${isTimerOnBreak ? "text-neon-purple" : "text-neon-teal"}`}>
                {formatSecondsToMMSS(timerRemaining)}
              </div>
              
              {/* Status Indicator */}
              <div className="flex items-center gap-1.5 mt-4 relative z-10">
                <span className={`w-2 h-2 rounded-full ${isTimerRunning ? (isTimerOnBreak ? "bg-secondary animate-ping" : "bg-primary animate-ping") : "bg-amber-500"}`} />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-sans">
                  {isTimerRunning ? (isTimerOnBreak ? "Enjoying Break..." : "Studying Core Syllabus...") : "Session Paused (Click to Resume)"}
                </span>
              </div>
            </button>

            {/* Break Time & Controls */}
            <div className="flex flex-col gap-4">
              {/* Break Timer Display */}
              <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20 text-center">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-0.5">Active Break Time</span>
                <div className="text-2xl font-mono font-bold text-secondary">
                  {formatSecondsToMMSS(breakSeconds)}
                </div>
                <div className="text-[9px] text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <span className="inline-block animate-pulse text-secondary">⏰</span> subsequent slots start times are shifted forward by this duration.
                </div>
              </div>

              {/* Main Timer Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleTogglePlay}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-xs cursor-pointer font-sans text-white ${isTimerRunning ? "bg-amber-600 hover:bg-amber-600/90" : "bg-primary hover:bg-primary/95"}`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-4 h-4" /> Pause (Take Break)
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Resume Study
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleCompleteSlot(activeSlotId)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all shadow-xs cursor-pointer font-sans"
                >
                  <CheckCircle className="w-4 h-4" /> Finish Slot
                </button>

                <button
                  onClick={handleResetTimer}
                  className="col-span-2 flex items-center justify-center gap-1 px-4 py-1.5 rounded-md text-xs font-semibold bg-muted border border-border hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-sans"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Session Timer
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Timer Empty State */
        <div className="p-6 rounded-2xl bg-card border border-dashed border-border text-center py-10 space-y-3">
          <Clock className="w-10 h-10 text-muted-foreground mx-auto animate-pulse-slow" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold font-sans">No Active Study Session</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Select a day from the sidebar roadmap and click "Study This" on one of the slots to activate your study timer.
            </p>
          </div>
        </div>
      )}

      {/* Preparation Stats Panel */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4 bg-card text-foreground shadow-xs">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1 font-sans">
          <BarChart2 className="w-3.5 h-3.5 text-primary" /> Preparation Progress Stats
        </h3>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-2.5 rounded bg-muted/50 border border-border">
            <span className="text-[9px] text-muted-foreground block uppercase font-sans">Study Time</span>
            <span className="text-sm font-bold text-primary font-mono">
              {formatSecondsToMMSS(totalStudySeconds)}
            </span>
          </div>
          <div className="p-2.5 rounded bg-muted/50 border border-border">
            <span className="text-[9px] text-muted-foreground block uppercase font-sans">Break Time</span>
            <span className="text-sm font-bold text-secondary font-mono">
              {formatSecondsToMMSS(totalBreakSeconds)}
            </span>
          </div>
        </div>
        <div className="pt-2 border-t border-border/60">
          <div className="flex justify-between text-[11px] mb-1 font-medium">
            <span className="text-muted-foreground font-sans">Syllabus Completion</span>
            <span className="text-primary font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[9px] text-muted-foreground mt-2 leading-normal font-sans">
            Completed <span className="font-semibold text-foreground">{completedCount}</span> out of <span className="font-semibold text-foreground">{totalSlots}</span> total roadmap target sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
