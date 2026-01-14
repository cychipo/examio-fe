"use client";
import React from "react";
import { GraduationCap, User } from "lucide-react";
import { UserRole } from "@/types/user";

interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void;
}

export function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="max-w-4xl w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black shadow-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-100 via-blue-50 to-transparent opacity-40 blur-3xl -mt-20"></div>

      <div className="text-center mb-8">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 mb-2">
          Chào Mừng Đến Với FayEdu
        </h2>
        <h1 className="text-4xl font-semibold mb-4">Bạn là ai?</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Chọn vai trò của bạn để tiếp tục
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Teacher Card */}
        <button
          onClick={() => onSelectRole("teacher")}
          className="group relative p-8 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white dark:bg-zinc-900"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
              <GraduationCap className="h-12 w-12 text-blue-600 dark:text-blue-400 group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
              Giáo Viên
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
              Tạo và quản lý bài kiểm tra, flashcards và phòng thi cho học sinh
            </p>
            <div className="mt-4 text-sm text-blue-600 dark:text-blue-400 font-medium">
              Chọn vai trò này →
            </div>
          </div>
        </button>

        {/* Student Card */}
        <button
          onClick={() => onSelectRole("student")}
          className="group relative p-8 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white dark:bg-zinc-900"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
              <User className="h-12 w-12 text-green-600 dark:text-green-400 group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
              Học Sinh
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
              Học tập với flashcards, làm bài kiểm tra và theo dõi tiến độ học tập
            </p>
            <div className="mt-4 text-sm text-green-600 dark:text-green-400 font-medium">
              Chọn vai trò này →
            </div>
          </div>
        </button>
      </div>

      <div className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
        Bạn có thể thay đổi vai trò này sau trong cài đặt tài khoản
      </div>
    </div>
  );
}
