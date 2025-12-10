"use client";

import { ProfileForm } from "@/components/molecules/profile/ProfileForm";
import type { UserProfile, UpdateProfileData } from "@/apis/profileApi";

interface ProfileTemplateProps {
  profile: UserProfile;
  onUpdate: (data: UpdateProfileData) => Promise<void>;
  onImageUploaded?: () => Promise<void>;
  isSubmitting?: boolean;
}

export function ProfileTemplate({
  profile,
  onUpdate,
  onImageUploaded,
  isSubmitting = false,
}: ProfileTemplateProps) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 pt-8 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hồ sơ của bạn</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý thông tin cá nhân của bạn
        </p>
      </div>

      {/* Profile Form */}
      <ProfileForm
        profile={profile}
        onSubmit={onUpdate}
        onImageUploaded={onImageUploaded}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
