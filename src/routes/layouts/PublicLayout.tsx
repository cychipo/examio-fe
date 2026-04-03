import type { PropsWithChildren } from "react";
import HeaderSection from "@/components/molecules/HeaderSection";
import FooterSection from "@/components/organisms/FooterSection";

export function PublicLayout({ children }: PropsWithChildren) {
  return (
    <div>
      <HeaderSection />
      {children}
      <FooterSection />
    </div>
  );
}
