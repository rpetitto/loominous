"use client";

import type { StepsContent } from "@/lib/types";
import { Clock } from "lucide-react";

interface Props {
  content: StepsContent;
  editable?: boolean;
  isPdf?: boolean;
  onUpdate?: (idx: number, field: "title" | "description" | "timestamp", val: string) => void;
}

export default function StepsSection({ content, editable, isPdf, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      {content.steps.map((step, i) => (
        <div
          key={i}
          className={`pdf-section flex gap-4 rounded-xl p-4 ${
            isPdf
              ? "border border-gray-200 bg-white"
              : "bg-slate-900/60 border border-slate-700/40"
          }`}
        >
          {/* Step number */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
            isPdf ? "bg-violet-100 text-violet-700" : "bg-violet-500/20 text-violet-300"
          }`}>
            {step.number}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p
                contentEditable={editable}
                suppressContentEditableWarning
                onBlur={(e) => onUpdate?.(i, "title", e.currentTarget.textContent ?? "")}
                className={`font-semibold text-sm ${isPdf ? "text-gray-900" : "text-white"}`}
              >
                {step.title}
              </p>
              {step.timestamp && (
                <span
                  contentEditable={editable}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdate?.(i, "timestamp", e.currentTarget.textContent ?? "")}
                  className={`flex-shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${
                    isPdf ? "bg-gray-100 text-gray-500" : "bg-slate-800 text-slate-500"
                  }`}
                >
                  <Clock size={10} />
                  {step.timestamp}
                </span>
              )}
            </div>
            <p
              contentEditable={editable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdate?.(i, "description", e.currentTarget.textContent ?? "")}
              className={`text-xs leading-relaxed ${isPdf ? "text-gray-600" : "text-slate-400"}`}
            >
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
