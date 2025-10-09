import { useState } from "react";

interface FlipCardProps {
  front: {
    label: string;
    content: string;
    hint?: string;
  };
  back: {
    label: string;
    content: string;
  };
  className?: string;
}

export function FlipCard({ front, back, className = "" }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={`relative h-80 cursor-pointer ${className}`}
      style={{ perspective: "1000px" }}
      onClick={() => setIsFlipped(!isFlipped)}>
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}>
        {/* Front */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden" }}>
          <div className="w-full h-full p-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-sm font-medium text-primary uppercase tracking-wide">
                {front.label}
              </div>
              <p className="text-2xl font-bold text-foreground">
                {front.content}
              </p>
              {front.hint && (
                <p className="text-sm text-muted-foreground">{front.hint}</p>
              )}
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}>
          <div className="w-full h-full p-8 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 border-2 border-accent/30 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-sm font-medium text-accent uppercase tracking-wide">
                {back.label}
              </div>
              <p className="text-lg text-foreground leading-relaxed">
                {back.content}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
