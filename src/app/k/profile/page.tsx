"use client";

import { useState, useCallback, useEffect } from "react";
import { ProfileTemplate } from "@/templates/ProfileTemplate";
import { updateProfileApi, type UpdateProfileData } from "@/apis/profileApi";
import { useToast } from "@/components/ui/toast";
import { storeCache } from "@/lib/storeCache";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ProfilePage() {
  const { user, getUser, initializing } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch user data on mount if not already loaded
  useEffect(() => {
    if (!user && !initializing) {
      getUser();
    }
  }, [user, initializing, getUser]);

  const refreshUserData = useCallback(async () => {
    // Invalidate FE cache
    storeCache.invalidate("user");
    storeCache.invalidate("user-profile");
    // Refresh auth store to update sidebar and profile data
    await getUser();
  }, [getUser]);

  const handleUpdate = useCallback(
    async (data: UpdateProfileData) => {
      try {
        setIsSubmitting(true);
        await updateProfileApi(data);
        // Refresh auth store and invalidate cache
        await refreshUserData();
        toast.success("Cập nhật hồ sơ thành công!");
      } catch (error) {
        console.error("Failed to update profile:", error);
        toast.error("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [refreshUserData, toast]
  );

  if (initializing || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Map auth store user to profile format
  const profile = {
    id: String(user.id),
    email: user.email,
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    banner: user.banner,
    bio: user.bio,
    isVerified: user.isVerified,
    createdAt: String(user.createdAt),
    updatedAt: String(user.updatedAt),
  };

  return (
    <ProfileTemplate
      profile={profile}
      onUpdate={handleUpdate}
      onImageUploaded={refreshUserData}
      isSubmitting={isSubmitting}
    />
  );
}
