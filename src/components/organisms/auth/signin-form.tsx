"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { Eye, EyeOff, FacebookIcon } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";

function BottomGradient() {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-[#e31837] to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-[#ffc107] to-transparent" />
    </>
  );
}

export function SigninForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { loginWithGoogle, loginWithFacebook, loginWithGithub, login } =
    useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const credential = formData.get("credential") as string;
    const password = formData.get("password") as string;
    const from = searchParams.get("from");

    try {
      await login({ credential, password });
      router.replace(from || "/k");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-red-50/30 to-yellow-50/30">
      <div className="w-full max-w-md rounded-2xl shadow-xl overflow-hidden border bg-white relative">
        {/* KMA gradient decoration */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-red-100 via-yellow-50 to-transparent opacity-60 blur-3xl -mt-20"></div>

        <div className="p-8 relative">
          <div className="flex flex-col items-center mb-8">
            <div>
              <Image
                src="/Logo_KMA.png"
                alt="KMA Edu Logo"
                width={80}
                height={80}
              />
            </div>
            <div className="p-0 mt-2">
              <h2 className="text-2xl font-bold text-center text-gray-800">
                Chào Mừng Trở Lại
              </h2>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Đăng nhập vào KMA Edu
              </p>
            </div>
          </div>

          <div className="space-y-6 p-0">
            <form onSubmit={handleSubmit} className="space-y-6 p-0">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Tên Đăng Nhập hoặc Email
                </label>
                <input
                  name="credential"
                  className="bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary w-full px-3 py-2 text-sm outline-none transition-all"
                  placeholder="Tên Đăng Nhập hoặc Email"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">
                    Mật Khẩu
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="bg-gray-50 border border-gray-200 text-gray-900 pr-12 h-12 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary w-full px-3 py-2 text-sm outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:bg-gray-100 inline-flex items-center justify-center rounded-md h-9 px-3 cursor-pointer transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="bg-primary hover:bg-[#b71c1c] relative group/btn w-full text-white rounded-lg h-11 font-semibold shadow-lg shadow-primary/30 cursor-pointer transition-all"
              >
                Đăng Nhập
              </button>
            </form>

            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-4 text-sm text-gray-400">
                Hoặc tiếp tục với
              </span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <div className="grid gap-2 mb-[10px] grid-cols-1 md:grid-cols-3">
              <button
                className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-gray-700 rounded-lg h-10 font-medium bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-all"
                type="button"
                onClick={loginWithGithub}
              >
                <IconBrandGithub className="h-4 w-4" />
                <span className="text-sm">GitHub</span>
                <BottomGradient />
              </button>

              <button
                className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-gray-700 rounded-lg h-10 font-medium bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-all"
                type="button"
                onClick={loginWithGoogle}
              >
                <IconBrandGoogle className="h-4 w-4" />
                <span className="text-sm">Google</span>
                <BottomGradient />
              </button>

              <button
                className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-gray-700 rounded-lg h-10 font-medium bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-all"
                type="button"
                onClick={loginWithFacebook}
              >
                <FacebookIcon className="h-4 w-4" />
                <span className="text-sm">Facebook</span>
                <BottomGradient />
              </button>
            </div>
          </div>

          <div className="text-muted-foreground flex justify-center gap-1 text-sm mt-4">
            <p>Bạn chưa có tài khoản? </p>
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
