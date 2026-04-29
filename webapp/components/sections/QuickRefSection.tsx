"use client";

import type { QuickRefContent } from "@/lib/types";

interface Props {
  content: QuickRefContent;
  editable?: boolean;
  isPdf?: boolean;
  onUpdate?: (row: number, col: number, val: string) => void;
  onHeaderUpdate?: (col: number, val: string) => void;
}

export default function QuickRefSection({ content, editable, isPdf, onUpdate, onHeaderUpdate }: Props) {
  return (
    <div className={`rounded-xl overflow-hidden border ${isPdf ? "border-gray-200" : "border-slate-700/40"}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className={isPdf ? "bg-gray-100" : "bg-slate-800/60"}>
            {content.headers.map((h, ci) => (
              <th
                key={ci}
                contentEditable={editable}
                suppressContentEditableWarning
                onBlur={(e) => onHeaderUpdate?.(ci, e.currentTarget.textContent ?? "")}
                className={`px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider ${
                  isPdf ? "text-gray-600" : "text-slate-400"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {content.rows.map((row, ri) => (
            <tr
              key={ri}
              className={`border-t ${
                isPdf
                  ? "border-gray-100 even:bg-gray-50"
                  : "border-slate-700/30 even:bg-slate-900/30 hover:bg-slate-800/30 transition-colors"
              }`}
            >
              {row.cols.map((cell, ci) => (
                <td
                  key={ci}
                  contentEditable={editable}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdate?.(ri, ci, e.currentTarget.textContent ?? "")}
                  className={`px-4 py-2.5 text-xs ${
                    ci === 0
                      ? isPdf
                        ? "font-semibold text-gray-900"
                        : "font-semibold text-white font-mono"
                      : isPdf
                      ? "text-gray-600"
                      : "text-slate-400"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
