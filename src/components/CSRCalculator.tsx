"use client";

import React, { useState } from "react";
import { Calculator, Info, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

export default function CSRCalculator() {
  const [netWorth, setNetWorth] = useState<string>("");
  const [turnover, setTurnover] = useState<string>("");
  const [profitY1, setProfitY1] = useState<string>("");
  const [profitY2, setProfitY2] = useState<string>("");
  const [profitY3, setProfitY3] = useState<string>("");

  const nw = parseFloat(netWorth) || 0;
  const to = parseFloat(turnover) || 0;
  const p1 = parseFloat(profitY1) || 0;
  const p2 = parseFloat(profitY2) || 0;
  const p3 = parseFloat(profitY3) || 0;

  // Eligibility Check
  // Rule: Any of the criteria met in the preceding year
  // Typically, we check if Year 3 (preceding year) meets the criteria
  const isEligibleNW = nw >= 500;
  const isEligibleTO = to >= 1000;
  const isEligibleNP = p3 >= 5; // Profit of the immediately preceding year
  const isEligible = isEligibleNW || isEligibleTO || isEligibleNP;

  // CSR Spend Calculation
  // 2% of average of 3 years' net profits
  const avgProfit = (p1 + p2 + p3) / 3;
  const avgProfitDisplay = avgProfit > 0 ? avgProfit : 0;
  const mandatorySpend = avgProfitDisplay * 0.02; // in Crores
  const mandatorySpendLakhs = mandatorySpend * 100; // in Lakhs

  // Committee Requirement
  // CSR obligation <= 50 Lakhs (0.5 Cr) -> Board can discharge, no separate CSR Committee required
  const committeeRequired = isEligible && mandatorySpendLakhs > 50;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Calculator className="w-5 h-5 text-teal-400" />
        <h3 className="text-lg font-semibold font-sans">CSR Section 135 Calculator</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
            Net Worth (₹ Cr)
          </label>
          <input
            type="number"
            value={netWorth}
            onChange={(e) => setNetWorth(e.target.value)}
            placeholder="e.g. 520"
            className="w-full px-3 py-2 text-sm bg-black/5 dark:bg-white/5 border border-border rounded-md focus:outline-none focus:border-teal-400 text-foreground placeholder:text-muted-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Threshold: ≥ ₹500 Cr</span>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
            Turnover (₹ Cr)
          </label>
          <input
            type="number"
            value={turnover}
            onChange={(e) => setTurnover(e.target.value)}
            placeholder="e.g. 1050"
            className="w-full px-3 py-2 text-sm bg-black/5 dark:bg-white/5 border border-border rounded-md focus:outline-none focus:border-teal-400 text-foreground placeholder:text-muted-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Threshold: ≥ ₹1000 Cr</span>
        </div>

        <div className="col-span-2">
          <span className="block text-xs font-bold text-muted-foreground uppercase mb-2">
            Net Profits for Preceding 3 Years (₹ Cr)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-muted-foreground mb-1">FY-3 (e.g. Year 1)</label>
              <input
                type="number"
                value={profitY1}
                onChange={(e) => setProfitY1(e.target.value)}
                placeholder="e.g. 4.5"
                className="w-full px-2 py-1.5 text-xs bg-black/5 dark:bg-white/5 border border-border rounded focus:outline-none focus:border-teal-400 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-[10px] text-muted-foreground mb-1">FY-2 (e.g. Year 2)</label>
              <input
                type="number"
                value={profitY2}
                onChange={(e) => setProfitY2(e.target.value)}
                placeholder="e.g. 6.0"
                className="w-full px-2 py-1.5 text-xs bg-black/5 dark:bg-white/5 border border-border rounded focus:outline-none focus:border-teal-400 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-[10px] text-muted-foreground mb-1">FY-1 (Preceding Yr)</label>
              <input
                type="number"
                value={profitY3}
                onChange={(e) => setProfitY3(e.target.value)}
                placeholder="e.g. 5.5"
                className="w-full px-2 py-1.5 text-xs bg-black/5 dark:bg-white/5 border border-border rounded focus:outline-none focus:border-teal-400 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-1">Preceding Year FY-1 Threshold: ≥ ₹5 Cr</span>
        </div>
      </div>

      {/* Calculations & Results */}
      <div className="p-4 rounded-lg bg-teal-500/5 border border-teal-500/20 space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-1.5 text-teal-400">
          <CheckCircle2 className="w-4 h-4" /> Compliance Assessment
        </h4>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block">CSR Applicability:</span>
            <span className={`font-bold ${isEligible ? "text-emerald-400" : "text-amber-400"}`}>
              {isEligible ? "APPLICABLE" : "NOT MANDATORY"}
            </span>
            {isEligible && (
              <span className="text-[9px] block text-muted-foreground">
                Triggered by: {[
                  isEligibleNW ? "Net Worth" : "",
                  isEligibleTO ? "Turnover" : "",
                  isEligibleNP ? "Net Profit" : ""
                ].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
          <div>
            <span className="text-muted-foreground block">3-Yr Avg Net Profit:</span>
            <span className="font-bold text-foreground">
              ₹ {avgProfitDisplay.toFixed(2)} Cr
            </span>
          </div>
        </div>

        {isEligible && (
          <div className="pt-2 border-t border-white/5 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Mandatory Spend (2%):</span>
              <span className="font-bold text-teal-300">
                ₹ {mandatorySpend.toFixed(3)} Cr (~₹ {mandatorySpendLakhs.toFixed(1)} Lakhs)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">CSR Committee Required?</span>
              <span className={`font-bold ${committeeRequired ? "text-red-400" : "text-emerald-400"}`}>
                {committeeRequired ? "YES (Spend > ₹50L)" : "NO (Spend ≤ ₹50L)"}
              </span>
            </div>
            {!committeeRequired && (
              <p className="text-[10px] text-muted-foreground leading-normal">
                💡 Since CSR obligation is ≤ ₹50 Lakhs, the Board can discharge the duties of the CSR Committee directly.
              </p>
            )}
          </div>
        )}
      </div>

      {/* statutory compliance timelines */}
      <div className="text-xs space-y-2 bg-purple-500/5 border border-purple-500/20 p-3 rounded-lg">
        <h4 className="font-bold text-purple-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Unspent CSR Treatment Flow (Sec 135(5) & 135(6))
        </h4>
        <div className="space-y-2 text-[11px] leading-relaxed">
          <div className="border-l-2 border-teal-500 pl-2">
            <span className="font-semibold text-foreground">Ongoing Projects:</span>
            <p className="text-muted-foreground">
              Transfer to <b>"Unspent CSR Account"</b> within <b>30 days</b> of FY end. Spend within <b>3 Financial Years</b>. If still unspent, transfer to Schedule VII Fund within <b>30 days</b> of completion of 3rd FY.
            </p>
          </div>
          <div className="border-l-2 border-purple-500 pl-2">
            <span className="font-semibold text-foreground">Other than Ongoing Projects:</span>
            <p className="text-muted-foreground">
              Transfer unspent amount directly to a <b>Schedule VII Fund</b> within <b>6 months</b> of the end of the financial year.
            </p>
          </div>
          <div className="border-l-2 border-amber-500 pl-2">
            <span className="font-semibold text-foreground">Set-off Provision:</span>
            <p className="text-muted-foreground">
              Excess spend can be carried forward and set-off against future CSR obligations for up to <b>3 succeeding FYs</b> (requires Board resolution, excludes CSR asset surplus).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
