"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Mail,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [success, setSuccess] = useState(false);
  const [autoSentEmail, setAutoSentEmail] = useState(false);
  const hasSentEmailRef = useRef(false);
  const router = useRouter();
  const { verifyAccount, sendVerificationEmail, loading, user } =
    useAuthStore();

  // Auto-send verification email on first load (only once)
  useEffect(() => {
    if (user && !user.isVerified && !hasSentEmailRef.current) {
      hasSentEmailRef.current = true;
      sendVerificationEmail()
        .then(() => {
          setAutoSentEmail(true);
        })
        .catch((error) => {
          console.error("Failed to auto-send verification email:", error);
        });
    }
  }, [user, sendVerificationEmail]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      await verifyAccount(code);
      setSuccess(true);
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/k");
      }, 2000);
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  const handleResendCode = async () => {
    try {
      await sendVerificationEmail();
    } catch (error) {
      console.error("Failed to resend verification email:", error);
    }
  };

  // If already verified, show success message
  if (user?.isVerified) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              Tài khoản đã được xác minh!
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              Tài khoản của bạn đã được xác minh thành công. Bạn có thể sử dụng
              đầy đủ các tính năng của hệ thống.
            </p>
            <Link
              href="/k"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Xác minh tài khoản
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
              Nhập mã xác minh đã được gửi đến email của bạn
            </p>
            {user?.email && (
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
                ({user.email})
              </p>
            )}
          </div>

          {/* Auto-sent notification */}
          {autoSentEmail && !success && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Email xác minh đã được gửi tự động. Vui lòng kiểm tra hộp thư
                  của bạn.
                </p>
              </div>
            </div>
          )}

          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-green-600 dark:text-green-400 font-medium">
                Xác minh thành công!
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">
                Đang chuyển hướng...
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Mã xác minh
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Nhập mã 6 số"
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center text-2xl tracking-[0.5em] font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang xác minh...
                    </>
                  ) : (
                    "Xác minh"
                  )}
                </button>
              </form>

              {/* Resend code */}
              <div className="mt-6 text-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                  Không nhận được mã?
                </p>
                <button
                  onClick={handleResendCode}
                  disabled={loading}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium disabled:opacity-50">
                  <Mail className="w-4 h-4" />
                  Gửi lại mã xác minh
                </button>
              </div>
            </>
          )}

          {/* Back to dashboard */}
          <div className="mt-6 text-center border-t border-zinc-200 dark:border-zinc-700 pt-6">
            <Link
              href="/k"
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
