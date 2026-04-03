import { Suspense, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, loading } = useAuthStore();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return;
    }

    try {
      await resetPassword({ email, code, newPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Failed to reset password:", error);
    }
  };

  if (success) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-zinc-900">Đặt lại mật khẩu thành công!</h2>
        <p className="text-zinc-500">Đang chuyển hướng đến trang đăng nhập...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="code" className="mb-2 block text-sm font-medium text-zinc-700">
          Mã xác nhận
        </label>
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={(value) => setCode(value)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
              <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
              <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
              <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
              <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      <div>
        <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-zinc-700">
          Mật khẩu mới
        </label>
        <div className="relative">
          <input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới"
            required
            minLength={6}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 pr-12 text-zinc-900 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-zinc-700">
          Xác nhận mật khẩu
        </label>
        <input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Nhập lại mật khẩu mới"
          required
          minLength={6}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
        />
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="mt-1 text-sm text-red-500">Mật khẩu không khớp</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || newPassword !== confirmPassword}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-red-700 disabled:bg-red-400"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          "Đặt lại mật khẩu"
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-yellow-50 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Đặt lại mật khẩu</h1>
            <p className="mt-2 text-zinc-500">Nhập mã xác nhận và mật khẩu mới</p>
          </div>

          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-700">
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
