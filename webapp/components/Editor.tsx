"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import type {
  CheatSheet,
  CheatSheetStyle,
  Section,
  SectionType,
  HeroContent,
  KeyConceptsContent,
  StepsContent,
  TipsContent,
  QuickRefContent,
} from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import SortableSectionItem from "./SortableSectionItem";
import CheatSheetPreview from "./CheatSheetPreview";
import EditorToolbar from "./EditorToolbar";

interface Props {
  initial: CheatSheet;
}

function newSection(type: SectionType): Section {
  const id = uuidv4();
  switch (type) {
    case "key-concepts":
      return {
        id,
        type,
        title: "Key Concepts",
        content: {
          items: [{ term: "New Concept", definition: "Add your definition here", emoji: "💡" }],
        } as KeyConceptsContent,
      };
    case "steps":
      return {
        id,
        type,
        title: "Step-by-Step Guide",
        content: {
          steps: [{ number: 1, title: "First Step", description: "Describe what to do", timestamp: "0:00" }],
        } as StepsContent,
      };
    case "tips":
      return {
        id,
        type,
        title: "Pro Tips",
        content: {
          items: [{ text: "Add your tip here", type: "tip" }],
        } as TipsContent,
      };
    case "quick-reference":
      return {
        id,
        type,
        title: "Quick Reference",
        content: {
          headers: ["Item", "Description"],
          rows: [{ cols: ["Example", "Value"] }],
        } as QuickRefContent,
      };
    default:
      return {
        id,
        type: "key-concepts",
        title: "New Section",
        content: { items: [] } as KeyConceptsContent,
      };
  }
}

export default function Editor({ initial }: Props) {
  const [cs, setCs] = useState<CheatSheet>(initial);
  const [style, setStyle] = useState<CheatSheetStyle>(initial.style);
  const [saved, setSaved] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const save = useCallback(
    (updated: CheatSheet) => {
      localStorage.setItem(`cs-${updated.id}`, JSON.stringify(updated));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    []
  );

  const update = useCallback(
    (updater: (prev: CheatSheet) => CheatSheet) => {
      setCs((prev) => {
        const next = updater(prev);
        save(next);
        return next;
      });
    },
    [save]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    update((prev) => {
      const oldIdx = prev.sections.findIndex((s) => s.id === active.id);
      const newIdx = prev.sections.findIndex((s) => s.id === over.id);
      return { ...prev, sections: arrayMove(prev.sections, oldIdx, newIdx) };
    });
  }

  function updateSectionTitle(id: string, title: string) {
    update((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, title } : s)),
    }));
  }

  function updateSectionContent(id: string, content: Section["content"]) {
    update((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, content } : s)),
    }));
  }

  function deleteSection(id: string) {
    update((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));
  }

  function addSection(type: SectionType) {
    update((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection(type)],
    }));
  }

  function updateHero(field: "title" | "subtitle", value: string) {
    update((prev) => ({ ...prev, [field]: value }));
  }

  function updateHeroContent(field: string, value: string) {
    update((prev) => {
      const hero = prev.sections.find((s) => s.type === "hero");
      if (!hero) {
        return { ...prev, [field === "title" ? "title" : "subtitle"]: value };
      }
      const content = hero.content as HeroContent;
      return {
        ...prev,
        sections: prev.sections.map((s) =>
          s.type === "hero" ? { ...s, content: { ...content, [field]: value } } : s
        ),
      };
    });
  }

  function handleStyleChange(s: CheatSheetStyle) {
    setStyle(s);
    update((prev) => ({ ...prev, style: s }));
  }

  function handleDownloadPdf() {
    const prev = style;
    if (prev !== "pdf") {
      setStyle("pdf");
      // Wait for the PDF layout to render before printing
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.print();
          window.addEventListener("afterprint", () => setStyle(prev), { once: true });
        }, 150);
      });
    } else {
      window.print();
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <EditorToolbar
        cs={cs}
        style={style}
        onStyleChange={handleStyleChange}
        onDownloadPdf={handleDownloadPdf}
        saved={saved}
        onTitleChange={(t) => updateHero("title", t)}
        onSubtitleChange={(s) => updateHero("subtitle", s)}
        onAddSection={addSection}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Section list sidebar */}
        <aside className="w-56 flex-shrink-0 bg-slate-900/50 border-r border-slate-800/60 overflow-y-auto no-print hidden lg:block">
          <div className="p-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
              Sections
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={cs.sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {cs.sections.map((section) => (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    onDelete={deleteSection}
                    mini
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </aside>

        {/* Main preview/editing area */}
        <main className="flex-1 overflow-y-auto">
          <CheatSheetPreview
            cs={{ ...cs, style }}
            editable
            onUpdateHeroContent={updateHeroContent}
            onUpdateSectionTitle={updateSectionTitle}
            onUpdateSectionContent={updateSectionContent}
            onDeleteSection={deleteSection}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          />
        </main>
      </div>
    </div>
  );
}
