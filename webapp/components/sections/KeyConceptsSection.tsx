"use client";

import type { KeyConceptsContent } from "@/lib/types";

interface Props {
  content: KeyConceptsContent;
  editable?: boolean;
  isPdf?: boolean;
  onUpdate?: (idx: number, field: "term" | "definition" | "emoji", val: string) => void;
}

export default function KeyConceptsSection({ content, editable, isPdf, onUpdate }: Props) {
  return (
    <div className={`grid gap-3 ${isPdf ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
      {content.items.map((item, i) => (
        <div
          key={i}
          className={`rounded-xl p-4 ${
            isPdf
              ? "border border-gray-200 bg-gray-50"
              : "bg-slate-900/60 border border-slate-700/40 hover:border-cyan-500/30 transition-colors"
          }`}
        >
          <div className="flex items-start gap-2">
            <span
              contentEditable={editable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdate?.(i, "emoji", e.currentTarget.textContent ?? "")}
              className="text-xl flex-shrink-0 cursor-text"
            >
              {item.emoji ?? "🔑"}
            </span>
            <div className="flex-1 min-w-0">
              <p
                contentEditable={editable}
                suppressContentEditableWarning
                onBlur={(e) => onUpdate?.(i, "term", e.currentTarget.textContent ?? "")}
                className={`font-bold text-sm mb-1 ${isPdf ? "text-gray-900" : "text-cyan-300"}`}
              >
                {item.term}
              </p>
              <p
                contentEditable={editable}
                suppressContentEditableWarning
                onBlur={(e) => onUpdate?.(i, "definition", e.currentTarget.textContent ?? "")}
                className={`text-xs leading-relaxed ${isPdf ? "text-gray-600" : "text-slate-400"}`}
              >
                {item.definition}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
