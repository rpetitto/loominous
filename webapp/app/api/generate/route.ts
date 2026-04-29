import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { v4 as uuidv4 } from "uuid";
import type { CheatSheet, LoomMeta, Section } from "@/lib/types";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert at creating beautiful, structured cheat sheets from video content.
Given video metadata and an optional transcript, generate a comprehensive cheat sheet as JSON.
Return ONLY valid JSON, no markdown fences, no explanation.

The JSON must follow this exact structure:
{
  "title": "Concise cheat sheet title (not just the video title)",
  "subtitle": "One-line description of what this covers",
  "sections": [
    {
      "type": "key-concepts",
      "title": "Key Concepts",
      "content": {
        "items": [
          { "term": "Term name", "definition": "Clear explanation", "emoji": "🔑" }
        ]
      }
    },
    {
      "type": "steps",
      "title": "Step-by-Step Guide",
      "content": {
        "steps": [
          { "number": 1, "title": "Step title", "description": "What to do", "timestamp": "00:00" }
        ]
      }
    },
    {
      "type": "tips",
      "title": "Pro Tips & Gotchas",
      "content": {
        "items": [
          { "text": "The tip or warning text", "type": "tip" }
        ]
      }
    },
    {
      "type": "quick-reference",
      "title": "Quick Reference",
      "content": {
        "headers": ["Column 1", "Column 2"],
        "rows": [
          { "cols": ["value1", "value2"] }
        ]
      }
    }
  ]
}

Rules:
- tip.type must be one of: "tip", "warning", "info", "success"
- Include 4-8 key concepts with relevant emojis
- Include at least 5 steps with timestamps (estimate if no transcript)
- Include 4-6 tips/warnings
- Quick reference table should have practical reference data (shortcuts, commands, values, etc.)
- Make it genuinely useful and specific to the video content
- Use clear, concise language`;

function buildUserPrompt(
  meta: LoomMeta,
  transcript: string,
  context: string
): string {
  return `Video Title: ${meta.title}
Author: ${meta.author}
Duration: ${meta.duration}
Video URL: ${meta.videoUrl}
${context ? `\nAdditional Context: ${context}` : ""}
${
  transcript
    ? `\nTranscript:\n${transcript.slice(0, 12000)}`
    : "\nNo transcript provided - infer content from the title and context."
}

Generate a comprehensive cheat sheet for this video content.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { meta, transcript, context } = body as {
      meta: LoomMeta;
      transcript?: string;
      context?: string;
    };

    if (!meta?.videoId) {
      return NextResponse.json({ error: "Missing video metadata" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserPrompt(meta, transcript ?? "", context ?? ""),
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    let parsed: { title: string; subtitle: string; sections: Omit<Section, "id">[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
    }

    const cheatSheet: CheatSheet = {
      id: uuidv4(),
      title: parsed.title,
      subtitle: parsed.subtitle,
      style: "interactive",
      loom: meta,
      sections: parsed.sections.map((s) => ({ ...s, id: uuidv4() })),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(cheatSheet);
  } catch (err: unknown) {
    console.error("Generate error:", err);
    const msg = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
