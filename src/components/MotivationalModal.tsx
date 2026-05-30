"use client";
import React, { useEffect, useState } from "react";
import { X, Trophy, Quote, Sparkles, Flame } from "lucide-react";
import { motivationalQuotes } from "@/data/schedule";

interface MotivationalModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotName: string;
}

export default function MotivationalModal({ isOpen, onClose, slotName }: MotivationalModalProps) {
  const [quote, setQuote] = useState({ text: "", author: "" });

  useEffect(() => {
    if (isOpen) {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setQuote(motivationalQuotes[randomIndex]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Custom Micro-Animations Style */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(1deg); }
        }
        @keyframes pulse-ring {
          0%, 100% { transform: scale(0.95); opacity: 0.3; }
          50% { transform: scale(1.08); opacity: 0.15; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-pulse-ring {
          animation: pulse-ring 3s ease-in-out infinite;
        }
      `}</style>

      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container using App Theme variables */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-card text-card-foreground border border-border shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-all cursor-pointer border-none bg-transparent"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-6">
          
          {/* Trophy Header */}
          <div className="relative flex items-center justify-center pt-2">
            {/* Outer Pulse Ring */}
            <div className="absolute w-20 h-20 rounded-full bg-primary/10 border border-primary/20 animate-pulse-ring" />
            
            {/* Inner Trophy Container */}
            <div className="relative z-10 w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center animate-float">
              <Trophy className="w-8 h-8" />
              <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1.5 -right-1.5 animate-pulse" />
            </div>
          </div>

          {/* Title Headers */}
          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-bold tracking-wide text-foreground font-sans">
              Slot Completed!
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans font-medium flex items-center justify-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              Great job finishing <span className="font-semibold text-primary underline decoration-primary/30 underline-offset-4">{slotName}</span>!
            </p>
          </div>

          {/* Quote Block using Theme Colors */}
          <div className="relative p-5 rounded-xl bg-muted/40 border border-border shadow-xs space-y-3.5 my-4 text-left border-l-4 border-l-primary">
            <Quote className="absolute top-2.5 right-3 w-8 h-8 text-primary/5 rotate-180" />
            <p className="text-sm font-medium text-foreground leading-relaxed font-sans relative z-10">
              "{quote.text}"
            </p>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-primary font-bold bg-primary/15 px-2.5 py-1 rounded">
                — {quote.author}
              </span>
            </div>
          </div>

          {/* Action Button using App Primary Theme Color */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all duration-200 active:scale-95 cursor-pointer border-none font-sans uppercase tracking-wider shadow-sm"
          >
            Keep Crushing It
          </button>
        </div>
      </div>
    </div>
  );
}
