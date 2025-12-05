import { Suspense } from "react";
import { SigninForm } from "@/components/organisms/auth/signin-form";

export const metadata = {
  title: "Đăng nhập - Examio",
  description: "Đăng nhập vào tài khoản Examio của bạn",
};

export default function LoginPage() {
  return (
    <div>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
        <SigninForm />
      </Suspense>
    </div>
  );
}
