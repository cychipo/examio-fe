import HeaderSection from "@/components/molecules/HeaderSection";
import FooterSection from "@/components/organisms/FooterSection";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <HeaderSection />
      {children}
      <FooterSection />
    </div>
  );
}
