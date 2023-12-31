import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { Toaster } from "~/components/ui/toaster";
import "./globals.css";
import { Navbar } from "~/components/util/navbar";
import { cn } from "~/lib/utils";
import Providers from "./providers";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Auth Frontend",
  description: "Frontend user authentication",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Toaster />
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
