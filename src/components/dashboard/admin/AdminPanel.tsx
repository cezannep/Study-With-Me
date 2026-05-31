"use client";

import React from "react";
import { useDashboardState, useDashboardActions } from "@/context/DashboardContext";
import { 
  Award, LogOut, RotateCcw, ArrowLeft, BookOpen, CheckCircle, X, Clock 
} from "lucide-react";

export default function AdminPanel() {
  const {
    studentsList,
    adminSelectedStudent,
    adminInputComments,
    adminInspectPlan
  } = useDashboardState();

  const {
    fetchStudents,
    handleSelectStudent,
    handleSaveComments,
    setAdminInspectPlan,
    handleAdminLogout,
    setAdminInputComments,
    formatSecondsToMMSS
  } = useDashboardActions();

  const liveInspectPlan = adminInspectPlan
    ? (adminSelectedStudent?.plans?.find((p: any) => p.id === adminInspectPlan.id) || adminInspectPlan)
    : null;

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Header */}
      <header className="relative z-40 shrink-0 w-full bg-zinc-900 border-b border-zinc-800 px-4 sm:px-6 py-4 flex items-center justify-between shadow-md animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 border border-primary/20 text-primary">
            <Award className="w-6 h-6 text-amber-500 animate-bounce" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white uppercase font-sans">Admin Console</h1>
            <p className="text-[10px] sm:text-xs text-zinc-400 font-sans">Monitor study plans and submit feedback</p>
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer border border-transparent font-bold font-sans"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Content Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Student list */}
        <aside className={`
          ${adminSelectedStudent ? "hidden lg:flex" : "w-full lg:w-80"}
          bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-y-auto shrink-0
        `}>
          <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-sans">Registered Students ({studentsList.length})</h2>
            <button
              onClick={fetchStudents}
              className="flex items-center gap-1 px-2.5 py-1.25 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-white transition-all cursor-pointer border border-zinc-700 font-semibold font-sans"
              title="Refresh student list"
            >
              <RotateCcw className="w-3 h-3" /> Refresh
            </button>
          </div>
          <div className="divide-y divide-zinc-800 flex-1">
            {studentsList.map((stud) => {
              const isSelected = adminSelectedStudent?.uid === stud.uid;
              return (
                <button
                  key={stud.uid}
                  onClick={() => handleSelectStudent(stud)}
                  className={`w-full text-left p-4 hover:bg-zinc-800 transition-colors flex items-center gap-3 cursor-pointer ${
                    isSelected ? "bg-zinc-800 border-l-4 border-primary" : ""
                  }`}
                >
                  {stud.photoURL ? (
                    <img src={stud.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-zinc-700" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-bold font-sans">
                      {stud.displayName ? stud.displayName.charAt(0) : "S"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate leading-tight font-sans">
                      {stud.displayName || "Anonymous Student"}
                    </p>
                    <p className="text-xs text-zinc-500 truncate mt-0.5 font-mono">
                      {stud.email || stud.uid.substring(0, 8)}
                    </p>
                  </div>
                </button>
              );
            })}
            {studentsList.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500 leading-relaxed font-sans animate-pulse">
                No registered student data found in Firestore database.
              </div>
            )}
          </div>
        </aside>

        {/* Main workspace - selected student details */}
        <main className={`
          ${!adminSelectedStudent ? "hidden lg:block" : "block"}
          flex-1 bg-zinc-950 p-4 sm:p-8 overflow-y-auto
        `}>
          {adminSelectedStudent ? (
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
              {/* Workspace actions bar: Back to students & Refresh List */}
              <div className="flex items-center justify-between gap-3 w-full">
                <button
                  type="button"
                  onClick={() => handleSelectStudent(null)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer w-fit font-sans"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Students
                </button>
                
                <button
                  onClick={fetchStudents}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-white hover:text-white rounded-lg transition-colors cursor-pointer font-semibold ml-auto font-sans"
                  title="Refresh student list"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Refresh List
                </button>
              </div>

              {/* Student header details */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 flex flex-col xl:flex-row items-center justify-between gap-6 w-full">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full xl:w-auto">
                  {adminSelectedStudent.photoURL ? (
                    <img src={adminSelectedStudent.photoURL} alt="Avatar" className="w-16 h-16 rounded-full border border-zinc-700 shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-lg font-bold shrink-0 font-sans">
                      {adminSelectedStudent.displayName ? adminSelectedStudent.displayName.charAt(0) : "S"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-bold text-white leading-snug break-words font-sans">
                      {adminSelectedStudent.displayName || "Anonymous Student"}
                    </h2>
                    <p className="text-xs text-zinc-400 break-all font-mono">{adminSelectedStudent.email}</p>
                    <p className="text-[9px] sm:text-[10px] text-zinc-500 font-mono mt-1 break-all">UID: {adminSelectedStudent.uid}</p>
                  </div>
                </div>

                {/* Summary progress metrics */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full xl:w-auto">
                  <div className="bg-zinc-950 border border-zinc-850 p-2 sm:p-4 text-center flex flex-col justify-center min-w-[70px] sm:min-w-[120px]">
                    <p className="text-[8px] sm:text-[9px] font-bold text-zinc-500 uppercase tracking-wider leading-tight sm:leading-none font-sans">Completed Slots</p>
                    <p className="text-lg sm:text-2xl font-extrabold text-primary mt-1 sm:mt-1.5 leading-none font-mono">
                      {adminSelectedStudent.progress?.completedSlots
                        ? Object.keys(adminSelectedStudent.progress.completedSlots).filter(
                            (id) => !adminSelectedStudent.progress.deletedSlots?.[id]
                          ).length
                        : 0}
                    </p>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-850 p-2 sm:p-4 text-center flex flex-col justify-center min-w-[70px] sm:min-w-[120px]">
                    <p className="text-[8px] sm:text-[9px] font-bold text-zinc-500 uppercase tracking-wider leading-tight sm:leading-none font-sans">Study Duration</p>
                    <p className="text-lg sm:text-2xl font-extrabold text-green-500 mt-1 sm:mt-1.5 leading-none font-mono">
                      {formatSecondsToMMSS(
                        adminSelectedStudent.totalStudyTime !== undefined
                          ? adminSelectedStudent.totalStudyTime
                          : (adminSelectedStudent.progress?.timeSpent
                            ? Object.values(adminSelectedStudent.progress.timeSpent).reduce((a: any, b: any) => a + b, 0)
                            : 0)
                      )}
                    </p>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-850 p-2 sm:p-4 text-center flex flex-col justify-center min-w-[70px] sm:min-w-[120px]">
                    <p className="text-[8px] sm:text-[9px] font-bold text-zinc-500 uppercase tracking-wider leading-tight sm:leading-none font-sans">Break Duration</p>
                    <p className="text-lg sm:text-2xl font-extrabold text-amber-500 mt-1 sm:mt-1.5 leading-none font-mono">
                      {formatSecondsToMMSS(
                        adminSelectedStudent.totalBreakTime !== undefined
                          ? adminSelectedStudent.totalBreakTime
                          : (adminSelectedStudent.progress?.breakTime
                            ? Object.values(adminSelectedStudent.progress.breakTime).reduce((a: any, b: any) => a + b, 0)
                            : 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Student plans details */}
                <div className="space-y-6">
                  <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Active Study Plans</h3>
                    <div className="space-y-3">
                      {adminSelectedStudent.plans && adminSelectedStudent.plans.length > 0 ? (
                        adminSelectedStudent.plans.map((p: any) => {
                          const totalS = p.days.flatMap((d: any) => d.slots).filter((s: any) => !adminSelectedStudent.progress?.deletedSlots?.[s.id]).length;
                          const compS = Object.keys(adminSelectedStudent.progress?.completedSlots || {}).filter((id) =>
                            p.days.flatMap((d: any) => d.slots).some((s: any) => s.id === id) && !adminSelectedStudent.progress?.deletedSlots?.[id]
                          ).length;
                          const active = adminSelectedStudent.activePlanId === p.id;
                          return (
                            <div 
                              key={p.id} 
                              onClick={() => setAdminInspectPlan(p)}
                              className={`p-4 border cursor-pointer hover:border-zinc-500 hover:bg-zinc-900/40 transition-all ${active ? "border-primary bg-primary/5" : "border-zinc-800 bg-zinc-950"} space-y-2`}
                              title="Click to view slots and roadmap"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-white truncate max-w-[200px] font-sans">{p.name}</span>
                                {active && (
                                  <span className="text-[9px] bg-primary text-primary-foreground font-bold px-1.5 py-0.5 uppercase tracking-wide font-sans animate-pulse">
                                    Active Plan
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-zinc-400 flex justify-between font-sans">
                                <span>{p.startDate} to {p.endDate}</span>
                                <span>{compS}/{totalS} slots completed</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-zinc-500 font-sans">No plans configured yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Admin feedback Comments */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-sans">Mentor Feedback &amp; Comments</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4">
                      Submit comments and suggestions to guide this student's preparation roadmap. The student will instantly see this feedback in their dashboard.
                    </p>
                    <textarea
                      value={adminInputComments}
                      onChange={(e) => setAdminInputComments(e.target.value)}
                      placeholder="Write your advice, suggestions, or comments here..."
                      className="w-full min-h-[160px] bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:outline-none focus:border-primary font-sans resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSaveComments}
                    className="w-full py-3 bg-white text-zinc-950 font-bold hover:bg-zinc-100 transition-colors text-sm border-none cursor-pointer flex items-center justify-center gap-2 font-sans"
                  >
                    <CheckCircle className="w-4 h-4" /> Save Feedback Comments
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 max-w-md mx-auto space-y-3 font-sans">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <BookOpen className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-bold text-white">No Student Selected</h3>
              <p className="text-xs leading-relaxed">
                Select a student from the sidebar panel to view their customized active plans, completed target metrics, and leave comments on their roadmap progress.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Admin Inspect Plan Modal */}
      {liveInspectPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide font-sans">{liveInspectPlan.name}</h2>
                  {adminSelectedStudent.activePlanId === liveInspectPlan.id && (
                    <span className="text-[9px] bg-primary text-primary-foreground font-bold px-1.5 py-0.5 uppercase tracking-wide font-sans">
                      Active Plan
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Date Range: {liveInspectPlan.startDate} to {liveInspectPlan.endDate}
                </p>
              </div>
              <button
                onClick={() => setAdminInspectPlan(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                title="Close Dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content: List of Days and Slots */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans">
              {liveInspectPlan.days && liveInspectPlan.days.length > 0 ? (
                liveInspectPlan.days.map((day: any) => {
                  const activeSlots = day.slots.filter((s: any) => !adminSelectedStudent.progress?.deletedSlots?.[s.id]);
                  if (activeSlots.length === 0) return null;

                  const dayStudySec = adminSelectedStudent.dailyStudyTime?.[`${liveInspectPlan.id}_${day.id}`] || 0;
                  const dayBreakSec = adminSelectedStudent.dailyBreakTime?.[`${liveInspectPlan.id}_${day.id}`] || 0;

                  return (
                    <div key={day.id} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider font-sans">
                          Day {day.id}: {day.dayName || day.name}
                        </h3>
                        <div className="flex items-center gap-3 text-[10px]">
                          {dayStudySec > 0 && (
                            <span className="text-green-550 font-bold font-mono">
                              Study: {formatSecondsToMMSS(dayStudySec)}
                            </span>
                          )}
                          {dayBreakSec > 0 && (
                            <span className="text-amber-550 font-bold font-mono">
                              Break: {formatSecondsToMMSS(dayBreakSec)}
                            </span>
                          )}
                          <span className="text-zinc-500 font-medium font-sans">
                            {activeSlots.length} {activeSlots.length === 1 ? "Slot" : "Slots"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {activeSlots.map((slot: any) => {
                          const isCompleted = !!adminSelectedStudent.progress?.completedSlots?.[slot.id];
                          const slotStudySec = adminSelectedStudent.slotStudyTime?.[slot.id] || adminSelectedStudent.progress?.timeSpent?.[slot.id] || 0;
                          const slotBreakSec = adminSelectedStudent.slotBreakTime?.[slot.id] || adminSelectedStudent.progress?.breakTime?.[slot.id] || 0;

                          return (
                            <div
                              key={slot.id}
                              className={`p-4 border rounded-lg transition-all ${
                                isCompleted
                                  ? "bg-zinc-900/30 border-primary/20 text-zinc-300"
                                  : "bg-zinc-950 border-zinc-800 text-white"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold font-sans uppercase tracking-wider text-zinc-400">
                                      Slot {slot.id.split("-").pop()?.toUpperCase().replace("SLOT", "").trim() || slot.id}
                                    </span>
                                    {isCompleted && (
                                      <span className="flex items-center gap-0.5 text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 font-bold uppercase tracking-wider rounded font-sans">
                                        <CheckCircle className="w-2.5 h-2.5" /> Completed
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-semibold text-white mt-1 leading-snug font-sans">
                                    {slot.name}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-zinc-400 font-sans">
                                    {slot.timeRange && (
                                      <p className="flex items-center gap-1 font-sans">
                                        <Clock className="w-3 h-3 text-zinc-500" />
                                        {slot.timeRange}
                                      </p>
                                    )}
                                    {(slotStudySec > 0 || slotBreakSec > 0) && (
                                      <div className="flex items-center gap-3">
                                        {slotStudySec > 0 && (
                                          <span className="text-green-500 font-semibold font-mono">
                                            Study: {formatSecondsToMMSS(slotStudySec)}
                                          </span>
                                        )}
                                        {slotBreakSec > 0 && (
                                          <span className="text-amber-500 font-semibold font-mono">
                                            Break: {formatSecondsToMMSS(slotBreakSec)}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-zinc-500 text-center py-8 font-sans">No roadmap schedule defined for this plan.</p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
              <button
                onClick={() => setAdminInspectPlan(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all border border-zinc-700 cursor-pointer font-sans"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
