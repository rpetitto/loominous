"use client";

import { useState } from "react";
import { Clock, ImagePlus, Pencil, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { StepsContent } from "@/lib/types";
import ScreenshotEditor from "@/components/ScreenshotEditor";

interface Props {
  content: StepsContent;
  editable?: boolean;
  isPdf?: boolean;
  thumbnailUrl?: string;
  videoId?: string;
  onUpdate?: (idx: number, field: "title" | "description" | "timestamp", val: string) => void;
  onUpdateScreenshot?: (idx: number, url: string) => void;
  onReplace?: (content: StepsContent) => void;
}

function renumber(steps: StepsContent["steps"]): StepsContent["steps"] {
  return steps.map((s, i) => ({ ...s, number: i + 1 }));
}

function timestampToSeconds(ts: string): number {
  const parts = ts.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? 0;
}

export default function StepsSection({
  content,
  editable,
  isPdf,
  thumbnailUrl,
  videoId,
  onUpdate,
  onUpdateScreenshot,
  onReplace,
}: Props) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  function move(from: number, to: number) {
    const steps = [...content.steps];
    steps.splice(to, 0, steps.splice(from, 1)[0]);
    onReplace?.({ ...content, steps: renumber(steps) });
  }

  function remove(idx: number) {
    onReplace?.({ ...content, steps: renumber(content.steps.filter((_, i) => i !== idx)) });
  }

  function add() {
    const n = content.steps.length + 1;
    onReplace?.({
      ...content,
      steps: [...content.steps, { number: n, title: "New Step", description: "Describe what to do", timestamp: "" }],
    });
  }

  const editingStep = editingIdx !== null ? content.steps[editingIdx] : null;

  return (
    <>
      <div className="space-y-3">
        {content.steps.map((step, i) => {
          const imgSrc = step.screenshotUrl || (!isPdf ? thumbnailUrl : undefined);
          const hasImg = !!imgSrc;
          const tsSeconds = step.timestamp ? timestampToSeconds(step.timestamp) : null;
          const loomUrl = videoId && tsSeconds !== null
            ? `https://www.loom.com/share/${videoId}?t=${tsSeconds}`
            : null;

          return (
            <div
              key={`${i}-${step.title.slice(0, 8)}`}
              className={`group/step relative rounded-xl p-4 ${
                isPdf ? "border border-gray-200 bg-white" : "bg-slate-900/60 border border-slate-700/40"
              }`}
            >
              {/* Reorder / delete controls */}
              {editable && !isPdf && (
                <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover/step:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    className="p-1 rounded text-slate-500 hover:text-slate-200 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    onClick={() => move(i, i + 1)}
                    disabled={i === content.steps.length - 1}
                    className="p-1 rounded text-slate-500 hover:text-slate-200 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronDown size={13} />
                  </button>
                  <button
                    onClick={() => remove(i)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}

              {/* Side-by-side layout */}
              <div className="flex gap-4 items-start">
                {/* Left: number + content */}
                <div className="flex gap-3 flex-1 min-w-0">
                  {/* Step number badge */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                      isPdf ? "bg-violet-100 text-violet-700" : "bg-violet-500/20 text-violet-300"
                    }`}
                  >
                    {step.number}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <p
                      contentEditable={editable && !isPdf}
                      suppressContentEditableWarning
                      onBlur={(e) => onUpdate?.(i, "title", e.currentTarget.textContent ?? "")}
                      className={`font-semibold text-sm mb-1 focus:outline-none ${isPdf ? "text-gray-900" : "text-white"}`}
                    >
                      {step.title}
                    </p>

                    {/* Description */}
                    <p
                      contentEditable={editable && !isPdf}
                      suppressContentEditableWarning
                      onBlur={(e) => onUpdate?.(i, "description", e.currentTarget.textContent ?? "")}
                      className={`text-xs leading-relaxed focus:outline-none ${isPdf ? "text-gray-600" : "text-slate-400"}`}
                    >
                      {step.description}
                    </p>

                    {/* Timestamp chip */}
                    {(step.timestamp || editable) && (
                      <div className="mt-2">
                        {editable && !isPdf ? (
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${
                              isPdf ? "bg-gray-100 text-gray-500" : "bg-slate-800 text-slate-500"
                            }`}
                          >
                            <Clock size={10} />
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => onUpdate?.(i, "timestamp", e.currentTarget.textContent ?? "")}
                              className="focus:outline-none min-w-[2ch]"
                            >
                              {step.timestamp || "0:00"}
                            </span>
                          </span>
                        ) : loomUrl ? (
                          <a
                            href={loomUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md transition-colors ${
                              isPdf
                                ? "bg-gray-100 text-gray-500"
                                : "bg-slate-800 text-slate-500 hover:bg-violet-500/20 hover:text-violet-300"
                            }`}
                          >
                            <Clock size={10} />
                            {step.timestamp}
                          </a>
                        ) : step.timestamp ? (
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${
                              isPdf ? "bg-gray-100 text-gray-500" : "bg-slate-800 text-slate-500"
                            }`}
                          >
                            <Clock size={10} />
                            {step.timestamp}
                          </span>
                        ) : null}
                      </div>
                    )}

                    {/* Edit screenshot button (edit mode only, compact) */}
                    {editable && !isPdf && (
                      <button
                        onClick={() => setEditingIdx(i)}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-slate-600 hover:text-violet-400 transition-colors"
                        title="Edit screenshot"
                      >
                        <ImagePlus size={12} />
                        {hasImg ? "Edit screenshot" : "Add screenshot"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: screenshot */}
                {hasImg ? (
                  <div
                    className={`flex-shrink-0 w-40 sm:w-48 rounded-lg overflow-hidden border ${
                      isPdf
                        ? "border-gray-200"
                        : "border-slate-700/40 group/shot" + (editable ? " cursor-pointer" : "")
                    }`}
                    onClick={editable && !isPdf ? () => setEditingIdx(i) : undefined}
                  >
                    <img
                      src={imgSrc!}
                      alt={`Step ${step.number}`}
                      className="w-full block"
                    />
                    {editable && !isPdf && (
                      <div className="absolute inset-0 rounded-lg bg-black/0 group-hover/shot:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover/shot:opacity-100 pointer-events-none">
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-white/90 text-slate-900 rounded-lg text-xs font-semibold shadow">
                          <Pencil size={11} /> Edit
                        </span>
                      </div>
                    )}
                  </div>
                ) : editable && !isPdf ? (
                  <button
                    onClick={() => setEditingIdx(i)}
                    className="flex-shrink-0 w-40 sm:w-48 flex flex-col items-center justify-center gap-1 py-6 rounded-lg border border-dashed border-slate-700/40 text-slate-600 hover:text-slate-400 hover:border-slate-600 transition-colors text-xs"
                  >
                    <ImagePlus size={16} />
                    <span>Add screenshot</span>
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add step button */}
      {editable && !isPdf && (
        <button
          onClick={add}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-slate-700/50 text-slate-600 hover:text-slate-400 hover:border-slate-600 text-xs transition-colors"
        >
          <Plus size={12} /> Add step
        </button>
      )}

      {/* Screenshot editor modal */}
      {editingIdx !== null && editingStep !== null && (
        <ScreenshotEditor
          imageUrl={editingStep.screenshotUrl ?? thumbnailUrl ?? ""}
          videoId={videoId}
          initialTimestamp={editingStep.timestamp}
          onSave={(url) => {
            onUpdateScreenshot?.(editingIdx, url);
            setEditingIdx(null);
          }}
          onClose={() => setEditingIdx(null)}
        />
      )}
    </>
  );
}
