"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface CanvasMarkdownRendererProps {
  content: string;
  className?: string;
  fontSize?: number;
  lineHeight?: number;
  fontFamily?: string;
  textColor?: string;
  maxWidth?: number;
}

interface ParsedElement {
  type: "text" | "bold" | "italic" | "code" | "image" | "newline";
  content: string;
  src?: string;
  alt?: string;
}

/**
 * Canvas-based markdown renderer for anti-cheating
 * Renders markdown content to canvas, making it harder to copy/inspect
 */
export function CanvasMarkdownRenderer({
  content,
  className = "",
  fontSize = 16,
  lineHeight = 1.6,
  fontFamily = "Inter, system-ui, sans-serif",
  textColor = "#1f2937",
  maxWidth,
}: CanvasMarkdownRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [_dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [loadedImages, setLoadedImages] = useState<
    Map<string, HTMLImageElement>
  >(() => new Map());
  const [isReady, setIsReady] = useState(false);

  // Parse markdown content
  const parseMarkdown = useCallback((text: string): ParsedElement[] => {
    const elements: ParsedElement[] = [];

    // Split by lines first to handle paragraphs
    const lines = text.split("\n");

    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) {
        elements.push({ type: "newline", content: "" });
      }

      // Regex patterns for inline elements
      const patterns = [
        { regex: /!\[([^\]]*)\]\(([^)]+)\)/g, type: "image" as const },
        { regex: /\*\*([^*]+)\*\*/g, type: "bold" as const },
        { regex: /\*([^*]+)\*/g, type: "italic" as const },
        { regex: /`([^`]+)`/g, type: "code" as const },
      ];

      // Find all matches with their positions
      const matches: Array<{
        index: number;
        length: number;
        type: ParsedElement["type"];
        content: string;
        src?: string;
        alt?: string;
      }> = [];

      for (const { regex, type } of patterns) {
        regex.lastIndex = 0;
        let match = regex.exec(line);
        while (match !== null) {
          if (type === "image") {
            matches.push({
              index: match.index,
              length: match[0].length,
              type,
              content: match[1],
              alt: match[1],
              src: match[2],
            });
          } else {
            matches.push({
              index: match.index,
              length: match[0].length,
              type,
              content: match[1],
            });
          }
          match = regex.exec(line);
        }
      }

      // Sort matches by position
      matches.sort((a, b) => a.index - b.index);

      // Process matches and text between them
      let currentIndex = 0;
      for (const m of matches) {
        if (m.index > currentIndex) {
          const textBefore = line.slice(currentIndex, m.index);
          if (textBefore) {
            elements.push({ type: "text", content: textBefore });
          }
        }

        elements.push({
          type: m.type,
          content: m.content,
          src: m.src,
          alt: m.alt,
        });

        currentIndex = m.index + m.length;
      }

      if (currentIndex < line.length) {
        elements.push({ type: "text", content: line.slice(currentIndex) });
      }
    });

    return elements;
  }, []);

  // Preload images
  useEffect(() => {
    const elements = parseMarkdown(content);
    const imageElements = elements.filter((e) => e.type === "image" && e.src);

    if (imageElements.length === 0) {
      setIsReady(true);
      return;
    }

    const newLoadedImages = new Map<string, HTMLImageElement>();
    let loadedCount = 0;

    imageElements.forEach((el) => {
      if (!el.src) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        newLoadedImages.set(el.src!, img);
        loadedCount++;
        if (loadedCount === imageElements.length) {
          setLoadedImages(newLoadedImages);
          setIsReady(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === imageElements.length) {
          setLoadedImages(newLoadedImages);
          setIsReady(true);
        }
      };
      img.src = el.src;
    });
  }, [content, parseMarkdown]);

  // Render to canvas
  useEffect(() => {
    if (!isReady || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const containerWidth = maxWidth || containerRef.current.offsetWidth || 600;
    const dpr = window.devicePixelRatio || 1;

    const elements = parseMarkdown(content);
    const lineHeightPx = fontSize * lineHeight;
    const padding = 8;

    // First pass: calculate required height
    let x = padding;
    let y = padding + fontSize;
    let maxY = y;
    const maxX = containerWidth;

    for (const element of elements) {
      if (element.type === "newline") {
        x = padding;
        y += lineHeightPx;
        continue;
      }

      if (element.type === "image" && element.src) {
        const img = loadedImages.get(element.src);
        if (img) {
          const imgMaxWidth = containerWidth - padding * 2;
          const scale = Math.min(1, imgMaxWidth / img.width);
          const imgHeight = img.height * scale;

          if (x > padding) {
            x = padding;
            y += lineHeightPx;
          }

          y += imgHeight + lineHeightPx * 0.5;
        }
        continue;
      }

      let font = `${fontSize}px ${fontFamily}`;
      if (element.type === "bold") {
        font = `bold ${fontSize}px ${fontFamily}`;
      } else if (element.type === "italic") {
        font = `italic ${fontSize}px ${fontFamily}`;
      } else if (element.type === "code") {
        font = `${fontSize - 1}px "JetBrains Mono", monospace`;
      }

      ctx.font = font;
      const textWidth = ctx.measureText(element.content).width;

      if (x + textWidth > containerWidth - padding) {
        x = padding;
        y += lineHeightPx;
      }

      x += textWidth;
    }

    maxY = y + lineHeightPx;

    const width = maxWidth || containerWidth;
    const height = maxY + padding;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    setDimensions({ width, height });

    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, width, height);

    // Second pass: render content
    x = padding;
    y = padding + fontSize;

    for (const element of elements) {
      if (element.type === "newline") {
        x = padding;
        y += lineHeightPx;
        continue;
      }

      if (element.type === "image" && element.src) {
        const img = loadedImages.get(element.src);
        if (img) {
          const imgMaxWidth = containerWidth - padding * 2;
          const scale = Math.min(1, imgMaxWidth / img.width);
          const imgWidth = img.width * scale;
          const imgHeight = img.height * scale;

          if (x > padding) {
            x = padding;
            y += lineHeightPx * 0.5;
          }

          ctx.drawImage(img, x, y - fontSize, imgWidth, imgHeight);
          y += imgHeight + lineHeightPx * 0.5;
          x = padding;
        }
        continue;
      }

      let font = `${fontSize}px ${fontFamily}`;
      let fillStyle = textColor;

      if (element.type === "bold") {
        font = `bold ${fontSize}px ${fontFamily}`;
      } else if (element.type === "italic") {
        font = `italic ${fontSize}px ${fontFamily}`;
      } else if (element.type === "code") {
        font = `${fontSize - 1}px "JetBrains Mono", monospace`;
        ctx.font = font;
        const codeWidth = ctx.measureText(element.content).width;
        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(x - 2, y - fontSize + 2, codeWidth + 4, fontSize + 4);
        fillStyle = "#dc2626";
      }

      ctx.font = font;
      const textWidth = ctx.measureText(element.content).width;

      if (x + textWidth > containerWidth - padding && x > padding) {
        x = padding;
        y += lineHeightPx;
      }

      ctx.fillStyle = fillStyle;
      ctx.fillText(element.content, x, y);

      x += textWidth;
    }
  }, [
    content,
    fontSize,
    lineHeight,
    fontFamily,
    textColor,
    maxWidth,
    isReady,
    loadedImages,
    parseMarkdown,
  ]);

  return (
    <div ref={containerRef} className={className}>
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          maxWidth: "100%",
        }}
      />
    </div>
  );
}
