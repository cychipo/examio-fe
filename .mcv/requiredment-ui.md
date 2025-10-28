🎯 Mục tiêu dự án

Mục tiêu của dự án này là tạo giao diện người dùng (UI) dựa trên hình ảnh hoặc mô tả thiết kế mà bạn cung cấp.
Giao diện sinh ra phải tuân thủ:

Mô hình Atomic Design Pattern

Sử dụng thư viện shadcn/ui làm nền tảng chính

Responsive trên mọi thiết bị (mobile, tablet, desktop)

Không fix cứng màu nền trừ khi thật cần thiết (nút, icon,...)

Hiện đại, có màu sắc nhẹ nhàng nhưng không quá tối giản

🧱 Quy tắc thiết kế
1. Tuân thủ mô hình Atomic Design Pattern

Cấu trúc thành 5 tầng:

Atoms: Thành phần cơ bản (Button, Input, Label, Icon, v.v.)

Molecules: Tổ hợp nhỏ (FormField, CardHeader, TableRow, v.v.)

Organisms: Thành phần lớn hơn (Sidebar, Navbar, ChartSection, v.v.)

Templates: Khung bố cục cho trang (DashboardLayout, AuthLayout, v.v.)

Pages: Trang hoàn chỉnh (Dashboard, Settings, v.v.)

Cấu trúc thư mục chuẩn:

src/
  components/
    atoms/
    molecules/
    organisms/
  templates/
  pages/

2. Thư viện & công cụ sử dụng

Sử dụng shadcn/ui
 làm thư viện chính.

Dùng Tailwind CSS để định kiểu.

Lucide-react cho biểu tượng.

Framer Motion cho animation (nếu cần).

3. Nguyên tắc màu sắc & chủ đề

🚫 Không dùng màu nền cố định kiểu bg-[#fff] hay bg-black.

✅ Sử dụng biến theme của Tailwind hoặc CSS variable (bg-background, text-foreground,…)

✅ Chỉ các thành phần như nút, icon, tag, trạng thái (status) mới được phép gán màu cố định.

✅ Hỗ trợ Light mode và Dark mode.

Ví dụ bảng màu chủ đạo (bạn có thể thay đổi theo dự án):

--background: oklch(0.999 0.001 106.8);
--foreground: oklch(0.31 0.08 235.5);
--primary: oklch(0.68 0.13 240);
--accent: oklch(0.7 0.18 25);
--muted: oklch(0.95 0.005 235);
--border: oklch(0.9 0.01 235);

4. Responsive

Giao diện phải tự động thích ứng cho:

Mobile: bố cục dọc, gọn gàng

Tablet: bố cục chia cột cân bằng

Desktop: bố cục mở rộng giống thiết kế gốc

Sử dụng các class responsive của Tailwind như md:, lg:, xl:.
Kết hợp flex, grid, gap, space-x/y để đảm bảo cân đối.

5. Hành vi và cấu trúc component

Mỗi component phải độc lập, có thể tái sử dụng.

Không sử dụng inline style trừ khi bắt buộc.

Không dùng “magic number” (ví dụ width: 142px) — phải có logic layout rõ ràng.

Ưu tiên HTML ngữ nghĩa (<header>, <main>, <section>, <nav>, v.v.)
