"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Calendar, Clock, CheckCircle, Play, Pause, RotateCcw, 
  Moon, Sun, HelpCircle, ChevronRight, BarChart2, Award, 
  ExternalLink, Sparkles, BookOpen, Layers, Menu, X, Plus, Trash, AlertTriangle
} from "lucide-react";
import { scheduleData, DayPlan, StudySlot } from "@/data/schedule";
import CSRCalculator from "./CSRCalculator";
import MR3Checker from "./MR3Checker";
import BoardValidator from "./BoardValidator";
import MotivationalModal from "./MotivationalModal";

interface CustomSlot {
  id: string;
  dayId: number;
  name: string;
  baseStartMinutes: number;
  baseEndMinutes: number;
  topics: string;
  trendAnalysis?: string;
  marks?: string;
  draftingFocus?: string;
}

interface UserProgress {
  completedSlots: Record<string, boolean>;
  timeSpent: Record<string, number>; // slotId -> seconds spent
  breakTime: Record<string, number>; // slotId -> seconds spent on break
  scheduleDelay: Record<number, number>; // dayId -> seconds of total delay
  theme: "light" | "dark";
  customSlots?: CustomSlot[];
  activeSlotId?: string | null;
  isTimerRunning?: boolean;
  isBreakActive?: boolean;
  timerDuration?: number;
  timerRemaining?: number;
  breakSeconds?: number;
  timerPreset?: string;
  selectedDayId?: number;
}

