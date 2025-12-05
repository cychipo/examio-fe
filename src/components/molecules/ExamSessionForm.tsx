"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Lock, LockOpen, Key, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ASSESS_TYPE } from "@/types/examSession";

/**
 * Interface cho dữ liệu form ExamSession
 */
export interface ExamSessionFormData {
  examRoomId: string;
  startTime: string;
  endTime?: string;
  autoJoinByLink?: boolean;
  // Security fields
  assessType: ASSESS_TYPE;
  allowRetake: boolean;
  maxAttempts: number;
  accessCode?: string | null;
  whitelist?: string[];
}

interface ExamRoomOption {
  id: string;
  title: string;
  description?: string;
}

interface ExamSessionFormProps {
  initialData?: Partial<ExamSessionFormData>;
  examRooms: ExamRoomOption[];
  isLoading?: boolean;
  isLoadingExamRooms?: boolean;
  onSubmit: (data: ExamSessionFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
  onGenerateCode?: () => Promise<string>;
}

/**
 * Form component để tạo/chỉnh sửa Exam Session
 */
export function ExamSessionForm({
  initialData,
  examRooms,
  isLoading = false,
  isLoadingExamRooms = false,
  onSubmit,
  onCancel,
  submitLabel = "Lưu",
  onGenerateCode,
}: ExamSessionFormProps) {
  const [formData, setFormData] = useState<ExamSessionFormData>({
    examRoomId: "",
    startTime: "",
    endTime: "",
    autoJoinByLink: false,
    assessType: ASSESS_TYPE.PUBLIC,
    allowRetake: false,
    maxAttempts: 1,
    accessCode: null,
    whitelist: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.examRoomId) {
      newErrors.examRoomId = "Vui lòng chọn phòng thi";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Vui lòng chọn thời gian bắt đầu";
    }

    if (formData.endTime && formData.startTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end <= start) {
        newErrors.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu";
      }
    }

    if (formData.assessType === ASSESS_TYPE.PRIVATE && !formData.accessCode) {
      newErrors.accessCode = "Phiên thi riêng tư cần có mã truy cập";
    }

    if (formData.maxAttempts < 1) {
      newErrors.maxAttempts = "Số lần thi phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleGenerateCode = async () => {
    if (onGenerateCode) {
      setIsGeneratingCode(true);
      try {
        const code = await onGenerateCode();
        setFormData({ ...formData, accessCode: code });
      } finally {
        setIsGeneratingCode(false);
      }
    } else {
      // Generate locally if no callback provided
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setFormData({ ...formData, accessCode: code });
    }
  };

  const isPrivate = formData.assessType === ASSESS_TYPE.PRIVATE;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Exam Room Selection */}
      <div className="space-y-2">
        <Label htmlFor="examRoomId">
          Phòng thi <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.examRoomId}
          onValueChange={(value) => {
            setFormData({ ...formData, examRoomId: value });
            if (errors.examRoomId) setErrors({ ...errors, examRoomId: "" });
          }}
          disabled={isLoading || isLoadingExamRooms}>
          <SelectTrigger className={cn(errors.examRoomId && "border-red-500")}>
            <SelectValue placeholder="Chọn phòng thi" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingExamRooms ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              examRooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.title}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errors.examRoomId && (
          <p className="text-sm text-red-500">{errors.examRoomId}</p>
        )}
      </div>

      {/* Time Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">
            Thời gian bắt đầu <span className="text-red-500">*</span>
          </Label>
          <Input
            id="startTime"
            type="datetime-local"
            value={formData.startTime ? formData.startTime.slice(0, 16) : ""}
            onChange={(e) => {
              setFormData({
                ...formData,
                startTime: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : "",
              });
              if (errors.startTime) setErrors({ ...errors, startTime: "" });
            }}
            disabled={isLoading}
            className={cn(errors.startTime && "border-red-500")}
          />
          {errors.startTime && (
            <p className="text-sm text-red-500">{errors.startTime}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">Thời gian kết thúc</Label>
          <Input
            id="endTime"
            type="datetime-local"
            value={formData.endTime ? formData.endTime.slice(0, 16) : ""}
            onChange={(e) => {
              setFormData({
                ...formData,
                endTime: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : "",
              });
              if (errors.endTime) setErrors({ ...errors, endTime: "" });
            }}
            disabled={isLoading}
            className={cn(errors.endTime && "border-red-500")}
          />
          {errors.endTime && (
            <p className="text-sm text-red-500">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* Security Settings */}
      <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
        <h3 className="font-medium flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Cài đặt bảo mật
        </h3>

        {/* Assess Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPrivate ? (
              <Lock className="h-4 w-4 text-orange-500" />
            ) : (
              <LockOpen className="h-4 w-4 text-green-500" />
            )}
            <Label>Loại phiên thi</Label>
          </div>
          <Select
            value={formData.assessType.toString()}
            onValueChange={(value) => {
              const assessType = Number.parseInt(value) as ASSESS_TYPE;
              setFormData({
                ...formData,
                assessType,
                accessCode:
                  assessType === ASSESS_TYPE.PUBLIC
                    ? null
                    : formData.accessCode,
              });
            }}
            disabled={isLoading}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ASSESS_TYPE.PUBLIC.toString()}>
                Công khai
              </SelectItem>
              <SelectItem value={ASSESS_TYPE.PRIVATE.toString()}>
                Riêng tư
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Access Code (only for private) */}
        {isPrivate && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <Label>
                Mã truy cập <span className="text-red-500">*</span>
              </Label>
            </div>
            <div className="flex gap-2">
              <Input
                value={formData.accessCode || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setFormData({ ...formData, accessCode: value });
                  if (errors.accessCode)
                    setErrors({ ...errors, accessCode: "" });
                }}
                placeholder="Nhập mã 6 chữ số"
                maxLength={6}
                disabled={isLoading}
                className={cn(errors.accessCode && "border-red-500")}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateCode}
                disabled={isLoading || isGeneratingCode}>
                {isGeneratingCode ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Tạo mã"
                )}
              </Button>
            </div>
            {errors.accessCode && (
              <p className="text-sm text-red-500">{errors.accessCode}</p>
            )}
          </div>
        )}

        {/* Auto Join by Link */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <Label>Tự động tham gia bằng link</Label>
          </div>
          <Switch
            checked={formData.autoJoinByLink}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, autoJoinByLink: checked })
            }
            disabled={isLoading}
          />
        </div>

        {/* Allow Retake */}
        <div className="flex items-center justify-between">
          <Label>Cho phép thi lại</Label>
          <Switch
            checked={formData.allowRetake}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, allowRetake: checked })
            }
            disabled={isLoading}
          />
        </div>

        {/* Max Attempts */}
        {formData.allowRetake && (
          <div className="space-y-2">
            <Label>Số lần thi tối đa</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={formData.maxAttempts}
              onChange={(e) => {
                const value = Math.max(1, Number.parseInt(e.target.value) || 1);
                setFormData({ ...formData, maxAttempts: value });
                if (errors.maxAttempts)
                  setErrors({ ...errors, maxAttempts: "" });
              }}
              disabled={isLoading}
              className={cn(errors.maxAttempts && "border-red-500", "w-24")}
            />
            {errors.maxAttempts && (
              <p className="text-sm text-red-500">{errors.maxAttempts}</p>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
