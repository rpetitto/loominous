"use client";

import { useRef } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

import type {
  CheatSheet,
  Section,
  SectionType,
  HeroContent,
  KeyConceptsContent,
  StepsContent,
  TipsContent,
  QuickRefContent,
} from "@/lib/types";

import HeroSection from "./sections/HeroSection";
import KeyConceptsSection from "./sections/KeyConceptsSection";
import StepsSection from "./sections/StepsSection";
import TipsSection from "./sections/TipsSection";
import QuickRefSection from "./sections/QuickRefSection";

const TYPE_LABEL: Record<SectionType, string> = {
  hero: "Hero",
  "key-concepts": "Key Concepts",
  steps: "Steps",
  tips: "Tips",
  "quick-reference": "Quick Reference",
  code: "Code",
  callout: "Callout",
};

const TYPE_BADGE: Record<SectionType, string> = {
  hero: "badge-steps",
  "key-concepts": "badge-concepts",
  steps: "badge-steps",
  tips: "badge-tips",
  "quick-reference": "badge-reference",
  code: "badge-code",
  callout: "badge-tips",
};

interface SectionWrapperProps {
  section: Section;
  editable?: boolean;
  isPdf: boolean;
  onDelete: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onContentChange: (id: string, content: Section["content"]) => void;
  loom: CheatSheet["loom"];
}

