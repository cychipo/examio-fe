import { useState, useCallback, useEffect } from "react";
import { updateProfileApi, type UpdateProfileData } from "@/apis/profileApi";
import { useToast } from "@/components/ui/toast";
import { storeCache } from "@/lib/storeCache";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ProfilePage() {
  const { user, getUser, initializing } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user && !initializing) {
      getUser();
    }
  }, [user, initializing, getUser]);

  const refreshUserData = useCallback(async () => {
    storeCache.invalidate("user");
    storeCache.invalidate("user-profile");
    await getUser();
  }, [getUser]);

  const handleUpdate = useCallback(async (data: UpdateProfileData) => {
    try {
      setIsSubmitting(true);
      await updateProfileApi(data);
      await refreshUserData();
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshUserData, toast]);

  if (initializing || !user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

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
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ</h1>
        <p className="text-muted-foreground">Quản lý thông tin tài khoản của bạn.</p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <div>
            <div className="text-sm text-muted-foreground">Tên hiển thị</div>
            <div className="font-medium">{profile.name || profile.username}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium">{profile.email}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Username</div>
            <div className="font-medium">{profile.username}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Trạng thái xác minh</div>
            <div className="font-medium">{profile.isVerified ? "Đã xác minh" : "Chưa xác minh"}</div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => handleUpdate({ name: profile.name, bio: profile.bio })}
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? "Đang lưu..." : "Làm mới hồ sơ"}
          </button>
        </div>
      </div>
    </div>
  );
}
