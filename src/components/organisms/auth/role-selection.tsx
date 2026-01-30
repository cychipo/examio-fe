"use client";
import React from "react";
import Image from "next/image";
import { GraduationCap, User } from "lucide-react";
import { UserRole } from "@/types/user";

interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void;
}

export function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-red-50/30 to-yellow-50/30 py-8">
      <div className="max-w-4xl w-full mx-4 rounded-2xl p-6 md:p-8 shadow-xl bg-white border relative">
        {/* KMA gradient decoration */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-red-100 via-yellow-50 to-transparent opacity-60 blur-3xl -mt-20 rounded-t-2xl"></div>

        <div className="relative text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/Logo_KMA.png"
              alt="KMA Edu Logo"
              width={60}
              height={60}
            />
          </div>
          <h2 className="font-bold text-xl text-gray-800 mb-2">
            Chào Mừng Đến Với KMA Edu
          </h2>
          <h1 className="text-3xl font-bold kma-gradient-text mb-4">
            Bạn là ai?
          </h1>
          <p className="text-gray-500">Chọn vai trò của bạn để tiếp tục</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Teacher Card */}
          <button
            onClick={() => onSelectRole("teacher")}
            className="group relative p-8 rounded-xl border-2 border-gray-200 hover:border-primary transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-red-100 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <GraduationCap className="h-12 w-12 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Giáo Viên</h3>
              <p className="text-sm text-gray-500 text-center">
                Tạo và quản lý bài kiểm tra, flashcards và phòng thi cho học
                sinh
              </p>
              <div className="mt-4 text-sm text-primary font-medium">
                Chọn vai trò này →
              </div>
            </div>
          </button>

          {/* Student Card */}
          <button
            onClick={() => onSelectRole("student")}
            className="group relative p-8 rounded-xl border-2 border-gray-200 hover:border-secondary transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-yellow-100 group-hover:bg-secondary group-hover:text-gray-800 transition-colors duration-300">
                <User className="h-12 w-12 text-secondary group-hover:text-gray-800" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Học Sinh</h3>
              <p className="text-sm text-gray-500 text-center">
                Học tập với flashcards, làm bài kiểm tra và theo dõi tiến độ học
                tập
              </p>
              <div className="mt-4 text-sm text-secondary font-medium">
                Chọn vai trò này →
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          Bạn có thể thay đổi vai trò này sau trong cài đặt tài khoản
        </div>
      </div>
    </div>
  );
}
