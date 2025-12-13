import { SignupForm } from "@/components/organisms/auth/signup-form";

export const metadata = {
  title: "Đăng ký - FayEdu",
  description: "Tạo tài khoản FayEdu của bạn",
};

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center ">
      <SignupForm />
    </div>
  );
}
