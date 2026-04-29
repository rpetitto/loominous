"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import type { Section, SectionType } from "@/lib/types";

const TYPE_ICON: Record<SectionType, string> = {
  hero: "🌟",
  "key-concepts": "🔑",
  steps: "📋",
  tips: "💡",
  "quick-reference": "📊",
  code: "💻",
  callout: "📣",
};

interface Props {
  section: Section;
  onDelete: (id: string) => void;
  mini?: boolean;
}

export default function SortableSectionItem({ section, onDelete, mini }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  if (mini) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-800/60 group cursor-default mb-0.5"
      >
        <button
          {...attributes}
          {...listeners}
          className="drag-handle text-slate-600 hover:text-slate-400 flex-shrink-0"
        >
          <GripVertical size={13} />
        </button>
        <span className="text-sm">{TYPE_ICON[section.type]}</span>
        <span className="text-xs text-slate-400 flex-1 truncate">{section.title}</span>
        <button
          onClick={() => onDelete(section.id)}
          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all flex-shrink-0"
        >
          <Trash2 size={11} />
        </button>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="section-card">
      <div className="flex items-center gap-2 mb-2">
        <button
          {...attributes}
          {...listeners}
          className="drag-handle text-slate-600 hover:text-slate-400"
        >
          <GripVertical size={16} />
        </button>
        <span>{TYPE_ICON[section.type]}</span>
        <span className="text-sm font-medium text-slate-300">{section.title}</span>
        <button
          onClick={() => onDelete(section.id)}
          className="ml-auto text-slate-600 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
