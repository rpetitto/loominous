# Loominous ✨

Turn any Loom video into a beautiful, fully editable cheat sheet — powered by Claude AI.

## Features

- **Paste any Loom URL** → auto-fetches video title, author, thumbnail
- **Claude-generated cheat sheets** — key concepts, step-by-step guide, pro tips, quick reference
- **Two export styles**: Interactive (dark web view) or PDF (Scribe-style print layout)
- **Drag-and-drop editor** — reorder sections with a grab handle
- **Inline WYSIWYG editing** — click any text to edit it directly
- **Chrome extension** — one-click from any Loom page, with automatic transcript extraction

---

## Quick Start

### 1. Set up the webapp

```bash
cd webapp
cp .env.local.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 2. Install the Chrome extension

1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder in this repo

The extension icon appears in your toolbar on any `loom.com/share/` page.

---

## How it works

```
Loom URL
  │
  ├─▶ /api/loom-info   → Loom OEmbed API → title, author, duration, thumbnail
  │
  └─▶ /api/generate    → Claude claude-sonnet-4-6
                              ├─ transcript (from extension or manual paste)
                              ├─ video metadata
                              └─ structured JSON cheat sheet
                                      │
                                      └─▶ Editor (/edit/[id])
                                              ├─ Interactive mode (dark web UI)
                                              ├─ PDF mode (print-ready, Scribe-style)
                                              ├─ Drag-and-drop section reordering
                                              └─ Inline contentEditable editing
```

## Chrome Extension

The companion extension:
- Detects Loom video pages automatically
- Extracts the transcript from the DOM
- Shows a popup with video info and a "Generate Cheat Sheet" button
- Opens the webapp with the URL (and transcript if found) pre-filled

### Extension transcript extraction

The content script tries multiple DOM selectors to find Loom's transcript panel. If the transcript isn't available (video doesn't have captions, or Loom's UI has changed), you can paste it manually in the Advanced Options section of the webapp.

---

## Project structure

```
loominous/
├── webapp/                    # Next.js 14 app
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── edit/[id]/         # Cheat sheet editor
│   │   └── api/
│   │       ├── loom-info/     # Fetch Loom OEmbed metadata
│   │       └── generate/      # Claude cheat sheet generation
│   ├── components/
│   │   ├── Editor.tsx         # Main editor shell
│   │   ├── EditorToolbar.tsx  # Toolbar with style toggle + export
│   │   ├── CheatSheetPreview.tsx  # Full preview with DnD
│   │   ├── SortableSectionItem.tsx
│   │   └── sections/          # Per-section renderers
│   │       ├── HeroSection.tsx
│   │       ├── KeyConceptsSection.tsx
│   │       ├── StepsSection.tsx
│   │       ├── TipsSection.tsx
│   │       └── QuickRefSection.tsx
│   └── lib/
│       ├── types.ts
│       ├── utils.ts
│       └── loom.ts
└── extension/                 # Chrome MV3 extension
    ├── manifest.json
    ├── popup.html / popup.css / popup.js
    ├── content.js             # DOM transcript extractor
    └── background.js
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | From [console.anthropic.com](https://console.anthropic.com) |
| `LOOM_API_TOKEN` | No | For official Loom API transcript access |

## Tech stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — custom dark theme
- **@dnd-kit** — accessible drag-and-drop
- **Framer Motion** — page animations
- **@anthropic-ai/sdk** — Claude claude-sonnet-4-6 for generation
- **Lucide React** — icons
