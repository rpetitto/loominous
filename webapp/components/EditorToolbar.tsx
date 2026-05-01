"use client";

import { useState } from "react";
import {
  Sparkles,
  Download,
  Monitor,
  FileText,
  Plus,
  CheckCircle2,
  ChevronLeft,
  Layers,
} from "lucide-react";

import Link from "next/link";
import type { CheatSheet, CheatSheetStyle, SectionType } from "@/lib/types";

const SECTION_TYPES: { type: SectionType; label: string; emoji: string }[] = [
  { type: "key-concepts", label: "Key Concepts", emoji: "🔑" },
  { type: "steps", label: "Steps", emoji: "📋" },
  { type: "tips", label: "Tips", emoji: "💡" },
  { type: "quick-reference", label: "Quick Ref", emoji: "📊" },
];

interface Props {
  cs: CheatSheet;
  style: CheatSheetStyle;
  onStyleChange: (s: CheatSheetStyle) => void;
  onDownloadPdf: () => void;
  saved: boolean;
  onTitleChange: (t: string) => void;
  onSubtitleChange: (s: string) => void;
  onAddSection: (type: SectionType) => void;
}

export default function EditorToolbar({
  cs,
  style,
  onStyleChange,
  onDownloadPdf,
  saved,
  onAddSection,
}: Props) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    await navigator.clipboard.writeText(url).catch(() => {});
    alert("Link copied to clipboard!");
  }

  return (
    <header className="no-print flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/60 backdrop-blur sticky top-0 z-50">
      {/* Back */}
      <Link
        href="/"
        className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm mr-2"
      >
        <ChevronLeft size={16} />
        <span className="font-bold">
          <span className="text-white">Loom</span>
          <span className="text-violet-400">inous</span>
        </span>
      </Link>

      <div className="h-5 w-px bg-slate-700" />

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{cs.title}</p>
        <p className="text-xs text-slate-500 truncate">{cs.loom.title}</p>
      </div>

      {/* Saved indicator */}
      {saved && (
        <span className="flex items-center gap-1 text-xs text-emerald-400">
          <CheckCircle2 size={13} />
          Saved
        </span>
      )}

      {/* Style toggle */}
      <div className="flex items-center bg-slate-800/60 rounded-lg p-1 gap-1">
        <button
          onClick={() => onStyleChange("interactive")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            style === "interactive"
              ? "bg-violet-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Monitor size={13} />
          Interactive
        </button>
        <button
          onClick={() => onStyleChange("pdf")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            style === "pdf"
              ? "bg-violet-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText size={13} />
          PDF
        </button>
      </div>

      {/* Add section */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700/60 text-xs font-medium transition-all"
        >
          <Plus size={13} />
          <Layers size={13} />
        </button>
        {showAddMenu && (
          <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700/60 rounded-xl shadow-xl p-2 w-48 z-50">
            <p className="text-xs font-semibold text-slate-500 px-2 py-1 mb-1">Add Section</p>
            {SECTION_TYPES.map(({ type, label, emoji }) => (
              <button
                key={type}
                onClick={() => {
                  onAddSection(type);
                  setShowAddMenu(false);
                }}
                className="w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors"
              >
                <span>{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Download PDF */}
      <button
        onClick={onDownloadPdf}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700/60 text-xs font-medium transition-all"
      >
        <Download size={13} />
        PDF
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all shadow-sm"
      >
        <Sparkles size={13} />
        Share
      </button>
    </header>
  );
}
