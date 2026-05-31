"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { scheduleData, DayPlan, StudySlot } from "@/data/schedule";
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, getDocs } from "firebase/firestore";

export interface Plan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  days: DayPlan[];
}

export interface UserProgress {
  completedSlots: Record<string, boolean>;
  timeSpent: Record<string, number>;
  breakTime: Record<string, number>;
  scheduleDelay: Record<number, number>;
  deletedSlots?: Record<string, boolean>;
  theme: "light" | "dark";
  activeSlotId?: string | null;
  isTimerRunning?: boolean;
  isBreakActive?: boolean;
  timerDuration?: number;
  timerRemaining?: number;
  breakSeconds?: number;
  timerPreset?: string;
  selectedDayId?: number;
  isTimerOnBreak?: boolean;
}

const DEFAULT_PROGRESS: UserProgress = {
  completedSlots: {},
  timeSpent: {},
  breakTime: {},
  scheduleDelay: {},
  deletedSlots: {},
  theme: "light",
};

interface DashboardStateContextProps {
  isMounted: boolean;
  isRestored: boolean;
  user: any;
  authLoading: boolean;
  isDemoMode: boolean;
  firebaseError: string | null;
  showMigrationModal: boolean;
  pendingMigrationData: { plans: Plan[]; activePlanId: string; progress: UserProgress } | null;
  cloudDataToRestore: { plans: Plan[]; activePlanId: string; progress: UserProgress } | null;
  isAdminMode: boolean;
  adminUsername: string;
  adminPassword: string;
  adminLoginError: string | null;
  studentsList: any[];
  adminSelectedStudent: any;
  adminInspectPlan: any | null;
  adminComments: string;
  adminInputComments: string;
  isAdminLoginOpen: boolean;
  progress: UserProgress;
  selectedDayId: number | string;
  activeSlotId: string | null;
  isTimerRunning: boolean;
  isBreakActive: boolean;
  timerDuration: number;
  timerRemaining: number;
  breakSeconds: number;
  timerPreset: string;
  isQuoteOpen: boolean;
  completedSlotName: string;
  isSidebarOpen: boolean;
  isRoadmapCollapsed: boolean;
  isMobile: boolean;
  isProfileDropdownOpen: boolean;
  activeUtilityTab: string;
  isAddSlotOpen: boolean;
  newSlotDayId: number;
  newSlotName: string;
  newSlotStartTime: string;
  newSlotEndTime: string;
  newSlotTopics: string;
  newSlotBreakTime: string;
  hideCompleted: boolean;
  overlapError: string | null;
  selectedGapIndex: number;
  deletingSlotId: string | null;
  isResetConfirmOpen: boolean;
  plans: Plan[];
  activePlanId: string;
  planToDelete: string | null;
  isAddPlanOpen: boolean;
  newPlanName: string;
  newPlanStartDate: string;
  newPlanEndDate: string;
  isEditSlotOpen: boolean;
  editingSlotId: string | null;
  editSlotName: string;
  editSlotStartTime: string;
  editSlotEndTime: string;
  editSlotTopics: string;
  editSlotTrendAnalysis: string;
  editSlotBreakTime: string;
  isEditingHeader: boolean;
  editHeaderSubject: string;
  editHeaderDetail: string;
  activeSection: string;
  isPlansPanelOpen: boolean;
  isTimerEndPromptOpen: boolean;
  isTimerOnBreak: boolean;
  prevFocusPreset: string;

  // Derived states
  activePlan: Plan;
  selectedDay: DayPlan | { id: number; date: string; dayName: string; title: string; trendAnalysis: string; slots: any[] };
  allSlotsForDay: StudySlot[];
  slotsToRender: StudySlot[];
  activeSlot: StudySlot | undefined;
  isEffectiveRoadmapCollapsed: boolean;
  progressPercent: number;
  completedCount: number;
  totalSlots: number;
  totalStudySeconds: number;
  totalBreakSeconds: number;
}

interface DashboardActionsContextProps {
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRoadmapCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPlansPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsProfileDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAddPlanOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedDayId: React.Dispatch<React.SetStateAction<number | string>>;
  setHideCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  setNewPlanName: React.Dispatch<React.SetStateAction<string>>;
  setNewPlanStartDate: React.Dispatch<React.SetStateAction<string>>;
  setNewPlanEndDate: React.Dispatch<React.SetStateAction<string>>;
  setAdminUsername: React.Dispatch<React.SetStateAction<string>>;
  setAdminPassword: React.Dispatch<React.SetStateAction<string>>;
  setIsAdminLoginOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setAdminLoginError: React.Dispatch<React.SetStateAction<string | null>>;
  setAdminInspectPlan: React.Dispatch<React.SetStateAction<any | null>>;
  setAdminInputComments: React.Dispatch<React.SetStateAction<string>>;
  setIsQuoteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNewSlotDayId: React.Dispatch<React.SetStateAction<number>>;
  setNewSlotName: React.Dispatch<React.SetStateAction<string>>;
  setNewSlotStartTime: React.Dispatch<React.SetStateAction<string>>;
  setNewSlotEndTime: React.Dispatch<React.SetStateAction<string>>;
  setNewSlotTopics: React.Dispatch<React.SetStateAction<string>>;
  setNewSlotBreakTime: React.Dispatch<React.SetStateAction<string>>;
  setSelectedGapIndex: React.Dispatch<React.SetStateAction<number>>;
  setEditSlotName: React.Dispatch<React.SetStateAction<string>>;
  setEditSlotStartTime: React.Dispatch<React.SetStateAction<string>>;
  setEditSlotEndTime: React.Dispatch<React.SetStateAction<string>>;
  setEditSlotTopics: React.Dispatch<React.SetStateAction<string>>;
  setEditSlotTrendAnalysis: React.Dispatch<React.SetStateAction<string>>;
  setEditSlotBreakTime: React.Dispatch<React.SetStateAction<string>>;
  setIsEditSlotOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingSlotId: React.Dispatch<React.SetStateAction<string | null>>;
  setEditHeaderSubject: React.Dispatch<React.SetStateAction<string>>;
  setEditHeaderDetail: React.Dispatch<React.SetStateAction<string>>;
  setIsEditingHeader: React.Dispatch<React.SetStateAction<boolean>>;
  setIsResetConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPlanToDelete: React.Dispatch<React.SetStateAction<string | null>>;
  setDeletingSlotId: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveUtilityTab: React.Dispatch<React.SetStateAction<string>>;
  setTimerPreset: React.Dispatch<React.SetStateAction<string>>;
  setIsTimerEndPromptOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTimerOnBreak: React.Dispatch<React.SetStateAction<boolean>>;
  setPrevFocusPreset: React.Dispatch<React.SetStateAction<string>>;
  setTimerDuration: React.Dispatch<React.SetStateAction<number>>;
  setTimerRemaining: React.Dispatch<React.SetStateAction<number>>;
  setBreakSeconds: React.Dispatch<React.SetStateAction<number>>;
  setIsTimerRunning: React.Dispatch<React.SetStateAction<boolean>>;
  setIsBreakActive: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveSlotId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsAddSlotOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOverlapError: React.Dispatch<React.SetStateAction<string | null>>;

  // Refs
  plansPanelRef: React.RefObject<HTMLDivElement | null>;
  profileDropdownRef: React.RefObject<HTMLDivElement | null>;

  // Functions
  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
  handleEnterDemoMode: () => void;
  handleMigrateData: () => Promise<void>;
  handleDiscardLocalData: () => void;
  handleAdminLogin: (e: React.FormEvent) => Promise<void>;
  handleAdminLogout: () => Promise<void>;
  fetchStudents: () => Promise<void>;
  handleSelectStudent: (student: any) => void;
  handleSaveComments: () => Promise<void>;
  handleSaveHeader: () => void;
  toggleTheme: () => void;
  handleSwitchPlan: (planId: string) => void;
  handleCreatePlan: (e: React.FormEvent) => void;
  handleDeletePlan: (planId: string) => void;
  performDeletePlan: (planId: string) => Promise<void>;
  handleStartSession: (slotId: string) => void;
  handleTogglePlay: () => void;
  handleCompleteSlot: (slotId: string) => void;
  handleToggleCompleteCheckbox: (slotId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  handleResetTimer: () => void;
  handleResetAllProgress: () => Promise<void>;
  handleAddCustomSlot: (e: React.FormEvent) => void;
  handleDeleteSlot: (slotId: string) => void;
  handleOpenEditSlot: (slot: StudySlot) => void;
  handleEditSlotSubmit: (e: React.FormEvent) => void;

  minutesToTimeString: (mins: number) => string;
  timeStringToMinutes: (timeStr: string) => number;
  formatTime12: (minutes: number) => string;
  getFreeGapsForDay: (dayId: number) => { start: number; end: number }[];
  getStartTimeOptions: (gapStart: number, gapEnd: number) => number[];
  getEndTimeOptions: (selectedStart: number, gapEnd: number) => number[];
  formatSecondsToMMSS: (totalSecs: number) => string;
  getShiftedTimeStr: (baseMinutes: number, dayId: number) => string;
  calculateBreakMinutes: (currentEnd: number, nextStart: number) => string;
}

const DashboardStateContext = createContext<DashboardStateContextProps | undefined>(undefined);
const DashboardActionsContext = createContext<DashboardActionsContextProps | undefined>(undefined);

async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export const DashboardProvider: React.FC<{ children: React.ReactNode; initialAdminLoginOpen?: boolean }> = ({ children, initialAdminLoginOpen = false }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // Migration Modal States
  const [showMigrationModal, setShowMigrationModal] = useState<boolean>(false);
  const [pendingMigrationData, setPendingMigrationData] = useState<{
    plans: Plan[];
    activePlanId: string;
    progress: UserProgress;
  } | null>(null);
  const [cloudDataToRestore, setCloudDataToRestore] = useState<{
    plans: Plan[];
    activePlanId: string;
    progress: UserProgress;
  } | null>(null);

  // Admin Panel States
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [adminSelectedStudent, setAdminSelectedStudent] = useState<any>(null);
  const [adminInspectPlan, setAdminInspectPlan] = useState<any | null>(null);
  const [adminComments, setAdminComments] = useState<string>("");
  const [adminInputComments, setAdminInputComments] = useState<string>("");
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(initialAdminLoginOpen);

  // Refs to bypass timer resets when restoring from localStorage
  const restoredSlotIdRef = useRef<string | null>(null);
  const restoredPresetRef = useRef<string | null>(null);
  const plansPanelRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const userDocUnsubscribeRef = useRef<(() => void) | null>(null);
  const lastSyncTimeRef = useRef<number>(0);
  const prevActiveSlotIdRef = useRef<string | null>(null);
  const prevTimerRunningRef = useRef<boolean>(false);
  const prevBreakActiveRef = useRef<boolean>(false);

  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [selectedDayId, setSelectedDayId] = useState<number | string>(1);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isBreakActive, setIsBreakActive] = useState<boolean>(false);
  const [timerDuration, setTimerDuration] = useState<number>(10800); // 3 hours in seconds
  const [timerRemaining, setTimerRemaining] = useState<number>(10800);
  const [breakSeconds, setBreakSeconds] = useState<number>(0);

