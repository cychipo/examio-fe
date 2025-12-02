"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useEffect } from "react";

interface RichTextViewerProps {
  content: string;
  className?: string;
}

/**
 * RichTextViewer - Read-only viewer for TipTap HTML content
 * Safely displays HTML content without using dangerouslySetInnerHTML
 * Uses TipTap's rendering engine for consistent display
 */
export function RichTextViewer({
  content,
  className = "",
}: RichTextViewerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded",
        },
      }),
    ],
    content,
    editable: false,
    immediatelyRender: false,
  });

  // Update content when it changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={className}>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none [&_.ProseMirror]:p-0 [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-0"
      />
    </div>
  );
}
