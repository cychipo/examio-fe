"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Facebook,
  Instagram,
  Linkedin,
  Send,
  Twitter,
  Copyright,
} from "lucide-react";
import Logo from "../atoms/Logo";

export default function FooterSection() {
  return (
    <footer className="relative border-t mt-16 bg-white text-foreground">
      <div className="container mx-auto px-4 py-8 sm:py-12 md:px-6 lg:px-8">
        <div className="grid gap-8 sm:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mb-6 text-muted-foreground mt-4">
              Nền tảng học tập trực tuyến hỗ trợ bởi AI - Học viện Kỹ thuật Mật
              mã
            </p>
            <form className="relative">
              <Input
                type="email"
                placeholder="Email của bạn"
                className="pr-12"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-white transition-transform hover:scale-105"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Đăng ký</span>
              </Button>
            </form>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl hidden lg:block" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="mb-4 text-lg font-semibold">Liên kết</h3>
            <nav className="space-y-2 text-sm">
              <a
                href="/"
                className="block transition-colors hover:text-primary"
              >
                Trang chủ
              </a>
              <a
                href="/about"
                className="block transition-colors hover:text-primary"
              >
                Giới thiệu
              </a>
              <a
                href="/contact"
                className="block transition-colors hover:text-primary"
              >
                Liên hệ
              </a>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Liên hệ</h3>
            <address className="space-y-2 text-sm not-italic">
              <p>141 Đường Chiến Thắng, Tân Triều</p>
              <p>Thanh Trì, Hà Nội</p>
              <p>Email: contact@kma.edu.vn</p>
            </address>
          </div>
          <div className="relative sm:col-span-2 lg:col-span-1 flex flex-col items-center sm:items-start">
            <h3 className="mb-4 text-lg font-semibold">Theo dõi</h3>
            <div className="mb-6 flex flex-wrap justify-center sm:justify-start gap-3 sm:space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary hover:text-white hover:border-primary"
                      onClick={() => {
                        window.open(
                          "https://www.facebook.com/HocVienKyThuatMatMa",
                          "_blank",
                        );
                      }}
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="sr-only">Facebook</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Facebook</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary hover:text-white hover:border-primary"
                    >
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Twitter</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary hover:text-white hover:border-primary"
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Instagram</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary hover:text-white hover:border-primary"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Connect with us on LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        <div className="mt-8 sm:mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground flex items-center gap-x-1">
            <Copyright size={15} className="-mt-1" /> {new Date().getFullYear()}{" "}
            KMA Edu. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm">
            <a href="#" className="transition-colors hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Terms of Service
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Cookie Settings
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
