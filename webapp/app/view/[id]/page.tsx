"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Download, Edit2, Loader2 } from "lucide-react";
import type { CheatSheet, CheatSheetStyle } from "@/lib/types";
import CheatSheetPreview from "@/components/CheatSheetPreview";
import Link from "next/link";

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cs, setCs] = useState<CheatSheet | null>(null);
  const [error, setError] = useState("");
  const [printStyle, setPrintStyle] = useState<CheatSheetStyle | null>(null);
  const restoringRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    const raw = localStorage.getItem(`cs-${id}`);
    if (!raw) {
      setError("Cheat sheet not found. It may have been created in a different browser or session.");
      return;
    }
    try {
      setCs(JSON.parse(raw));
    } catch {
      setError("Failed to load cheat sheet data.");
    }
  }, [id]);

  function handleDownloadPdf() {
    if (restoringRef.current) return;
    setPrintStyle("pdf");
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
        window.addEventListener(
          "afterprint",
          () => {
            restoringRef.current = true;
            setPrintStyle(null);
            setTimeout(() => { restoringRef.current = false; }, 100);
          },
          { once: true }
        );
      }, 150);
    });
  }

  if (error) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 max-w-md text-center"
        >
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (!cs) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <Loader2 size={32} className="text-violet-400 animate-spin" />
      </div>
    );
  }

  const displayStyle = printStyle ?? cs.style;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Toolbar */}
      <header className="no-print sticky top-0 z-50 flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/60 backdrop-blur">
        {/* Back / branding */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm mr-2"
        >
          <ArrowLeft size={15} />
          <span className="font-bold">
            <span className="text-white">Loom</span>
            <span className="text-violet-400">inous</span>
          </span>
        </Link>

        <div className="h-5 w-px bg-slate-700" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{cs.title}</p>
          <p className="text-xs text-slate-500 truncate">{cs.loom.author} · {cs.loom.duration}</p>
        </div>

        {/* Download PDF */}
        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700/60 text-xs font-medium transition-all"
        >
          <Download size={13} />
          Download PDF
        </button>

        {/* Edit link */}
        <Link
          href={`/edit/${id}`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all shadow-sm"
        >
          <Edit2 size={13} />
          Edit
        </Link>
      </header>

      <CheatSheetPreview
        cs={{ ...cs, style: displayStyle }}
        editable={false}
      />
    </div>
  );
}
