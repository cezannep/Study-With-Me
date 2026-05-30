"use client";

import React from "react";
import { useDashboardState, useDashboardActions } from "@/context/DashboardContext";
import { 
  Calendar, Clock, CheckCircle, X, Award, AlertTriangle, Pencil, Sparkles, BookOpen 
} from "lucide-react";
import MotivationalModal from "@/components/MotivationalModal";

export default function ModalsContainer() {
  const {
    isAddSlotOpen,
    newSlotDayId,
    selectedGapIndex,
    newSlotStartTime,
    newSlotEndTime,
    newSlotName,
    newSlotTopics,
    newSlotBreakTime,
    overlapError,
    activePlan,
    isAddPlanOpen,
    newPlanName,
    newPlanStartDate,
    newPlanEndDate,
    isEditSlotOpen,
    editSlotName,
    editSlotStartTime,
    editSlotEndTime,
    editSlotTopics,
    editSlotBreakTime,
    editSlotTrendAnalysis,
    isTimerEndPromptOpen,
    isTimerOnBreak,
    timerPreset,
    prevFocusPreset,
    activeSlot,
    progress,
    activeSlotId,
    isResetConfirmOpen,
    planToDelete,
    plans,
    showMigrationModal,
    isQuoteOpen,
    completedSlotName
  } = useDashboardState();

  const {
    setIsAddSlotOpen,
    setNewSlotDayId,
    setSelectedGapIndex,
    setNewSlotStartTime,
    setNewSlotEndTime,
    setNewSlotName,
    setNewSlotTopics,
    setNewSlotBreakTime,
    handleAddCustomSlot,
    getFreeGapsForDay,
    getStartTimeOptions,
    getEndTimeOptions,
    timeStringToMinutes,
    minutesToTimeString,
    formatTime12,
    setIsAddPlanOpen,
    setNewPlanName,
    setNewPlanStartDate,
    setNewPlanEndDate,
    handleCreatePlan,
    setIsEditSlotOpen,
    setEditSlotName,
    setEditSlotStartTime,
    setEditSlotEndTime,
    setEditSlotTopics,
    setEditSlotBreakTime,
    setEditSlotTrendAnalysis,
    handleEditSlotSubmit,
    setIsTimerEndPromptOpen,
    setTimerPreset,
    setTimerDuration,
    setTimerRemaining,
    setIsTimerRunning,
    setIsBreakActive,
    setBreakSeconds,
    setIsTimerOnBreak,
    setPrevFocusPreset,
    handleCompleteSlot,
    setIsResetConfirmOpen,
    handleResetAllProgress,
    setPlanToDelete,
    performDeletePlan,
    handleDiscardLocalData,
    handleMigrateData,
    setIsQuoteOpen
  } = useDashboardActions();

  return (
    <>
      {/* Add Custom Slot Modal */}
      {isAddSlotOpen && (() => {
        const gaps = getFreeGapsForDay(newSlotDayId);
        const currentGap = gaps[selectedGapIndex];
        const startTimeOpts = currentGap ? getStartTimeOptions(currentGap.start, currentGap.end) : [];
        const startMinutes = timeStringToMinutes(newSlotStartTime);
        const endTimeOpts = currentGap ? getEndTimeOptions(startMinutes, currentGap.end) : [];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setIsAddSlotOpen(false)}
            />
            {/* Form Content */}
            <form 
              onSubmit={handleAddCustomSlot}
              className="relative w-full max-w-lg glass-panel border border-border p-6 rounded-2xl space-y-4 shadow-2xl z-10 bg-popover text-popover-foreground animate-in zoom-in-95 duration-150"
            >
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
                  <BookOpen className="w-5 h-5 text-primary" /> Add Custom Study Topic / Slot
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddSlotOpen(false)}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {gaps.length === 0 ? (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive font-semibold flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">No Time Slots Available</p>
                    <p className="font-normal mt-0.5 text-destructive/90">All hours on Day {newSlotDayId} are occupied. Remove a custom study slot or choose a different target day.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Day Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1 font-sans">
                        Target Day
                      </label>
                      <select
                        value={newSlotDayId}
                        onChange={(e) => setNewSlotDayId(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                      >
                        {activePlan.days.map(d => (
                          <option key={d.id} value={d.id} className="bg-background text-foreground font-sans">Day {d.id} • {d.dayName}</option>
                        ))}
                      </select>
                    </div>

                    {/* Slot Name */}
                    <div>
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1 font-sans">
                        Slot Label / Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Extra Slot 4"
                        value={newSlotName}
                        onChange={(e) => setNewSlotName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                        required
                      />
                    </div>

                    {/* Available Gap Ranges */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1 font-sans">
                        Select Available Time Slot (Unoccupied)
                      </label>
                      <select
                        value={selectedGapIndex}
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          setSelectedGapIndex(idx);
                          const gap = gaps[idx];
                          if (gap) {
                            setNewSlotStartTime(minutesToTimeString(gap.start));
                            const endVal = gap.start + 60 <= gap.end ? gap.start + 60 : gap.end;
                            setNewSlotEndTime(minutesToTimeString(endVal));
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                      >
                        {gaps.map((gap, i) => (
                          <option key={i} value={i} className="bg-background text-foreground font-mono">
                            {formatTime12(gap.start)} – {formatTime12(gap.end)} ({Math.round((gap.end - gap.start) / 60 * 10) / 10} hours free)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Start Time select */}
                    <div>
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1 font-sans">
                        Start Time
                      </label>
                      <select
                        value={newSlotStartTime}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          setNewSlotStartTime(newStart);
                          const newStartMin = timeStringToMinutes(newStart);
                          if (currentGap) {
                            const endVal = newStartMin + 60 <= currentGap.end ? newStartMin + 60 : currentGap.end;
                            setNewSlotEndTime(minutesToTimeString(endVal));
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                      >
                        {startTimeOpts.map(opt => (
                          <option key={opt} value={minutesToTimeString(opt)} className="bg-background text-foreground font-mono">
                            {formatTime12(opt)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* End Time select */}
                    <div>
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1 font-sans">
                        End Time
                      </label>
                      <select
                        value={newSlotEndTime}
                        onChange={(e) => setNewSlotEndTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                      >
                        {endTimeOpts.map(opt => (
                          <option key={opt} value={minutesToTimeString(opt)} className="bg-background text-foreground font-mono">
                            {formatTime12(opt)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Overlap Error Warning */}
                  {overlapError && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/25 text-xs text-destructive font-semibold flex items-start gap-2 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
                      <span className="font-sans">{overlapError}</span>
                    </div>
                  )}

                  {/* Topics */}
                  <div>
                    <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1 font-sans">
                      Study Topics / Legal Focus
                    </label>
                    <textarea
                      placeholder="List key governance failure analysis, audit guidelines, or case studies..."
                      value={newSlotTopics}
                      onChange={(e) => setNewSlotTopics(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none font-sans"
                      required
                    />
                  </div>

                  <div>
                    {/* Break Time After Slot */}
                    <div className="w-1/3">
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1 text-primary font-sans">
                        Break After (Mins)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="5"
                        value={newSlotBreakTime}
                        onChange={(e) => setNewSlotBreakTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-primary/30 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSlotOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm bg-muted border border-border text-foreground hover:bg-muted/80 transition-colors cursor-pointer font-semibold font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={gaps.length === 0 || !!overlapError}
                  className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-sans"
                >
                  Save Study Topic
                </button>
              </div>
            </form>
          </div>
        );
      })()}

      {/* Create New Plan Modal */}
      {isAddPlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsAddPlanOpen(false)}
          />
          {/* Content */}
          <form 
            onSubmit={handleCreatePlan}
            className="relative w-full max-w-md glass-panel border border-border p-6 rounded-2xl space-y-4 shadow-2xl z-10 bg-popover text-popover-foreground animate-in zoom-in-95 duration-150"
          >
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
                <Calendar className="w-5 h-5 text-primary" /> Create New Study Plan
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPlanOpen(false)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1 font-sans">
                  Plan Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7-Day CS Revision Core"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1 font-sans">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newPlanStartDate}
                    onChange={(e) => setNewPlanStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1 font-sans">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newPlanEndDate}
                    onChange={(e) => setNewPlanEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddPlanOpen(false)}
                className="px-4 py-2 rounded-lg text-sm bg-muted border border-border text-foreground hover:bg-muted/80 transition-colors font-semibold font-sans cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-bold font-sans cursor-pointer"
              >
                Generate Plan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Slot Modal Form */}
      {isEditSlotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsEditSlotOpen(false)}
          />
          {/* Form Content */}
          <form 
            onSubmit={handleEditSlotSubmit}
            className="relative w-full max-w-lg glass-panel border border-border p-6 rounded-2xl space-y-4 shadow-2xl z-10 bg-popover text-popover-foreground animate-in zoom-in-95 duration-150"
          >
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
                <Pencil className="w-5 h-5 text-primary" /> Edit Study Topic / Slot
              </h3>
              <button
                type="button"
                onClick={() => setIsEditSlotOpen(false)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Slot Name */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1 font-sans">
                  Slot Label / Name
                </label>
                <input
                  type="text"
                  value={editSlotName}
                  onChange={(e) => setEditSlotName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                  required
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1 font-sans">
                  Start Time
                </label>
                <input
                  type="time"
                  value={editSlotStartTime}
                  onChange={(e) => setEditSlotStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  required
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1 font-sans">
                  End Time
                </label>
                <input
                  type="time"
                  value={editSlotEndTime}
                  onChange={(e) => setEditSlotEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  required
                />
              </div>
            </div>

            {/* Overlap Error Warning */}
            {overlapError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/25 text-xs text-destructive font-semibold flex items-start gap-2 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
                <span className="font-sans">{overlapError}</span>
              </div>
            )}

            {/* Topics */}
            <div>
              <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1 font-sans">
                Study Topics / Legal Focus
              </label>
              <textarea
                placeholder="List topics..."
                value={editSlotTopics}
                onChange={(e) => setEditSlotTopics(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary h-20 resize-none animate-in fade-in duration-150 font-sans"
                required
              />
            </div>

             <div>
              {/* Break Time After Slot */}
              <div className="w-1/3">
                <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1 text-primary font-sans">
                  Break After (Mins)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="5"
                  value={editSlotBreakTime}
                  onChange={(e) => setEditSlotBreakTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-primary/30 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                  required
                />
              </div>
            </div>

            {/* Trend Analysis */}
            <div>
              <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1 font-sans">
                Exam Trend Analysis (Optional)
              </label>
              <textarea
                placeholder="Trend hints..."
                value={editSlotTrendAnalysis}
                onChange={(e) => setEditSlotTrendAnalysis(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary h-16 resize-none font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditSlotOpen(false)}
                className="px-4 py-2 rounded-lg text-sm bg-muted border border-border text-foreground hover:bg-muted/80 transition-colors cursor-pointer font-semibold font-sans"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold shadow-md cursor-pointer font-sans"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Timer End Prompt Modal */}
      {isTimerEndPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsTimerEndPromptOpen(false)}
          />
          {/* Content */}
          <div className="relative w-full max-w-md glass-panel border border-border p-6 rounded-2xl space-y-4 shadow-2xl z-10 bg-popover text-popover-foreground text-center animate-in zoom-in-95 duration-150">
            <div className="flex flex-col items-center gap-3">
              <div className={`p-3 rounded-full ${isTimerOnBreak ? "bg-secondary/15 border border-secondary/20 text-secondary" : "bg-primary/15 border border-primary/20 text-primary"}`}>
                {isTimerOnBreak ? <Clock className="w-8 h-8 animate-pulse" /> : <Award className="w-8 h-8" />}
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {isTimerOnBreak ? "Break Session Completed!" : "Focus Session Completed!"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-normal font-sans">
                  {isTimerOnBreak 
                    ? `Your ${activeSlot?.breakTimeAfter !== undefined ? activeSlot.breakTimeAfter : 5}-minute break is over. Let's resume the focus study session and make progress!`
                    : "You have finished your focus interval. Would you like to start the next session or take a quick break first?"
                  }
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  // Start Next Session
                  let nextPreset = timerPreset;
                  if (isTimerOnBreak) {
                    nextPreset = prevFocusPreset;
                    setIsTimerOnBreak(false);
                  }
                  
                  let durationSeconds = 10800; // 3 hrs default
                  if (activeSlot) {
                    durationSeconds = (activeSlot.baseEndMinutes - activeSlot.baseStartMinutes) * 60;
                  }
                  if (nextPreset === "sprint") {
                    durationSeconds = 45 * 60;
                  } else if (nextPreset === "pomodoro") {
                    durationSeconds = 25 * 60;
                  }
                  
                  setTimerPreset(nextPreset);
                  setTimerDuration(durationSeconds);
                  if (nextPreset === "full" && activeSlot) {
                    const timeSpent = progress.timeSpent[activeSlot.id] || 0;
                    setTimerRemaining(Math.max(0, durationSeconds - timeSpent));
                  } else {
                    setTimerRemaining(durationSeconds);
                  }
                  setIsTimerRunning(true);
                  setIsBreakActive(false);
                  setBreakSeconds(0);
                  setIsTimerEndPromptOpen(false);
                }}
                className="w-full py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md cursor-pointer font-sans"
              >
                Start Next Session
              </button>

              {!isTimerOnBreak && (
                <button
                  type="button"
                  onClick={() => {
                    // Take break
                    if (timerPreset !== "break") {
                      setPrevFocusPreset(timerPreset);
                    }
                    setIsTimerOnBreak(true);
                    setTimerPreset("break");
                    const breakMinutes = activeSlot?.breakTimeAfter !== undefined ? activeSlot.breakTimeAfter : 5;
                    setTimerDuration(breakMinutes * 60);
                    setTimerRemaining(breakMinutes * 60);
                    setIsTimerRunning(true);
                    setIsBreakActive(false);
                    setIsTimerEndPromptOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-secondary/20 hover:bg-secondary/35 text-secondary border border-secondary/20 transition-all cursor-pointer font-sans"
                >
                  Take a {activeSlot?.breakTimeAfter !== undefined ? activeSlot.breakTimeAfter : 5}-Minute Break
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  // Finish Slot
                  if (activeSlotId) {
                    handleCompleteSlot(activeSlotId);
                  }
                  setIsTimerEndPromptOpen(false);
                  setIsTimerOnBreak(false);
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer font-sans"
              >
                Finish Slot & Complete Target
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setIsResetConfirmOpen(false)}
          />
          {/* Content */}
          <div className="relative w-full max-w-md glass-panel border border-border p-6 rounded-2xl space-y-4 shadow-2xl z-10 bg-popover text-popover-foreground animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-sans">Clear All Study Progress?</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-sans">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs font-semibold leading-relaxed text-foreground/90 font-sans">
              Are you sure you want to clear all progress, completed slots, and active timer delays? Your customized study sessions will be reset to default.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-lg text-sm bg-muted border border-border text-foreground hover:bg-muted/80 transition-colors cursor-pointer font-semibold font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetAllProgress}
                className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer font-bold font-sans"
              >
                Yes, Reset Prep
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Plan Confirmation Modal */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setPlanToDelete(null)}
          />
          <div className="relative w-full max-w-sm glass-panel border border-border p-6 rounded-2xl space-y-4 shadow-2xl z-10 bg-popover text-popover-foreground animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-sans">Delete Study Plan?</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-sans">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-xs font-semibold leading-relaxed text-foreground/90 font-sans">
              Are you sure you want to delete the plan "{plans.find(p => p.id === planToDelete)?.name}"? All custom topics and logged times for this plan will be permanently removed.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs bg-muted border border-border text-foreground hover:bg-muted/80 transition-colors cursor-pointer font-semibold font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (planToDelete) {
                    performDeletePlan(planToDelete);
                    setPlanToDelete(null);
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer font-bold font-sans"
              >
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Migration Modal */}
      {showMigrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
          {/* Content */}
          <div className="relative w-full max-w-lg glass-panel border border-border p-8 rounded-2xl space-y-6 shadow-2xl z-10 bg-popover text-popover-foreground animate-in zoom-in-95 duration-150">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-foreground uppercase">Local Data Detected</h3>
                <p className="text-sm text-muted-foreground font-sans">
                  We found local study plans, completed slots/modules, and timer details stored on this device.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3 text-xs font-sans">
              <p className="font-semibold text-foreground">What would you like to do with this data?</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground font-sans">
                <li>
                  <strong className="text-foreground">Migrate to Cloud:</strong> Overwrite/update your cloud account with this local data. Your progress will be saved in Firebase and synced to all devices.
                </li>
                <li>
                  <strong className="text-foreground">Discard Local &amp; Load Cloud:</strong> Ignore this local data and load the existing plans and progress saved in your cloud account.
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleDiscardLocalData}
                className="flex-1 py-3 px-4 rounded-xl text-sm bg-muted border border-border text-foreground hover:bg-muted/80 transition-all duration-200 cursor-pointer font-semibold font-sans"
              >
                Discard &amp; Load Cloud
              </button>
              <button
                type="button"
                onClick={handleMigrateData}
                className="flex-1 py-3 px-4 rounded-xl text-sm bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 cursor-pointer font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 font-sans"
              >
                <CheckCircle className="w-4 h-4" />
                Yes, Migrate to Cloud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Motivational Celebration Modal */}
      <MotivationalModal 
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        slotName={completedSlotName}
      />
    </>
  );
}
