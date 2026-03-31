import {
  BookOpen,
  Bot,
  BrainCircuit,
  Blocks,
  Code2,
  Database,
  FileCode2,
  FlaskConical,
  Folder,
  FolderOpen,
  GraduationCap,
  Library,
} from "lucide-react";

import { GenAIKnowledgeFolderIcon } from "@/types/genai-knowledge";

export const FOLDER_ICON_OPTIONS: Array<{
  value: GenAIKnowledgeFolderIcon;
  label: string;
  Icon: typeof Folder;
}> = [
  { value: "Folder", label: "Folder", Icon: Folder },
  { value: "FolderOpen", label: "Folder Open", Icon: FolderOpen },
  { value: "Code2", label: "Code", Icon: Code2 },
  { value: "FileCode2", label: "File Code", Icon: FileCode2 },
  { value: "BrainCircuit", label: "AI Brain", Icon: BrainCircuit },
  { value: "BookOpen", label: "Book", Icon: BookOpen },
  { value: "Library", label: "Library", Icon: Library },
  { value: "Bot", label: "Bot", Icon: Bot },
  { value: "Database", label: "Database", Icon: Database },
  { value: "Blocks", label: "Blocks", Icon: Blocks },
  { value: "GraduationCap", label: "Classroom", Icon: GraduationCap },
  { value: "FlaskConical", label: "Lab", Icon: FlaskConical },
];

export const iconMap = Object.fromEntries(
  FOLDER_ICON_OPTIONS.map(item => [item.value, item.Icon]),
) as Record<GenAIKnowledgeFolderIcon, typeof Folder>;

const ICON_ACCENT_STYLES: Record<GenAIKnowledgeFolderIcon, string> = {
  Folder: "bg-amber-500/12 text-amber-700 ring-amber-500/15",
  FolderOpen: "bg-orange-500/12 text-orange-700 ring-orange-500/15",
  Code2: "bg-sky-500/12 text-sky-700 ring-sky-500/15",
  FileCode2: "bg-cyan-500/12 text-cyan-700 ring-cyan-500/15",
  BrainCircuit: "bg-fuchsia-500/12 text-fuchsia-700 ring-fuchsia-500/15",
  BookOpen: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/15",
  Library: "bg-indigo-500/12 text-indigo-700 ring-indigo-500/15",
  Bot: "bg-violet-500/12 text-violet-700 ring-violet-500/15",
  Database: "bg-teal-500/12 text-teal-700 ring-teal-500/15",
  Blocks: "bg-rose-500/12 text-rose-700 ring-rose-500/15",
  GraduationCap: "bg-blue-500/12 text-blue-700 ring-blue-500/15",
  FlaskConical: "bg-lime-500/12 text-lime-700 ring-lime-500/15",
};

export function getIconAccent(icon: GenAIKnowledgeFolderIcon) {
  return ICON_ACCENT_STYLES[icon] || "bg-primary/10 text-primary ring-primary/10";
}

export function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
