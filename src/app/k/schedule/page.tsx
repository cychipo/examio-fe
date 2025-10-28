"use client";

import { useState } from "react";
import { ScheduleTemplate } from "@/templates/ScheduleTemplate";
import type { ScheduleClass } from "@/components/organisms/k/TodayScheduleSection";
import type { UpcomingExam } from "@/components/organisms/k/UpcomingExamsSection";
import type { Task } from "@/components/organisms/k/QuickTasksSection";
import type { WeekScheduleClass } from "@/components/molecules/WeekScheduleView";

// Mock data
const mockClasses: ScheduleClass[] = [
  {
    id: "1",
    time: "09:00\nSáng",
    subject: "Toán học - Giải tích II",
    location: "Phòng 301, Tòa nhà A",
    type: "class",
  },
  {
    id: "2",
    time: "11:00\nSáng",
    subject: "Báo cáo Thí nghiệm Vật lý",
    location: "Phòng: Phòng khoa học",
    type: "lab",
  },
  {
    id: "3",
    time: "14:00\nChiều",
    subject: "Khoa học Máy tính - Thuật toán",
    location: "Phòng 205, Phòng thí nghiệm",
    type: "class",
  },
  {
    id: "4",
    time: "16:30\nChiều",
    subject: "Chuẩn bị Thi Hóa học",
    location: "Buổi học - Thư viện",
    type: "study",
  },
];

const mockWeekClasses: WeekScheduleClass[] = [
  {
    id: "w1",
    day: "Mon",
    time: "09:00\nSáng",
    subject: "Toán học - Giải tích II",
    location: "Phòng 301, Tòa nhà A",
    type: "class",
  },
  {
    id: "w2",
    day: "Mon",
    time: "14:00\nChiều",
    subject: "Lập trình Python",
    location: "Phòng 102, Lab",
    type: "lab",
  },
  {
    id: "w3",
    day: "Tue",
    time: "10:00\nSáng",
    subject: "Vật lý Đại cương",
    location: "Phòng 205, Tòa nhà B",
    type: "class",
  },
  {
    id: "w4",
    day: "Tue",
    time: "15:00\nChiều",
    subject: "Thí nghiệm Hóa học",
    location: "Phòng Lab 301",
    type: "lab",
  },
  {
    id: "w5",
    day: "Wed",
    time: "09:00\nSáng",
    subject: "Tiếng Anh Học thuật",
    location: "Phòng 401, Tòa nhà C",
    type: "class",
  },
  {
    id: "w6",
    day: "Wed",
    time: "13:30\nChiều",
    subject: "Cấu trúc Dữ liệu",
    location: "Phòng 105, Lab",
    type: "class",
  },
  {
    id: "w7",
    day: "Thu",
    time: "08:30\nSáng",
    subject: "Triết học Mác-Lênin",
    location: "Phòng 501, Tòa nhà A",
    type: "class",
  },
  {
    id: "w8",
    day: "Thu",
    time: "14:00\nChiều",
    subject: "Báo cáo Đồ án",
    location: "Phòng họp Khoa",
    type: "study",
  },
  {
    id: "w9",
    day: "Fri",
    time: "09:00\nSáng",
    subject: "Cơ sở Dữ liệu",
    location: "Phòng 201, Lab",
    type: "class",
  },
  {
    id: "w10",
    day: "Fri",
    time: "15:30\nChiều",
    subject: "Thảo luận Nhóm",
    location: "Thư viện - Phòng 3",
    type: "study",
  },
  {
    id: "w11",
    day: "Sat",
    time: "10:00\nSáng",
    subject: "Ôn tập Toán",
    location: "Thư viện",
    type: "study",
  },
  {
    id: "w12",
    day: "Sun",
    time: "14:00\nChiều",
    subject: "Làm bài tập Lập trình",
    location: "Tại nhà",
    type: "task",
  },
];

const mockExams: UpcomingExam[] = [
  {
    id: "1",
    subject: "Thi cuối kỳ Hóa học",
    date: "Nov 3, 2024",
    daysLeft: 6,
    color: "red",
  },
  {
    id: "2",
    subject: "Thi giữa kỳ Toán",
    date: "Nov 12, 2024",
    daysLeft: 15,
    color: "orange",
  },
  {
    id: "3",
    subject: "Kiểm tra Vật lý",
    date: "Nov 20, 2024",
    daysLeft: 23,
    color: "blue",
  },
];

const mockTasksData: Task[] = [
  {
    id: "1",
    label: "Xem lại ghi chú bài giảng",
    checked: false,
  },
  {
    id: "2",
    label: "Nộp bài tập",
    checked: true,
  },
  {
    id: "3",
    label: "Chuẩn bị bài thuyết trình",
    checked: false,
  },
  {
    id: "4",
    label: "Mua sách giáo khoa",
    checked: false,
  },
];

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [tasks, setTasks] = useState<Task[]>(mockTasksData);
  const [currentMonth, setCurrentMonth] = useState("October");
  const [currentYear, setCurrentYear] = useState(2024);
  const [selectedDate, setSelectedDate] = useState(28);

  const stats = {
    todayClasses: 4,
    pendingTasks: 12,
    upcomingExams: 3,
    completed: 28,
  };

  const handleTaskToggle = (id: string, checked: boolean) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, checked } : task))
    );
  };

  const handlePrevMonth = () => {
    const monthIndex = getMonthIndex(currentMonth);
    if (monthIndex === 0) {
      setCurrentMonth("December");
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(getMonthName(monthIndex - 1));
    }
  };

  const handleNextMonth = () => {
    const monthIndex = getMonthIndex(currentMonth);
    if (monthIndex === 11) {
      setCurrentMonth("January");
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(getMonthName(monthIndex + 1));
    }
  };

  return (
    <ScheduleTemplate
      stats={stats}
      classes={mockClasses}
      weekClasses={mockWeekClasses}
      exams={mockExams}
      tasks={tasks}
      viewMode={viewMode}
      currentMonth={currentMonth}
      currentYear={currentYear}
      selectedDate={selectedDate}
      onViewModeChange={setViewMode}
      onTaskToggle={handleTaskToggle}
      onDateSelect={setSelectedDate}
      onPrevMonth={handlePrevMonth}
      onNextMonth={handleNextMonth}
    />
  );
}

function getMonthIndex(monthName: string): number {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months.indexOf(monthName);
}

function getMonthName(index: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[index];
}
