"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Save, Loader2, ImageIcon, Camera, Upload } from "lucide-react";
import type { UserProfile, UpdateProfileData } from "@/apis/profileApi";
import { uploadAvatarApi, uploadBannerApi } from "@/apis/profileApi";
import { useToast } from "@/components/ui/toast";

interface ProfileFormProps {
  profile: UserProfile;
  onSubmit: (data: UpdateProfileData) => Promise<void>;
  onImageUploaded?: () => Promise<void>; // Callback after image upload
  isSubmitting?: boolean;
}

export function ProfileForm({
  profile,
  onSubmit,
  onImageUploaded,
  isSubmitting = false,
}: ProfileFormProps) {
  const [name, setName] = useState(profile.name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatar, setAvatar] = useState(profile.avatar || "");
  const [banner, setBanner] = useState(profile.banner || "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only include fields that have changed
    const changedData: UpdateProfileData = {};

    if (name !== (profile.name || "")) {
      changedData.name = name || undefined;
    }
    if (bio !== (profile.bio || "")) {
      changedData.bio = bio || undefined;
    }
    if (avatar !== (profile.avatar || "")) {
      changedData.avatar = avatar || null;
    }
    if (banner !== (profile.banner || "")) {
      changedData.banner = banner || null;
    }

    // Only submit if there are changes
    if (Object.keys(changedData).length > 0) {
      await onSubmit(changedData);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const result = await uploadAvatarApi(file);
      setAvatar(result.url);
      // Notify parent to refresh user data
      if (onImageUploaded) {
        await onImageUploaded();
      }
      toast.success("Đã tải ảnh đại diện lên thành công!");
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      toast.error("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingBanner(true);
      const result = await uploadBannerApi(file);
      setBanner(result.url);
      // Notify parent to refresh user data
      if (onImageUploaded) {
        await onImageUploaded();
      }
      toast.success("Đã tải ảnh bìa lên thành công!");
    } catch (error) {
      console.error("Failed to upload banner:", error);
      toast.error("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const initials = (profile.name || profile.username || "U")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5" />
          Thông tin cá nhân
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Preview & Upload */}
          <div className="space-y-2">
            <Label>Ảnh bìa</Label>
            <div className="relative h-32 rounded-lg bg-muted/50 overflow-hidden border border-border/50 group">
              {banner ? (
                <img
                  src={banner}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
              <div
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={() => bannerInputRef.current?.click()}>
                {isUploadingBanner ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Upload className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
              disabled={isUploadingBanner}
            />
            <p className="text-xs text-muted-foreground">
              Nhấp vào ảnh để tải lên (tối đa 5MB)
            </p>
          </div>

          {/* Avatar Preview & Upload */}
          <div className="space-y-2">
            <Label>Ảnh đại diện</Label>
            <div className="flex items-center gap-4">
              <div
                className="relative cursor-pointer group"
                onClick={() => avatarInputRef.current?.click()}>
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={avatar || undefined}
                    alt={profile.name || profile.username}
                  />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {isUploadingAvatar ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Nhấp vào ảnh để tải lên (tối đa 2MB)
                </p>
              </div>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={isUploadingAvatar}
            />
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên hiển thị</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên hiển thị"
              maxLength={100}
            />
          </div>

          {/* Bio Field */}
          <div className="space-y-2">
            <Label htmlFor="bio">Giới thiệu bản thân</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Viết vài dòng về bản thân..."
              maxLength={500}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/500
            </p>
          </div>

          {/* Account Info (Read-only) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile.email} disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Tên đăng nhập</Label>
              <Input
                value={profile.username}
                disabled
                className="bg-muted/50"
              />
            </div>
          </div>

          {/* Account Status */}
          <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Trạng thái xác thực:
              </span>
              {profile.isVerified ? (
                <span className="text-sm font-medium text-emerald-600">
                  Đã xác thực
                </span>
              ) : (
                <span className="text-sm font-medium text-yellow-600">
                  Chưa xác thực
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isSubmitting || isUploadingAvatar || isUploadingBanner}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
