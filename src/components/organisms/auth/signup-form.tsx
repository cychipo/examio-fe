"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import Link from "next/link";
import { FacebookIcon } from "lucide-react";
import { useScreenBreakpoint } from "@/hooks/useDevices";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/components/ui/toast";

export function SignupForm() {
  const { signup } = useAuthStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (password !== (formData.get("twitterpassword") as string)) {
      toast.warning("Mật khẩu nhập lại không khớp!");
      return;
    }

    signup({ username, email, password });
  };
  const { isMobile } = useScreenBreakpoint();

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black shadow-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 mb-[10px]">
        Chào Mừng Đến Với Examio
      </h2>
      <h1 className="text-4xl justify-self-center font-semibold">Đăng Ký</h1>

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="firstname">Tên Đăng Nhập</Label>
            <Input
              id="username"
              name="username"
              placeholder="Tên Đăng Nhập"
              type="text"
            />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email </Label>
          <Input
            id="email"
            name="email"
            placeholder="exam@fc.com"
            type="email"
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Mật Khẩu</Label>
          <Input
            id="password"
            name="password"
            placeholder="••••••••"
            type="password"
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-8">
          <Label htmlFor="twitterpassword">Nhập Lại Mật Khẩu</Label>
          <Input
            id="twitterpassword"
            name="twitterpassword"
            placeholder="••••••••"
            type="twitterpassword"
          />
        </LabelInputContainer>

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] cursor-pointer"
          type="submit">
          Đăng Ký &rarr;
          <BottomGradient />
        </button>

        <div className="flex items-center my-8">
          <hr className="flex-grow border-t border-neutral-300 dark:border-neutral-700" />
          <span className="px-4 text-sm text-neutral-500">
            Hoặc đăng ký với
          </span>
          <hr className="flex-grow border-t border-neutral-300 dark:border-neutral-700" />
        </div>

        <div
          className={`grid gap-2 mb-[10px] ${
            isMobile ? "grid-cols-1" : "grid-cols-3"
          }`}>
          <button
            className=" relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)] cursor-pointer"
            type="submit">
            <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-neutral-700 dark:text-neutral-300 text-sm">
              GitHub
            </span>
            <BottomGradient />
          </button>
          <button
            className=" relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)] cursor-pointer"
            type="submit">
            <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-neutral-700 dark:text-neutral-300 text-sm">
              Google
            </span>
            <BottomGradient />
          </button>
          <button
            className=" relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)] cursor-pointer"
            type="submit">
            <FacebookIcon className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-neutral-700 dark:text-neutral-300 text-sm">
              Facebook
            </span>
            <BottomGradient />
          </button>
        </div>
        <div className="text-muted-foreground flex justify-center gap-1 text-sm mt-4">
          <p>Đã có tài khoản? </p>
          <Link
            href="/login"
            className="text-primary font-medium hover:underline">
            Đăng Nhập
          </Link>
        </div>
      </form>
    </div>
  );
}

function BottomGradient() {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
}

function LabelInputContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
}
