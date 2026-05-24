"use client";

import React, { useEffect, useState } from "react";
import { X, Trophy, Quote, Sparkles } from "lucide-react";
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md p-6 rounded-2xl glass-panel shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground flex items-center justify-center gap-1.5 font-sans">
              Slot Completed! <Sparkles className="w-5 h-5 text-amber-400" />
            </h3>
            <p className="text-xs text-muted-foreground">
              Great job finishing <span className="font-semibold text-teal-400">{slotName}</span>!
            </p>
          </div>

          <div className="relative p-6 rounded-xl bg-white/5 border border-white/5 space-y-3 my-4">
            <Quote className="absolute top-2 left-2 w-6 h-6 text-teal-500/20" />
            <p className="text-sm italic text-foreground leading-relaxed relative z-10 font-sans px-4">
              "{quote.text}"
            </p>
            <p className="text-xs text-right text-teal-400 font-medium">
              — {quote.author}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-teal-500/25 active:scale-95"
          >
            Keep Crushing It
          </button>
        </div>
      </div>
    </div>
  );
}
