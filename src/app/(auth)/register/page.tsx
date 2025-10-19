import { SignupForm } from "@/components/organisms/auth/signup-form";

export const metadata = {
  title: "Đăng ký - Examio",
  description: "Tạo tài khoản Examio của bạn",
};

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center ">
      <SignupForm />
    </div>
  );
}
