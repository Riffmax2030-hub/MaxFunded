import "./globals.css";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LiveTicker from "@/components/LiveTicker";
import ContactWidget from "@/components/ContactWidget";

export const metadata = {
  title: "MaxFunded — Trade to the Maximum. Zero Personal Risk.",
  description: "Next-generation proprietary trading evaluation firm. Trade simulated accounts up to $200,000, keep up to 90% of profits, and scale your capital.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#060709] text-neutral-100 antialiased selection:bg-[#ccff00] selection:text-black">
        <LiveTicker />
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <ContactWidget />
      </body>
    </html>
  );
}