function SectionWrapper({
  section,
  editable,
  isPdf,
  onDelete,
  onTitleChange,
  onContentChange,
  loom,
}: SectionWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    disabled: !editable || isPdf,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const content = renderSectionContent(section, editable, isPdf, onContentChange, loom);
  if (!content) return null;

  if (isPdf) {
    return (
      <div className="pdf-section mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          {section.title}
        </h2>
        {content}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="section-card glass rounded-2xl overflow-hidden mb-4"
    >
      {/* Section header */}
      {editable && (
        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-700/30 bg-slate-900/40">
          <button
            {...attributes}
            {...listeners}
            className="drag-handle text-slate-600 hover:text-slate-400 flex-shrink-0 cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={15} />
          </button>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[section.type]}`}
          >
            {TYPE_LABEL[section.type]}
          </span>
          <h2
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={(e) => onTitleChange(section.id, e.currentTarget.textContent ?? "")}
            className="flex-1 text-sm font-semibold text-slate-200 focus:outline-none"
          >
            {section.title}
          </h2>
          <button
            onClick={() => onDelete(section.id)}
            className="flex-shrink-0 text-slate-600 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
      {!editable && (
        <div className="px-5 py-3 border-b border-slate-700/30">
          <h2 className="text-sm font-bold text-slate-200">{section.title}</h2>
        </div>
      )}
      <div className="p-5">{content}</div>
    </div>
  );
}

function renderSectionContent(
  section: Section,
  editable: boolean | undefined,
  isPdf: boolean,
  onContentChange: (id: string, content: Section["content"]) => void,
  loom?: CheatSheet["loom"]
) {
  switch (section.type) {
    case "key-concepts":
      return (
        <KeyConceptsSection
          content={section.content as KeyConceptsContent}
          editable={editable}
          isPdf={isPdf}
          onUpdate={(idx, field, val) => {
            const c = section.content as KeyConceptsContent;
            const items = [...c.items];
            items[idx] = { ...items[idx], [field]: val };
            onContentChange(section.id, { ...c, items });
          }}
        />
      );
    case "steps":
      return (
        <StepsSection
          content={section.content as StepsContent}
          editable={editable}
          isPdf={isPdf}
          thumbnailUrl={loom?.thumbnail}
          videoId={loom?.videoId}
          onUpdate={(idx, field, val) => {
            const c = section.content as StepsContent;
            const steps = [...c.steps];
            steps[idx] = { ...steps[idx], [field]: val };
            onContentChange(section.id, { ...c, steps });
          }}
          onUpdateScreenshot={(idx, url) => {
            const c = section.content as StepsContent;
            const steps = [...c.steps];
            steps[idx] = { ...steps[idx], screenshotUrl: url };
            onContentChange(section.id, { ...c, steps });
          }}
          onReplace={(newContent) => onContentChange(section.id, newContent)}
        />
      );
    case "tips":
      return (
        <TipsSection
          content={section.content as TipsContent}
          editable={editable}
          isPdf={isPdf}
          onUpdate={(idx, val) => {
            const c = section.content as TipsContent;
            const items = [...c.items];
            items[idx] = { ...items[idx], text: val };
            onContentChange(section.id, { ...c, items });
          }}
        />
      );
    case "quick-reference":
      return (
        <QuickRefSection
          content={section.content as QuickRefContent}
          editable={editable}
          isPdf={isPdf}
          onUpdate={(ri, ci, val) => {
            const c = section.content as QuickRefContent;
            const rows = c.rows.map((r, ri2) =>
              ri2 === ri
                ? { cols: r.cols.map((cell, ci2) => (ci2 === ci ? val : cell)) }
                : r
            );
            onContentChange(section.id, { ...c, rows });
          }}
          onHeaderUpdate={(ci, val) => {
            const c = section.content as QuickRefContent;
            const headers = c.headers.map((h, i) => (i === ci ? val : h));
            onContentChange(section.id, { ...c, headers });
          }}
        />
      );
    default:
      return null;
  }
}

interface PreviewProps {
  cs: CheatSheet;
  editable?: boolean;
  onUpdateHeroContent?: (field: string, value: string) => void;
  onUpdateSectionTitle?: (id: string, title: string) => void;
  onUpdateSectionContent?: (id: string, content: Section["content"]) => void;
  onDeleteSection?: (id: string) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  sensors?: SensorDescriptor<SensorOptions>[];
}

export default function CheatSheetPreview({
  cs,
  editable,
  onUpdateHeroContent,
  onUpdateSectionTitle,
  onUpdateSectionContent,
  onDeleteSection,
  onDragEnd,
  sensors,
}: PreviewProps) {
  const isPdf = cs.style === "pdf";

  const containerClass = isPdf
    ? "cheatsheet-pdf max-w-4xl mx-auto px-8 py-10 bg-white min-h-screen"
    : "max-w-3xl mx-auto px-4 py-8";

  const nonHeroSections = cs.sections.filter((s) => s.type !== "hero");

  return (
    <div className={containerClass}>
      {/* PDF Header */}
      {isPdf && (
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-violet-200">
          <div>
            <h1 className="text-3xl font-black text-gray-900">{cs.title}</h1>
            <p className="text-gray-500 mt-1">{cs.subtitle}</p>
          </div>
          <div className="text-right text-sm text-gray-400">
            <p className="font-semibold text-gray-600">{cs.loom.author}</p>
            <p>{cs.loom.duration}</p>
          </div>
        </div>
      )}

      {/* Interactive header */}
      {!isPdf && (
        <div className="mb-6">
          <h1
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateHeroContent?.("title", e.currentTarget.textContent ?? "")}
            className="text-3xl font-black gradient-text mb-1 focus:outline-none"
          >
            {cs.title}
          </h1>
          <p
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateHeroContent?.("subtitle", e.currentTarget.textContent ?? "")}
            className="text-slate-400 text-sm focus:outline-none"
          >
            {cs.subtitle}
          </p>
        </div>
      )}

      {/* Hero thumbnail card */}
      <HeroSection
        title={cs.title}
        content={{ description: cs.subtitle, highlights: [] }}
        loom={cs.loom}
        editable={false}
        isPdf={isPdf}
      />

      <div className="mt-6">
        {editable && !isPdf && onDragEnd && sensors ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={nonHeroSections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {nonHeroSections.map((section) => (
                <SectionWrapper
                  key={section.id}
                  section={section}
                  editable={editable}
                  isPdf={isPdf}
                  loom={cs.loom}
                  onDelete={onDeleteSection ?? (() => {})}
                  onTitleChange={onUpdateSectionTitle ?? (() => {})}
                  onContentChange={onUpdateSectionContent ?? (() => {})}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          nonHeroSections.map((section) => (
            <SectionWrapper
              key={section.id}
              section={section}
              editable={editable && !isPdf}
              isPdf={isPdf}
              loom={cs.loom}
              onDelete={onDeleteSection ?? (() => {})}
              onTitleChange={onUpdateSectionTitle ?? (() => {})}
              onContentChange={onUpdateSectionContent ?? (() => {})}
            />
          ))
        )}
      </div>

      {/* PDF footer */}
      {isPdf && (
        <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          Generated by Loominous · {new Date(cs.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
