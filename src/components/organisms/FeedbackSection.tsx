"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  username: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      "Examio giúp tôi nhanh chóng tạo đề kiểm tra từ tài liệu, tiết kiệm rất nhiều thời gian.",
    name: "Nguyễn Minh",
    username: "@nguyenminh",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1fhCxXO10TfXDUmXI1mifS0F4WdAGj6sQKz29flWEUjJTLZgq",
  },
  {
    id: 2,
    quote:
      "Flashcard được tạo tự động rất hữu ích khi ôn thi. Trải nghiệm mượt mà và dễ sử dụng.",
    name: "Trần Thảo",
    username: "@tranthao",
    avatar:
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQtnzCcvAiN1IfeJKmXVXj4VyDZAMuJ_FZhTZeBiaE4NTyWn0WH",
  },
  {
    id: 3,
    quote:
      "Tính năng tóm tắt giúp tôi nắm nhanh nội dung chính, không cần đọc lại toàn bộ tài liệu.",
    name: "Lê Quang",
    username: "@lequang",
    avatar:
      "https://pbs.twimg.com/profile_images/1831304303455227904/7iNyxmd2_400x400.jpg",
  },
  {
    id: 4,
    quote:
      "Cộng đồng Examio rất năng động, tôi dễ dàng tìm thấy cách học hiệu quả từ chia sẻ của mọi người.",
    name: "Phạm Huy",
    username: "@phamhuy",
    avatar:
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSytehY0JCtB2LldGFekX-va-h7xeXrQandVeQnnlkHhpy7JJjr",
  },
  {
    id: 5,
    quote:
      "AI của Examio mang đến cách tiếp cận hoàn toàn mới, giúp tôi học nhanh hơn và nhớ lâu hơn.",
    name: "Đỗ Lan",
    username: "@dolan",
    avatar:
      "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQSp2WdtY5QyAjfFqpVy4PrYgPkwassjuISq-oNL1_7deK0hCE9",
  },
];

const getVisibleCount = (width: number): number => {
  if (width >= 1280) return 3;
  if (width >= 768) return 2;
  return 1;
};

