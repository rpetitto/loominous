"use client";

import type { HeroContent, LoomMeta } from "@/lib/types";
import { ExternalLink, Clock, User } from "lucide-react";

interface Props {
  title: string;
  content: HeroContent;
  loom: LoomMeta;
  editable?: boolean;
  onUpdate?: (field: string, value: string) => void;
  isPdf?: boolean;
}

export default function HeroSection({ title, content, loom, editable, onUpdate, isPdf }: Props) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${isPdf ? "pdf-hero" : "bg-gradient-to-br from-violet-900/40 via-indigo-900/30 to-slate-900/60 border border-violet-500/20"} p-8`}>
      {!isPdf && (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent pointer-events-none" />
      )}
      <div className="relative flex flex-col md:flex-row gap-6 items-start">
        {/* Thumbnail */}
        {loom.thumbnail && (
          <div className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={loom.thumbnail}
              alt={loom.title}
              className={`rounded-xl object-cover shadow-lg ${isPdf ? "w-40 h-24" : "w-48 h-28 md:w-56 md:h-32"}`}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate?.("title", e.currentTarget.textContent ?? "")}
            className={`font-black leading-tight mb-2 ${isPdf ? "text-2xl text-gray-900" : "text-2xl md:text-3xl text-white gradient-text"}`}
          >
            {title}
          </h1>
          <p
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate?.("description", e.currentTarget.textContent ?? "")}
            className={`leading-relaxed mb-4 ${isPdf ? "text-sm text-gray-600" : "text-slate-300"}`}
          >
            {content.description}
          </p>
          {/* Highlights */}
          {content.highlights?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {content.highlights.map((h, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                    isPdf
                      ? "bg-violet-100 text-violet-700"
                      : "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                  }`}
                >
                  {h}
                </span>
              ))}
            </div>
          )}
          {/* Meta */}
          <div className={`flex flex-wrap items-center gap-3 text-xs ${isPdf ? "text-gray-500" : "text-slate-500"}`}>
            <span className="flex items-center gap-1">
              <User size={11} />
              {loom.author}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {loom.duration}
            </span>
            <a
              href={loom.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1 hover:underline ${isPdf ? "text-violet-600" : "text-violet-400 hover:text-violet-300"}`}
            >
              <ExternalLink size={11} />
              Watch video
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
