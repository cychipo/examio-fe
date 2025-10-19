import { SigninForm } from "@/components/organisms/auth/signin-form";

export const metadata = {
  title: "Đăng nhập - Examio",
  description: "Đăng nhập vào tài khoản Examio của bạn",
};

export default function LoginPage() {
  return (
    <div>
      <SigninForm />
    </div>
  );
}
