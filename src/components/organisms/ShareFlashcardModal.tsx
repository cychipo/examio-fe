"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Copy,
  RefreshCw,
  Link2,
  Lock,
  Globe,
  Users,
  X,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  getSharingSettings,
  updateSharingSettings,
  generateAccessCode,
  searchUsersForWhitelist,
  SearchUser,
} from "@/apis/flashcardSetApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ShareFlashcardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flashcardSetId: string;
  flashcardSetTitle: string;
}

type PrivateAccessType = "code" | "whitelist";

// Type for whitelist user info (stored in state)
type WhitelistUser = {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
};

export function ShareFlashcardModal({
  open,
  onOpenChange,
  flashcardSetId,
  flashcardSetTitle: _flashcardSetTitle,
}: ShareFlashcardModalProps) {
  const [isPublic, setIsPublic] = useState(true);
  const [privateAccessType, setPrivateAccessType] =
    useState<PrivateAccessType>("code");
  const [accessCode, setAccessCode] = useState<string>("");
  const [whitelistUsers, setWhitelistUsers] = useState<WhitelistUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // User search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/study-flashcard/${flashcardSetId}`
      : "";

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const settings = await getSharingSettings(flashcardSetId);
      setIsPublic(settings.isPublic);
      setAccessCode(settings.accessCode || "");
      // Convert whitelist IDs to WhitelistUser objects
      // For now, just store IDs - actual user info will be fetched when needed
      setWhitelistUsers(
        (settings.whitelist || []).map((id) => ({
          id,
          username: id,
          name: null,
          avatar: null,
        }))
      );
      if (!settings.isPublic) {
        setPrivateAccessType(settings.accessCode ? "code" : "whitelist");
      }
    } catch (error) {
      console.error("Failed to fetch sharing settings:", error);
      toast.error("Không thể tải cài đặt chia sẻ");
    } finally {
      setLoading(false);
    }
  }, [flashcardSetId]);

  // Fetch current settings when modal opens
  useEffect(() => {
    if (open && flashcardSetId) {
      fetchSettings();
    }
  }, [open, flashcardSetId, fetchSettings]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    // Debounce search - 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        setShowSearchDropdown(true);
        const results = await searchUsersForWhitelist(value);
        // Filter out already added users
        const filteredResults = results.filter(
          (user) => !whitelistUsers.some((u) => u.id === user.id)
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Failed to search users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelectUser = (user: SearchUser) => {
    if (!whitelistUsers.some((u) => u.id === user.id)) {
      setWhitelistUsers([
        ...whitelistUsers,
        {
          id: user.id,
          username: user.username,
          name: user.name,
          avatar: user.avatar,
        },
      ]);
    }
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  const handleRemoveUser = (userId: string) => {
    setWhitelistUsers(whitelistUsers.filter((u) => u.id !== userId));
  };

  const handleGenerateCode = async () => {
    try {
      const result = await generateAccessCode(flashcardSetId);
      setAccessCode(result.accessCode);
      toast.success("Đã tạo mã truy cập mới");
    } catch (error) {
      console.error("Failed to generate code:", error);
      toast.error("Không thể tạo mã truy cập");
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSharingSettings(flashcardSetId, {
        isPublic,
        accessCode:
          !isPublic && privateAccessType === "code" ? accessCode : null,
        whitelist:
          !isPublic && privateAccessType === "whitelist"
            ? whitelistUsers.map((u) => u.id)
            : [],
      });
      toast.success("Đã lưu cài đặt chia sẻ");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save sharing settings:", error);
      toast.error("Không thể lưu cài đặt chia sẻ");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Đã sao chép liên kết");
  }, [shareUrl]);

  const handleCopyCode = useCallback(() => {
    if (accessCode) {
      navigator.clipboard.writeText(accessCode);
      toast.success("Đã sao chép mã truy cập");
    }
  }, [accessCode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Chia sẻ bộ thẻ
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Share link */}
            <div className="space-y-2">
              <Label>Liên kết chia sẻ</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Public/Private toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  {isPublic ? (
                    <Globe className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-orange-600" />
                  )}
                  {isPublic ? "Công khai" : "Riêng tư"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isPublic
                    ? "Bất kỳ ai có liên kết đều có thể xem"
                    : "Chỉ những người được phép mới có thể xem"}
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            {/* Private access options */}
            {!isPublic && (
              <div className="space-y-4 border-t pt-4">
                <Label>Phương thức truy cập</Label>
                <RadioGroup
                  value={privateAccessType}
                  onValueChange={(v) =>
                    setPrivateAccessType(v as PrivateAccessType)
                  }>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="code" id="code" />
                    <Label htmlFor="code" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Mã truy cập 6 số
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="whitelist" id="whitelist" />
                    <Label
                      htmlFor="whitelist"
                      className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Danh sách được phép
                    </Label>
                  </div>
                </RadioGroup>

                {/* Access code section */}
                {privateAccessType === "code" && (
                  <div className="space-y-2">
                    <Label>Mã truy cập</Label>
                    <div className="flex gap-2">
                      <Input
                        value={accessCode}
                        readOnly
                        placeholder="Chưa có mã"
                        className="font-mono text-lg tracking-widest"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyCode}
                        disabled={!accessCode}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleGenerateCode}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Người dùng cần nhập mã này để xem bộ thẻ
                    </p>
                  </div>
                )}

                {/* Whitelist section */}
                {privateAccessType === "whitelist" && (
                  <div className="space-y-3">
                    <Label>Danh sách người dùng được phép</Label>

                    {/* Search input with dropdown */}
                    <div className="relative" ref={searchContainerRef}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          placeholder="Tìm kiếm theo username, tên hoặc email..."
                          className="pl-9"
                          onFocus={() =>
                            searchQuery.length >= 2 &&
                            setShowSearchDropdown(true)
                          }
                        />
                        {isSearching && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>

                      {/* Search results dropdown */}
                      {showSearchDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-auto">
                          {isSearching ? (
                            <div className="p-3 text-center text-sm text-muted-foreground">
                              Đang tìm kiếm...
                            </div>
                          ) : searchResults.length > 0 ? (
                            searchResults.map((user) => (
                              <button
                                key={user.id}
                                onClick={() => handleSelectUser(user)}
                                className="w-full flex items-center gap-3 p-2 hover:bg-accent text-left transition-colors">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatar || undefined} />
                                  <AvatarFallback>
                                    {(user.name ||
                                      user.username ||
                                      "U")[0].toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {user.name || user.username}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    @{user.username} • {user.email}
                                  </p>
                                </div>
                              </button>
                            ))
                          ) : searchQuery.length >= 2 ? (
                            <div className="p-3 text-center text-sm text-muted-foreground">
                              Không tìm thấy người dùng
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Selected users list */}
                    {whitelistUsers.length > 0 && (
                      <div className="space-y-2 mt-3">
                        <p className="text-xs text-muted-foreground">
                          {whitelistUsers.length} người dùng được phép
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {whitelistUsers.map((user) => (
                            <div
                              key={user.id}
                              className="inline-flex items-center gap-2 px-2 py-1 bg-muted rounded-full text-sm">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={user.avatar || undefined} />
                                <AvatarFallback className="text-[10px]">
                                  {(user.name ||
                                    user.username ||
                                    "U")[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="max-w-[120px] truncate">
                                {user.name || user.username}
                              </span>
                              <button
                                onClick={() => handleRemoveUser(user.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Đang lưu..." : "Lưu cài đặt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
