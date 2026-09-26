import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "RiffMax Funding — Trade Your Strategy. Prove Your Skill.",
  description: "Global proprietary trading evaluation firm. Trade simulated accounts, pass the challenge, and earn eligible performance rewards.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-dark-900 text-gray-100 antialiased selection:bg-brand-600 selection:text-white">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
