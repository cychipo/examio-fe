import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { RetroGrid } from "../ui/retro-grid";
import { Highlighter } from "../magicui/highlighter";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export function HeroSection() {
  return (
    <>
      <main className="overflow-hidden">
        <RetroGrid />
        <section>
          <div className="relative pt-12 md:pt-16">
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      delayChildren: 1,
                    },
                  },
                },
                item: {
                  hidden: {
                    opacity: 0,
                    y: 20,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      bounce: 0.3,
                      duration: 2,
                    },
                  },
                },
              }}
              className="absolute inset-0 -z-20">
              {" "}
            </AnimatedGroup>
            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"
            />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  <h1 className="mt-8 max-w-4xl mx-auto text-balance text-3xl sm:text-4xl md:text-5xl lg:mt-16 lg:text-6xl xl:text-[5.25rem]">
                    Từ trang giấy đến kiến thức, chỉ trong tích tắc.
                  </h1>
                  <div className="text-center mx-auto mt-6 sm:mt-8 max-w-2xl text-balance text-base sm:text-lg px-2 sm:px-0">
                    <p className="leading-relaxed">
                      Nền tảng của chúng tôi mang sức mạnh{" "}
                      <Highlighter action="underline" color="#FF9800">
                        trí tuệ nhân tạo
                      </Highlighter>{" "}
                      để biến tài liệu thành{" "}
                      <Highlighter action="highlight" color="#87CEFA">
                        bài kiểm tra, flashcard và tóm tắt
                      </Highlighter>{" "}
                      giúp học tập hiệu quả hơn.
                    </p>
                  </div>
                </AnimatedGroup>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-8 sm:mt-12 flex flex-col items-center justify-center gap-3 sm:gap-2 md:flex-row">
                  <div
                    key={1}
                    className="bg-foreground/10 rounded-[14px] border p-0.5">
                    <Button
                      variant="default"
                      asChild
                      size="lg"
                      className="rounded-xl px-5 text-base bg-primary hover:bg-red-700 text-white">
                      <Link to="/k">
                        <span className="text-nowrap">Bắt đầu ngay</span>
                      </Link>
                    </Button>
                  </div>
                  <Button
                    key={2}
                    asChild
                    size="lg"
                    variant="ghost"
                    className="h-10.5 rounded-xl px-5">
                    <Link to="/k">
                      <span className="text-nowrap text-base">Xem thêm</span>
                    </Link>
                  </Button>
                </AnimatedGroup>
              </div>
            </div>

            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}>
              <div className="relative mt-8 overflow-hidden px-2 sm:mt-12 md:mt-20">
                <div
                  aria-hidden
                  className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                />
                <div className="inset-shadow-2xs ring-background bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                  <img
                    className="bg-background aspect-15/8 relative hidden rounded-2xl"
                    src="https://tailark.com//_next/image?url=%2Fmail2.png&w=3840&q=75"
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                  <img
                    className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border"
                    src="https://tailark.com/_next/image?url=%2Fmail2-light.png&w=3840&q=75"
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </main>
    </>
  );
}
