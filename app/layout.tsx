import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import MainWrapper from "@/components/MainWrapper";
import WelcomeToast from "@/components/WelcomeToast";
import AIChatbot from "@/components/AIChatbot";
import { Toaster } from "@/components/ui/sonner";
import '@fontsource/fraunces';
import '@fontsource/inter';
import '@fontsource/ibm-plex-mono';

export const metadata: Metadata = {
  title: "BoiStore",
  description: "Virtual PDF Bookstore",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F5F2EC] text-[#1A1D1E] min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <MainWrapper>{children}</MainWrapper>
          <Footer />
          <WelcomeToast />
          <AIChatbot />
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}