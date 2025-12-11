"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  Smartphone,
  Tablet,
  Loader2,
  LogOut,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  getDevicesApi,
  logoutDeviceApi,
  logoutAllOthersApi,
  type Device,
} from "@/apis/devicesApi";
import { useToast } from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutingId, setLogoutingId] = useState<string | null>(null);
  const [isLogoutingAll, setIsLogoutingAll] = useState(false);
  const { toast } = useToast();

  const fetchDevices = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getDevicesApi();
      setDevices(result.devices);
    } catch (error) {
      console.error("Failed to fetch devices:", error);
      toast.error("Không thể tải danh sách thiết bị");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleLogoutDevice = async (sessionId: string) => {
    try {
      setLogoutingId(sessionId);
      await logoutDeviceApi(sessionId);
      toast.success("Đã đăng xuất thiết bị thành công");
      // Remove device from list
      setDevices((prev) => prev.filter((d) => d.id !== sessionId));
    } catch (error) {
      console.error("Failed to logout device:", error);
      toast.error("Không thể đăng xuất thiết bị");
    } finally {
      setLogoutingId(null);
    }
  };

  const handleLogoutAllOthers = async () => {
    try {
      setIsLogoutingAll(true);
      const result = await logoutAllOthersApi();
      toast.success(`Đã đăng xuất ${result.devicesLoggedOut} thiết bị khác`);
      // Keep only current device
      setDevices((prev) => prev.filter((d) => d.isCurrent));
    } catch (error) {
      console.error("Failed to logout all devices:", error);
      toast.error("Không thể đăng xuất các thiết bị khác");
    } finally {
      setIsLogoutingAll(false);
    }
  };

  const getDeviceIcon = (deviceName: string | null, os: string | null) => {
    const name = (deviceName || "").toLowerCase();
    const osLower = (os || "").toLowerCase();

    if (
      name.includes("iphone") ||
      name.includes("android") ||
      osLower.includes("ios") ||
      osLower.includes("android")
    ) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (name.includes("ipad") || name.includes("tablet")) {
      return <Tablet className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const otherDevicesCount = devices.filter((d) => !d.isCurrent).length;

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Thiết bị đã đăng nhập
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Thiết bị đã đăng nhập
          </CardTitle>

          {otherDevicesCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={isLogoutingAll}
                >
                  {isLogoutingAll ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <LogOut className="h-4 w-4 mr-2" />
                  )}
                  Đăng xuất thiết bị khác
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Xác nhận đăng xuất
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc muốn đăng xuất khỏi {otherDevicesCount} thiết bị
                    khác? Các phiên đăng nhập trên những thiết bị đó sẽ kết
                    thúc.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogoutAllOthers}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Đăng xuất tất cả
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý các thiết bị đang đăng nhập vào tài khoản của bạn
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {devices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Không có thiết bị nào đang đăng nhập
          </div>
        ) : (
          devices.map((device) => (
            <div
              key={device.id}
              className={`flex items-start gap-4 p-4 rounded-lg border ${
                device.isCurrent
                  ? "bg-primary/5 border-primary/20"
                  : "bg-muted/30 border-border/50"
              }`}
            >
              {/* Device Icon */}
              <div
                className={`p-2 rounded-lg ${
                  device.isCurrent
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {getDeviceIcon(device.deviceName, device.os)}
              </div>

              {/* Device Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">
                    {device.deviceName || "Thiết bị không xác định"}
                  </span>
                  {device.isCurrent && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      Thiết bị này
                    </span>
                  )}
                </div>

                <div className="mt-1 text-sm text-muted-foreground space-y-0.5">
                  <div>
                    {device.browser || "Không xác định"} •{" "}
                    {device.os || "Không xác định"}
                  </div>

                  {device.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {device.location}
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Hoạt động {device.lastActivity}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              {!device.isCurrent && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={logoutingId === device.id}
                    >
                      {logoutingId === device.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Đăng xuất khỏi thiết bị này?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Thiết bị:{" "}
                        {device.deviceName || "Không xác định"} (
                        {device.browser})
                        <br />
                        Phiên đăng nhập trên thiết bị này sẽ kết thúc.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleLogoutDevice(device.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Đăng xuất
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
