"use client";

import React, { useState } from "react";
import { FileText, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

export default function MR3Checker() {
  const [companyType, setCompanyType] = useState<string>("listed"); // listed, public_unlisted, private
  const [paidUpCapital, setPaidUpCapital] = useState<string>("");
  const [turnover, setTurnover] = useState<string>("");
  const [outstandingLoans, setOutstandingLoans] = useState<string>("");
  const [isSubsidiaryOfPublic, setIsSubsidiaryOfPublic] = useState<boolean>(false);

  const capital = parseFloat(paidUpCapital) || 0;
  const to = parseFloat(turnover) || 0;
  const loans = parseFloat(outstandingLoans) || 0;

  // Rules:
  // 1. Listed: Always applicable
  // 2. Unlisted Public:
  //    - Paid up capital >= 50 Cr OR
  //    - Turnover >= 250 Cr OR
  //    - Outstanding loans/borrowings >= 100 Cr
  // 3. Private:
  //    - If subsidiary of a public company, it is deemed public and the above thresholds apply.
  //    - Otherwise, not applicable under Section 204 (can do voluntarily).

  let isApplicable = false;
  let reason = "";

  if (companyType === "listed") {
    isApplicable = true;
    reason = "Every listed company must undergo a Secretarial Audit under Section 204(1).";
  } else if (companyType === "public_unlisted") {
    const capOk = capital >= 50;
    const toOk = to >= 250;
    const loanOk = loans >= 100;
    isApplicable = capOk || toOk || loanOk;

    if (isApplicable) {
      const triggers = [];
      if (capOk) triggers.push(`Paid-up Capital (₹ ${capital} Cr ≥ ₹50 Cr)`);
      if (toOk) triggers.push(`Turnover (₹ ${to} Cr ≥ ₹250 Cr)`);
      if (loanOk) triggers.push(`Outstanding Loans (₹ ${loans} Cr ≥ ₹100 Cr)`);
      reason = `Mandatory for Unlisted Public Company meeting: ${triggers.join(", ")}.`;
    } else {
      reason = "Unlisted Public Company thresholds not met (Paid-up Capital < ₹50 Cr, Turnover < ₹250 Cr, and Loans < ₹100 Cr).";
    }
  } else if (companyType === "private") {
    if (isSubsidiaryOfPublic) {
      const capOk = capital >= 50;
      const toOk = to >= 250;
      const loanOk = loans >= 100;
      isApplicable = capOk || toOk || loanOk;

      if (isApplicable) {
        const triggers = [];
        if (capOk) triggers.push(`Paid-up Capital (₹ ${capital} Cr ≥ ₹50 Cr)`);
        if (toOk) triggers.push(`Turnover (₹ ${to} Cr ≥ ₹250 Cr)`);
        if (loanOk) triggers.push(`Outstanding Loans (₹ ${loans} Cr ≥ ₹100 Cr)`);
        reason = `Deemed Public Company (subsidiary of public) meeting thresholds: ${triggers.join(", ")}.`;
      } else {
        reason = "Deemed Public Company (subsidiary of public) but does not meet the thresholds.";
      }
    } else {
      isApplicable = false;
      reason = "Independent private companies are exempt from mandatory Secretarial Audit under Section 204.";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <FileText className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-semibold font-sans">Secretarial Audit (MR-3) Checker</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
            Company Classification
          </label>
          <select
            value={companyType}
            onChange={(e) => setCompanyType(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-black/5 dark:bg-white/5 border border-border rounded-md focus:outline-none focus:border-violet-400 text-foreground"
          >
            <option value="listed" className="bg-background text-foreground">Listed Company</option>
            <option value="public_unlisted" className="bg-background text-foreground">Unlisted Public Company</option>
            <option value="private" className="bg-background text-foreground">Private Company</option>
          </select>
        </div>

        {companyType === "private" && (
          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="subsidiaryPublic"
              checked={isSubsidiaryOfPublic}
              onChange={(e) => setIsSubsidiaryOfPublic(e.target.checked)}
              className="w-4 h-4 rounded text-violet-500 border-border bg-black/5 dark:bg-white/5 cursor-pointer"
            />
            <label htmlFor="subsidiaryPublic" className="text-xs text-muted-foreground cursor-pointer select-none">
              Is this private company a subsidiary of a public company?
            </label>
          </div>
        )}

        {(companyType === "public_unlisted" || (companyType === "private" && isSubsidiaryOfPublic)) && (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-muted-foreground mb-1">Paid-up Capital (Cr)</label>
              <input
                type="number"
                value={paidUpCapital}
                onChange={(e) => setPaidUpCapital(e.target.value)}
                placeholder="e.g. 55"
                className="w-full px-2 py-1.5 text-xs bg-black/5 dark:bg-white/5 border border-border rounded focus:outline-none focus:border-violet-400 text-foreground placeholder:text-muted-foreground"
              />
              <span className="text-[8px] text-muted-foreground">Limit: ≥ ₹50 Cr</span>
            </div>
            <div>
              <label className="block text-[10px] text-muted-foreground mb-1">Turnover (Cr)</label>
              <input
                type="number"
                value={turnover}
                onChange={(e) => setTurnover(e.target.value)}
                placeholder="e.g. 260"
                className="w-full px-2 py-1.5 text-xs bg-black/5 dark:bg-white/5 border border-border rounded focus:outline-none focus:border-violet-400 text-foreground placeholder:text-muted-foreground"
              />
              <span className="text-[8px] text-muted-foreground">Limit: ≥ ₹250 Cr</span>
            </div>
            <div>
              <label className="block text-[10px] text-muted-foreground mb-1">O/s Loans (Cr)</label>
              <input
                type="number"
                value={outstandingLoans}
                onChange={(e) => setOutstandingLoans(e.target.value)}
                placeholder="e.g. 110"
                className="w-full px-2 py-1.5 text-xs bg-black/5 dark:bg-white/5 border border-border rounded focus:outline-none focus:border-violet-400 text-foreground placeholder:text-muted-foreground"
              />
              <span className="text-[8px] text-muted-foreground">Limit: ≥ ₹100 Cr</span>
            </div>
          </div>
        )}
      </div>

      {/* Compliance Assessment */}
      <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20 space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-1.5 text-purple-400">
          <CheckCircle2 className="w-4 h-4" /> Secretarial Audit Assessment
        </h4>
        <div className="text-xs space-y-1">
          <div className="flex gap-2 items-center">
            <span className="text-muted-foreground">Audit Status:</span>
            <span className={`font-bold ${isApplicable ? "text-red-400" : "text-emerald-400"}`}>
              {isApplicable ? "MANDATORY (MR-3 Required)" : "EXEMPT / VOLUNTARY"}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-normal pt-1">
            <b>Rationale:</b> {reason}
          </p>
        </div>
      </div>

      {/* MR-3 Structure Checklist */}
      <div className="text-xs space-y-2 bg-blue-500/5 border border-blue-500/20 p-3 rounded-lg">
        <h4 className="font-bold text-blue-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" /> The 5 Core Secretarial Audit Modules (MR-3)
        </h4>
        <p className="text-[10px] text-muted-foreground">
          The Practising Company Secretary (PCS) must report compliance and record deviations on these 5 specific laws:
        </p>
        <ul className="space-y-1 text-[11px] list-decimal list-inside text-muted-foreground leading-relaxed">
          <li>
            <span className="font-semibold text-foreground">Companies Act, 2013</span> (and rules made thereunder).
          </li>
          <li>
            <span className="font-semibold text-foreground">Securities Contracts (Regulation) Act, 1956 (SCRA)</span> and rules.
          </li>
          <li>
            <span className="font-semibold text-foreground">Depositories Act, 1996</span> and regulations.
          </li>
          <li>
            <span className="font-semibold text-foreground">FEMA, 1999</span> (Foreign Exchange Management Act) - regulations on FDI, ODI, and ECBs.
          </li>
          <li>
            <span className="font-semibold text-foreground">SEBI Act, 1992</span> regulations:
            <ul className="pl-4 list-disc list-inside text-[10px] text-muted-foreground mt-0.5">
              <li>LODR (Listing Obligations)</li>
              <li>PIT (Prohibition of Insider Trading)</li>
              <li>SAST (Substantial Acquisition of Shares & Takeovers)</li>
              <li>ICDR (Issue of Capital & Disclosure Requirements)</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
}
