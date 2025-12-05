"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, X, Search, Users } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { searchUsersForWhitelistApi } from "@/apis/examSessionApi";
import { cn } from "@/lib/utils";

export interface WhitelistUser {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
  email: string;
}

interface UserSearchInputProps {
  selectedUsers: WhitelistUser[];
  onUsersChange: (users: WhitelistUser[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * User search input with debounce for whitelist management
 * Follows Atomic Design - Molecule level
 */
export function UserSearchInput({
  selectedUsers,
  onUsersChange,
  placeholder = "Tìm người dùng theo tên hoặc email...",
  disabled = false,
}: UserSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WhitelistUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 500);

  // Search users when debounced query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchUsersForWhitelistApi(debouncedQuery);
        // Filter out already selected users
        const filteredResults = results.filter(
          (user) => !selectedUsers.some((selected) => selected.id === user.id)
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Failed to search users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [debouncedQuery, selectedUsers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectUser = (user: WhitelistUser) => {
    onUsersChange([...selectedUsers, user]);
    setSearchQuery("");
    setSearchResults([]);
    setIsOpen(false);
  };

  const handleRemoveUser = (userId: string) => {
    onUsersChange(selectedUsers.filter((user) => user.id !== userId));
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Selected users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <Badge
              key={user.id}
              variant="secondary"
              className="flex items-center gap-2 py-1.5 px-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="text-xs">
                  {user.name?.[0] || user.username[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{user.name || user.username}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => handleRemoveUser(user.id)}
                disabled={disabled}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
            className="pl-9"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search results dropdown */}
        {isOpen &&
          (searchResults.length > 0 ||
            (debouncedQuery.length >= 2 && !isSearching)) && (
            <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto shadow-lg">
              {searchResults.length > 0 ? (
                <div className="py-1">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted transition-colors"
                      )}
                      onClick={() => handleSelectUser(user)}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback>
                          {user.name?.[0] || user.username[0]}
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
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 text-muted-foreground">
                  <Users className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Không tìm thấy người dùng</p>
                </div>
              )}
            </Card>
          )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        Nhập ít nhất 2 ký tự để tìm kiếm. Chọn người dùng để thêm vào danh sách.
      </p>
    </div>
  );
}
