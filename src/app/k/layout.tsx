import { SidebarKit } from "@/components/organisms/k/SideBar";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Sparkles, LogOut, Settings, CreditCard, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const metadata: Metadata = {
  title: "Examio - Quản lý",
  description: "Nền tảng ôn tập và thi trực tuyến hỗ trợ bởi AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full min-h-screen flex-1 overflow-x-hidden overflow-y-auto rounded-md md:flex-row flex-col",
      )}
    >
      <div className="fixed bg-background h-[calc(100%)] md:w-20 w-0">
        <SidebarKit />
      </div>
      <div className="w-full md:ml-20 m-0">
        {/* Header */}
        <header
          className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80 "
          style={{ width: "100%" }}
        >
          <div className="container mx-auto py-4 px-2 w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center md:w-10 md:h-10 h-7 w-7 rounded-lg bg-primary/10 border border-primary/20">
                  <Sparkles className="md:w-5 md:h-5 w-4 h-4 text-primary" />
                </div>
                <div>
                  <h1 className="md:text-xl font-bold text-foreground text-sm">
                    AI Study Generator
                  </h1>
                  <p className="text-xs text-muted-foreground">Powered by AI</p>
                </div>
              </div>

              <div className="flex items-center md:gap-x-6 gap-x-2">
                <div className="border p-2 rounded-xl md:text-sm text-xs text-nowrap font-semibold cursor-pointer">
                  200 Credits
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="w-10 h-10 cursor-pointer">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-fit" align="center">
                    <DropdownMenuLabel className="font-semibold">
                      Tài khoản
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <User className="h-4 w-4" />
                        Hồ sơ
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CreditCard className="h-4 w-4" />
                        Thanh toán
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4" />
                        Cài đặt
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      <LogOut className="h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
