"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Send,
  MapPin,
  AtSign,
  PhoneCall,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Decoration (Blobs) */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-cyan-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-cyan-500/5" />
      </div>
      {/* Floating shapes */}
      <div className="fixed top-20 left-[10%] w-72 h-72 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[80px] -z-10 animate-pulse" />
      <div className="fixed bottom-20 right-[10%] w-96 h-96 bg-purple-400/20 dark:bg-purple-400/10 rounded-full blur-[100px] -z-10" />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1100px]">
          {/* Page Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mb-10 text-center"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3"
            >
              Liên Hệ Với Chúng Tôi
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal"
            >
              Chúng tôi luôn sẵn sàng lắng nghe ý kiến của bạn. Hãy điền vào
              biểu mẫu bên dưới hoặc liên hệ trực tiếp qua email.
            </motion.p>
          </motion.div>

          {/* Glass Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/65 dark:bg-gray-900/60 backdrop-blur-md rounded-3xl overflow-hidden p-1 shadow-2xl border border-white/60 dark:border-white/10"
          >
            <div className="flex flex-col lg:flex-row">
              {/* Left Column: Contact Form */}
              <div className="flex-1 p-5 sm:p-8 lg:p-12">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                    Gửi tin nhắn
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Chúng tôi sẽ phản hồi trong vòng 24 giờ.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <label className="flex flex-col">
                      <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2 ml-1">
                        Họ và tên
                      </span>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full rounded-xl h-12 pl-11 pr-4 bg-white/50 dark:bg-white/10 border border-white/60 dark:border-white/20 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/90 dark:focus:bg-white/20 transition-all text-sm font-medium"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                    </label>

                    <label className="flex flex-col">
                      <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2 ml-1">
                        Email
                      </span>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full rounded-xl h-12 pl-11 pr-4 bg-white/50 dark:bg-white/10 border border-white/60 dark:border-white/20 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/90 dark:focus:bg-white/20 transition-all text-sm font-medium"
                          placeholder="example@email.com"
                        />
                      </div>
                    </label>
                  </div>

                  <label className="flex flex-col">
                    <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2 ml-1">
                      Số điện thoại{" "}
                      <span className="text-slate-400 font-normal">
                        (Tùy chọn)
                      </span>
                    </span>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full rounded-xl h-12 pl-11 pr-4 bg-white/50 dark:bg-white/10 border border-white/60 dark:border-white/20 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/90 dark:focus:bg-white/20 transition-all text-sm font-medium"
                        placeholder="+84 ..."
                      />
                    </div>
                  </label>

                  <label className="flex flex-col">
                    <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2 ml-1">
                      Nội dung tin nhắn
                    </span>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full rounded-xl min-h-[140px] p-4 bg-white/50 dark:bg-white/10 border border-white/60 dark:border-white/20 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/90 dark:focus:bg-white/20 transition-all text-sm font-medium resize-none"
                      placeholder="Hãy chia sẻ chi tiết yêu cầu của bạn..."
                    />
                  </label>

                  <button
                    type="submit"
                    className="group relative w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Gửi Tin Nhắn
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                </form>
              </div>

              {/* Right Column: Info & Map */}
              <div className="w-full lg:w-[350px] xl:w-[400px] bg-white/40 dark:bg-white/5 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/50 dark:border-white/10 p-5 sm:p-8 flex flex-col gap-6 sm:gap-8">
                {/* Info Cards */}
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                    Thông tin liên hệ
                  </h3>
                  <div className="space-y-4">
                    {/* Email Item */}
                    <a
                      href="mailto:fayeteam2004@gmail.com"
                      className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 transition-colors border border-white/40 dark:border-white/10 shadow-sm group"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <AtSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                          Email
                        </p>
                        <p className="text-slate-900 dark:text-white font-medium break-all">
                          fayeteam2004@gmail.com
                        </p>
                      </div>
                    </a>

                    {/* Phone Item */}
                    <a
                      href="tel:+84977836517"
                      className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 transition-colors border border-white/40 dark:border-white/10 shadow-sm group"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <PhoneCall className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                          Hotline
                        </p>
                        <p className="text-slate-900 dark:text-white font-medium">
                          +84 977 836 517
                        </p>
                      </div>
                    </a>

                    {/* Address Item */}
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                          Địa chỉ
                        </p>
                        <p className="text-slate-900 dark:text-white font-medium">
                          Hà Nội, Việt Nam
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden shadow-inner border border-white/50 dark:border-white/10 group">
                  <img
                    src="https://images.unsplash.com/photo-1524168272322-bf73616d9cb5?w=800&h=400&fit=crop"
                    alt="Map Location - Hanoi"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg animate-bounce">
                      <MapPin className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                  <a
                    href="https://maps.google.com/?q=Hanoi,Vietnam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm text-slate-800 dark:text-white transition-colors backdrop-blur-sm"
                  >
                    Xem bản đồ lớn
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
