"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  FolderCheck,
  Smile,
  Eye,
  Target,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

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

const stats = [
  {
    icon: Calendar,
    value: "2+",
    label: "Năm phát triển nền tảng AI giáo dục",
  },
  {
    icon: FolderCheck,
    value: "10K+",
    label: "Bài kiểm tra và flashcard được tạo",
  },
  {
    icon: Smile,
    value: "98%",
    label: "Người dùng hài lòng với trải nghiệm",
  },
];

const cultureImages = [
  {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
    alt: "Team collaboration",
    title: "Làm việc nhóm",
  },
  {
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    alt: "Knowledge sharing",
    title: "Chia sẻ kiến thức",
  },
  {
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    alt: "Creative workspace",
    title: "Không gian sáng tạo",
  },
];

export default function AboutSection() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen pt-12">
      {/* Ambient Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] -top-20 -left-20 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute w-[400px] sm:w-[500px] md:w-[600px] h-[400px] sm:h-[500px] md:h-[600px] bottom-0 right-0 bg-yellow-400/15 rounded-full blur-[80px]" />
        <div className="absolute w-[250px] sm:w-[300px] md:w-[400px] h-[250px] sm:h-[300px] md:h-[400px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-300/15 rounded-full blur-[80px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center w-full">
        {/* Hero Section */}
        <section className="w-full px-4 md:px-10 py-12 md:py-20 flex justify-center">
          <div className="max-w-[1120px] w-full">
            <div className="flex flex-col-reverse md:flex-row gap-10 items-center">
              {/* Text Content */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="flex flex-col gap-6 md:w-1/2 items-start"
              >
                <motion.div
                  variants={fadeInUp}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border border-white/60 text-xs font-semibold text-primary backdrop-blur-sm shadow-sm"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  Đổi mới sáng tạo
                </motion.div>

                <motion.h1
                  variants={fadeInUp}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900"
                >
                  Sáng tạo. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">
                    Tận tâm.
                  </span>{" "}
                  <br className="hidden sm:block" />
                  Đột phá.
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="text-slate-600 text-lg leading-relaxed max-w-lg"
                >
                  Chúng tôi là đội ngũ đam mê công nghệ giáo dục, sử dụng AI để
                  biến tài liệu thành bài kiểm tra, flashcard và tóm tắt, giúp
                  việc học tập trở nên hiệu quả và thú vị hơn.
                </motion.p>

                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 w-full sm:w-auto"
                >
                  <button className="h-11 sm:h-12 px-6 sm:px-8 bg-primary hover:bg-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-500/30 transition-all transform hover:-translate-y-1 text-sm sm:text-base">
                    Khám phá ngay
                  </button>
                  <button className="h-11 sm:h-12 px-6 sm:px-8 bg-white/65 backdrop-blur-md text-slate-800 font-bold rounded-lg hover:bg-white/80 transition-all border border-white/50 text-sm sm:text-base">
                    Xem hồ sơ
                  </button>
                </motion.div>
              </motion.div>

              {/* Image/Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/2 relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-yellow-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                    alt="Team collaborating"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay card within image */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/65 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/40">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/20 text-green-700 p-2 rounded-full">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase">
                          Tăng trưởng
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          +125% năm nay
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full px-4 md:px-10 pb-16 flex justify-center">
          <div className="max-w-[1120px] w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white/65 backdrop-blur-md p-5 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 border border-white/60"
                >
                  <div className="text-primary mb-1 sm:mb-2">
                    <stat.icon className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-slate-500 font-medium">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="w-full px-4 md:px-10 py-16 flex justify-center relative">
          <div className="absolute inset-0 bg-white/30 skew-y-3 transform origin-top-left -z-10" />
          <div className="max-w-[1120px] w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex flex-col gap-12"
            >
              <motion.div
                variants={fadeInUp}
                className="text-center max-w-2xl mx-auto space-y-4"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  Tầm nhìn & Sứ mệnh
                </h2>
                <p className="text-slate-600 text-lg">
                  Định hướng phát triển bền vững và cam kết mang lại giá trị lâu
                  dài cho giáo dục.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Vision Card */}
                <motion.div
                  variants={fadeInUp}
                  className="bg-white/65 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-3xl border border-white/70 shadow-lg relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Eye className="w-24 h-24" />
                  </div>
                  <div className="relative z-10 flex flex-col gap-6 h-full">
                    <div className="w-14 h-14 bg-red-100 text-primary rounded-xl flex items-center justify-center mb-2">
                      <Eye className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">
                        Tầm nhìn
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        Trở thành nền tảng AI giáo dục hàng đầu Việt Nam, nơi
                        mọi người học đều có thể tiếp cận công nghệ tiên tiến để
                        học tập hiệu quả và phát triển bản thân.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Mission Card */}
                <motion.div
                  variants={fadeInUp}
                  className="bg-white/65 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-3xl border border-white/70 shadow-lg relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target className="w-24 h-24" />
                  </div>
                  <div className="relative z-10 flex flex-col gap-6 h-full">
                    <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-2">
                      <Target className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">
                        Sứ mệnh
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        Mang AI vào giáo dục, giúp học sinh và giáo viên tiết
                        kiệm thời gian tạo nội dung học tập, nâng cao chất lượng
                        giảng dạy và hiệu quả học tập.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Culture Section */}
        <section className="w-full px-4 md:px-10 py-16 flex justify-center">
          <div className="max-w-[1120px] w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex flex-col gap-8"
            >
              <motion.div
                variants={fadeInUp}
                className="flex justify-between items-end"
              >
                <h2 className="text-2xl font-bold text-slate-900">
                  Văn hóa KMA Edu
                </h2>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
              >
                {cultureImages.map((image, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className={cn(
                      "relative group overflow-hidden rounded-xl aspect-[4/3] shadow-md cursor-pointer",
                      index === 2 && "sm:col-span-2 md:col-span-1",
                    )}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/65 backdrop-blur-md m-2 rounded-lg translate-y-full group-hover:translate-y-0 transition-transform duration-300 border border-white/40">
                      <p className="text-sm font-bold text-slate-900">
                        {image.title}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full px-4 md:px-10 py-20 flex justify-center">
          <div className="max-w-[960px] w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/65 backdrop-blur-md rounded-3xl p-6 sm:p-10 md:p-16 text-center border border-white/50 shadow-xl relative overflow-hidden"
            >
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />

              <div className="relative z-10 flex flex-col items-center gap-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
                  Sẵn sàng trải nghiệm KMA Edu?
                </h2>
                <p className="text-slate-600 max-w-xl text-lg">
                  Bắt đầu tạo bài kiểm tra, flashcard và tóm tắt từ tài liệu của
                  bạn với sức mạnh của AI ngay hôm nay.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
                  <button
                    className="h-12 px-8 bg-primary hover:bg-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-500/30 transition-all cursor-pointer"
                    onClick={() => navigate("/k")}
                  >
                    Bắt đầu miễn phí
                  </button>
                  <button
                    className="h-12 px-8 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                    onClick={() => navigate("/contact")}
                  >
                    Liên hệ với chúng tôi
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