  // Custom Timer Preset Option
  const [timerPreset, setTimerPreset] = useState<string>("full");

  // Modals and Navigation
  const [isQuoteOpen, setIsQuoteOpen] = useState<boolean>(false);
  const [completedSlotName, setCompletedSlotName] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isRoadmapCollapsed, setIsRoadmapCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [activeUtilityTab, setActiveUtilityTab] = useState<string>("csr");

  // Custom Topic Form Modal State
  const [isAddSlotOpen, setIsAddSlotOpen] = useState<boolean>(false);
  const [newSlotDayId, setNewSlotDayId] = useState<number>(1);
  const [newSlotName, setNewSlotName] = useState<string>("");
  const [newSlotStartTime, setNewSlotStartTime] = useState<string>("18:00");
  const [newSlotEndTime, setNewSlotEndTime] = useState<string>("19:30");
  const [newSlotTopics, setNewSlotTopics] = useState<string>("");
  const [newSlotBreakTime, setNewSlotBreakTime] = useState<string>("5");
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);
  const [overlapError, setOverlapError] = useState<string | null>(null);
  const [selectedGapIndex, setSelectedGapIndex] = useState<number>(0);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // New Study Plan state variables
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string>("");
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState<boolean>(false);
  const [newPlanName, setNewPlanName] = useState<string>("");
  const [newPlanStartDate, setNewPlanStartDate] = useState<string>("");
  const [newPlanEndDate, setNewPlanEndDate] = useState<string>("");

  // Edit Slot Modal state variables
  const [isEditSlotOpen, setIsEditSlotOpen] = useState<boolean>(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editSlotName, setEditSlotName] = useState<string>("");
  const [editSlotStartTime, setEditSlotStartTime] = useState<string>("07:00");
  const [editSlotEndTime, setEditSlotEndTime] = useState<string>("10:00");
  const [editSlotTopics, setEditSlotTopics] = useState<string>("");
  const [editSlotTrendAnalysis, setEditSlotTrendAnalysis] = useState<string>("");
  const [editSlotBreakTime, setEditSlotBreakTime] = useState<string>("5");

  // Edit Day Header state variables
  const [isEditingHeader, setIsEditingHeader] = useState<boolean>(false);
  const [editHeaderSubject, setEditHeaderSubject] = useState<string>("");
  const [editHeaderDetail, setEditHeaderDetail] = useState<string>("");

  // View Section state
  const [activeSection] = useState<string>("workspace");

  // New Timer states for custom flow
  const [isPlansPanelOpen, setIsPlansPanelOpen] = useState<boolean>(false);
  const [isTimerEndPromptOpen, setIsTimerEndPromptOpen] = useState<boolean>(false);
  const [isTimerOnBreak, setIsTimerOnBreak] = useState<boolean>(false);
  const [prevFocusPreset, setPrevFocusPreset] = useState<string>("full");

  // Refs for Intervals
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const breakIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Close plans panel and profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (plansPanelRef.current && !plansPanelRef.current.contains(event.target as Node)) {
        setIsPlansPanelOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Client-side mount check to prevent white hydration flicker
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedAdminMode = sessionStorage.getItem("is_admin_mode") === "true";
      if (savedAdminMode) {
        setIsAdminMode(true);
      }
    }
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Helpers
  const minutesToTimeString = useCallback((mins: number): string => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    const formatHrs = hrs < 10 ? `0${hrs}` : hrs;
    const formatMins = m < 10 ? `0${m}` : m;
    return `${formatHrs}:${formatMins}`;
  }, []);

  const timeStringToMinutes = useCallback((timeStr: string): number => {
    const [hrs, mins] = timeStr.split(":").map(Number);
    return (hrs || 0) * 60 + (mins || 0);
  }, []);

  const formatTime12 = useCallback((minutes: number) => {
    const hrs = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    const ampm = hrs >= 12 ? "PM" : "AM";
    const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
    const displayMins = mins < 10 ? `0${mins}` : mins;
    return `${displayHrs}:${displayMins} ${ampm}`;
  }, []);

  // Load plans & progress from LocalStorage
  const loadFromLocalStorage = useCallback(() => {
    const storedPlans = localStorage.getItem("study_plans");
    const storedActivePlanId = localStorage.getItem("active_plan_id");
    let currentPlans: Plan[] = [];
    let currentActivePlanId = "";

    if (storedPlans) {
      try {
        currentPlans = JSON.parse(storedPlans);
      } catch (e) {
        console.error(e);
      }
    }

    if (storedActivePlanId) {
      currentActivePlanId = storedActivePlanId;
    } else if (currentPlans.length > 0) {
      currentActivePlanId = currentPlans[0].id;
      localStorage.setItem("active_plan_id", currentActivePlanId);
    }

    setPlans(currentPlans);
    setActivePlanId(currentActivePlanId);

    const stored = localStorage.getItem("icsi_study_planner");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProgress({
          ...DEFAULT_PROGRESS,
          ...parsed,
        });

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
        if (parsed.isTimerOnBreak !== undefined) setIsTimerOnBreak(parsed.isTimerOnBreak);
        if (parsed.prevFocusPreset !== undefined) setPrevFocusPreset(parsed.prevFocusPreset);

        if (parsed.theme === "dark") {
          document.documentElement.classList.add("theme-dark");
        } else {
          document.documentElement.classList.remove("theme-dark");
        }
      } catch (e) {
        console.error("Error reading localStorage", e);
      }
    }
  }, []);

  // Sync state to Firebase doc
  const syncToFirebase = useCallback(async (updatedPlans: Plan[], updatedActivePlanId: string, updatedProgress: UserProgress) => {
    if (!auth.currentUser) return;
    try {
      const totalStudyTime = Object.values(updatedProgress.timeSpent).reduce((a, b) => a + b, 0);
      const totalBreakTime = Object.values(updatedProgress.breakTime).reduce((a, b) => a + b, 0);
      const slotStudyTime = updatedProgress.timeSpent;
      const slotBreakTime = updatedProgress.breakTime;

      const dailyStudyTime: Record<string, number> = {};
      const dailyBreakTime: Record<string, number> = {};
      updatedPlans.forEach(plan => {
        plan.days.forEach(day => {
          let dayStudy = 0;
          let dayBreak = 0;
          day.slots.forEach(slot => {
            dayStudy += updatedProgress.timeSpent[slot.id] || 0;
            dayBreak += updatedProgress.breakTime[slot.id] || 0;
          });
          dailyStudyTime[`${plan.id}_${day.id}`] = dayStudy;
          dailyBreakTime[`${plan.id}_${day.id}`] = dayBreak;
        });
      });

      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        plans: updatedPlans,
        activePlanId: updatedActivePlanId,
        progress: {
          ...updatedProgress,
          activeSlotId,
          isTimerRunning,
          isBreakActive,
          timerDuration,
          timerRemaining,
          breakSeconds,
          timerPreset,
          selectedDayId,
          isTimerOnBreak,
          prevFocusPreset
        },
        totalStudyTime,
        totalBreakTime,
        slotStudyTime,
        slotBreakTime,
        dailyStudyTime,
        dailyBreakTime
      });
    } catch (e) {
      console.error("Firebase sync error: ", e);
    }
  }, [activeSlotId, isTimerRunning, isBreakActive, timerDuration, timerRemaining, breakSeconds, timerPreset, selectedDayId, isTimerOnBreak, prevFocusPreset]);

  // Helper to check if local progress exists in localStorage
  const hasLocalProgress = useCallback(() => {
    try {
      const localProgressStr = localStorage.getItem("icsi_study_planner");
      if (localProgressStr) {
        const parsed = JSON.parse(localProgressStr);
        if (
          (parsed.completedSlots && Object.keys(parsed.completedSlots).length > 0) ||
          (parsed.timeSpent && Object.keys(parsed.timeSpent).length > 0) ||
          (parsed.breakTime && Object.keys(parsed.breakTime).length > 0) ||
          (parsed.scheduleDelay && Object.keys(parsed.scheduleDelay).length > 0) ||
          (parsed.deletedSlots && Object.keys(parsed.deletedSlots).length > 0) ||
          parsed.activeSlotId
        ) {
          return true;
        }
      }
      const localPlansStr = localStorage.getItem("study_plans");
      if (localPlansStr) {
        const parsed = JSON.parse(localPlansStr);
        if (parsed.length > 1) {
          return true;
        }
        if (parsed.length === 1 && parsed[0].id !== "plan-default") {
          return true;
        }
        if (parsed.length === 1 && parsed[0].id === "plan-default") {
          const defaultPlanDays = parsed[0].days;
          if (defaultPlanDays) {
            const totalDefaultSlots = scheduleData.flatMap((d: any) => d.slots).length;
            const totalLocalSlots = defaultPlanDays.flatMap((d: any) => d.slots).length;
            if (totalDefaultSlots !== totalLocalSlots) {
              return true;
            }
          }
        }
      }
    } catch (e) {
      console.error("Error checking local progress:", e);
    }
    return false;
  }, []);

  // Helper to apply progress to component states
  const applyProgressAndPlans = useCallback((loadedPlans: Plan[], loadedActivePlanId: string, loadedProgress: UserProgress) => {
    setPlans(loadedPlans);
    setActivePlanId(loadedActivePlanId);
    setProgress(loadedProgress);

    if (loadedProgress.activeSlotId !== undefined) {
      setActiveSlotId(loadedProgress.activeSlotId);
      restoredSlotIdRef.current = loadedProgress.activeSlotId;
    }
    if (loadedProgress.isTimerRunning !== undefined) setIsTimerRunning(loadedProgress.isTimerRunning);
    if (loadedProgress.isBreakActive !== undefined) setIsBreakActive(loadedProgress.isBreakActive);
    if (loadedProgress.timerDuration !== undefined) setTimerDuration(loadedProgress.timerDuration);
    if (loadedProgress.timerRemaining !== undefined) setTimerRemaining(loadedProgress.timerRemaining);
    if (loadedProgress.breakSeconds !== undefined) setBreakSeconds(loadedProgress.breakSeconds);
    if (loadedProgress.timerPreset !== undefined) {
      setTimerPreset(loadedProgress.timerPreset);
      restoredPresetRef.current = loadedProgress.timerPreset;
    }
    if (loadedProgress.selectedDayId !== undefined) setSelectedDayId(loadedProgress.selectedDayId);
    if (loadedProgress.isTimerOnBreak !== undefined) setIsTimerOnBreak(loadedProgress.isTimerOnBreak);
    if (loadedProgress.prevFocusPreset !== undefined) setPrevFocusPreset(loadedProgress.prevFocusPreset);

    if (loadedProgress.theme === "dark") {
      document.documentElement.classList.add("theme-dark");
    } else {
      document.documentElement.classList.remove("theme-dark");
    }
  }, []);

  const getDefaultRoadmapFromFirebase = useCallback(async (): Promise<Plan> => {
    try {
      const docRef = doc(db, "system", "default_roadmap");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: data.id || "plan-default",
          name: data.name || "7-Day Study Roadmap",
          startDate: data.startDate || "2026-05-24",
          endDate: data.endDate || "2026-05-30",
          days: data.days || JSON.parse(JSON.stringify(scheduleData))
        };
      } else {
        const defaultPlan: Plan = {
          id: "plan-default",
          name: "7-Day Study Roadmap",
          startDate: "2026-05-24",
          endDate: "2026-05-30",
          days: JSON.parse(JSON.stringify(scheduleData))
        };
        await setDoc(docRef, defaultPlan);
        return defaultPlan;
      }
    } catch (e) {
      console.error("Firestore get default roadmap error: ", e);
      return {
        id: "plan-default",
        name: "7-Day Study Roadmap",
        startDate: "2026-05-24",
        endDate: "2026-05-30",
        days: JSON.parse(JSON.stringify(scheduleData))
      };
    }
  }, []);

  // Listen to Auth changes & load user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (userDocUnsubscribeRef.current) {
        userDocUnsubscribeRef.current();
        userDocUnsubscribeRef.current = null;
      }
      setUser(currentUser);
      if (currentUser) {
        if (isAdminLoginOpen) {
          setAuthLoading(false);
          return;
        }
        if (currentUser.isAnonymous || isAdminMode) {
          setIsAdminMode(true);
          setAuthLoading(false);
          return;
        }

        setAuthLoading(true);
        setFirebaseError(null);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let cloudPlans: Plan[] = [];
          let cloudActivePlanId = "plan-default";
          let cloudProgress = DEFAULT_PROGRESS;
          let cloudComments = "";

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (data.plans) cloudPlans = data.plans;
            if (data.activePlanId) cloudActivePlanId = data.activePlanId;
            if (data.progress) cloudProgress = { ...DEFAULT_PROGRESS, ...data.progress };
            if (data.adminComments) cloudComments = data.adminComments;
          }

          setAdminComments(cloudComments);

          userDocUnsubscribeRef.current = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              if (data.adminComments !== undefined) {
                setAdminComments(data.adminComments || "");
              }
            }
          }, (err) => {
            console.error("Real-time comments listener error:", err);
          });

          setDoc(userDocRef, {
            email: currentUser.email || "",
            displayName: currentUser.displayName || "",
            photoURL: currentUser.photoURL || ""
          }, { merge: true }).catch(err => console.error("Failed to update user metadata:", err));

          const isInitialSignup = !userDocSnap.exists();

          if (isInitialSignup && hasLocalProgress()) {
            const localPlansStr = localStorage.getItem("study_plans");
            const localActivePlanId = localStorage.getItem("active_plan_id") || "plan-default";
            const localProgressStr = localStorage.getItem("icsi_study_planner");

            let localPlans: Plan[] = [];
            if (localPlansStr) {
              try { localPlans = JSON.parse(localPlansStr); } catch (e) {}
            }
            if (localPlans.length === 0) {
              localPlans = [{
                id: "plan-default",
                name: "7-Day Study Roadmap",
                startDate: "2026-05-24",
                endDate: "2026-05-30",
                days: JSON.parse(JSON.stringify(scheduleData))
              }];
            }

            let localProgress = DEFAULT_PROGRESS;
            if (localProgressStr) {
              try { localProgress = { ...DEFAULT_PROGRESS, ...JSON.parse(localProgressStr) }; } catch (e) {}
            }

            setPendingMigrationData({
              plans: localPlans,
              activePlanId: localActivePlanId,
              progress: localProgress
            });

            let restorePlans = cloudPlans;
            let restoreActivePlanId = cloudActivePlanId;
            if (restorePlans.length === 0) {
              restoreActivePlanId = "";
            }

            setCloudDataToRestore({
              plans: restorePlans,
              activePlanId: restoreActivePlanId,
              progress: cloudProgress
            });

            setShowMigrationModal(true);
            setAuthLoading(false);
          } else {
            if (userDocSnap.exists()) {
              applyProgressAndPlans(cloudPlans, cloudActivePlanId, cloudProgress);
              localStorage.removeItem("study_plans");
              localStorage.removeItem("active_plan_id");
              localStorage.removeItem("icsi_study_planner");
            } else {
              const defaultPlans: Plan[] = [];
              await setDoc(userDocRef, {
                plans: defaultPlans,
                activePlanId: "",
                progress: DEFAULT_PROGRESS,
                totalStudyTime: 0,
                totalBreakTime: 0,
                slotStudyTime: {},
                slotBreakTime: {},
                dailyStudyTime: {},
                dailyBreakTime: {}
              }, { merge: true });
              applyProgressAndPlans(defaultPlans, "", DEFAULT_PROGRESS);
            }
            setAuthLoading(false);
          }
        } catch (error: any) {
          console.error("Firebase fetch error: ", error);
          setFirebaseError("Failed to load cloud database. Sync disabled.");
          loadFromLocalStorage();
          setAuthLoading(false);
        }
      } else {
        setPlans([]);
        setActivePlanId("plan-default");
        setProgress(DEFAULT_PROGRESS);
        setAuthLoading(false);
      }
      setIsRestored(true);
    });

    return () => {
      unsubscribe();
      if (userDocUnsubscribeRef.current) {
        userDocUnsubscribeRef.current();
      }
    };
  }, [isAdminLoginOpen, isAdminMode, applyProgressAndPlans, getDefaultRoadmapFromFirebase, hasLocalProgress, loadFromLocalStorage]);

  // Real-time listener for all students in Admin Mode
  useEffect(() => {
    if (!isAdminMode) return;

    setAuthLoading(true);
    const q = collection(db, "users");

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const students: any[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        students.push({
          uid: docSnap.id,
          ...data
        });
      });
      setStudentsList(students);
      setAuthLoading(false);
    }, (err) => {
      console.error("Error in real-time students listener:", err);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [isAdminMode]);

  // Sync isAdminMode to sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isAdminMode) {
        sessionStorage.setItem("is_admin_mode", "true");
      } else {
        sessionStorage.removeItem("is_admin_mode");
      }
    }
  }, [isAdminMode]);

  // Keep adminSelectedStudent in sync with studentsList
  useEffect(() => {
    if (isAdminMode && adminSelectedStudent) {
      const updated = studentsList.find(s => s.uid === adminSelectedStudent.uid);
      if (updated) {
        setAdminSelectedStudent(updated);
      }
    }
  }, [studentsList, isAdminMode, adminSelectedStudent]);

  // Sync state to LocalStorage and Firebase (debounced & throttled)
  useEffect(() => {
    if (!isRestored) return;

    const stored = localStorage.getItem("icsi_study_planner");
    let parsed = {};
    if (stored) {
      try { parsed = JSON.parse(stored); } catch (e) { console.error(e); }
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
      selectedDayId,
      isTimerOnBreak,
      prevFocusPreset
    };
    localStorage.setItem("icsi_study_planner", JSON.stringify(updated));

    if (user) {
      const now = Date.now();
      const timeSinceLastSync = now - lastSyncTimeRef.current;

      const statusChanged = isTimerRunning !== prevTimerRunningRef.current || isBreakActive !== prevBreakActiveRef.current;
      prevTimerRunningRef.current = isTimerRunning;
      prevBreakActiveRef.current = isBreakActive;

      const progressData = {
        ...progress,
        activeSlotId,
        isTimerRunning,
        isBreakActive,
        timerDuration,
        timerRemaining,
        breakSeconds,
        timerPreset,
        selectedDayId,
        isTimerOnBreak,
        prevFocusPreset
      };

      const totalStudyTime = Object.values(progress.timeSpent).reduce((a, b) => a + b, 0);
      const totalBreakTime = Object.values(progress.breakTime).reduce((a, b) => a + b, 0);
      const slotStudyTime = progress.timeSpent;
      const slotBreakTime = progress.breakTime;

      const dailyStudyTime: Record<string, number> = {};
      const dailyBreakTime: Record<string, number> = {};
      plans.forEach(plan => {
        plan.days.forEach(day => {
          let dayStudy = 0;
          let dayBreak = 0;
          day.slots.forEach(slot => {
            dayStudy += progress.timeSpent[slot.id] || 0;
            dayBreak += progress.breakTime[slot.id] || 0;
          });
          dailyStudyTime[`${plan.id}_${day.id}`] = dayStudy;
          dailyBreakTime[`${plan.id}_${day.id}`] = dayBreak;
        });
      });

      const updatePayload = {
        plans,
        activePlanId,
        progress: progressData,
        totalStudyTime,
        totalBreakTime,
        slotStudyTime,
        slotBreakTime,
        dailyStudyTime,
        dailyBreakTime
      };

      if (statusChanged) {
        lastSyncTimeRef.current = now;
        const userDocRef = doc(db, "users", user.uid);
        updateDoc(userDocRef, updatePayload).catch(err => console.error("Firebase status transition sync failed:", err));
      } else if ((isTimerRunning || isBreakActive) && timeSinceLastSync > 10000) {
        lastSyncTimeRef.current = now;
        const userDocRef = doc(db, "users", user.uid);
        updateDoc(userDocRef, updatePayload).catch(err => console.error("Firebase interval sync failed:", err));
      } else {
        const timer = setTimeout(() => {
          lastSyncTimeRef.current = Date.now();
          const userDocRef = doc(db, "users", user.uid);
          updateDoc(userDocRef, updatePayload).catch(err => console.error("Firebase debounced sync failed:", err));
        }, 2500);

        return () => clearTimeout(timer);
      }
    }
  }, [isRestored, activeSlotId, isTimerRunning, isBreakActive, timerDuration, timerRemaining, breakSeconds, timerPreset, selectedDayId, isTimerOnBreak, prevFocusPreset, user, plans, activePlanId, progress]);

  // Save progress helper
  const saveProgress = useCallback((updated: UserProgress) => {
    setProgress(updated);
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);

      const totalStudyTime = Object.values(updated.timeSpent).reduce((a, b) => a + b, 0);
      const totalBreakTime = Object.values(updated.breakTime).reduce((a, b) => a + b, 0);
      const slotStudyTime = updated.timeSpent;
      const slotBreakTime = updated.breakTime;

      const dailyStudyTime: Record<string, number> = {};
      const dailyBreakTime: Record<string, number> = {};
      plans.forEach(plan => {
        plan.days.forEach(day => {
          let dayStudy = 0;
          let dayBreak = 0;
          day.slots.forEach(slot => {
            dayStudy += updated.timeSpent[slot.id] || 0;
            dayBreak += updated.breakTime[slot.id] || 0;
          });
          dailyStudyTime[`${plan.id}_${day.id}`] = dayStudy;
          dailyBreakTime[`${plan.id}_${day.id}`] = dayBreak;
        });
      });

      updateDoc(userDocRef, {
        "progress.completedSlots": updated.completedSlots,
        "progress.timeSpent": updated.timeSpent,
        "progress.breakTime": updated.breakTime,
        "progress.scheduleDelay": updated.scheduleDelay,
        "progress.deletedSlots": updated.deletedSlots || {},
        "progress.theme": updated.theme,
        totalStudyTime,
        totalBreakTime,
        slotStudyTime,
        slotBreakTime,
        dailyStudyTime,
        dailyBreakTime
      }).catch(err => console.error("Firebase progress sync failed:", err));
    } else {
      const updatedWithTimer = {
        ...updated,
        activeSlotId,
        isTimerRunning,
        isBreakActive,
        timerDuration,
        timerRemaining,
        breakSeconds,
        timerPreset,
        selectedDayId,
        isTimerOnBreak,
        prevFocusPreset
      };
      localStorage.setItem("icsi_study_planner", JSON.stringify(updatedWithTimer));
    }
  }, [plans, activeSlotId, isTimerRunning, isBreakActive, timerDuration, timerRemaining, breakSeconds, timerPreset, selectedDayId, isTimerOnBreak, prevFocusPreset]);

  const savePlans = useCallback((updatedPlans: Plan[], nextActivePlanId?: string) => {
    setPlans(updatedPlans);
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const updateData: any = { plans: updatedPlans };
      if (nextActivePlanId !== undefined) {
        updateData.activePlanId = nextActivePlanId;
      }
      updateDoc(userDocRef, updateData).catch(err => console.error("Firebase plans sync failed:", err));
    } else {
      localStorage.setItem("study_plans", JSON.stringify(updatedPlans));
    }
  }, []);

  // Handlers for Login/Logout
  const handleLogin = useCallback(async () => {
    setFirebaseError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      console.error("Login popup failed:", e);
      setFirebaseError(e.message || "Sign in failed. Check console or config.");
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsDemoMode(false);
      setPlans([]);
      setActivePlanId("");
      setProgress(DEFAULT_PROGRESS);
      setActiveSlotId(null);
      setIsTimerRunning(false);
      setIsBreakActive(false);
      setTimerDuration(10800);
      setTimerRemaining(10800);
      setBreakSeconds(0);
      setIsTimerOnBreak(false);

      setShowMigrationModal(false);
      setPendingMigrationData(null);
      setCloudDataToRestore(null);
      setIsAdminMode(false);
      setIsAdminLoginOpen(false);
    } catch (e) {
      console.error("Sign out failed:", e);
    }
  }, []);

  const handleEnterDemoMode = useCallback(() => {
    setIsDemoMode(true);
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const handleMigrateData = useCallback(async () => {
    if (!auth.currentUser || !pendingMigrationData) return;
    setAuthLoading(true);
    try {
      const totalStudyTime = Object.values(pendingMigrationData.progress.timeSpent).reduce((a, b) => a + b, 0);
      const totalBreakTime = Object.values(pendingMigrationData.progress.breakTime).reduce((a, b) => a + b, 0);
      const slotStudyTime = pendingMigrationData.progress.timeSpent;
      const slotBreakTime = pendingMigrationData.progress.breakTime;

      const dailyStudyTime: Record<string, number> = {};
      const dailyBreakTime: Record<string, number> = {};
      pendingMigrationData.plans.forEach(plan => {
        plan.days.forEach(day => {
          let dayStudy = 0;
          let dayBreak = 0;
          day.slots.forEach(slot => {
            dayStudy += pendingMigrationData.progress.timeSpent[slot.id] || 0;
            dayBreak += pendingMigrationData.progress.breakTime[slot.id] || 0;
          });
          dailyStudyTime[`${plan.id}_${day.id}`] = dayStudy;
          dailyBreakTime[`${plan.id}_${day.id}`] = dayBreak;
        });
      });

      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userDocRef, {
        plans: pendingMigrationData.plans,
        activePlanId: pendingMigrationData.activePlanId,
        progress: pendingMigrationData.progress,
        totalStudyTime,
        totalBreakTime,
        slotStudyTime,
        slotBreakTime,
        dailyStudyTime,
        dailyBreakTime
      }, { merge: true });

      applyProgressAndPlans(
        pendingMigrationData.plans,
        pendingMigrationData.activePlanId,
        pendingMigrationData.progress
      );

      localStorage.removeItem("study_plans");
      localStorage.removeItem("active_plan_id");
      localStorage.removeItem("icsi_study_planner");
    } catch (e) {
      console.error("Migration failed:", e);
      alert("Failed to migrate data to cloud. Please try again.");
    } finally {
      setShowMigrationModal(false);
      setPendingMigrationData(null);
      setCloudDataToRestore(null);
      setAuthLoading(false);
    }
  }, [pendingMigrationData, applyProgressAndPlans]);

  const handleDiscardLocalData = useCallback(() => {
    if (!cloudDataToRestore) return;
    setAuthLoading(true);

    applyProgressAndPlans(
      cloudDataToRestore.plans,
      cloudDataToRestore.activePlanId,
      cloudDataToRestore.progress
    );

    localStorage.removeItem("study_plans");
    localStorage.removeItem("active_plan_id");
    localStorage.removeItem("icsi_study_planner");

    setShowMigrationModal(false);
    setPendingMigrationData(null);
    setCloudDataToRestore(null);
    setAuthLoading(false);
  }, [cloudDataToRestore, applyProgressAndPlans]);

  const fetchStudents = useCallback(async () => {
    setAuthLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const students: any[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        students.push({
          uid: docSnap.id,
          ...data
        });
      });
      setStudentsList(students);
    } catch (e) {
      console.error("Error fetching students: ", e);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleAdminLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError(null);
    
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      setAdminLoginError("Access denied. Please authenticate with Google first.");
      return;
    }

    const adminEmail = currentUser.email;

    try {
      // 1. Fetch admin document from Firestore
      const adminDocRef = doc(db, "admins", adminEmail);
      let adminDoc = await getDoc(adminDocRef);

      // 2. If it does not exist, and it is the default admin email, seed the document
      if (!adminDoc.exists()) {
        if (adminEmail === "sunuhacker@gmail.com" || adminEmail === "cezanne.p.cez@gmail.com") {
          const defaultHash = await hashPassword("cezan123");
          await setDoc(adminDocRef, {
            username: "admin",
            passwordHash: defaultHash,
            email: adminEmail,
            createdAt: new Date().toISOString()
          });
          adminDoc = await getDoc(adminDocRef); // re-fetch
        } else {
          setAdminLoginError("Access denied. Your account is not configured as an administrator.");
          return;
        }
      }

      const adminData = adminDoc.data();
      if (!adminData) {
        setAdminLoginError("Admin configuration could not be loaded.");
        return;
      }

      // 3. Hash the entered password
      const inputHash = await hashPassword(adminPassword);

      // 4. Compare username and passwordHash
      if (adminUsername === adminData.username && inputHash === adminData.passwordHash) {
        setIsAdminMode(true);
        setIsAdminLoginOpen(false);
        setAdminUsername("");
        setAdminPassword("");
        await fetchStudents();
      } else {
        setAdminLoginError("Invalid username or password.");
      }
    } catch (err: any) {
      console.error("Admin Login Error: ", err);
      setAdminLoginError(`Authentication failed: ${err.message || err}`);
    }
  }, [adminUsername, adminPassword, fetchStudents]);

  const handleAdminLogout = useCallback(async () => {
    setIsAdminMode(false);
    setStudentsList([]);
    setAdminSelectedStudent(null);
    setAdminInputComments("");
    if (initialAdminLoginOpen) {
      setIsAdminLoginOpen(true);
    }
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out failed:", e);
    }
  }, [initialAdminLoginOpen]);

  const handleSelectStudent = useCallback((student: any) => {
    setAdminSelectedStudent(student);
    setAdminInputComments(student?.adminComments || "");
  }, []);

  const handleSaveComments = useCallback(async () => {
    if (!adminSelectedStudent) return;
    try {
      const studentDocRef = doc(db, "users", adminSelectedStudent.uid);
      await setDoc(studentDocRef, {
        adminComments: adminInputComments
      }, { merge: true });

      setAdminSelectedStudent((prev: any) => ({
        ...prev,
        adminComments: adminInputComments
      }));

      setStudentsList((prevList) =>
        prevList.map((stud) =>
          stud.uid === adminSelectedStudent.uid
            ? { ...stud, adminComments: adminInputComments }
            : stud
        )
      );

      alert("Comments saved successfully!");
    } catch (e) {
      console.error("Failed to save comments: ", e);
      alert("Failed to save comments. Please try again.");
    }
  }, [adminSelectedStudent, adminInputComments]);

  const handleSaveHeader = useCallback(() => {
    const trimmedSubject = editHeaderSubject.trim();
    const trimmedDetail = editHeaderDetail.trim();
    if (!trimmedSubject) {
      alert("Day heading subject cannot be empty.");
      return;
    }
    const newTitle = trimmedSubject + (trimmedDetail ? `: ${trimmedDetail}` : "");
    const updatedPlans = plans.map(p => {
      if (p.id === activePlanId) {
        return {
          ...p,
          days: p.days.map(d => {
            if (d.id === selectedDayId) {
              return {
                ...d,
                title: newTitle
              };
            }
            return d;
          })
        };
      }
      return p;
    });
    savePlans(updatedPlans);
    setIsEditingHeader(false);
  }, [plans, activePlanId, selectedDayId, editHeaderSubject, editHeaderDetail, savePlans]);

  const toggleTheme = useCallback(() => {
    const newTheme: "light" | "dark" = progress.theme === "light" ? "dark" : "light";
    const updated: UserProgress = { ...progress, theme: newTheme };
    saveProgress(updated);
    if (newTheme === "dark") {
      document.documentElement.classList.add("theme-dark");
    } else {
      document.documentElement.classList.remove("theme-dark");
    }
  }, [progress, saveProgress]);

  const handleSwitchPlan = useCallback((planId: string) => {
    setActivePlanId(planId);
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      updateDoc(userDocRef, {
        activePlanId: planId
      }).catch(err => console.error("Firebase activePlanId sync failed:", err));
    } else {
      localStorage.setItem("active_plan_id", planId);
    }
    const nextPlan = plans.find(p => p.id === planId);
    if (nextPlan && nextPlan.days.length > 0) {
      setSelectedDayId(nextPlan.days[0].id);
    }
    setIsTimerRunning(false);
    setIsBreakActive(false);
    setActiveSlotId(null);
    setBreakSeconds(0);
    setIsTimerOnBreak(false);
  }, [plans]);

  const handleCreatePlan = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName || !newPlanStartDate || !newPlanEndDate) {
      alert("Please fill in all plan details.");
      return;
    }

    const start = new Date(newPlanStartDate);
    const end = new Date(newPlanEndDate);

    if (end < start) {
      alert("End date must be after or equal to start date.");
      return;
    }

    const daysList: DayPlan[] = [];
    let dayNum = 1;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });

      daysList.push({
        id: dayNum,
        date: dateStr,
        dayName: dayName,
        title: `Day ${dayNum}: Plan your day`,
        trendAnalysis: "Add topics and start studying to track progress.",
        slots: []
      });
      dayNum++;
    }

    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
      name: newPlanName,
      startDate: newPlanStartDate,
      endDate: newPlanEndDate,
      days: daysList
    };

    const updatedPlans = [...plans, newPlan];
    savePlans(updatedPlans, newPlan.id);
    setActivePlanId(newPlan.id);
    if (!auth.currentUser) {
      localStorage.setItem("active_plan_id", newPlan.id);
    }
    setSelectedDayId(1);

    setNewPlanName("");
    setNewPlanStartDate("");
    setNewPlanEndDate("");
    setIsAddPlanOpen(false);
  }, [newPlanName, newPlanStartDate, newPlanEndDate, plans, savePlans]);

  const handleDeletePlan = useCallback((planId: string) => {
    setPlanToDelete(planId);
  }, []);

  const performDeletePlan = useCallback(async (planId: string) => {
    const updatedPlans = plans.filter(p => p.id !== planId);

    if (updatedPlans.length === 0) {
      savePlans([], "");
      setActivePlanId("");
      if (!auth.currentUser) {
        localStorage.setItem("active_plan_id", "");
      }
      setSelectedDayId(1);

      saveProgress({
        ...progress,
        completedSlots: {},
        timeSpent: {},
        breakTime: {},
        scheduleDelay: {},
        deletedSlots: {},
      });
    } else {
      const remainingPlan = updatedPlans[0];
      savePlans(updatedPlans, remainingPlan.id);
      setActivePlanId(remainingPlan.id);
      if (!auth.currentUser) {
        localStorage.setItem("active_plan_id", remainingPlan.id);
      }
      if (remainingPlan.days.length > 0) {
        setSelectedDayId(remainingPlan.days[0].id);
      }
    }

    setIsTimerRunning(false);
    setIsBreakActive(false);
    setActiveSlotId(null);
    setBreakSeconds(0);
    setIsTimerOnBreak(false);
  }, [plans, progress, savePlans, saveProgress, getDefaultRoadmapFromFirebase]);

  const handleStartSession = useCallback((slotId: string) => {
    const plan = plans.find(p => p.id === activePlanId) || plans[0];
    if (!plan) return;
    setActiveSlotId(slotId);
    setIsTimerRunning(true);
    setIsBreakActive(false);
    setTimerPreset("full");
    setBreakSeconds(0);
    setIsTimerOnBreak(false);

    const slot = plan.days.flatMap(d => d.slots).find(s => s.id === slotId);
    const duration = slot ? (slot.baseEndMinutes - slot.baseStartMinutes) * 60 : 10800;
    const spent = progress.timeSpent[slotId] || 0;
    setTimerDuration(duration);
    setTimerRemaining(Math.max(0, duration - spent));
  }, [plans, activePlanId, progress]);

  const handleTogglePlay = useCallback(() => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      if (!isTimerOnBreak) {
        setIsBreakActive(true);
      }
    } else {
      setIsTimerRunning(true);
      setIsBreakActive(false);
    }
  }, [isTimerRunning, isTimerOnBreak]);

  const handleCompleteSlot = useCallback((slotId: string) => {
    const plan = plans.find(p => p.id === activePlanId) || plans[0];
    if (!plan) return;
    const slot = plan.days.flatMap(d => d.slots).find(s => s.id === slotId);
    setCompletedSlotName(slot?.name || "Slot");

    setIsTimerRunning(false);
    setIsBreakActive(false);
    setActiveSlotId(null);
    setBreakSeconds(0);
    setIsTimerOnBreak(false);

    const updatedComplete = { ...progress.completedSlots };
    updatedComplete[slotId] = true;

    saveProgress({
      ...progress,
      completedSlots: updatedComplete
    });

    setIsQuoteOpen(true);
  }, [plans, activePlanId, progress, saveProgress]);

  const handleToggleCompleteCheckbox = useCallback((slotId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedComplete = { ...progress.completedSlots };
    if (event.target.checked) {
      updatedComplete[slotId] = true;
      const plan = plans.find(p => p.id === activePlanId) || plans[0];
      const slot = plan?.days.flatMap(d => d.slots).find(s => s.id === slotId);
      setCompletedSlotName(slot?.name || "Slot");
      setIsQuoteOpen(true);
    } else {
      delete updatedComplete[slotId];
    }

    saveProgress({
      ...progress,
      completedSlots: updatedComplete
    });
  }, [plans, activePlanId, progress, saveProgress]);

  const handleResetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setIsBreakActive(false);
    setTimerRemaining(timerDuration);
    setBreakSeconds(0);
    setIsTimerOnBreak(false);
  }, [timerDuration]);

  const handleResetAllProgress = useCallback(async () => {
    saveProgress({
      ...DEFAULT_PROGRESS,
      theme: progress.theme,
    });

    savePlans([], "");
    setActivePlanId("");
    if (!auth.currentUser) {
      localStorage.setItem("active_plan_id", "");
    }
    setSelectedDayId(1);

    setIsTimerRunning(false);
    setIsBreakActive(false);
    setActiveSlotId(null);
    setBreakSeconds(0);
    setIsResetConfirmOpen(false);
    setIsTimerOnBreak(false);
  }, [progress, saveProgress, savePlans]);

  const handleAddCustomSlot = useCallback((e: React.FormEvent) => {
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

    const plan = plans.find(p => p.id === activePlanId) || plans[0];
    if (!plan) return;
    const targetDay = plan.days.find(d => d.id === newSlotDayId);
    if (!targetDay) return;

    const targetDaySlots = targetDay.slots.filter(s => !progress.deletedSlots?.[s.id]);
    const isOverlapping = targetDaySlots.some(slot => startMin < slot.baseEndMinutes && endMin > slot.baseStartMinutes);
    if (isOverlapping) {
      setOverlapError("This time slot overlaps with an existing study topic. Please choose another time.");
      return;
    }

    const formatAMPM = (min: number) => {
      const hrs = Math.floor(min / 60);
      const m = min % 60;
      const ampm = hrs >= 12 ? "PM" : "AM";
      const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
      const displayMins = m < 10 ? `0${m}` : m;
      return `${displayHrs}:${displayMins} ${ampm}`;
    };

    const newSlot: StudySlot = {
      id: `slot-${Date.now()}`,
      name: newSlotName,
      timeRange: `${formatAMPM(startMin)} – ${formatAMPM(endMin)}`,
      baseStartMinutes: startMin,
      baseEndMinutes: endMin,
      topics: newSlotTopics,
      breakTimeAfter: newSlotBreakTime ? parseInt(newSlotBreakTime) : 5
    };

    const updatedPlans = plans.map(p => {
      if (p.id === plan.id) {
        return {
          ...p,
          days: p.days.map(d => {
            if (d.id === newSlotDayId) {
              return {
                ...d,
                slots: [...d.slots, newSlot].sort((a, b) => a.baseStartMinutes - b.baseStartMinutes)
              };
            }
            return d;
          })
        };
      }
      return p;
    });

    savePlans(updatedPlans);

    setNewSlotName("");
    setNewSlotTopics("");
    setNewSlotBreakTime("5");
    setIsAddSlotOpen(false);
  }, [newSlotName, newSlotTopics, newSlotStartTime, newSlotEndTime, newSlotDayId, newSlotBreakTime, plans, activePlanId, progress, savePlans, timeStringToMinutes]);

  const handleDeleteSlot = useCallback((slotId: string) => {
    const updatedDeleted = { ...progress.deletedSlots, [slotId]: true };
    const updatedComplete = { ...progress.completedSlots };
    delete updatedComplete[slotId];

    saveProgress({
      ...progress,
      deletedSlots: updatedDeleted,
      completedSlots: updatedComplete
    });

    if (activeSlotId === slotId) {
      setIsTimerRunning(false);
      setIsBreakActive(false);
      setActiveSlotId(null);
      setBreakSeconds(0);
    }
  }, [progress, activeSlotId, saveProgress]);

  const handleOpenEditSlot = useCallback((slot: StudySlot) => {
    setEditingSlotId(slot.id);
    setEditSlotName(slot.name);
    setEditSlotStartTime(minutesToTimeString(slot.baseStartMinutes));
    setEditSlotEndTime(minutesToTimeString(slot.baseEndMinutes));
    setEditSlotTopics(slot.topics);
    setEditSlotTrendAnalysis(slot.trendAnalysis || "");
    setEditSlotBreakTime(slot.breakTimeAfter !== undefined ? slot.breakTimeAfter.toString() : "5");
    setOverlapError(null);
    setIsEditSlotOpen(true);
  }, [minutesToTimeString]);

  const handleEditSlotSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!editSlotName || !editSlotTopics) {
      setOverlapError("Please fill in the Name and Topics fields.");
      return;
    }

    const startMin = timeStringToMinutes(editSlotStartTime);
    const endMin = timeStringToMinutes(editSlotEndTime);

    if (endMin <= startMin) {
      setOverlapError("End time must be after the start time.");
      return;
    }

    const plan = plans.find(p => p.id === activePlanId) || plans[0];
    if (!plan) return;
    const targetDay = plan.days.find(d => d.id === selectedDayId);
    if (!targetDay) return;

    const targetDaySlots = targetDay.slots.filter(s => s.id !== editingSlotId && !progress.deletedSlots?.[s.id]);
    const isOverlapping = targetDaySlots.some(slot => startMin < slot.baseEndMinutes && endMin > slot.baseStartMinutes);
    if (isOverlapping) {
      setOverlapError("This time slot overlaps with another topic. Please choose another time.");
      return;
    }

    const formatAMPM = (min: number) => {
      const hrs = Math.floor(min / 60);
      const m = min % 60;
      const ampm = hrs >= 12 ? "PM" : "AM";
      const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
      const displayMins = m < 10 ? `0${m}` : m;
      return `${displayHrs}:${displayMins} ${ampm}`;
    };

    const updatedPlans = plans.map(p => {
      if (p.id === plan.id) {
        return {
          ...p,
          days: p.days.map(d => {
            if (d.id === selectedDayId) {
              return {
                ...d,
                slots: d.slots.map(s => {
                  if (s.id === editingSlotId) {
                    return {
                      ...s,
                      name: editSlotName,
                      timeRange: `${formatAMPM(startMin)} – ${formatAMPM(endMin)}`,
                      baseStartMinutes: startMin,
                      baseEndMinutes: endMin,
                      topics: editSlotTopics,
                      trendAnalysis: editSlotTrendAnalysis || undefined,
                      breakTimeAfter: editSlotBreakTime ? parseInt(editSlotBreakTime) : 5
                    };
                  }
                  return s;
                }).sort((a, b) => a.baseStartMinutes - b.baseStartMinutes)
              };
            }
            return d;
          })
        };
      }
      return p;
    });

    savePlans(updatedPlans);
    setIsEditSlotOpen(false);
    setEditingSlotId(null);
  }, [editSlotName, editSlotTopics, editSlotStartTime, editSlotEndTime, plans, activePlanId, selectedDayId, editingSlotId, progress, editSlotTrendAnalysis, editSlotBreakTime, savePlans, timeStringToMinutes]);

  const getFreeGapsForDay = useCallback((dayId: number) => {
    const plan = plans.find(p => p.id === activePlanId) || plans[0];
    const targetDay = plan?.days.find(d => d.id === dayId);
    const targetDaySlots = targetDay
      ? [...targetDay.slots].filter(s => !progress.deletedSlots?.[s.id]).sort((a, b) => a.baseStartMinutes - b.baseStartMinutes)
      : [];

    const gaps: { start: number; end: number }[] = [];
    let currentMin = 300;

    for (const slot of targetDaySlots) {
      if (slot.baseStartMinutes > currentMin + 15) {
        gaps.push({ start: currentMin, end: slot.baseStartMinutes });
      }
      currentMin = Math.max(currentMin, slot.baseEndMinutes);
    }

    if (currentMin < 1440 - 15) {
      gaps.push({ start: currentMin, end: 1440 });
    }

    return gaps;
  }, [plans, activePlanId, progress]);

  const getStartTimeOptions = useCallback((gapStart: number, gapEnd: number) => {
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
  }, []);

  const getEndTimeOptions = useCallback((selectedStart: number, gapEnd: number) => {
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
  }, []);

  const formatSecondsToMMSS = useCallback((totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const displayHrs = hrs > 0 ? `${hrs}:` : "";
    const displayMins = mins < 10 && hrs > 0 ? `0${mins}` : mins;
    const displaySecs = secs < 10 ? `0${secs}` : secs;

    return `${displayHrs}${displayMins}:${displaySecs}`;
  }, []);

  const getShiftedTimeStr = useCallback((baseMinutes: number, dayId: number) => {
    const delaySeconds = progress.scheduleDelay[dayId] || 0;
    const delayMinutes = Math.floor(delaySeconds / 60);
    const shiftedMinutes = baseMinutes + delayMinutes;

    const hrs = Math.floor(shiftedMinutes / 60) % 24;
    const mins = shiftedMinutes % 60;
    const ampm = hrs >= 12 ? "PM" : "AM";
    const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
    const displayMins = mins < 10 ? `0${mins}` : mins;

    return `${displayHrs}:${displayMins} ${ampm}`;
  }, [progress]);

  const calculateBreakMinutes = useCallback((currentEnd: number, nextStart: number) => {
    const diff = nextStart - currentEnd;
    if (diff <= 0) return "";

    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;

    if (hrs > 0) {
      return mins > 0 ? `${hrs} Hour${hrs > 1 ? "s" : ""} ${mins} Min${mins > 1 ? "s" : ""}` : `${hrs} Hour${hrs > 1 ? "s" : ""}`;
    }
    return `${styleMins(mins)}`;

    function styleMins(m: number) {
      return `${m} Mins`;
    }
  }, []);

  // Timer Ticking Logic
  useEffect(() => {
    if (isTimerRunning && activeSlotId) {
      const plan = plans.find(p => p.id === activePlanId) || plans[0];
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsTimerRunning(false);
            setIsBreakActive(false);
            setIsTimerEndPromptOpen(true);
            return 0;
          }

          if (isTimerOnBreak) {
            setProgress(curr => {
              const updatedBreakTime = { ...curr.breakTime };
              updatedBreakTime[activeSlotId] = (updatedBreakTime[activeSlotId] || 0) + 1;

              const updatedDelays = { ...curr.scheduleDelay };
              const activeSlotDay = plan?.days.find(d => d.slots.some(s => s.id === activeSlotId));
              const activeSlotDayId = activeSlotDay ? activeSlotDay.id : (typeof selectedDayId === "number" ? selectedDayId : 1);
              updatedDelays[activeSlotDayId] = (updatedDelays[activeSlotDayId] || 0) + 1;

              const nextProgress = {
                ...curr,
                breakTime: updatedBreakTime,
                scheduleDelay: updatedDelays
              };
              if (!auth.currentUser) {
                localStorage.setItem("icsi_study_planner", JSON.stringify(nextProgress));
              }
              return nextProgress;
            });
          } else {
            setProgress(curr => {
              const updatedTimeSpent = { ...curr.timeSpent };
              updatedTimeSpent[activeSlotId] = (updatedTimeSpent[activeSlotId] || 0) + 1;
              const nextProgress = { ...curr, timeSpent: updatedTimeSpent };
              if (!auth.currentUser) {
                localStorage.setItem("icsi_study_planner", JSON.stringify(nextProgress));
              }
              return nextProgress;
            });
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, activeSlotId, isTimerOnBreak, selectedDayId, plans, activePlanId]);

  // Break/Pause Shifting Logic
  useEffect(() => {
    if (isBreakActive && activeSlotId) {
      const plan = plans.find(p => p.id === activePlanId) || plans[0];
      breakIntervalRef.current = setInterval(() => {
        setBreakSeconds(prev => prev + 1);

        setProgress(curr => {
          const updatedBreakTime = { ...curr.breakTime };
          updatedBreakTime[activeSlotId] = (updatedBreakTime[activeSlotId] || 0) + 1;

          const updatedDelays = { ...curr.scheduleDelay };
          const activeSlotDay = plan?.days.find(d => d.slots.some(s => s.id === activeSlotId));
          const activeSlotDayId = activeSlotDay ? activeSlotDay.id : (typeof selectedDayId === "number" ? selectedDayId : 1);
          updatedDelays[activeSlotDayId] = (updatedDelays[activeSlotDayId] || 0) + 1;

          const nextProgress = {
            ...curr,
            breakTime: updatedBreakTime,
            scheduleDelay: updatedDelays
          };
          if (!auth.currentUser) {
            localStorage.setItem("icsi_study_planner", JSON.stringify(nextProgress));
          }
          return nextProgress;
        });

      }, 1000);
    } else {
      if (breakIntervalRef.current) clearInterval(breakIntervalRef.current);
    }

    return () => {
      if (breakIntervalRef.current) clearInterval(breakIntervalRef.current);
    };
  }, [isBreakActive, activeSlotId, selectedDayId, plans, activePlanId]);

  // Handle Preset Changes
  useEffect(() => {
    if (activeSlotId === restoredSlotIdRef.current || timerPreset === restoredPresetRef.current) {
      if (activeSlotId === restoredSlotIdRef.current) restoredSlotIdRef.current = null;
      if (timerPreset === restoredPresetRef.current) restoredPresetRef.current = null;
      prevActiveSlotIdRef.current = activeSlotId;
      return;
    }
    if (!activeSlotId) {
      prevActiveSlotIdRef.current = null;
      return;
    }

    const isSlotChanged = prevActiveSlotIdRef.current !== activeSlotId;
    prevActiveSlotIdRef.current = activeSlotId;

    let durationSeconds = 10800;
    const plan = plans.find(p => p.id === activePlanId) || plans[0];
    const slot = plan?.days.flatMap(d => d.slots).find(s => s.id === activeSlotId);
    let slotMins = slot ? (slot.baseEndMinutes - slot.baseStartMinutes) : 0;
    if (slot) {
      durationSeconds = slotMins * 60;
    }

    let currentPreset = timerPreset;
    if (currentPreset === "pomodoro" && slotMins < 25) {
      currentPreset = "full";
      setTimerPreset("full");
    }

    if (currentPreset === "sprint") {
      durationSeconds = 45 * 60;
    } else if (currentPreset === "pomodoro") {
      durationSeconds = 25 * 60;
    }

    setTimerDuration(durationSeconds);

    if (currentPreset === "full" && slot) {
      const timeSpent = progress.timeSpent[slot.id] || 0;
      setTimerRemaining(Math.max(0, durationSeconds - timeSpent));
    } else {
      setTimerRemaining(durationSeconds);
    }

    if (isSlotChanged) {
      setIsBreakActive(false);
      setBreakSeconds(0);
      setIsTimerOnBreak(false);
    }
  }, [timerPreset, activeSlotId, plans, activePlanId, progress.timeSpent]);

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

    const plan = plans.find(p => p.id === activePlanId) || plans[0];
    const targetDay = plan?.days.find(d => d.id === newSlotDayId);
    const targetDaySlots = targetDay ? targetDay.slots.filter(s => !progress.deletedSlots?.[s.id]) : [];

    const overlappingSlot = targetDaySlots.find(slot => {
      return startMin < slot.baseEndMinutes && endMin > slot.baseStartMinutes;
    });

    if (overlappingSlot) {
      setOverlapError(`Time overlaps with: ${overlappingSlot.name} (${formatTime12(overlappingSlot.baseStartMinutes)} - ${formatTime12(overlappingSlot.baseEndMinutes)})`);
    } else {
      setOverlapError(null);
    }
  }, [newSlotDayId, newSlotStartTime, newSlotEndTime, plans, activePlanId, isAddSlotOpen, progress.deletedSlots, formatTime12, timeStringToMinutes]);

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
  }, [newSlotDayId, plans, activePlanId, isAddSlotOpen, getFreeGapsForDay, minutesToTimeString]);

  const activePlan = useMemo(() => {
    return plans.find(p => p.id === activePlanId) || plans[0] || {
      id: "plan-empty",
      name: "No Plan Created",
      startDate: "",
      endDate: "",
      days: []
    };
  }, [plans, activePlanId]);

  const selectedDay = useMemo(() => {
    return activePlan.days.find(d => d.id === selectedDayId) || activePlan.days[0] || {
      id: 1,
      date: "",
      dayName: "",
      title: "Empty Day",
      trendAnalysis: "",
      slots: []
    };
  }, [activePlan, selectedDayId]);

  const allSlotsForDay = useMemo(() => {
    return [...selectedDay.slots]
      .filter(slot => !progress.deletedSlots?.[slot.id])
      .sort((a, b) => a.baseStartMinutes - b.baseStartMinutes);
  }, [selectedDay.slots, progress.deletedSlots]);

  const slotsToRender = useMemo(() => {
    return hideCompleted
      ? allSlotsForDay.filter(slot => !progress.completedSlots[slot.id])
      : allSlotsForDay;
  }, [allSlotsForDay, hideCompleted, progress.completedSlots]);

  const activeSlot = useMemo(() => {
    return activePlan.days.flatMap(d => d.slots).find(s => s.id === activeSlotId);
  }, [activePlan, activeSlotId]);

  const isEffectiveRoadmapCollapsed = useMemo(() => {
    return isRoadmapCollapsed && !isMobile;
  }, [isRoadmapCollapsed, isMobile]);

  const totalSlots = useMemo(() => {
    return activePlan.days.flatMap(d => d.slots).filter(s => !progress.deletedSlots?.[s.id]).length;
  }, [activePlan, progress.deletedSlots]);

  const completedCount = useMemo(() => {
    return Object.keys(progress.completedSlots).filter(id => !progress.deletedSlots?.[id]).length;
  }, [progress.completedSlots, progress.deletedSlots]);

  const progressPercent = useMemo(() => {
    return totalSlots > 0 ? Math.round((completedCount / totalSlots) * 100) : 0;
  }, [completedCount, totalSlots]);

  const totalStudySeconds = useMemo(() => {
    return Object.values(progress.timeSpent).reduce((a, b) => a + b, 0);
  }, [progress.timeSpent]);

  const totalBreakSeconds = useMemo(() => {
    return Object.values(progress.breakTime).reduce((a, b) => a + b, 0);
  }, [progress.breakTime]);

  const stateValue = useMemo(() => ({
    isMounted,
    isRestored,
    user,
    authLoading,
    isDemoMode,
    firebaseError,
    showMigrationModal,
    pendingMigrationData,
    cloudDataToRestore,
    isAdminMode,
    adminUsername,
    adminPassword,
    adminLoginError,
    studentsList,
    adminSelectedStudent,
    adminInspectPlan,
    adminComments,
    adminInputComments,
    isAdminLoginOpen,
    progress,
    selectedDayId,
    activeSlotId,
    isTimerRunning,
    isBreakActive,
    timerDuration,
    timerRemaining,
    breakSeconds,
    timerPreset,
    isQuoteOpen,
    completedSlotName,
    isSidebarOpen,
    isRoadmapCollapsed,
    isMobile,
    isProfileDropdownOpen,
    activeUtilityTab,
    isAddSlotOpen,
    newSlotDayId,
    newSlotName,
    newSlotStartTime,
    newSlotEndTime,
    newSlotTopics,
    newSlotBreakTime,
    hideCompleted,
    overlapError,
    selectedGapIndex,
    deletingSlotId,
    isResetConfirmOpen,
    plans,
    activePlanId,
    planToDelete,
    isAddPlanOpen,
    newPlanName,
    newPlanStartDate,
    newPlanEndDate,
    isEditSlotOpen,
    editingSlotId,
    editSlotName,
    editSlotStartTime,
    editSlotEndTime,
    editSlotTopics,
    editSlotTrendAnalysis,
    editSlotBreakTime,
    isEditingHeader,
    editHeaderSubject,
    editHeaderDetail,
    activeSection,
    isPlansPanelOpen,
    isTimerEndPromptOpen,
    isTimerOnBreak,
    prevFocusPreset,

    activePlan,
    selectedDay,
    allSlotsForDay,
    slotsToRender,
    activeSlot,
    isEffectiveRoadmapCollapsed,
    progressPercent,
    completedCount,
    totalSlots,
    totalStudySeconds,
    totalBreakSeconds
  }), [
    isMounted, isRestored, user, authLoading, isDemoMode, firebaseError, showMigrationModal, pendingMigrationData, cloudDataToRestore,
    isAdminMode, adminUsername, adminPassword, adminLoginError, studentsList, adminSelectedStudent, adminInspectPlan, adminComments,
    adminInputComments, isAdminLoginOpen, progress, selectedDayId, activeSlotId, isTimerRunning, isBreakActive, timerDuration,
    timerRemaining, breakSeconds, timerPreset, isQuoteOpen, completedSlotName, isSidebarOpen, isRoadmapCollapsed, isMobile,
    isProfileDropdownOpen, activeUtilityTab, isAddSlotOpen, newSlotDayId, newSlotName, newSlotStartTime, newSlotEndTime,
    newSlotTopics, newSlotBreakTime, hideCompleted, overlapError, selectedGapIndex, deletingSlotId, isResetConfirmOpen,
    plans, activePlanId, planToDelete, isAddPlanOpen, newPlanName, newPlanStartDate, newPlanEndDate, isEditSlotOpen,
    editingSlotId, editSlotName, editSlotStartTime, editSlotEndTime, editSlotTopics, editSlotTrendAnalysis, editSlotBreakTime,
    isEditingHeader, editHeaderSubject, editHeaderDetail, activeSection, isPlansPanelOpen, isTimerEndPromptOpen, isTimerOnBreak,
    prevFocusPreset, activePlan, selectedDay, allSlotsForDay, slotsToRender, activeSlot, isEffectiveRoadmapCollapsed,
    progressPercent, completedCount, totalSlots, totalStudySeconds, totalBreakSeconds
  ]);

  const actionsValue = useMemo(() => ({
    setIsSidebarOpen,
    setIsRoadmapCollapsed,
    setIsPlansPanelOpen,
    setIsProfileDropdownOpen,
    setIsAddPlanOpen,
    setSelectedDayId,
    setHideCompleted,
    setNewPlanName,
    setNewPlanStartDate,
    setNewPlanEndDate,
    setAdminUsername,
    setAdminPassword,
    setIsAdminLoginOpen,
    setAdminLoginError,
    setAdminInspectPlan,
    setAdminInputComments,
    setIsQuoteOpen,
    setNewSlotDayId,
    setNewSlotName,
    setNewSlotStartTime,
    setNewSlotEndTime,
    setNewSlotTopics,
    setNewSlotBreakTime,
    setSelectedGapIndex,
    setEditSlotName,
    setEditSlotStartTime,
    setEditSlotEndTime,
    setEditSlotTopics,
    setEditSlotTrendAnalysis,
    setEditSlotBreakTime,
    setIsEditSlotOpen,
    setEditingSlotId,
    setEditHeaderSubject,
    setEditHeaderDetail,
    setIsEditingHeader,
    setIsResetConfirmOpen,
    setPlanToDelete,
    setDeletingSlotId,
    setActiveUtilityTab,
    setTimerPreset,
    setIsTimerEndPromptOpen,
    setIsTimerOnBreak,
    setPrevFocusPreset,
    setTimerDuration,
    setTimerRemaining,
    setBreakSeconds,
    setIsTimerRunning,
    setIsBreakActive,
    setActiveSlotId,
    setIsAddSlotOpen,
    setOverlapError,

    plansPanelRef,
    profileDropdownRef,

    handleLogin,
    handleLogout,
    handleEnterDemoMode,
    handleMigrateData,
    handleDiscardLocalData,
    handleAdminLogin,
    handleAdminLogout,
    fetchStudents,
    handleSelectStudent,
    handleSaveComments,
    handleSaveHeader,
    toggleTheme,
    handleSwitchPlan,
    handleCreatePlan,
    handleDeletePlan,
    performDeletePlan,
    handleStartSession,
    handleTogglePlay,
    handleCompleteSlot,
    handleToggleCompleteCheckbox,
    handleResetTimer,
    handleResetAllProgress,
    handleAddCustomSlot,
    handleDeleteSlot,
    handleOpenEditSlot,
    handleEditSlotSubmit,

    minutesToTimeString,
    timeStringToMinutes,
    formatTime12,
    getFreeGapsForDay,
    getStartTimeOptions,
    getEndTimeOptions,
    formatSecondsToMMSS,
    getShiftedTimeStr,
    calculateBreakMinutes
  }), [
    handleLogin, handleLogout, handleEnterDemoMode, handleMigrateData, handleDiscardLocalData,
    handleAdminLogin, handleAdminLogout, fetchStudents, handleSelectStudent, handleSaveComments,
    handleSaveHeader, toggleTheme, handleSwitchPlan, handleCreatePlan, handleDeletePlan,
    performDeletePlan, handleStartSession, handleTogglePlay, handleCompleteSlot,
    handleToggleCompleteCheckbox, handleResetTimer, handleResetAllProgress, handleAddCustomSlot,
    handleDeleteSlot, handleOpenEditSlot, handleEditSlotSubmit, minutesToTimeString,
    timeStringToMinutes, formatTime12, getFreeGapsForDay, getStartTimeOptions, getEndTimeOptions,
    formatSecondsToMMSS, getShiftedTimeStr, calculateBreakMinutes
  ]);

  return (
    <DashboardStateContext.Provider value={stateValue}>
      <DashboardActionsContext.Provider value={actionsValue}>
        {children}
      </DashboardActionsContext.Provider>
    </DashboardStateContext.Provider>
  );
};

export const useDashboardState = () => {
  const context = useContext(DashboardStateContext);
  if (context === undefined) {
    throw new Error("useDashboardState must be used within a DashboardProvider");
  }
  return context;
};

export const useDashboardActions = () => {
  const context = useContext(DashboardActionsContext);
  if (context === undefined) {
    throw new Error("useDashboardActions must be used within a DashboardProvider");
  }
  return context;
};
