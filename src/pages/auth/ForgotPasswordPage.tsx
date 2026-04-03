import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { sendCodeResetPassword, loading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await sendCodeResetPassword({ email });
      setSent(true);
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (error) {
      console.error("Failed to send reset code:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-yellow-50 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Quên mật khẩu?</h1>
            <p className="mt-2 text-zinc-500">
              Nhập email của bạn để nhận mã đặt lại mật khẩu
            </p>
          </div>

          {sent ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-medium text-green-600">Mã đặt lại đã được gửi!</p>
              <p className="mt-2 text-sm text-zinc-500">Đang chuyển hướng...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-red-700 disabled:bg-red-400"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi mã đặt lại"
                )}
              </button>
            </form>
          )}

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
