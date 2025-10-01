import HeaderSection from "@/components/molecules/HeaderSection";
import FooterSection from "@/components/organisms/FooterSection";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>

      {children}

    </div>
  );
}
