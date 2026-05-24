"use client";

import React, { useState } from "react";
import { Users, CheckCircle2, AlertTriangle, Scale } from "lucide-react";

export default function BoardValidator() {
  const [chairpersonType, setChairpersonType] = useState<string>("executive"); // executive, non_exec_regular, non_exec_promoter
  const [isTop2000, setIsTop2000] = useState<boolean>(true); // top 2000 listed entity
  const [isTop1000, setIsTop1000] = useState<boolean>(true); // top 1000 listed entity
  const [totalDirectors, setTotalDirectors] = useState<number>(6);
  const [nonExecutiveDirectors, setNonExecutiveDirectors] = useState<number>(3);
  const [independentDirectors, setIndependentDirectors] = useState<number>(2);
  const [womenDirectors, setWomenDirectors] = useState<number>(1);
  const [independentWomenDirectors, setIndependentWomenDirectors] = useState<number>(1);

  // Validations:
  const errors: string[] = [];
  const passes: string[] = [];

  // Rule 1: Board Size (Reg 17(1)(c))
  // At least 6 directors for Top 2000 listed entities
  const minRequiredDirectors = isTop2000 ? 6 : 3;
  if (totalDirectors < minRequiredDirectors) {
    errors.push(`Board size is too small. Current: ${totalDirectors}. Required minimum: ${minRequiredDirectors} (for top 2000 listed entities).`);
  } else {
    passes.push(`Board size is valid (${totalDirectors} directors).`);
  }

  // Rule 2: Executive vs Non-Executive (Reg 17(1)(a))
  // Board must have at least 50% non-executive directors
  const halfDirectors = Math.ceil(totalDirectors / 2);
  if (nonExecutiveDirectors < halfDirectors) {
    errors.push(`Insufficient Non-Executive Directors. Current: ${nonExecutiveDirectors}. Required minimum: ${halfDirectors} (at least 50% of Board).`);
  } else {
    passes.push(`Non-Executive composition is valid (${nonExecutiveDirectors} / ${totalDirectors} are Non-Executive).`);
  }

  // Rule 3: Woman Director and Independent Woman Director (Reg 17(1)(a))
  // All listed entities: at least 1 woman director.
  // Top 1000 listed entities: at least 1 independent woman director.
  if (womenDirectors < 1) {
    errors.push("Missing Woman Director. Every listed entity must have at least 1 woman director.");
  } else {
    passes.push(`Has ${womenDirectors} woman director(s).`);
  }

  if (isTop1000) {
    if (independentWomenDirectors < 1) {
      errors.push("Missing Independent Woman Director. Top 1000 listed entities must have at least 1 independent woman director.");
    } else {
      passes.push("Has at least 1 independent woman director (Top 1000 check passed).");
    }
  }

  // Rule 4: Independent Directors ratio (Reg 17(1)(b))
  // - If Chairperson is Regular Non-Executive (not promoter, not related to promoter): Min 1/3rd Independent
  // - If Chairperson is Executive, or Regular Non-Executive but Promoter/Related: Min 50% Independent
  let requiredIDRatio = 0.5;
  let reasonID = "";
  if (chairpersonType === "non_exec_regular") {
    requiredIDRatio = 1 / 3;
    reasonID = "Chairperson is non-executive & unrelated to promoters (Min 1/3rd Independent required)";
  } else if (chairpersonType === "executive") {
    requiredIDRatio = 0.5;
    reasonID = "Chairperson is executive (Min 50% Independent required)";
  } else if (chairpersonType === "non_exec_promoter") {
    requiredIDRatio = 0.5;
    reasonID = "Chairperson is non-executive promoter or related (Min 50% Independent required)";
  }

  const requiredIDCount = Math.ceil(totalDirectors * requiredIDRatio);
  if (independentDirectors < requiredIDCount) {
    errors.push(`Insufficient Independent Directors. Current: ${independentDirectors}. Required: ${requiredIDCount} (${reasonID}).`);
  } else {
    passes.push(`Independent Director composition is valid (${independentDirectors} / ${totalDirectors} are independent. ${reasonID}).`);
  }

  const isValid = errors.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Users className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold font-sans">SEBI LODR Board Validator</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
            Chairperson Category
          </label>
          <select
            value={chairpersonType}
            onChange={(e) => setChairpersonType(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-black/5 dark:bg-white/5 border border-border rounded-md focus:outline-none focus:border-emerald-400 text-foreground"
          >
            <option value="executive" className="bg-background text-foreground">Executive Chairperson</option>
            <option value="non_exec_regular" className="bg-background text-foreground">Non-Executive (Independent / Unrelated)</option>
            <option value="non_exec_promoter" className="bg-background text-foreground">Non-Executive (Promoter / Related)</option>
          </select>
        </div>

        <div className="col-span-1 flex items-center gap-2 py-1">
          <input
            type="checkbox"
            id="isTop1000"
            checked={isTop1000}
            onChange={(e) => {
              setIsTop1000(e.target.checked);
              if (e.target.checked) setIsTop2000(true);
            }}
            className="w-4 h-4 rounded text-emerald-500 border-border bg-black/5 dark:bg-white/5 cursor-pointer"
          />
          <label htmlFor="isTop1000" className="text-xs text-muted-foreground cursor-pointer select-none">
            Top 1000 Entity
          </label>
        </div>

        <div className="col-span-1 flex items-center gap-2 py-1">
          <input
            type="checkbox"
            id="isTop2000"
            checked={isTop2000}
            onChange={(e) => {
              setIsTop2000(e.target.checked);
              if (!e.target.checked) setIsTop1000(false);
            }}
            className="w-4 h-4 rounded text-emerald-500 border-border bg-black/5 dark:bg-white/5 cursor-pointer"
          />
          <label htmlFor="isTop2000" className="text-xs text-muted-foreground cursor-pointer select-none">
            Top 2000 Entity
          </label>
        </div>

        <div className="col-span-1">
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
            Total Directors
          </label>
          <input
            type="number"
            value={totalDirectors}
            min={1}
            onChange={(e) => setTotalDirectors(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-1.5 text-xs bg-black/5 dark:bg-white/5 border border-border rounded focus:outline-none focus:border-emerald-400 text-foreground"
          />
        </div>

        <div className="col-span-1">
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
            Non-Executive
          </label>
          <input
            type="number"
            value={nonExecutiveDirectors}
            min={0}
            onChange={(e) => setNonExecutiveDirectors(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-1.5 text-xs bg-black/5 dark:bg-white/5 border border-border rounded focus:outline-none focus:border-emerald-400 text-foreground"
          />
        </div>

        <div className="col-span-1">
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
            Independent IDs
          </label>
          <input
            type="number"
            value={independentDirectors}
            min={0}
            onChange={(e) => setIndependentDirectors(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-1.5 text-xs bg-black/5 dark:bg-white/5 border border-border rounded focus:outline-none focus:border-emerald-400 text-foreground"
          />
        </div>

        <div className="col-span-1">
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
            Women Directors
          </label>
          <input
            type="number"
            value={womenDirectors}
            min={0}
            onChange={(e) => setWomenDirectors(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-1.5 text-xs bg-black/5 dark:bg-white/5 border border-border rounded focus:outline-none focus:border-emerald-400 text-foreground"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
            Independent Women Directors (only applicable if Top 1000)
          </label>
          <input
            type="number"
            value={independentWomenDirectors}
            min={0}
            disabled={!isTop1000}
            onChange={(e) => setIndependentWomenDirectors(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-1.5 text-xs bg-black/5 dark:bg-white/5 border border-border rounded focus:outline-none focus:border-emerald-400 disabled:opacity-50 text-foreground"
          />
        </div>
      </div>

      {/* Validation Result */}
      <div className={`p-4 rounded-lg border ${isValid ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"} space-y-3`}>
        <h4 className="text-sm font-semibold flex items-center gap-1.5">
          <Scale className={`w-4 h-4 ${isValid ? "text-emerald-400" : "text-red-400"}`} />
          Board Validity Status: <span className={isValid ? "text-emerald-400" : "text-red-400"}>{isValid ? "COMPLIANT" : "NON-COMPLIANT"}</span>
        </h4>

        {errors.length > 0 ? (
          <ul className="space-y-1.5">
            {errors.map((err, i) => (
              <li key={i} className="text-xs text-red-400 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{err}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-1.5">
            {passes.map((pass, i) => (
              <li key={i} className="text-xs text-emerald-400 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{pass}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick reminders */}
      <div className="text-xs space-y-2 bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-lg">
        <h4 className="font-bold text-emerald-400">LODR Committee Composition Reminders</h4>
        <div className="space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
          <p>
            📌 <b>Audit Committee:</b> Min 3 directors, 2/3rd independent. Chairperson must be independent (Reg 18).
          </p>
          <p>
            📌 <b>Nomination & Remuneration Committee (NRC):</b> Min 3 directors, all non-executive, min 2/3rd independent. Chairperson must be independent (Reg 19).
          </p>
          <p>
            📌 <b>Stakeholders Relationship Committee (SRC):</b> Min 3 directors, at least 1 independent. Chairperson must be non-executive (Reg 20).
          </p>
        </div>
      </div>
    </div>
  );
}
