"use client";

import type { TipsContent, TipItem } from "@/lib/types";
import { AlertTriangle, Info, CheckCircle, Lightbulb } from "lucide-react";

const TYPE_CONFIG: Record<
  TipItem["type"],
  { icon: React.ReactNode; dark: string; pdf: string }
> = {
  tip: {
    icon: <Lightbulb size={14} />,
    dark: "bg-violet-500/10 border-violet-500/20 text-violet-300",
    pdf: "bg-violet-50 border-violet-200 text-violet-800",
  },
  warning: {
    icon: <AlertTriangle size={14} />,
    dark: "bg-orange-500/10 border-orange-500/20 text-orange-300",
    pdf: "bg-orange-50 border-orange-200 text-orange-800",
  },
  info: {
    icon: <Info size={14} />,
    dark: "bg-sky-500/10 border-sky-500/20 text-sky-300",
    pdf: "bg-sky-50 border-sky-200 text-sky-800",
  },
  success: {
    icon: <CheckCircle size={14} />,
    dark: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
    pdf: "bg-emerald-50 border-emerald-200 text-emerald-800",
  },
};

interface Props {
  content: TipsContent;
  editable?: boolean;
  isPdf?: boolean;
  onUpdate?: (idx: number, val: string) => void;
}

export default function TipsSection({ content, editable, isPdf, onUpdate }: Props) {
  return (
    <div className="space-y-2">
      {content.items.map((item, i) => {
        const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.tip;
        return (
          <div
            key={i}
            className={`pdf-section flex items-start gap-2.5 rounded-xl px-4 py-3 border text-sm ${
              isPdf ? cfg.pdf : cfg.dark
            }`}
          >
            <span className="flex-shrink-0 mt-0.5">{cfg.icon}</span>
            <p
              contentEditable={editable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdate?.(i, e.currentTarget.textContent ?? "")}
              className="leading-relaxed text-xs"
            >
              {item.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
