"use client";
import Anthropic from "@/components/kokonutui/anthropic";
import AnthropicDark from "@/components/kokonutui/anthropic-dark";
import Google from "@/components/kokonutui/gemini";
import OpenAI from "@/components/kokonutui/open-ai";
import OpenAIDark from "@/components/kokonutui/open-ai-dark";
import MistralAI from "@/components/kokonutui/mistral";
import DeepSeek from "@/components/kokonutui/deepseek";
import { cn } from "@/lib/utils";
import { Mic, Plus, CheckCircle2, Clock, Sparkles, Zap } from "lucide-react";
import {
  motion,
  useMotionValue,
  useTransform,
  type Variants,
} from "motion/react";
import { useState, useEffect, useRef } from "react";
import { SparklesText } from "../magicui/sparkles-text";

interface BentoItem {
  id: string;
  title: string;
  description: string;
  icons?: boolean;
  href?: string;
  feature?:
    | "chart"
    | "counter"
    | "code"
    | "timeline"
    | "spotlight"
    | "icons"
    | "typing"
    | "metrics";
  spotlightItems?: string[];
  timeline?: Array<{ year: string; event: string }>;
  code?: string;
  codeLang?: string;
  typingText?: string;
  metrics?: Array<{
    label: string;
    value: number;
    suffix?: string;
    color?: string;
  }>;
  statistic?: {
    value: string;
    label: string;
    start?: number;
    end?: number;
    suffix?: string;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

const bentoItems: BentoItem[] = [
  {
    id: "main",
    title: "Tạo Quiz & Flashcard từ tài liệu",
    description:
      "Upload file PDF, Word hoặc hình ảnh - AI sẽ tự động phân tích và tạo bộ câu hỏi, flashcard giúp bạn học tập hiệu quả trong tích tắc.",
    href: "#",
    feature: "spotlight",
    spotlightItems: [
      "Hỗ trợ PDF, Word, hình ảnh và nhiều định dạng khác",
      "Tạo quiz trắc nghiệm với nhiều dạng câu hỏi",
      "Tự động sinh flashcard từ nội dung tài liệu",
      "Tùy chỉnh số lượng và độ khó câu hỏi",
      "Lưu trữ và quản lý lịch sử tạo nội dung",
    ],
    size: "lg",
    className: "col-span-2 row-span-1 md:col-span-2 md:row-span-1",
  },
  {
    id: "stat1",
    title: "Phòng thi & Chống gian lận",
    description:
      "Tạo phòng thi trực tuyến với hệ thống giám sát thông minh, theo dõi hành vi và ngăn chặn gian lận hiệu quả.",
    href: "#",
    feature: "typing",
    typingText:
      "const examRoom = await createExamRoom({\n  title: 'Kiểm tra giữa kỳ',\n  duration: 60,\n  antiCheat: true,\n  webcamRequired: true,\n});\n\nawait inviteStudents(examRoom.id, emails);",
    size: "md",
    className: "col-span-2 row-span-1 col-start-1 col-end-3",
  },
  {
    id: "partners",
    title: "Đa nền tảng AI",
    description:
      "Tích hợp nhiều mô hình AI hàng đầu để đảm bảo chất lượng nội dung tốt nhất cho việc học tập.",
    icons: true,
    href: "#",
    feature: "icons",
    size: "md",
    className: "col-span-1 row-span-1",
  },
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

function SpotlightFeature({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item, index) => (
        <motion.li
          key={`spotlight-${item.toLowerCase().replace(/\s+/g, "-")}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * index }}
          className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          <span className="text-sm text-neutral-700">
            {item}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

function CounterAnimation({
  start,
  end,
  suffix = "",
}: {
  start: number;
  end: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);

    let currentFrame = 0;
    const counter = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const easedProgress = 1 - (1 - progress) ** 3;
      const current = start + (end - start) * easedProgress;

      setCount(Math.min(current, end));

      if (currentFrame === totalFrames) {
        clearInterval(counter);
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [start, end]);

  return (
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-bold text-neutral-900">
        {count.toFixed(1).replace(/\.0$/, "")}
      </span>
      <span className="text-xl font-medium text-neutral-900">
        {suffix}
      </span>
    </div>
  );
}

function ChartAnimation({ value }: { value: number }) {
  return (
    <div className="mt-2 w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-emerald-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </div>
  );
}

function IconsFeature() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
      <motion.div className="flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 border border-border group transition-all duration-300 hover:border-border">
        <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
          <OpenAI className="w-5 h-5 sm:w-7 sm:h-7 transition-transform " />
          <OpenAIDark className="w-5 h-5 sm:w-7 sm:h-7 hidden transition-transform " />
        </div>
        <span className="text-xs font-medium text-center text-neutral-600 group-hover:text-neutral-900">
          OpenAI
        </span>
      </motion.div>
      <motion.div className="flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 border border-border group transition-all duration-300 hover:border-border">
        <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
          <Anthropic className="w-5 h-5 sm:w-7 sm:h-7 transition-transform " />
          <AnthropicDark className="w-5 h-5 sm:w-7 sm:h-7 hidden transition-transform " />
        </div>
        <span className="text-xs font-medium text-center text-neutral-600 group-hover:text-neutral-900">
          Anthropic
        </span>
      </motion.div>
      <motion.div className="flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 border border-border group transition-all duration-300 hover:border-border">
        <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
          <Google className="w-5 h-5 sm:w-7 sm:h-7 transition-transform " />
        </div>
        <span className="text-xs font-medium text-center text-neutral-600 group-hover:text-neutral-900">
          Google
        </span>
      </motion.div>
      <motion.div className="flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 border border-border group transition-all duration-300 hover:border-border">
        <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
          <MistralAI className="w-5 h-5 sm:w-7 sm:h-7 transition-transform " />
        </div>
        <span className="text-xs font-medium text-center text-neutral-600 group-hover:text-neutral-900">
          Mistral
        </span>
      </motion.div>
      <motion.div className="flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 border border-border group transition-all duration-300 hover:border-border">
        <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
          <DeepSeek className="w-5 h-5 sm:w-7 sm:h-7 transition-transform " />
        </div>
        <span className="text-xs font-medium text-center text-neutral-600 group-hover:text-neutral-900">
          DeepSeek
        </span>
      </motion.div>
      <motion.div className="flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 border border-border group transition-all duration-300 hover:border-border">
        <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600 transition-transform " />
        </div>
        <span className="text-xs font-medium text-center text-neutral-600 group-hover:text-neutral-900">
          More
        </span>
      </motion.div>
    </div>
  );
}

function TypingCodeFeature({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);

        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, Math.random() * 30 + 10); // Random typing speed for realistic effect

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  // Reset animation when component unmounts and remounts
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, []);

  return (
    <div className="mt-3 relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-xs text-neutral-500">
          server.ts
        </div>
      </div>
      <div
        ref={terminalRef}
        className="bg-neutral-900 text-neutral-100 p-2.5 sm:p-3 rounded-md text-[11px] sm:text-xs font-mono h-[120px] sm:h-[150px] overflow-y-auto">
        <pre className="whitespace-pre-wrap">
          {displayedText}
          <span className="animate-pulse">|</span>
        </pre>
      </div>
    </div>
  );
}

function MetricsFeature({
  metrics,
}: {
  metrics: Array<{
    label: string;
    value: number;
    suffix?: string;
    color?: string;
  }>;
}) {
  const getColorClass = (color = "emerald") => {
    const colors = {
      emerald: "bg-emerald-500",
      blue: "bg-primary",
      violet: "bg-yellow-500",
      amber: "bg-amber-500",
      rose: "bg-rose-500",
    };
    return colors[color as keyof typeof colors] || colors.emerald;
  };

  return (
    <div className="mt-3 space-y-3">
      {metrics.map((metric, index) => (
        <motion.div
          key={`metric-${metric.label.toLowerCase().replace(/\s+/g, "-")}`}
          className="space-y-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 * index }}>
          <div className="flex justify-between items-center text-sm">
            <div className="text-neutral-700 font-medium flex items-center gap-1.5">
              {metric.label === "Uptime" && <Clock className="w-3.5 h-3.5" />}
              {metric.label === "Response time" && (
                <Zap className="w-3.5 h-3.5" />
              )}
              {metric.label === "Cost reduction" && (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {metric.label}
            </div>
            <div className="text-neutral-700 font-semibold">
              {metric.value}
              {metric.suffix}
            </div>
          </div>
          <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${getColorClass(metric.color)}`}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, metric.value)}%`,
              }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
                delay: 0.15 * index,
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AIInput_Voice() {
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (submitted) {
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [submitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!isDemo) return;

    let timeoutId: NodeJS.Timeout;
    const runAnimation = () => {
      setSubmitted(true);
      timeoutId = setTimeout(() => {
        setSubmitted(false);
        timeoutId = setTimeout(runAnimation, 1000);
      }, 3000);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo]);

  const handleClick = () => {
    if (isDemo) {
      setIsDemo(false);
      setSubmitted(false);
    } else {
      setSubmitted((prev) => !prev);
    }
  };

  return (
    <div className="w-full py-4">
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
            submitted
              ? "bg-none"
              : "bg-none hover:bg-black/10"
          )}
          type="button"
          onClick={handleClick}>
          {submitted ? (
            <div
              className="w-6 h-6 rounded-sm animate-spin bg-black  cursor-pointer pointer-events-auto"
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className="w-6 h-6 text-black/70" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            submitted
              ? "text-black/70"
              : "text-black/30"
          )}>
          {formatTime(time)}
        </span>

        <div className="h-4 w-64 flex items-center justify-center gap-0.5">
          {[...Array.from({ length: 48 })].map((_, i) => (
            <div
              key={`voice-bar-${i}`}
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                submitted
                  ? "bg-black/50 animate-pulse"
                  : "bg-black/10 h-1"
              )}
              style={
                submitted && isClient
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="h-4 text-xs text-black/70">
          {submitted ? "Listening..." : "Click to speak"}
        </p>
      </div>
    </div>
  );
}

function BentoCard({ item }: { item: BentoItem }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [2, -2]);
  const rotateY = useTransform(x, [-100, 100], [-2, 2]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct * 100);
    y.set(yPct * 100);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
      onHoverEnd={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}>
      <div
        className={`
                    group relative flex flex-col gap-4 h-full rounded-xl p-5
                    bg-gradient-to-b from-neutral-50/60 via-neutral-50/40 to-neutral-50/30
                   
                    border border-border
                    before:absolute before:inset-0 before:rounded-xl
                    before:bg-gradient-to-b before:from-white/10 before:via-white/20 before:to-transparent
                   
                    before:opacity-100 before:transition-opacity before:duration-500
                    after:absolute after:inset-0 after:rounded-xl after:bg-neutral-50/70 after:z-[-1]
                    backdrop-blur-[4px]
                    shadow-[0_4px_20px_rgb(0,0,0,0.04)]
                    hover:border-border
                    hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]
                    hover:backdrop-blur-[6px]
                    hover:bg-gradient-to-b hover:from-neutral-50/60 hover:via-neutral-50/30 hover:to-neutral-50/20
                   
                    transition-all duration-500 ease-out ${item.className}
                `}
        tabIndex={0}
        aria-label={`${item.title} - ${item.description}`}>
        <div
          className="relative z-10 flex flex-col gap-3 h-full"
          style={{ transform: "translateZ(20px)" }}>
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold tracking-tight text-neutral-900 group-hover:text-neutral-700 transition-colors duration-300">
                {item.title}
              </h3>
            </div>

            <p className="text-sm text-neutral-600 tracking-tight">
              {item.description}
            </p>

            {/* Feature specific content */}
            {item.feature === "spotlight" && item.spotlightItems && (
              <SpotlightFeature items={item.spotlightItems} />
            )}

            {item.feature === "counter" && item.statistic && (
              <div className="mt-auto pt-3">
                <CounterAnimation
                  start={item.statistic.start || 0}
                  end={item.statistic.end || 100}
                  suffix={item.statistic.suffix}
                />
              </div>
            )}

            {item.feature === "chart" && item.statistic && (
              <div className="mt-auto pt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">
                    {item.statistic.label}
                  </span>
                  <span className="text-sm font-medium text-neutral-700">
                    {item.statistic.end}
                    {item.statistic.suffix}
                  </span>
                </div>
                <ChartAnimation value={item.statistic.end || 0} />
              </div>
            )}

            {item.feature === "icons" && <IconsFeature />}

            {item.feature === "typing" && item.typingText && (
              <TypingCodeFeature text={item.typingText} />
            )}

            {item.feature === "metrics" && item.metrics && (
              <MetricsFeature metrics={item.metrics} />
            )}

            {item.icons && !item.feature && (
              <div className="mt-auto pt-4 flex items-center flex-wrap gap-4 border-t border-border">
                <OpenAI className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" />
                <OpenAIDark className="w-5 h-5 hidden opacity-70 hover:opacity-100 transition-opacity" />
                <AnthropicDark className="w-5 h-5 hidden opacity-70 hover:opacity-100 transition-opacity" />
                <Anthropic className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" />
                <Google className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" />
                <MistralAI className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" />
                <DeepSeek className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative py-16 sm:py-24 lg:py-36 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeInUp}>
          <SparklesText className="text-3xl sm:text-4xl lg:text-5xl text-center pb-8 sm:pb-12">
            Tính năng nổi bật
          </SparklesText>
        </motion.div>
        {/* Bento Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid gap-4 sm:gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <motion.div variants={fadeInUp} className="md:col-span-1">
              <BentoCard item={bentoItems[0]} />
            </motion.div>
            <motion.div variants={fadeInUp} className="md:col-span-2">
              <BentoCard item={bentoItems[1]} />
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <motion.div variants={fadeInUp} className="md:col-span-1">
              <BentoCard item={bentoItems[2]} />
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="md:col-span-1 rounded-xl overflow-hidden bg-gradient-to-b from-neutral-50/80 to-neutral-50 border border-border hover:border-border hover:shadow-lg hover:shadow-neutral-200/20 transition-all duration-300">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
                    Giáo viên AI thông minh
                  </h3>
                </div>
                <p className="text-sm text-neutral-600 tracking-tight mb-4">
                  Tương tác với giáo viên AI qua tin nhắn hoặc giọng nói để hỏi
                  đáp cũng như thảo luận về các chủ đề học tập.
                </p>
                <AIInput_Voice />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