export default function FeedbackSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(1024); // Always start with default
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set actual window width only after mount to prevent hydration mismatch
    setWindowWidth(window.innerWidth);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);

      const oldVisibleCount = getVisibleCount(windowWidth);
      const newVisibleCount = getVisibleCount(newWidth);

      if (oldVisibleCount !== newVisibleCount) {
        const maxIndexForNewWidth = testimonials.length - newVisibleCount;
        if (currentIndex > maxIndexForNewWidth) {
          setCurrentIndex(Math.max(0, maxIndexForNewWidth));
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [windowWidth, currentIndex]);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        const visibleCount = getVisibleCount(windowWidth);
        const maxIndex = testimonials.length - visibleCount;

        if (currentIndex >= maxIndex) {
          setDirection(-1);
          setCurrentIndex((prev) => prev - 1);
        } else if (currentIndex <= 0) {
          setDirection(1);
          setCurrentIndex((prev) => prev + 1);
        } else {
          setCurrentIndex((prev) => prev + direction);
        }
      }, 4000);
    };

    startAutoPlay();

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, currentIndex, windowWidth, direction]);

  const visibleCount = getVisibleCount(windowWidth);
  const maxIndex = testimonials.length - visibleCount;
  const canGoNext = currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;

  const goNext = () => {
    if (canGoNext) {
      setDirection(1);
      setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
      pauseAutoPlay();
    }
  };

  const goPrev = () => {
    if (canGoPrev) {
      setDirection(-1);
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
      pauseAutoPlay();
    }
  };

  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const handleDragEnd = (
    _: unknown,
    info: { offset: { x: number; y: number } }
  ) => {
    const { offset } = info;
    const swipeThreshold = 30;

    if (offset.x < -swipeThreshold && canGoNext) {
      goNext();
    } else if (offset.x > swipeThreshold && canGoPrev) {
      goPrev();
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    pauseAutoPlay();
  };

  return (
    <div className="px-4 py-8 sm:py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 md:mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light font-medium text-xs sm:text-sm uppercase tracking-wider">
            Người dùng nói gì
          </span>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 dark:from-primary-light dark:to-primary bg-clip-text text-transparent mt-3 sm:mt-4 px-4">
            Đánh giá nền tảng từ người dùng
          </h3>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/70 dark:from-primary-light dark:to-primary mx-auto mt-4 sm:mt-6"></div>
        </motion.div>

        <div className="relative" ref={containerRef}>
          <div className="flex justify-center sm:justify-end sm:absolute sm:-top-16 right-0 space-x-2 mb-4 sm:mb-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={goPrev}
              disabled={!canGoPrev}
              className={`p-2 rounded-full ${
                canGoPrev
                  ? "bg-white dark:bg-gray-700 shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 text-primary dark:text-primary-light"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              } transition-all duration-300`}
              aria-label="Previous testimonial">
              <ChevronLeft size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={goNext}
              disabled={!canGoNext}
              className={`p-2 rounded-full ${
                canGoNext
                  ? "bg-white dark:bg-gray-700 shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 text-primary dark:text-primary-light"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              } transition-all duration-300`}
              aria-label="Next testimonial">
              <ChevronRight size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>

          <div className="overflow-hidden relative px-2 sm:px-0">
            <motion.div
              className="flex"
              animate={{ x: `-${currentIndex * (100 / visibleCount)}%` }}
              transition={{
                type: "spring",
                stiffness: 70,
                damping: 20,
              }}>
              {testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  className={`flex-shrink-0 w-full ${
                    visibleCount === 3
                      ? "md:w-1/3"
                      : visibleCount === 2
                      ? "md:w-1/2"
                      : "w-full"
                  } p-2`}
                  initial={{ opacity: 0.5, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98, cursor: "grabbing" }}
                  style={{ cursor: "grab" }}>
                  <motion.div
                    className="relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 h-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg shadow-primary/5 dark:shadow-primary-light/5"
                    whileHover={{
                      boxShadow:
                        "0 10px 15px -3px rgba(79, 70, 229, 0.1), 0 4px 6px -2px rgba(79, 70, 229, 0.05)",
                    }}>
                    <div className="absolute -top-4 -left-4 opacity-10 dark:opacity-20">
                      <Quote
                        size={windowWidth < 640 ? 40 : 60}
                        className="text-primary dark:text-primary-light"
                      />
                    </div>

                    <div className="relative z-10 h-full flex flex-col">
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium mb-4 sm:mb-6 leading-relaxed">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>

                      <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center">
                          <div className="relative flex-shrink-0">
                            <img
                              width={48}
                              height={48}
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/api/placeholder/48/48";
                              }}
                            />
                            <motion.div
                              className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary-light/20"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0, 0.3, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 1,
                              }}
                            />
                          </div>
                          <div className="ml-3">
                            <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                              {testimonial.name}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                              {testimonial.username}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center mt-6 sm:mt-8">
            {isMounted &&
              Array.from(
                { length: testimonials.length - visibleCount + 1 },
                (_, index: number) => (
                  <motion.button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className="relative mx-1 focus:outline-none"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Go to testimonial ${index + 1}`}>
                    <motion.div
                      className={`w-2 h-2 rounded-full ${
                        index === currentIndex
                          ? "bg-primary dark:bg-primary-light"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                      animate={{
                        scale: index === currentIndex ? [1, 1.2, 1] : 1,
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: index === currentIndex ? Infinity : 0,
                        repeatDelay: 1,
                      }}
                    />
                    {index === currentIndex && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/30 dark:bg-primary-light/30"
                        animate={{
                          scale: [1, 1.8],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      />
                    )}
                  </motion.button>
                )
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
