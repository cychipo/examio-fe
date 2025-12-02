"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUrlDialog } from "@/components/organisms/ImageUrlDialog";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

/**
 * RichTextEditor - TipTap based rich text editor
 * Hỗ trợ formatting đầy đủ:
 * - Text: Bold, Italic, Inline Code
 * - Headings: H1, H2, H3
 * - Lists: Bullet List, Numbered List
 * - Blockquote
 * - Undo/Redo
 *
 * Features:
 * - Click anywhere in editor area to focus and start typing
 * - Full height clickable area for better UX
 * - Keyboard shortcuts support (Ctrl+B, Ctrl+I, etc.)
 */
export function RichTextEditor({
  content,
  onChange,
  placeholder = "Nhập nội dung...",
  disabled = false,
  minHeight = "150px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded",
        },
      }),
    ],
    content,
    editable: !disabled,
    immediatelyRender: false, // Fix SSR hydration mismatch
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // State for image dialog
  const [showImageDialog, setShowImageDialog] = useState(false);

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  // Handle image insert
  const handleInsertImage = (url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <>
      <ImageUrlDialog
        open={showImageDialog}
        onOpenChange={setShowImageDialog}
        onConfirm={handleInsertImage}
      />
      <div className="border rounded-lg overflow-hidden bg-background">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
          {/* Text Formatting */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={
              disabled || !editor.can().chain().focus().toggleBold().run()
            }
            className={editor.isActive("bold") ? "bg-accent" : ""}
            title="Bold (Ctrl+B)">
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={
              disabled || !editor.can().chain().focus().toggleItalic().run()
            }
            className={editor.isActive("italic") ? "bg-accent" : ""}
            title="Italic (Ctrl+I)">
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={disabled}
            className={editor.isActive("code") ? "bg-accent" : ""}
            title="Inline Code">
            <Code className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Headings */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            disabled={disabled}
            className={
              editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""
            }
            title="Heading 1">
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            disabled={disabled}
            className={
              editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""
            }
            title="Heading 2">
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            disabled={disabled}
            className={
              editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""
            }
            title="Heading 3">
            <Heading3 className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Lists */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
            className={editor.isActive("bulletList") ? "bg-accent" : ""}
            title="Bullet List">
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={disabled}
            className={editor.isActive("orderedList") ? "bg-accent" : ""}
            title="Numbered List">
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Blockquote */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            disabled={disabled}
            className={editor.isActive("blockquote") ? "bg-accent" : ""}
            title="Blockquote">
            <Quote className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Image */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowImageDialog(true)}
            disabled={disabled}
            title="Chèn hình ảnh">
            <ImageIcon className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Undo/Redo */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={disabled || !editor.can().chain().focus().undo().run()}
            title="Undo (Ctrl+Z)">
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={disabled || !editor.can().chain().focus().redo().run()}
            title="Redo (Ctrl+Shift+Z)">
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Editor Content - Click anywhere to focus */}
        <div
          className="cursor-text"
          style={{ minHeight }}
          onClick={() => editor.commands.focus()}>
          <EditorContent
            editor={editor}
            className="prose prose-sm max-w-none p-2 min-h-[150px] focus:outline-none"
          />
        </div>
      </div>
    </>
  );
}
