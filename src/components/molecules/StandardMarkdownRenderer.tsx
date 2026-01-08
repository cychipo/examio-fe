"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

interface StandardMarkdownRendererProps {
  content: string;
  className?: string;
  fontSize?: number;
}

export function StandardMarkdownRenderer({
  content,
  className,
  fontSize = 16,
}: StandardMarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose dark:prose-invert max-w-none break-words",
        className
      )}
      style={{ fontSize: `${fontSize}px` }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeKatex,
          rehypeRaw,
          [
            rehypeSanitize,
            {
              ...defaultSchema,
              attributes: {
                ...defaultSchema.attributes,
                "*": ["className", "class", "style"], // Allow class/style for styling
                img: ["src", "alt", "width", "height", "className", "class"],
                a: ["href", "name", "target", "rel", "className", "class"],
                // Allow KaTeX elements and classes
                span: [...(defaultSchema.attributes?.span || []), "className", "class"],
                div: [...(defaultSchema.attributes?.div || []), "className", "class"],
                math: ["display"], // Allow math elements
                annotation: ["encoding"], // Allow math annotations
              },
            },
          ],
        ]}
        components={{
          img: ({ node, ...props }) => (
            <img
              {...props}
              alt={props.alt || "Image"}
              className="max-w-full h-auto rounded-lg my-2 border border-border"
              loading="lazy"
            />
          ),
          h1: ({ className, ...props }) => (
            <h1
              className={cn(
                "mt-2 scroll-m-20 text-4xl font-bold tracking-tight",
                className
              )}
              {...props}
            />
          ),
          h2: ({ className, ...props }) => (
            <h2
              className={cn(
                "mt-2 scroll-m-20 border-b pb-1 text-3xl font-semibold tracking-tight first:mt-0",
                className
              )}
              {...props}
            />
          ),
          h3: ({ className, ...props }) => (
            <h3
              className={cn(
                "mt-2 scroll-m-20 text-2xl font-semibold tracking-tight",
                className
              )}
              {...props}
            />
          ),
          h4: ({ className, ...props }) => (
            <h4
              className={cn(
                "mt-2 scroll-m-20 text-xl font-semibold tracking-tight",
                className
              )}
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p {...props} className="leading-7 [&:not(:first-child)]:mt-2" />
          ),
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline hover:text-primary/80 transition-colors"
            />
          ),
          ul: ({ className, ...props }) => (
            <ul
              className={cn("my-2 ml-6 list-disc [&>li]:mt-2", className)}
              {...props}
            />
          ),
          ol: ({ className, ...props }) => (
            <ol
              className={cn("my-2 ml-6 list-decimal [&>li]:mt-2", className)}
              {...props}
            />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-\w+/.exec(className || "");
            const isInline = !match && !className?.includes("language-");
            return isInline ? (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-destructive dark:text-red-400"
                {...props}>
                {children}
              </code>
            ) : (
              <code
                className={cn(
                  "block bg-muted p-4 rounded-lg my-3 overflow-x-auto font-mono text-sm",
                  className
                )}
                {...props}>
                {children}
              </code>
            );
          },
        }}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
