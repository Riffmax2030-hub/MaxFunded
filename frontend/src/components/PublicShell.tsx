"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LiveTicker from "@/components/LiveTicker";
import ContactWidget from "@/components/ContactWidget";
import CookieConsentBanner from "@/components/CookieConsentBanner";

export default function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Admin routes use their own sidebar layout — suppress the public shell
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <LiveTicker />
      <Navbar />
      {/* Spacer: LiveTicker (~36px) + fixed Navbar (72px) = 108px */}
      <div style={{ height: "108px" }} aria-hidden="true" />
      <main className="flex-grow">{children}</main>
      <Footer />
      <ContactWidget />
      <CookieConsentBanner />
    </>
  );
}
