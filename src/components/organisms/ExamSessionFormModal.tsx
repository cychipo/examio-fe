"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Calendar, Clock, Lock, Users, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ExamSessionBasic } from "@/types/examRoom";
import { ASSESS_TYPE } from "@/types/examSession";

interface ExamSessionFormData {
  startTime: string;
  endTime: string;
  isPublic: boolean;
  accessCode: string;
  allowRetake: boolean;
  maxAttempts: number;
}

interface ExamSessionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  examRoomId: string;
  session?: ExamSessionBasic | null;
  onSubmit: (data: {
    startTime: string;
    endTime?: string;
    assessType: ASSESS_TYPE;
    accessCode?: string | null;
    allowRetake: boolean;
    maxAttempts: number;
  }) => Promise<boolean>;
  isLoading?: boolean;
}

const initialFormData: ExamSessionFormData = {
  startTime: "",
  endTime: "",
  isPublic: true,
  accessCode: "",
  allowRetake: false,
  maxAttempts: 1,
};

/**
 * Modal form component for creating/editing exam sessions
 * Follows Atomic Design - Organism level
 */
export function ExamSessionFormModal({
  open,
  onOpenChange,
  mode,
  session,
  onSubmit,
  isLoading = false,
}: ExamSessionFormModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] =
    useState<ExamSessionFormData>(initialFormData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ExamSessionFormData, string>>
  >({});

  // Reset form when modal opens/closes or session changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && session) {
        // Populate form with session data
        const startTimeFormatted = session.startTime
          ? format(new Date(session.startTime), "yyyy-MM-dd'T'HH:mm")
          : "";
        const endTimeFormatted = session.endTime
          ? format(new Date(session.endTime), "yyyy-MM-dd'T'HH:mm")
          : "";

        setFormData({
          startTime: startTimeFormatted,
          endTime: endTimeFormatted,
          isPublic: (session as any).assessType === ASSESS_TYPE.PUBLIC,
          accessCode: (session as any).accessCode || "",
          allowRetake: (session as any).allowRetake || false,
          maxAttempts: (session as any).maxAttempts || 1,
        });
      } else {
        // Default values for create mode
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30); // Start 30 mins from now
        const defaultStart = format(now, "yyyy-MM-dd'T'HH:mm");

        setFormData({
          ...initialFormData,
          startTime: defaultStart,
        });
      }
      setErrors({});
    }
  }, [open, mode, session]);

  // Handle input change
  const handleChange = useCallback(
    (field: keyof ExamSessionFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  // Generate random 6-digit access code
  const generateAccessCode = useCallback(() => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setFormData((prev) => ({ ...prev, accessCode: code }));
  }, []);

  // Validate form
  const validate = useCallback(() => {
    const newErrors: Partial<Record<keyof ExamSessionFormData, string>> = {};

    if (!formData.startTime) {
      newErrors.startTime = "Vui lòng chọn thời gian bắt đầu";
    }

    if (
      !formData.isPublic &&
      formData.accessCode &&
      !/^\d{6}$/.test(formData.accessCode)
    ) {
      newErrors.accessCode = "Mã truy cập phải là 6 chữ số";
    }

    if (
      formData.allowRetake &&
      (formData.maxAttempts < 1 || formData.maxAttempts > 10)
    ) {
      newErrors.maxAttempts = "Số lần làm phải từ 1 đến 10";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    try {
      const submitData = {
        startTime: new Date(formData.startTime).toISOString(),
        endTime: formData.endTime
          ? new Date(formData.endTime).toISOString()
          : undefined,
        assessType: formData.isPublic
          ? ASSESS_TYPE.PUBLIC
          : ASSESS_TYPE.PRIVATE,
        accessCode:
          !formData.isPublic && formData.accessCode
            ? formData.accessCode
            : null,
        allowRetake: formData.allowRetake,
        maxAttempts: formData.maxAttempts,
      };

      const success = await onSubmit(submitData);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isFormLoading = isLoading || submitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {mode === "create" ? "Tạo phiên thi mới" : "Chỉnh sửa phiên thi"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Thiết lập thời gian và cài đặt cho phiên thi mới"
              : "Cập nhật thông tin phiên thi"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6 py-4">
          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="startTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              disabled={isFormLoading}
            />
            {errors.startTime && (
              <p className="text-sm text-red-500">{errors.startTime}</p>
            )}
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label htmlFor="endTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Thời gian kết thúc
            </Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
              disabled={isFormLoading}
            />
            <p className="text-xs text-muted-foreground">
              Để trống nếu không giới hạn thời gian
            </p>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                {formData.isPublic ? (
                  <Users className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                {formData.isPublic
                  ? "Phiên thi công khai"
                  : "Phiên thi riêng tư"}
              </Label>
              <p className="text-xs text-muted-foreground">
                {formData.isPublic
                  ? "Mọi người đều có thể tham gia"
                  : "Chỉ những người có mã mới tham gia được"}
              </p>
            </div>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleChange("isPublic", checked)}
              disabled={isFormLoading}
            />
          </div>

          {/* Access Code (when private) */}
          {!formData.isPublic && (
            <div className="space-y-2">
              <Label htmlFor="accessCode" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Mã truy cập (6 chữ số)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="accessCode"
                  type="text"
                  maxLength={6}
                  placeholder="Nhập mã 6 chữ số"
                  value={formData.accessCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    handleChange("accessCode", value);
                  }}
                  disabled={isFormLoading}
                  className="font-mono text-center tracking-widest"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={generateAccessCode}
                  disabled={isFormLoading}
                  title="Tạo mã ngẫu nhiên">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {errors.accessCode && (
                <p className="text-sm text-red-500">{errors.accessCode}</p>
              )}
            </div>
          )}

          {/* Allow Retake */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Cho phép làm lại</Label>
              <p className="text-xs text-muted-foreground">
                Thí sinh có thể làm bài nhiều lần
              </p>
            </div>
            <Switch
              checked={formData.allowRetake}
              onCheckedChange={(checked) =>
                handleChange("allowRetake", checked)
              }
              disabled={isFormLoading}
            />
          </div>

          {/* Max Attempts */}
          {formData.allowRetake && (
            <div className="space-y-2">
              <Label htmlFor="maxAttempts">Số lần làm tối đa</Label>
              <Input
                id="maxAttempts"
                type="number"
                min={1}
                max={10}
                value={formData.maxAttempts}
                onChange={(e) =>
                  handleChange(
                    "maxAttempts",
                    Number.parseInt(e.target.value) || 1
                  )
                }
                disabled={isFormLoading}
              />
              {errors.maxAttempts && (
                <p className="text-sm text-red-500">{errors.maxAttempts}</p>
              )}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isFormLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isFormLoading}>
              {isFormLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === "create" ? "Tạo phiên thi" : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
