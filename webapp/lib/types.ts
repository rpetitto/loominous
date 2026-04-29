export type SectionType =
  | "hero"
  | "key-concepts"
  | "steps"
  | "tips"
  | "quick-reference"
  | "code"
  | "callout";

export interface KeyConceptItem {
  term: string;
  definition: string;
  emoji?: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
  timestamp?: string;
  screenshotUrl?: string;
}

export interface TipItem {
  text: string;
  type: "tip" | "warning" | "info" | "success";
}

export interface QuickRefRow {
  cols: string[];
}

export interface HeroContent {
  description: string;
  highlights: string[];
}

export interface KeyConceptsContent {
  items: KeyConceptItem[];
}

export interface StepsContent {
  steps: Step[];
}

export interface TipsContent {
  items: TipItem[];
}

export interface QuickRefContent {
  headers: string[];
  rows: QuickRefRow[];
}

export interface CodeContent {
  language: string;
  code: string;
  caption?: string;
}

export interface CalloutContent {
  icon: string;
  title: string;
  body: string;
  variant: "info" | "warning" | "success" | "purple";
}

export type SectionContent =
  | HeroContent
  | KeyConceptsContent
  | StepsContent
  | TipsContent
  | QuickRefContent
  | CodeContent
  | CalloutContent;

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  content: SectionContent;
}

export type CheatSheetStyle = "interactive" | "pdf";

export interface LoomMeta {
  title: string;
  author: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  videoId: string;
}

export interface CheatSheet {
  id: string;
  title: string;
  subtitle: string;
  style: CheatSheetStyle;
  loom: LoomMeta;
  sections: Section[];
  createdAt: string;
}
