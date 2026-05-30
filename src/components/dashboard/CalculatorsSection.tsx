"use client";

import React from "react";
import { useDashboardState, useDashboardActions } from "@/context/DashboardContext";
import CSRCalculator from "@/components/CSRCalculator";
import MR3Checker from "@/components/MR3Checker";
import BoardValidator from "@/components/BoardValidator";

export default function CalculatorsSection() {
  const { selectedDayId, activeUtilityTab } = useDashboardState();
  const { setActiveUtilityTab } = useDashboardActions();

  if (selectedDayId !== "calculators") return null;

  return (
    <div className="rounded-2xl glass-panel p-5 md:p-6 border border-border space-y-6 bg-card text-foreground shadow-xs animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">Corporate &amp; Governance Calculators</h3>
          <p className="text-xs text-muted-foreground">Quick utility tools for CSR eligibility, board composition compliance, and MR-3 applicability.</p>
        </div>
        
        <div className="flex bg-muted p-1 rounded-lg border border-border shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveUtilityTab("csr")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${activeUtilityTab === "csr" ? "bg-background text-foreground shadow-xs font-sans" : "text-muted-foreground hover:text-foreground font-sans"}`}
          >
            CSR Section 135
          </button>
          <button
            onClick={() => setActiveUtilityTab("mr3")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${activeUtilityTab === "mr3" ? "bg-background text-foreground shadow-xs font-sans" : "text-muted-foreground hover:text-foreground font-sans"}`}
          >
            Secretarial Audit (MR-3)
          </button>
          <button
            onClick={() => setActiveUtilityTab("board")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${activeUtilityTab === "board" ? "bg-background text-foreground shadow-xs font-sans" : "text-muted-foreground hover:text-foreground font-sans"}`}
          >
            Board Validator (LODR)
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {activeUtilityTab === "csr" && <CSRCalculator />}
        {activeUtilityTab === "mr3" && <MR3Checker />}
        {activeUtilityTab === "board" && <BoardValidator />}
      </div>
    </div>
  );
}