const DEFAULT_PROGRESS: UserProgress = {
  completedSlots: {},
  timeSpent: {},
  breakTime: {},
  scheduleDelay: {},
  theme: "light",
  customSlots: [],
};

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  
  // Refs to bypass timer resets when restoring from localStorage
  const restoredSlotIdRef = useRef<string | null>(null);
  const restoredPresetRef = useRef<string | null>(null);

  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [selectedDayId, setSelectedDayId] = useState<number>(1);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isBreakActive, setIsBreakActive] = useState<boolean>(false);
  const [timerDuration, setTimerDuration] = useState<number>(10800); // 3 hours in seconds
  const [timerRemaining, setTimerRemaining] = useState<number>(10800);
  const [breakSeconds, setBreakSeconds] = useState<number>(0);
  
  // Custom Timer Preset Option
  const [timerPreset, setTimerPreset] = useState<string>("full"); // full (180m), sprint (45m), pomodoro (25m)

  // Modals and Navigation
  const [isQuoteOpen, setIsQuoteOpen] = useState<boolean>(false);
  const [completedSlotName, setCompletedSlotName] = useState<string>("");
  const [activeUtilityTab, setActiveUtilityTab] = useState<string>("csr"); // csr, mr3, board
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  
  // Custom Topic Form Modal State
  const [isAddSlotOpen, setIsAddSlotOpen] = useState<boolean>(false);
  const [newSlotDayId, setNewSlotDayId] = useState<number>(1);
  const [newSlotName, setNewSlotName] = useState<string>("");
  const [newSlotStartTime, setNewSlotStartTime] = useState<string>("18:00");
  const [newSlotEndTime, setNewSlotEndTime] = useState<string>("19:30");
  const [newSlotTopics, setNewSlotTopics] = useState<string>("");
  const [newSlotMarks, setNewSlotMarks] = useState<string>("");
  const [newSlotDraftingFocus, setNewSlotDraftingFocus] = useState<string>("");
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);
  const [overlapError, setOverlapError] = useState<string | null>(null);
  const [selectedGapIndex, setSelectedGapIndex] = useState<number>(0);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Refs for Intervals
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const breakIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state mounting
  useEffect(() => {
    const stored = localStorage.getItem("icsi_study_planner");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProgress({
          ...DEFAULT_PROGRESS,
          ...parsed,
          customSlots: parsed.customSlots || []
        });

        // Restore active timer states
        if (parsed.activeSlotId !== undefined) {
          setActiveSlotId(parsed.activeSlotId);
          restoredSlotIdRef.current = parsed.activeSlotId;
        }
        if (parsed.isTimerRunning !== undefined) setIsTimerRunning(parsed.isTimerRunning);
        if (parsed.isBreakActive !== undefined) setIsBreakActive(parsed.isBreakActive);
        if (parsed.timerDuration !== undefined) setTimerDuration(parsed.timerDuration);
        if (parsed.timerRemaining !== undefined) setTimerRemaining(parsed.timerRemaining);
        if (parsed.breakSeconds !== undefined) setBreakSeconds(parsed.breakSeconds);
        if (parsed.timerPreset !== undefined) {
          setTimerPreset(parsed.timerPreset);
          restoredPresetRef.current = parsed.timerPreset;
        }
        if (parsed.selectedDayId !== undefined) setSelectedDayId(parsed.selectedDayId);

        // Apply initial theme (light by default, add theme-dark if dark)
        if (parsed.theme === "dark") {
          document.documentElement.classList.add("theme-dark");
        } else {
          document.documentElement.classList.remove("theme-dark");
        }
      } catch (e) {
        console.error("Error reading localStorage", e);
      }
    }
    setIsMounted(true);
    setIsRestored(true);
  }, []);

  // Sync timer states and selected day to localStorage
  useEffect(() => {
    if (!isRestored) return;
    const stored = localStorage.getItem("icsi_study_planner");
    let parsed = {};
    if (stored) {
      try {
        parsed = JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    const updated = {
      ...parsed,
      activeSlotId,
      isTimerRunning,
      isBreakActive,
      timerDuration,
      timerRemaining,
      breakSeconds,
      timerPreset,
      selectedDayId
    };
    localStorage.setItem("icsi_study_planner", JSON.stringify(updated));
  }, [isRestored, activeSlotId, isTimerRunning, isBreakActive, timerDuration, timerRemaining, breakSeconds, timerPreset, selectedDayId]);

  // Save progress helper
  const saveProgress = (updated: UserProgress) => {
    setProgress(updated);
    const updatedWithTimer = {
      ...updated,
      activeSlotId,
      isTimerRunning,
      isBreakActive,
      timerDuration,
      timerRemaining,
      breakSeconds,
      timerPreset,
      selectedDayId
    };
    localStorage.setItem("icsi_study_planner", JSON.stringify(updatedWithTimer));
  };

  // Toggle Theme
  const toggleTheme = () => {
    const newTheme: "light" | "dark" = progress.theme === "light" ? "dark" : "light";
    const updated: UserProgress = { ...progress, theme: newTheme };
    saveProgress(updated);
    if (newTheme === "dark") {
      document.documentElement.classList.add("theme-dark");
    } else {
      document.documentElement.classList.remove("theme-dark");
    }
  };

  const selectedDay = scheduleData.find(d => d.id === selectedDayId) || scheduleData[0];
  
  // Combine Static and Custom slots
  const allSlotsForDay = [
    ...(selectedDay.slots),
    ...(progress.customSlots || []).filter(s => s.dayId === selectedDayId)
  ].sort((a, b) => a.baseStartMinutes - b.baseStartMinutes);

  const slotsToRender = hideCompleted
    ? allSlotsForDay.filter(slot => !progress.completedSlots[slot.id])
    : allSlotsForDay;

  const activeSlot = [
    ...scheduleData.flatMap(d => d.slots),
    ...(progress.customSlots || [])
  ].find(s => s.id === activeSlotId);

  // Handle Preset Changes
  useEffect(() => {
    // If the activeSlotId or timerPreset matches the initially restored values, skip resetting
    if (activeSlotId === restoredSlotIdRef.current || timerPreset === restoredPresetRef.current) {
      if (activeSlotId === restoredSlotIdRef.current) restoredSlotIdRef.current = null;
      if (timerPreset === restoredPresetRef.current) restoredPresetRef.current = null;
      return;
    }
    if (!activeSlotId) return;
    
    let durationSeconds = 10800; // 3 hrs default
    if (timerPreset === "sprint") {
      durationSeconds = 45 * 60; // 45 mins
    } else if (timerPreset === "pomodoro") {
      durationSeconds = 25 * 60; // 25 mins
    }
    
    setTimerDuration(durationSeconds);
    setTimerRemaining(durationSeconds);
    setIsTimerRunning(false);
    setIsBreakActive(false);
    setBreakSeconds(0);
  }, [timerPreset, activeSlotId]);

  // Check for overlaps when creating new slot
  useEffect(() => {
    if (!isAddSlotOpen) {
      setOverlapError(null);
      return;
    }

    const startMin = timeStringToMinutes(newSlotStartTime);
    const endMin = timeStringToMinutes(newSlotEndTime);

    if (endMin <= startMin) {
      setOverlapError("End time must be after start time.");
      return;
    }

    // Get all slots for target day
    const targetDaySlots = [
      ...(scheduleData.find(d => d.id === newSlotDayId)?.slots || []),
      ...(progress.customSlots || []).filter(s => s.dayId === newSlotDayId)
    ];

    const overlappingSlot = targetDaySlots.find(slot => {
      return startMin < slot.baseEndMinutes && endMin > slot.baseStartMinutes;
    });

    if (overlappingSlot) {
      setOverlapError(`Time overlaps with: ${overlappingSlot.name} (${formatTime12(overlappingSlot.baseStartMinutes)} - ${formatTime12(overlappingSlot.baseEndMinutes)})`);
    } else {
      setOverlapError(null);
    }
  }, [newSlotDayId, newSlotStartTime, newSlotEndTime, progress.customSlots, isAddSlotOpen]);

  // Update available gaps and set default start/end times when day or open state changes
  useEffect(() => {
    if (!isAddSlotOpen) return;

    const gaps = getFreeGapsForDay(newSlotDayId);
    if (gaps.length > 0) {
      setSelectedGapIndex(0);
      const firstGap = gaps[0];
      setNewSlotStartTime(minutesToTimeString(firstGap.start));
      const endVal = firstGap.start + 60 <= firstGap.end ? firstGap.start + 60 : firstGap.end;
      setNewSlotEndTime(minutesToTimeString(endVal));
    } else {
      setSelectedGapIndex(-1);
      setNewSlotStartTime("");
      setNewSlotEndTime("");
    }
  }, [newSlotDayId, progress.customSlots, isAddSlotOpen]);

  // Timer Ticking Logic
  useEffect(() => {
    if (isTimerRunning && activeSlotId) {
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            handleCompleteSlot(activeSlotId);
            return 0;
          }
          
          // Increment study time spent
          setProgress(curr => {
            const updatedTimeSpent = { ...curr.timeSpent };
            updatedTimeSpent[activeSlotId] = (updatedTimeSpent[activeSlotId] || 0) + 1;
            const nextProgress = { ...curr, timeSpent: updatedTimeSpent };
            localStorage.setItem("icsi_study_planner", JSON.stringify(nextProgress));
            return nextProgress;
          });

          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, activeSlotId]);

  // Break/Pause Shifting Logic
  useEffect(() => {
    if (isBreakActive && activeSlotId) {
      breakIntervalRef.current = setInterval(() => {
        setBreakSeconds(prev => prev + 1);

        // Update progress data
        setProgress(curr => {
          // Increment break time for this slot
          const updatedBreakTime = { ...curr.breakTime };
          updatedBreakTime[activeSlotId] = (updatedBreakTime[activeSlotId] || 0) + 1;

          // Increase schedule delay for the active day
          const updatedDelays = { ...curr.scheduleDelay };
          updatedDelays[selectedDayId] = (updatedDelays[selectedDayId] || 0) + 1;

          const nextProgress = { 
            ...curr, 
            breakTime: updatedBreakTime,
            scheduleDelay: updatedDelays
          };
          localStorage.setItem("icsi_study_planner", JSON.stringify(nextProgress));
          return nextProgress;
        });

      }, 1000);
    } else {
      if (breakIntervalRef.current) clearInterval(breakIntervalRef.current);
    }

    return () => {
      if (breakIntervalRef.current) clearInterval(breakIntervalRef.current);
    };
  }, [isBreakActive, activeSlotId, selectedDayId]);

  // Start Session
  const handleStartSession = (slotId: string) => {
    setActiveSlotId(slotId);
    setIsTimerRunning(true);
    setIsBreakActive(false);
    setTimerPreset("full");
    setBreakSeconds(0);
    
    // Set timer remaining to the slot length or preset
    setTimerDuration(10800);
    setTimerRemaining(10800);
  };

  // Play / Pause toggler
  const handleTogglePlay = () => {
    if (isTimerRunning) {
      // Pause study, start break
      setIsTimerRunning(false);
      setIsBreakActive(true);
    } else {
      // Resume study, pause break
      setIsTimerRunning(true);
      setIsBreakActive(false);
    }
  };

  // Complete Slot manually or by timer
  const handleCompleteSlot = (slotId: string) => {
    const slot = [
      ...scheduleData.flatMap(d => d.slots),
      ...(progress.customSlots || [])
    ].find(s => s.id === slotId);
    setCompletedSlotName(slot?.name || "Slot");
    
    // Reset timer state
    setIsTimerRunning(false);
    setIsBreakActive(false);
    setActiveSlotId(null);
    setBreakSeconds(0);

    // Update completion
    const updatedComplete = { ...progress.completedSlots };
    updatedComplete[slotId] = true;
    
    saveProgress({
      ...progress,
      completedSlots: updatedComplete
    });

    setIsQuoteOpen(true);
  };

  // Toggle Completion Checkbox manually
  const handleToggleCompleteCheckbox = (slotId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedComplete = { ...progress.completedSlots };
    if (event.target.checked) {
      updatedComplete[slotId] = true;
      const slot = [
        ...scheduleData.flatMap(d => d.slots),
        ...(progress.customSlots || [])
      ].find(s => s.id === slotId);
      setCompletedSlotName(slot?.name || "Slot");
      setIsQuoteOpen(true);
    } else {
      delete updatedComplete[slotId];
    }
    
    saveProgress({
      ...progress,
      completedSlots: updatedComplete
    });
  };

  // Reset Timer
  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setIsBreakActive(false);
    setTimerRemaining(timerDuration);
    setBreakSeconds(0);
  };

  // Full reset of progress
  const handleResetAllProgress = () => {
    saveProgress({
      ...DEFAULT_PROGRESS,
      theme: progress.theme,
      customSlots: []
    });
    setIsTimerRunning(false);
    setIsBreakActive(false);
    setActiveSlotId(null);
    setBreakSeconds(0);
    setIsResetConfirmOpen(false);
  };

  // Add Custom Topic/Slot Submit
  const handleAddCustomSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotName || !newSlotTopics) {
      setOverlapError("Please fill in the Name and Topics fields.");
      return;
    }

    const startMin = timeStringToMinutes(newSlotStartTime);
    const endMin = timeStringToMinutes(newSlotEndTime);

    if (endMin <= startMin) {
      setOverlapError("End time must be after the start time.");
      return;
    }

    // Verify overlap
    const targetDaySlots = [
      ...(scheduleData.find(d => d.id === newSlotDayId)?.slots || []),
      ...(progress.customSlots || []).filter(s => s.dayId === newSlotDayId)
    ];
    const isOverlapping = targetDaySlots.some(slot => startMin < slot.baseEndMinutes && endMin > slot.baseStartMinutes);
    if (isOverlapping) {
      setOverlapError("This time slot overlaps with an existing study topic. Please choose another time.");
      return;
    }

    const newSlot: CustomSlot = {
      id: `custom-${Date.now()}`,
      dayId: newSlotDayId,
      name: newSlotName,
      baseStartMinutes: startMin,
      baseEndMinutes: endMin,
      topics: newSlotTopics,
      marks: newSlotMarks ? `${newSlotMarks} Marks` : undefined,
      draftingFocus: newSlotDraftingFocus || undefined
    };

    const updatedCustom = [...(progress.customSlots || []), newSlot];
    saveProgress({
      ...progress,
      customSlots: updatedCustom
    });

    // Reset Form
    setNewSlotName("");
    setNewSlotTopics("");
    setNewSlotMarks("");
    setNewSlotDraftingFocus("");
    setIsAddSlotOpen(false);
  };

  // Delete Custom Slot
  const handleDeleteCustomSlot = (slotId: string) => {
    const updatedCustom = (progress.customSlots || []).filter(s => s.id !== slotId);
    const updatedComplete = { ...progress.completedSlots };
    delete updatedComplete[slotId];

    saveProgress({
      ...progress,
      completedSlots: updatedComplete,
      customSlots: updatedCustom
    });

    if (activeSlotId === slotId) {
      setIsTimerRunning(false);
      setIsBreakActive(false);
      setActiveSlotId(null);
      setBreakSeconds(0);
    }
  };

  // Convert minutes from midnight to HH:MM format
  const minutesToTimeString = (mins: number): string => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const hStr = h < 10 ? `0${h}` : `${h}`;
    const mStr = m < 10 ? `0${m}` : `${m}`;
    return `${hStr}:${mStr}`;
  };

  // Convert minutes from midnight to 12-hour string (e.g. 07:00 AM)
  const formatTime12 = (minutes: number) => {
    const hrs = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    const ampm = hrs >= 12 ? "PM" : "AM";
    const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
    const displayMins = mins < 10 ? `0${mins}` : mins;
    return `${displayHrs}:${displayMins} ${ampm}`;
  };

  // Get unoccupied free gaps on a target day
  const getFreeGapsForDay = (dayId: number) => {
    const targetDaySlots = [
      ...(scheduleData.find(d => d.id === dayId)?.slots || []),
      ...(progress.customSlots || []).filter(s => s.dayId === dayId)
    ].sort((a, b) => a.baseStartMinutes - b.baseStartMinutes);

    const gaps: { start: number; end: number }[] = [];
    let currentMin = 300; // 05:00 AM study day start

    for (const slot of targetDaySlots) {
      if (slot.baseStartMinutes > currentMin + 15) { // gap must be at least 15 mins
        gaps.push({ start: currentMin, end: slot.baseStartMinutes });
      }
      currentMin = Math.max(currentMin, slot.baseEndMinutes);
    }

    if (currentMin < 1440 - 15) { // 12:00 AM midnight study day end
      gaps.push({ start: currentMin, end: 1440 });
    }

    return gaps;
  };

  // Generate starting times within a gap (in 30-min steps)
  const getStartTimeOptions = (gapStart: number, gapEnd: number) => {
    const options: number[] = [];
    options.push(gapStart);
    
    let current = Math.floor((gapStart + 30) / 30) * 30;
    while (current < gapEnd) {
      if (current > gapStart) {
        options.push(current);
      }
      current += 30;
    }
    return options;
  };

  // Generate end times after selected start time (in 30-min steps)
  const getEndTimeOptions = (selectedStart: number, gapEnd: number) => {
    const options: number[] = [];
    let current = Math.floor((selectedStart + 30) / 30) * 30;
    while (current < gapEnd) {
      if (current > selectedStart) {
        options.push(current);
      }
      current += 30;
    }
    if (!options.includes(gapEnd) && gapEnd > selectedStart) {
      options.push(gapEnd);
    }
    return options.sort((a, b) => a - b);
  };

  // Time conversion helpers
  const timeStringToMinutes = (timeStr: string): number => {
    const [hrs, mins] = timeStr.split(":").map(Number);
    return (hrs || 0) * 60 + (mins || 0);
  };

  const formatSecondsToMMSS = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    const displayHrs = hrs > 0 ? `${hrs}:` : "";
    const displayMins = mins < 10 && hrs > 0 ? `0${mins}` : mins;
    const displaySecs = secs < 10 ? `0${secs}` : secs;

    return `${displayHrs}${displayMins}:${displaySecs}`;
  };

  const getShiftedTimeStr = (baseMinutes: number, dayId: number) => {
    const delaySeconds = progress.scheduleDelay[dayId] || 0;
    const delayMinutes = Math.floor(delaySeconds / 60);
    const shiftedMinutes = baseMinutes + delayMinutes;
    
    const hrs = Math.floor(shiftedMinutes / 60) % 24;
    const mins = shiftedMinutes % 60;
    const ampm = hrs >= 12 ? "PM" : "AM";
    const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
    const displayMins = mins < 10 ? `0${mins}` : mins;
    
    return `${displayHrs}:${displayMins} ${ampm}`;
  };

  const calculateBreakMinutes = (currentEnd: number, nextStart: number) => {
    const diff = nextStart - currentEnd;
    if (diff <= 0) return "";
    
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    
    if (hrs > 0) {
      return mins > 0 ? `${hrs} Hour${hrs > 1 ? "s" : ""} ${mins} Min${mins > 1 ? "s" : ""}` : `${hrs} Hour${hrs > 1 ? "s" : ""}`;
    }
    return `${mins} Mins`;
  };

  const totalSlots = scheduleData.flatMap(d => d.slots).length + (progress.customSlots || []).length;
  const completedCount = Object.keys(progress.completedSlots).length;
  const progressPercent = totalSlots > 0 ? Math.round((completedCount / totalSlots) * 100) : 0;

  const totalStudySeconds = Object.values(progress.timeSpent).reduce((a, b) => a + b, 0);
  const totalBreakSeconds = Object.values(progress.breakTime).reduce((a, b) => a + b, 0);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground transition-colors duration-300 overflow-hidden">
      
      {/* Header */}
      <header className="relative z-40 shrink-0 w-full glass-panel border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
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
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest hidden sm:block">ICSI Professional Prep</p>
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

          {/* Reset Button */}
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg font-semibold transition-all duration-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Prep
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* Sidebar Backdrop Overlay */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-20 bg-black/45 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Day Selection Sidebar */}
        <aside className={`
          fixed left-0 z-30 w-72 transform border-r border-border bg-card lg:bg-transparent p-4 flex flex-col gap-4 transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 h-full overflow-y-auto shrink-0
          ${isSidebarOpen ? "translate-x-0 top-[57px] bottom-0 bg-card shadow-2xl border-r border-border" : "-translate-x-full lg:block top-0 bottom-0"}
        `}>
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">7-Day Study Roadmap</h2>
          </div>

          {/* Days List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {scheduleData.map((day) => {
              const isSelected = day.id === selectedDayId;
              
              // Count completed slots for this day
              const daySlotIds = day.slots.map(s => s.id);
              const customForDay = (progress.customSlots || []).filter(s => s.dayId === day.id);
              const customSlotIds = customForDay.map(s => s.id);
              
              const dayTotalSlotsCount = daySlotIds.length + customSlotIds.length;
              const completedOnDay = [...daySlotIds, ...customSlotIds].filter(id => progress.completedSlots[id]).length;
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
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex flex-col gap-1.5 relative overflow-hidden group ${
                    isSelected 
                      ? "bg-primary/10 border-primary shadow-sm" 
                      : "bg-muted/40 border-border hover:bg-muted/70"
                  }`}
                >
                  {/* Decorative glowing gradient block on hover/active */}
                  {isSelected && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-teal-400 to-purple-500" />
                  )}

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

                  <div className="flex items-center justify-between text-[9px] mt-1 pt-1.5 border-t border-border">
                    <span className="text-muted-foreground">
                      Slots: <span className="font-semibold text-foreground">{completedOnDay}/{dayTotalSlotsCount}</span>
                    </span>
                    {delayMin > 0 && (
                      <span className="text-amber-500 font-medium">
                        Delay: +{delayMin}m
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Stats Panel */}
          <div className="p-3.5 rounded-xl bg-card border border-border space-y-3 mt-auto shadow-sm">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5 text-primary" /> Preparation Stats
            </h3>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded bg-muted border border-border">
                <span className="text-[9px] text-muted-foreground block uppercase">Study Time</span>
                <span className="text-xs font-bold text-primary">
                  {formatSecondsToMMSS(totalStudySeconds)}
                </span>
              </div>
              <div className="p-2 rounded bg-muted border border-border">
                <span className="text-[9px] text-muted-foreground block uppercase">Break Time</span>
                <span className="text-xs font-bold text-secondary">
                  {formatSecondsToMMSS(totalBreakSeconds)}
                </span>
              </div>
            </div>
            <button
              onClick={handleResetAllProgress}
              className="w-full py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[10px] font-bold text-red-500 transition-colors uppercase tracking-wider md:hidden"
            >
              Reset Progress
            </button>
          </div>
        </aside>

        {/* Dashboard Center Area: Active Timer and Today's Schedule */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 max-w-5xl">
          
          {/* Active Slot Timer Section */}
          {activeSlotId && activeSlot ? (
            <div className="relative overflow-hidden p-6 rounded-2xl glass-panel border border-primary/20 shadow-lg space-y-6">
              
              {/* Decorative backgrounds */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full filter blur-3xl -z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full filter blur-3xl -z-10 pointer-events-none" />

              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pb-4 border-b border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      ACTIVE SESSION
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {selectedDay.date} • {selectedDay.dayName}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold font-sans">{activeSlot.name}: {activeSlot.topics.split(".")[0]}</h2>
                  <p className="text-xs text-muted-foreground line-clamp-1">{activeSlot.topics}</p>
                </div>
                
                {/* Timer presets */}
                <div className="flex items-center gap-1.5 bg-muted p-1 rounded-lg border border-border shrink-0">
                  <span className="text-[9px] text-muted-foreground px-2 uppercase font-semibold">Preset:</span>
                  <button 
                    onClick={() => setTimerPreset("full")}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${timerPreset === "full" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    3h Slot
                  </button>
                  <button 
                    onClick={() => setTimerPreset("sprint")}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${timerPreset === "sprint" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    45m Focus
                  </button>
                  <button 
                    onClick={() => setTimerPreset("pomodoro")}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${timerPreset === "pomodoro" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    25m Pomodoro
                  </button>
                </div>
              </div>

              {/* Timer Interface Grid */}
              <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6 items-center">
                
                {/* Left: Study Countdown Display */}
                <div className="2xl:col-span-2 flex flex-col items-center justify-center py-4 bg-muted border border-border rounded-2xl">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Remaining Time</span>
                  <div className="text-5xl sm:text-7xl font-mono font-bold tracking-tighter text-neon-teal">
                    {formatSecondsToMMSS(timerRemaining)}
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5 mt-3">
                    <span className={`w-2 h-2 rounded-full ${isTimerRunning ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
                    <span className="text-xs text-muted-foreground">
                      {isTimerRunning ? "Studying Core Syllabus..." : "Session Paused"}
                    </span>
                  </div>
                </div>

                {/* Right: Break Time & Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 2xl:flex 2xl:flex-col gap-4">
                  {/* Break Timer Display */}
                  <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20 text-center">
                    <span className="text-[10px] text-secondary block uppercase font-bold tracking-wider mb-0.5">Active Break Time</span>
                    <span className="text-3xl font-mono font-bold text-neon-purple">
                      {formatSecondsToMMSS(breakSeconds)}
                    </span>
                    <span className="text-[9px] text-muted-foreground block mt-1 leading-normal">
                      ⏰ subsequent slots start times are shifted forward by this duration.
                    </span>
                  </div>

                  {/* Play, Pause, Complete buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleTogglePlay}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isTimerRunning 
                          ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20" 
                          : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                      }`}
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
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" /> Finish Slot
                    </button>

                    <button
                      onClick={handleResetTimer}
                      className="col-span-2 flex items-center justify-center gap-1 px-4 py-1.5 rounded-md text-xs font-semibold bg-muted border border-border hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Session Timer
                    </button>
                  </div>
                </div>

              </div>

              {/* Tips related to active slot */}
              {activeSlot.trendAnalysis && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-primary font-bold uppercase tracking-wider shrink-0 mt-0.5">Trend Tip:</span>
                  <span>{activeSlot.trendAnalysis}</span>
                </div>
              )}
            </div>
          ) : (
            /* Timer Empty State */
            <div className="p-6 rounded-2xl bg-card border border-dashed border-border text-center py-10 space-y-3">
              <Clock className="w-10 h-10 text-muted-foreground mx-auto animate-pulse-slow" />
              <div className="space-y-1">
                <h3 className="text-base font-semibold font-sans">No Active Study Session</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Select a day from the sidebar roadmap and click "Start Study Session" on one of the slots to activate your study timer.
                </p>
              </div>
            </div>
          )}

          {/* Today's Schedule Card Timeline */}
          <div className="rounded-2xl glass-panel p-5 md:p-6 border border-border space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-border">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold font-sans text-foreground font-sans">Day {selectedDay.id}: {selectedDay.title.split(":")[0]}</h3>
                <p className="text-xs text-primary font-medium">{selectedDay.title.split(":")[1]?.trim()}</p>
              </div>
              
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
                  onClick={() => {
                    setNewSlotDayId(selectedDayId);
                    setIsAddSlotOpen(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm shrink-0"
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

            {/* Exam Trend Banner */}
            <div className="p-3.5 rounded-xl bg-secondary/5 border border-secondary/25 text-xs leading-relaxed space-y-1.5">
              <h4 className="font-bold text-secondary uppercase tracking-wide flex items-center gap-1.5 font-sans">
                <Award className="w-4 h-4 text-secondary" /> ICSI Exam Trend Analysis
              </h4>
              <p className="text-muted-foreground">{selectedDay.trendAnalysis}</p>
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
                  const isCustom = slot.id.startsWith("custom-");
                  
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
                          ? "bg-primary/5 border-primary shadow-sm" 
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

                              {slot.marks && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-secondary/10 text-secondary border border-secondary/20 uppercase">
                                  {slot.marks}
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-semibold text-foreground leading-normal">
                              {slot.topics}
                            </p>

                            {slot.draftingFocus && (
                              <p className="text-xs text-secondary leading-normal border-l-2 border-secondary/40 pl-2 font-medium">
                                ✍️ <b>Drafting Focus:</b> {slot.draftingFocus}
                              </p>
                            )}
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

                              {/* Delete custom slot */}
                              {isCustom && (
                                <div className="relative flex items-center">
                                  {deletingSlotId === slot.id ? (
                                    <div className="flex items-center gap-1 bg-destructive/10 border border-destructive/20 rounded-md p-0.5 animate-in fade-in-50 zoom-in-95 duration-100">
                                      <span className="text-[9px] text-destructive font-bold uppercase px-1 font-sans">Delete?</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteCustomSlot(slot.id);
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
                                      className="p-1 rounded-md text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                                      title="Delete Custom Topic"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Start button */}
                            {!isCompleted && !isActive && (
                              <button
                                onClick={() => handleStartSession(slot.id)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                              >
                                <Play className="w-3 h-3" /> Study This
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
        </main>

        {/* Dashboard Right Area: Quick Utility Hub (CSR, MR-3, LODR board checkers) */}
        <aside className="hidden xl:flex w-[400px] border-l border-border flex-col gap-4 p-5 overflow-y-auto bg-card/30 shrink-0 h-full">
          
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Layers className="w-4 h-4 text-secondary" />
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Utility Hub</h2>
          </div>

          {/* Calculator Tab Switcher */}
          <div className="flex bg-muted p-1 rounded-lg border border-border">
            <button
              onClick={() => setActiveUtilityTab("csr")}
              className={`flex-1 py-1.5 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                activeUtilityTab === "csr" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              CSR Sec 135
            </button>
            <button
              onClick={() => setActiveUtilityTab("mr3")}
              className={`flex-1 py-1.5 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                activeUtilityTab === "mr3" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              MR-3 Audit
            </button>
            <button
              onClick={() => setActiveUtilityTab("board")}
              className={`flex-1 py-1.5 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                activeUtilityTab === "board" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              LODR Board
            </button>
          </div>

          {/* Active Calculator Widget Panel */}
          <div className="flex-1 p-4 rounded-2xl glass-panel border border-border shadow-sm">
            {activeUtilityTab === "csr" && <CSRCalculator />}
            {activeUtilityTab === "mr3" && <MR3Checker />}
            {activeUtilityTab === "board" && <BoardValidator />}
          </div>

        </aside>

      </div>

      {/* Add Custom Slot Modal Form */}
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
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsAddSlotOpen(false)}
            />
            {/* Form Content */}
            <form 
              onSubmit={handleAddCustomSlot}
              className="relative w-full max-w-lg glass-panel border border-border p-6 rounded-2xl space-y-4 shadow-xl z-10 animate-in zoom-in-95 duration-150"
            >
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
                  <BookOpen className="w-5 h-5 text-primary" /> Add Custom Study Topic / Slot
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddSlotOpen(false)}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
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
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1">
                        Target Day
                      </label>
                      <select
                        value={newSlotDayId}
                        onChange={(e) => setNewSlotDayId(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {scheduleData.map(d => (
                          <option key={d.id} value={d.id} className="bg-background text-foreground font-sans">Day {d.id} • {d.dayName}</option>
                        ))}
                      </select>
                    </div>

                    {/* Slot Name */}
                    <div>
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1">
                        Slot Label / Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Extra Slot 4"
                        value={newSlotName}
                        onChange={(e) => setNewSlotName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>

                    {/* Available Gap Ranges */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1">
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
                          <option key={i} value={i} className="bg-background text-foreground">
                            {formatTime12(gap.start)} – {formatTime12(gap.end)} ({Math.round((gap.end - gap.start) / 60 * 10) / 10} hours free)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Start Time select */}
                    <div>
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1">
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
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {startTimeOpts.map(opt => (
                          <option key={opt} value={minutesToTimeString(opt)} className="bg-background text-foreground">
                            {formatTime12(opt)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* End Time select */}
                    <div>
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1">
                        End Time
                      </label>
                      <select
                        value={newSlotEndTime}
                        onChange={(e) => setNewSlotEndTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {endTimeOpts.map(opt => (
                          <option key={opt} value={minutesToTimeString(opt)} className="bg-background text-foreground">
                            {formatTime12(opt)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Overlap Error Warning */}
                  {overlapError && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/25 text-xs text-destructive font-semibold flex items-start gap-2 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{overlapError}</span>
                    </div>
                  )}

                  {/* Topics */}
                  <div>
                    <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1">
                      Study Topics / Legal Focus
                    </label>
                    <textarea
                      placeholder="List key governance failure analysis, audit guidelines, or case studies..."
                      value={newSlotTopics}
                      onChange={(e) => setNewSlotTopics(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Marks Weightage */}
                    <div>
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1">
                        Marks (Optional)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 15"
                        value={newSlotMarks}
                        onChange={(e) => setNewSlotMarks(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Drafting Focus */}
                    <div>
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1">
                        Drafting Focus (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Trust Deed"
                        value={newSlotDraftingFocus}
                        onChange={(e) => setNewSlotDraftingFocus(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSlotOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm bg-muted border border-border text-foreground hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={gaps.length === 0 || !!overlapError}
                  className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Study Topic
                </button>
              </div>
            </form>
          </div>
        );
      })()}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsResetConfirmOpen(false)}
          />
          {/* Content */}
          <div className="relative w-full max-w-md glass-panel border border-border p-6 rounded-2xl space-y-4 shadow-xl z-10 animate-in zoom-in-95 duration-150 bg-background text-foreground">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold">Clear All Study Progress?</h3>
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
                className="px-4 py-2 rounded-lg text-sm bg-muted border border-border text-foreground hover:bg-muted/80 transition-colors cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetAllProgress}
                className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer font-bold"
              >
                Yes, Reset Prep
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer/Modal for Utility tools */}
      <div className="xl:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => {
            setActiveUtilityTab("csr");
            setIsSidebarOpen(false); // Close sidebar if open
            const el = document.getElementById("mobile-utility-drawer");
            if (el) el.classList.toggle("hidden");
          }}
          className="p-3.5 rounded-full bg-gradient-to-tr from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white font-bold shadow-xl border border-white/20 active:scale-95 flex items-center justify-center"
          title="Open Utility Calculators"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Backdrop & Container */}
      <div id="mobile-utility-drawer" className="hidden fixed inset-0 z-50">
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => document.getElementById("mobile-utility-drawer")?.classList.add("hidden")}
        />
        <div className="absolute bottom-0 inset-x-0 max-h-[85vh] rounded-t-2xl bg-card border-t border-border p-5 flex flex-col gap-4 overflow-y-auto animate-in slide-in-from-bottom duration-200">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-secondary" /> Quick Utility Hub
            </h3>
            <button
              onClick={() => document.getElementById("mobile-utility-drawer")?.classList.add("hidden")}
              className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex bg-muted p-1 rounded-lg border border-border">
            <button
              onClick={() => setActiveUtilityTab("csr")}
              className={`flex-1 py-1.5 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                activeUtilityTab === "csr" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground"
              }`}
            >
              CSR Sec 135
            </button>
            <button
              onClick={() => setActiveUtilityTab("mr3")}
              className={`flex-1 py-1.5 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                activeUtilityTab === "mr3" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground"
              }`}
            >
              MR-3 Audit
            </button>
            <button
              onClick={() => setActiveUtilityTab("board")}
              className={`flex-1 py-1.5 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                activeUtilityTab === "board" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground"
              }`}
            >
              LODR Board
            </button>
          </div>

          <div className="py-2">
            {activeUtilityTab === "csr" && <CSRCalculator />}
            {activeUtilityTab === "mr3" && <MR3Checker />}
            {activeUtilityTab === "board" && <BoardValidator />}
          </div>
        </div>
      </div>

      {/* Motivational Celebration Modal */}
      <MotivationalModal 
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        slotName={completedSlotName}
      />

    </div>
  );
}
