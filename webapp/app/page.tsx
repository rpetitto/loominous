"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link,
  Sparkles,
  FileText,
  Zap,
  GripVertical,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Puzzle,
  ExternalLink,
} from "lucide-react";
import { isValidLoomUrl } from "@/lib/utils";
import type { LoomMeta, CheatSheet } from "@/lib/types";

type Phase = "idle" | "fetching-meta" | "generating" | "done" | "error";

function HomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [context, setContext] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [meta, setMeta] = useState<LoomMeta | null>(null);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-fill from extension URL params
  useEffect(() => {
    const urlParam = searchParams.get("url");
    const transcriptParam = searchParams.get("transcript");
    if (urlParam && isValidLoomUrl(urlParam)) {
      setUrl(urlParam);
      if (transcriptParam) {
        setTranscript(transcriptParam);
        setShowAdvanced(true);
      }
    }
  }, [searchParams]);

  const valid = isValidLoomUrl(url);

  async function handleGenerate() {
    if (!valid) return;
    setError("");
    setPhase("fetching-meta");

    try {
      // 1. Fetch Loom metadata
      const metaRes = await fetch(
        `/api/loom-info?url=${encodeURIComponent(url)}`
      );
      if (!metaRes.ok) {
        const d = await metaRes.json();
        throw new Error(d.error || "Could not fetch Loom video info");
      }
      const loomMeta: LoomMeta = await metaRes.json();
      setMeta(loomMeta);
      setPhase("generating");

      // 2. Generate cheat sheet via Claude
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta: loomMeta,
          transcript: transcript.trim() || undefined,
          context: context.trim() || undefined,
        }),
      });
      if (!genRes.ok) {
        const d = await genRes.json();
        throw new Error(d.error || "Generation failed");
      }
      const cheatSheet: CheatSheet = await genRes.json();

      // 3. Store and redirect
      setPhase("done");
      localStorage.setItem(`cs-${cheatSheet.id}`, JSON.stringify(cheatSheet));
      setTimeout(() => router.push(`/edit/${cheatSheet.id}`), 600);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("error");
    }
  }

  return (
    <main className="hero-gradient min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-violet-400 mb-6">
          <Sparkles size={12} />
          AI-Powered Cheat Sheet Generator
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
          <span className="text-white">Loom</span>
          <span className="gradient-text">inous</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
          Paste any Loom video URL and get a beautiful, editable cheat sheet in
          seconds — powered by Claude AI.
        </p>
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-2xl"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl">
          {/* URL input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Loom Video URL
            </label>
            <div className="relative flex items-center">
              <Link
                size={16}
                className="absolute left-4 text-slate-500 pointer-events-none"
              />
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setMeta(null);
                  setError("");
                  setPhase("idle");
                }}
                placeholder="https://www.loom.com/share/..."
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              />
              {valid && (
                <CheckCircle2
                  size={16}
                  className="absolute right-4 text-emerald-400"
                />
              )}
            </div>
            {url && !valid && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={12} />
                Doesn&apos;t look like a valid Loom URL
              </p>
            )}
          </div>

          {/* Advanced options */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1 mb-4 transition-colors"
          >
            <ChevronRight
              size={14}
              className={`transition-transform ${showAdvanced ? "rotate-90" : ""}`}
            />
            {showAdvanced ? "Hide" : "Show"} advanced options
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Transcript{" "}
                      <span className="text-slate-500 font-normal">
                        (optional — paste from Loom or extension)
                      </span>
                    </label>
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="Paste the video transcript here for more accurate results..."
                      rows={5}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Extra context{" "}
                      <span className="text-slate-500 font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="e.g. 'Tutorial on React hooks for beginners'"
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metadata preview */}
          <AnimatePresence>
            {meta && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-700/40 mb-5"
              >
                {meta.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={meta.thumbnail}
                    alt="thumbnail"
                    className="w-16 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {meta.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {meta.author} · {meta.duration}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-5 text-sm text-red-400"
              >
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <button
            onClick={handleGenerate}
            disabled={!valid || phase === "fetching-meta" || phase === "generating" || phase === "done"}
            className="w-full relative overflow-hidden rounded-xl py-4 font-bold text-white text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/30 hover:shadow-violet-900/50 active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              {phase === "fetching-meta" && (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Fetching video info…
                </>
              )}
              {phase === "generating" && (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Claude is generating your cheat sheet…
                </>
              )}
              {phase === "done" && (
                <>
                  <CheckCircle2 size={18} />
                  Done! Opening editor…
                </>
              )}
              {(phase === "idle" || phase === "error") && (
                <>
                  <Sparkles size={18} />
                  Generate Cheat Sheet
                </>
              )}
            </span>
          </button>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {[
            { icon: <Zap size={13} />, label: "Claude-powered" },
            { icon: <GripVertical size={13} />, label: "Drag-and-drop editor" },
            { icon: <FileText size={13} />, label: "PDF & Interactive export" },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs text-slate-400"
            >
              {icon}
              {label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Extension CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-10 glass rounded-2xl p-5 max-w-2xl w-full"
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 flex-shrink-0">
            <Puzzle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white">
              Chrome Extension Available
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Install the companion extension to auto-fill the Loom URL and
              extract transcripts directly from any Loom page.
            </p>
          </div>
          <a
            href="#install-extension"
            className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-400 text-xs font-medium hover:bg-violet-600/30 transition-colors"
          >
            Install
            <ExternalLink size={11} />
          </a>
        </div>
      </motion.div>

      {/* Install instructions */}
      <motion.div
        id="install-extension"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 max-w-2xl w-full text-center"
      >
        <p className="text-xs text-slate-600">
          To install the extension: open{" "}
          <code className="text-slate-500">chrome://extensions</code>, enable
          Developer mode, click &quot;Load unpacked&quot; and select the{" "}
          <code className="text-slate-500">extension/</code> folder.
        </p>
      </motion.div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen hero-gradient" />}>
      <HomePageInner />
    </Suspense>
  );
}
