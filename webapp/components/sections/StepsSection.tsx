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

          return (
            <div
              key={`${i}-${step.title.slice(0, 8)}`}
              className={`group/step relative rounded-xl p-4 ${
                isPdf ? "border border-gray-200 bg-white" : "bg-slate-900/60 border border-slate-700/40"
              }`}
            >
              {/* Row controls (edit mode) */}
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

              <div className="flex gap-4">
                {/* Step number */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                    isPdf ? "bg-violet-100 text-violet-700" : "bg-violet-500/20 text-violet-300"
                  }`}
                >
                  {step.number}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p
                      contentEditable={editable && !isPdf}
                      suppressContentEditableWarning
                      onBlur={(e) => onUpdate?.(i, "title", e.currentTarget.textContent ?? "")}
                      className={`font-semibold text-sm focus:outline-none ${isPdf ? "text-gray-900" : "text-white"}`}
                    >
                      {step.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0 mr-16">
                      {(step.timestamp || editable) && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${
                            isPdf ? "bg-gray-100 text-gray-500" : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          <Clock size={10} />
                          <span
                            contentEditable={editable && !isPdf}
                            suppressContentEditableWarning
                            onBlur={(e) => onUpdate?.(i, "timestamp", e.currentTarget.textContent ?? "")}
                            className="focus:outline-none"
                          >
                            {step.timestamp || (editable ? "0:00" : "")}
                          </span>
                        </span>
                      )}
                      {editable && !isPdf && (
                        <button
                          onClick={() => setEditingIdx(i)}
                          className="p-1 rounded-md text-slate-600 hover:text-violet-400 hover:bg-slate-800 transition-colors"
                          title="Edit screenshot"
                        >
                          <ImagePlus size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    contentEditable={editable && !isPdf}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdate?.(i, "description", e.currentTarget.textContent ?? "")}
                    className={`text-xs leading-relaxed focus:outline-none ${isPdf ? "text-gray-600" : "text-slate-400"}`}
                  >
                    {step.description}
                  </p>

                  {/* Screenshot thumbnail */}
                  {imgSrc && (
                    <div
                      className={`mt-3 relative rounded-lg overflow-hidden border ${
                        isPdf ? "border-gray-200" : "border-slate-700/40 group/shot cursor-pointer"
                      }`}
                      onClick={editable && !isPdf ? () => setEditingIdx(i) : undefined}
                    >
                      <img
                        src={imgSrc}
                        alt={`Step ${step.number}`}
                        className="w-full block"
                      />
                      {editable && !isPdf && (
                        <div className="absolute inset-0 bg-black/0 group-hover/shot:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover/shot:opacity-100">
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 text-slate-900 rounded-lg text-xs font-semibold shadow">
                            <Pencil size={12} /> Edit screenshot
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add screenshot button (when no image and editable) */}
                  {!imgSrc && editable && !isPdf && (
                    <button
                      onClick={() => setEditingIdx(i)}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-4 rounded-lg border border-dashed border-slate-700/40 text-slate-600 hover:text-slate-400 hover:border-slate-600 transition-colors text-xs"
                    >
                      <ImagePlus size={14} /> Add screenshot
                    </button>
                  )}
                </div>
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
