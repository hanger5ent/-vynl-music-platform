import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { BetaBanner } from "@/components/ui/BetaBanner";
import FeedbackWidget from "@/components/testing/FeedbackWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vynl - Music Streaming Platform",
  description: "The premier invite-only music streaming platform for artists and music lovers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <BetaBanner />
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster position="bottom-right" />
            <FeedbackWidget isTestingMode={true} />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
