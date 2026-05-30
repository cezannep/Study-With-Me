"use client";

import React from "react";
import { useDashboardState, useDashboardActions } from "@/context/DashboardContext";
import { Pencil, Plus, Clock, Play, Trash, CheckCircle } from "lucide-react";

export default function PlannerSection() {
  const {
    selectedDayId,
    selectedDay,
    isEditingHeader,
    editHeaderSubject,
    editHeaderDetail,
    hideCompleted,
    slotsToRender,
    activeSlotId,
    deletingSlotId,
    progress,
    activePlan
  } = useDashboardState();

  const {
    setIsEditingHeader,
    setEditHeaderSubject,
    setEditHeaderDetail,
    handleSaveHeader,
    setHideCompleted,
    setNewSlotDayId,
    setIsAddSlotOpen,
    handleToggleCompleteCheckbox,
    handleOpenEditSlot,
    handleDeleteSlot,
    setDeletingSlotId,
    handleStartSession,
    getShiftedTimeStr,
    calculateBreakMinutes
  } = useDashboardActions();

  if (selectedDayId === "calculators") return null;

  return (
    <div className="rounded-2xl glass-panel p-5 md:p-6 border border-border space-y-6 bg-card text-foreground">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-border">
        {isEditingHeader ? (
          <div className="flex flex-col gap-2 max-w-sm sm:max-w-md w-full py-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={editHeaderSubject}
                onChange={(e) => setEditHeaderSubject(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-1/3"
                placeholder="Subject (e.g. ESG)"
              />
              <input
                type="text"
                value={editHeaderDetail}
                onChange={(e) => setEditHeaderDetail(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-2/3"
                placeholder="Detail (e.g. Plan your day)"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveHeader}
                className="px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-bold text-[10px] cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingHeader(false)}
                className="px-3 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-all font-bold text-[10px] border border-border cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="group relative flex items-start gap-2 max-w-xs sm:max-w-md">
            <div className="space-y-0.5">
              <h3 className="text-lg font-bold font-sans text-foreground flex items-center gap-1.5">
                Day {selectedDay.id}: {selectedDay.title.split(":")[0]}
                <button
                  type="button"
                  onClick={() => {
                    const parts = selectedDay.title.split(":");
                    setEditHeaderSubject(parts[0] || "");
                    setEditHeaderDetail(parts[1]?.trim() || "");
                    setIsEditingHeader(true);
                  }}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 cursor-pointer inline-flex items-center justify-center shrink-0"
                  title="Edit Day Heading"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </h3>
              {selectedDay.title.split(":")[1] && (
                <p className="text-xs text-primary font-medium">{selectedDay.title.split(":")[1]?.trim()}</p>
              )}
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
          {/* Hide Completed Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-muted-foreground select-none hover:text-foreground transition-colors mr-1 shrink-0">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
              className="w-4 h-4 rounded text-primary border-border bg-background focus:ring-primary focus:ring-offset-background"
            />
            <span>Hide Completed</span>
          </label>

          {/* Add Custom Slot Button */}
          <button
            type="button"
            onClick={() => {
              setNewSlotDayId(selectedDayId);
              setIsAddSlotOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Topic / Slot
          </button>

          <div className="text-xs shrink-0">
            <span className="font-semibold text-foreground bg-muted px-2.5 py-1.5 border border-border rounded-lg whitespace-nowrap">
              {selectedDay.date} ({selectedDay.dayName})
            </span>
          </div>
        </div>
      </div>

      {/* Timed Timeline Slots */}
      {slotsToRender.length === 0 ? (
        <div className="p-6 rounded-2xl bg-muted/40 border border-dashed border-border text-center py-10 space-y-2">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className="text-sm font-semibold text-foreground">All Tasks Completed!</h4>
          <p className="text-xs text-muted-foreground">
            You've checked off all study targets for today. Toggle "Hide Completed" to review them.
          </p>
        </div>
      ) : (
        <div className="space-y-4 relative pl-3 border-l-2 border-border py-1">
          {slotsToRender.map((slot, index) => {
            const isCompleted = progress.completedSlots[slot.id];
            const isActive = activeSlotId === slot.id;
            const isCustom = slot.id.startsWith("slot-") || slot.id.startsWith("custom-");
            
            // Fetch shifted times
            const shiftedStart = getShiftedTimeStr(slot.baseStartMinutes, selectedDay.id);
            const shiftedEnd = getShiftedTimeStr(slot.baseEndMinutes, selectedDay.id);
            const delaySeconds = progress.scheduleDelay[selectedDay.id] || 0;
            const isDelayed = delaySeconds > 0;

            // Time spent calculations
            const secsSpent = progress.timeSpent[slot.id] || 0;
            const minSpent = Math.floor(secsSpent / 60);

            return (
              <div key={slot.id} className="relative group space-y-2">
                
                {/* Circle timeline nodes */}
                <div className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 transition-colors ${
                  isCompleted 
                    ? "bg-emerald-500 border-emerald-500" 
                    : isActive 
                    ? "bg-primary border-primary animate-pulse" 
                    : "bg-background border-muted-foreground"
                }`} />

                <div className={`p-4 rounded-xl border transition-all ${
                  isActive 
                    ? "bg-primary/5 border-primary shadow-xs" 
                    : isCompleted 
                    ? "bg-emerald-500/5 border-emerald-500/20 opacity-80" 
                    : "bg-card border-border hover:border-muted-foreground/30 shadow-xs"
                }`}>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                    <div className="space-y-1.5 flex-1">
                      
                      {/* Slot Name, Marks, Shifted Time */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-bold ${isActive ? "text-primary" : isCompleted ? "text-emerald-500" : "text-foreground font-sans"}`}>
                          {slot.name}
                        </span>

                        {isCustom && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                            Custom
                          </span>
                        )}
                        
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium bg-muted px-2 py-0.5 rounded border border-border">
                          <Clock className="w-3 h-3" /> 
                          {shiftedStart} – {shiftedEnd} 
                          {isDelayed && (
                            <span className="text-amber-500 font-semibold ml-0.5">(+{Math.floor(delaySeconds/60)}m delay)</span>
                          )}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-foreground leading-normal">
                        {slot.topics}
                      </p>
                    </div>

                    {/* Complete Checkbox, Action Button, Delete Button */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0 self-end sm:self-auto">
                      
                      <div className="flex items-center gap-2">
                        {/* Checkbox */}
                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            id={`check-${slot.id}`}
                            checked={isCompleted || false}
                            onChange={(e) => handleToggleCompleteCheckbox(slot.id, e)}
                            className="w-4 h-4 rounded text-primary border-border bg-background focus:ring-primary"
                          />
                          <label htmlFor={`check-${slot.id}`} className="text-xs text-muted-foreground cursor-pointer select-none">
                            Mark Done
                          </label>
                        </div>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditSlot(slot);
                          }}
                          className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                          title="Edit Topic / Slot"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete button */}
                        <div className="relative flex items-center">
                          {deletingSlotId === slot.id ? (
                            <div className="flex items-center gap-1 bg-destructive/10 border border-destructive/20 rounded-md p-0.5 animate-in fade-in-50 zoom-in-95 duration-100">
                              <span className="text-[9px] text-destructive font-bold uppercase px-1 font-sans">Delete?</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSlot(slot.id);
                                  setDeletingSlotId(null);
                                }}
                                className="px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground text-[9px] font-bold hover:bg-destructive/90 transition-colors cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingSlotId(null);
                                }}
                                className="px-1.5 py-0.5 rounded bg-muted text-foreground text-[9px] font-bold hover:bg-muted/80 transition-colors cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingSlotId(slot.id);
                              }}
                              className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete Topic"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Start button */}
                      {!isCompleted && !isActive && (
                        <button
                          type="button"
                          onClick={() => handleStartSession(slot.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" /> Study This
                        </button>
                      )}

                      {isActive && (
                        <span className="text-[10px] text-primary font-bold uppercase animate-pulse">
                          Studying now
                        </span>
                      )}

                      {isCompleted && minSpent > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          Studied: {minSpent} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dynamic Break Times based on slots to render */}
                {index < slotsToRender.length - 1 && calculateBreakMinutes(slot.baseEndMinutes, slotsToRender[index + 1].baseStartMinutes) && (
                  <div className="py-2.5 pl-6 flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                    <span>☕ Break: {calculateBreakMinutes(slot.baseEndMinutes, slotsToRender[index + 1].baseStartMinutes)}</span>
                    <span className="text-[10px] font-normal text-muted-foreground/60 italic">
                      ({getShiftedTimeStr(slot.baseEndMinutes, selectedDay.id)} – {getShiftedTimeStr(slotsToRender[index + 1].baseStartMinutes, selectedDay.id)})
                    </span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
