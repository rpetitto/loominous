"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Camera, Layers } from "lucide-react";

interface Props {
  imageUrl: string;
  videoId?: string;
  initialTimestamp?: string;
  onSave: (url: string) => void;
  onClose: () => void;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target!.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function ScreenshotEditor({ imageUrl, videoId, initialTimestamp, onSave, onClose }: Props) {
  const [mode, setMode] = useState<"canvas" | "video">(imageUrl ? "canvas" : videoId ? "video" : "canvas");
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [pasting, setPasting] = useState(false);
  const [pasteError, setPasteError] = useState("");
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const applyPastedImage = useCallback((url: string) => {
    setCurrentImageUrl(url);
    setPasteError("");
    setMode("canvas");
  }, []);

  // Cmd/Ctrl+V paste handler
  useEffect(() => {
    async function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) continue;
          const url = await blobToDataUrl(file);
          applyPastedImage(url);
          return;
        }
      }
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [applyPastedImage]);

  async function handlePasteButton() {
    setPasting(true);
    setPasteError("");
    try {
      const clipItems = await navigator.clipboard.read();
      for (const item of clipItems) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const url = await blobToDataUrl(blob);
          applyPastedImage(url);
          return;
        }
      }
      setPasteError("No image in clipboard — right-click the video and select Copy Video Frame first.");
    } catch {
      setPasteError("Clipboard access denied. Try pressing ⌘V (Mac) or Ctrl+V (Windows) instead.");
    } finally {
      if (mounted.current) setPasting(false);
    }
  }

  const modal = (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/60 w-full max-w-3xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/40 flex-shrink-0">
          {videoId && (
            <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-1">
              <button
                onClick={() => setMode("canvas")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  mode === "canvas" ? "bg-violet-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers size={12} />
                Canvas
              </button>
              <button
                onClick={() => setMode("video")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  mode === "video" ? "bg-violet-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <Camera size={12} />
                Video
              </button>
            </div>
          )}
          <div className="flex-1" />
          <button
            onClick={() => onSave(currentImageUrl)}
            disabled={!currentImageUrl}
            className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
          >
            Save
          </button>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Canvas tab */}
        {mode === "canvas" && (
          <div className="flex-1 overflow-auto p-4">
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt="Screenshot"
                className="w-full rounded-xl border border-slate-700/40 block"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-slate-700/50 text-slate-500 gap-2">
                <Camera size={28} className="opacity-40" />
                <p className="text-sm">No screenshot yet.</p>
                {videoId && (
                  <button onClick={() => setMode("video")} className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2">
                    Capture from video →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Video tab */}
        {mode === "video" && videoId && (
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* Loom embed */}
            <div className="relative w-full rounded-xl overflow-hidden border border-slate-700/40 bg-black" style={{ aspectRatio: "16/9" }}>
              <iframe
                src={`https://www.loom.com/embed/${videoId}?hideEmbedTopBar=true&autoplay=0`}
                className="absolute inset-0 w-full h-full"
                allow="fullscreen"
                allowFullScreen
              />
            </div>

            {/* Capture instructions */}
            <div className="bg-slate-800/60 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Capture a frame</p>
              <ol className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 text-xs flex items-center justify-center font-bold mt-0.5">1</span>
                  Scrub the video above to the moment you want
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 text-xs flex items-center justify-center font-bold mt-0.5">2</span>
                  Right-click the video and select <strong className="text-white">Copy Video Frame</strong>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 text-xs flex items-center justify-center font-bold mt-0.5">3</span>
                  Click the button below (or press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs font-mono">⌘V</kbd>)
                </li>
              </ol>

              {pasteError && (
                <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{pasteError}</p>
              )}

              <button
                onClick={handlePasteButton}
                disabled={pasting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-wait text-white font-semibold text-sm transition-all shadow-sm"
              >
                <Camera size={14} />
                {pasting ? "Reading clipboard…" : "Paste Frame to Canvas →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
