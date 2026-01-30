"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import Link from "next/link";
import { FacebookIcon } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/components/ui/toast";
import { RoleSelection } from "./role-selection";
import { UserRole } from "@/types/user";
import { useRouter } from "next/navigation";

function BottomGradient() {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-[#e31837] to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-[#ffc107] to-transparent" />
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

export function SignupForm() {
  const { signup } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const router = useRouter();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (password !== (formData.get("confirmPassword") as string)) {
      toast.warning("Mật khẩu nhập lại không khớp!");
      return;
    }

    if (!selectedRole) {
      toast.warning("Vui lòng chọn vai trò!");
      return;
    }

    try {
      await signup({ username, email, password, role: selectedRole });
      router.replace("/k");
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  // Show role selection first
  if (!selectedRole) {
    return <RoleSelection onSelectRole={handleRoleSelect} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-red-50/30 to-yellow-50/30 py-8">
      <div className="max-w-md w-full mx-4 rounded-2xl p-6 md:p-8 shadow-xl bg-white border relative">
        {/* KMA gradient decoration */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-red-100 via-yellow-50 to-transparent opacity-60 blur-3xl -mt-20 rounded-t-2xl"></div>

        <div className="relative">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-6">
            <Image
              src="/Logo_KMA.png"
              alt="KMA Edu Logo"
              width={60}
              height={60}
            />
            <h2 className="font-bold text-xl text-gray-800 mt-3">
              Chào Mừng Đến Với KMA Edu
            </h2>
            <h1 className="text-3xl font-bold kma-gradient-text mt-1">
              Đăng Ký
            </h1>
          </div>

          {/* Show selected role */}
          <div className="mb-6 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-gray-600">
              Vai trò:{" "}
              <span className="font-semibold text-primary">
                {selectedRole === "teacher" ? "Giáo Viên" : "Học Sinh"}
              </span>
              <button
                onClick={() => setSelectedRole(null)}
                className="ml-2 text-xs text-primary hover:underline"
              >
                Thay đổi
              </button>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <LabelInputContainer>
              <Label htmlFor="username" className="text-gray-700">
                Tên Đăng Nhập
              </Label>
              <Input
                id="username"
                name="username"
                placeholder="Tên Đăng Nhập"
                type="text"
                className="bg-gray-50 border-gray-200 focus:ring-primary focus:border-primary"
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                placeholder="email@kma.edu.vn"
                type="email"
                className="bg-gray-50 border-gray-200 focus:ring-primary focus:border-primary"
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="password" className="text-gray-700">
                Mật Khẩu
              </Label>
              <Input
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
                className="bg-gray-50 border-gray-200 focus:ring-primary focus:border-primary"
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Nhập Lại Mật Khẩu
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                type="password"
                className="bg-gray-50 border-gray-200 focus:ring-primary focus:border-primary"
              />
            </LabelInputContainer>

            <button
              className="bg-primary hover:bg-[#b71c1c] relative group/btn w-full text-white rounded-lg h-11 font-semibold shadow-lg shadow-primary/30 cursor-pointer transition-all mt-6"
              type="submit"
            >
              Đăng Ký →
              <BottomGradient />
            </button>

            <div className="flex items-center my-6">
              <hr className="flex-grow border-t border-gray-200" />
              <span className="px-4 text-sm text-gray-400">
                Hoặc đăng ký với
              </span>
              <hr className="flex-grow border-t border-gray-200" />
            </div>

            <div className="grid gap-2 grid-cols-1 md:grid-cols-3">
              <button
                className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-gray-700 rounded-lg h-10 font-medium bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-all"
                type="button"
              >
                <IconBrandGithub className="h-4 w-4" />
                <span className="text-sm">GitHub</span>
                <BottomGradient />
              </button>
              <button
                className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-gray-700 rounded-lg h-10 font-medium bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-all"
                type="button"
              >
                <IconBrandGoogle className="h-4 w-4" />
                <span className="text-sm">Google</span>
                <BottomGradient />
              </button>
              <button
                className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-gray-700 rounded-lg h-10 font-medium bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-all"
                type="button"
              >
                <FacebookIcon className="h-4 w-4" />
                <span className="text-sm">Facebook</span>
                <BottomGradient />
              </button>
            </div>

            <div className="text-muted-foreground flex justify-center gap-1 text-sm mt-4">
              <p>Đã có tài khoản? </p>
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Đăng Nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
