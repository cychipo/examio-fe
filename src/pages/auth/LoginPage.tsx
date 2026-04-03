import { Suspense } from "react";
import { SigninForm } from "@/components/organisms/auth/signin-form";

export default function LoginPage() {
  return (
    <div>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            Đang tải...
          </div>
        }
      >
        <SigninForm />
      </Suspense>
    </div>
  );
}
