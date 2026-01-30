import { SignupForm } from "@/components/organisms/auth/signup-form";

export const metadata = {
  title: "Đăng ký - KMA Edu",
  description: "Tạo tài khoản KMA Edu của bạn",
};

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center ">
      <SignupForm />
    </div>
  );
}
