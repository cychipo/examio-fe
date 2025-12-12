"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, Mail, Eye, EyeOff, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { sendCodeChangePasswordApi, changePasswordApi } from "@/apis/authApi";
import { AxiosError } from "axios";

// Helper to extract error message from API responses
const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Đã xảy ra lỗi. Vui lòng thử lại.";
};

type Step = "initial" | "verify" | "success";

export function ChangePasswordSection() {
  const [step, setStep] = useState<Step>("initial");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [code, setCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { toast } = useToast();

  const handleSendCode = async () => {
    try {
      setIsSendingCode(true);
      await sendCodeChangePasswordApi();
      setStep("verify");
      toast.success("Mã xác minh đã được gửi đến email của bạn!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    try {
      setIsSubmitting(true);
      await changePasswordApi({
        code,
        currentPassword,
        newPassword,
      });
      setStep("success");
      toast.success("Đổi mật khẩu thành công!");

      // Reset form after success
      setTimeout(() => {
        setStep("initial");
        setCode("");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }, 3000);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setStep("initial");
    setCode("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Đổi mật khẩu
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === "initial" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Để đổi mật khẩu, chúng tôi sẽ gửi mã xác minh đến email của bạn.
            </p>
            <Button
              onClick={handleSendCode}
              disabled={isSendingCode}
              className="w-full sm:w-auto">
              {isSendingCode ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Gửi mã xác minh
                </>
              )}
            </Button>
          </div>
        )}

        {step === "verify" && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="p-3 bg-primary/10 rounded-lg text-sm text-primary">
              Mã xác minh đã được gửi đến email của bạn (có hiệu lực 10 phút)
            </div>

            {/* Verification Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Mã xác minh</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Nhập mã 6 số"
                maxLength={6}
                required
              />
            </div>

            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">
                  Mật khẩu xác nhận không khớp
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || newPassword !== confirmPassword}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Đổi mật khẩu
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Hủy
              </Button>
            </div>

            {/* Resend code */}
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={handleSendCode}
              disabled={isSendingCode}>
              {isSendingCode ? "Đang gửi lại..." : "Gửi lại mã xác minh"}
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-emerald-600">
                Đổi mật khẩu thành công!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Mật khẩu của bạn đã được cập nhật.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
