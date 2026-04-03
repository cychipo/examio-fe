import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [success, setSuccess] = useState(false);
  const [autoSentEmail, setAutoSentEmail] = useState(false);
  const hasSentEmailRef = useRef(false);
  const navigate = useNavigate();
  const { verifyAccount, sendVerificationEmail, loading, user } = useAuthStore();

  useEffect(() => {
    if (user && !user.isVerified && !hasSentEmailRef.current) {
      hasSentEmailRef.current = true;
      sendVerificationEmail()
        .then(() => setAutoSentEmail(true))
        .catch((error) => {
          console.error("Failed to auto-send verification email:", error);
        });
    }
  }, [user, sendVerificationEmail]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      await verifyAccount(code);
      setSuccess(true);
      setTimeout(() => {
        navigate("/k", { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  const handleResendCode = async () => {
    try {
      await sendVerificationEmail();
    } catch (error) {
      console.error("Failed to resend verification email:", error);
    }
  };

  if (user?.isVerified) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mb-3 text-2xl font-bold text-zinc-900">Tài khoản đã được xác minh!</h1>
            <p className="mb-6 text-zinc-500">
              Tài khoản của bạn đã được xác minh thành công. Bạn có thể sử dụng đầy đủ các tính năng của hệ thống.
            </p>
            <Link to="/k" className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700">
              <ArrowLeft className="h-4 w-4" />
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Xác minh tài khoản</h1>
            <p className="mt-2 text-zinc-500">Nhập mã xác minh đã được gửi đến email của bạn</p>
            {user?.email && <p className="mt-1 text-sm text-zinc-400">({user.email})</p>}
          </div>

          {autoSentEmail && !success && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-primary" />
                <p className="text-sm text-red-700">Email xác minh đã được gửi tự động. Vui lòng kiểm tra hộp thư của bạn.</p>
              </div>
            </div>
          )}

          {success ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-medium text-green-600">Xác minh thành công!</p>
              <p className="mt-2 text-sm text-zinc-500">Đang chuyển hướng...</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="code" className="mb-2 block text-sm font-medium text-zinc-700">Mã xác minh</label>
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

                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-red-700 disabled:bg-red-400"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Đang xác minh...
                    </>
                  ) : (
                    "Xác minh"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="mb-2 text-sm text-zinc-500">Không nhận được mã?</p>
                <button onClick={handleResendCode} disabled={loading} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-red-700 disabled:opacity-50">
                  <Mail className="h-4 w-4" />
                  Gửi lại mã xác minh
                </button>
              </div>
            </>
          )}

          <div className="mt-6 border-t border-zinc-200 pt-6 text-center">
            <Link to="/k" className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-700">
              <ArrowLeft className="h-4 w-4" />
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
