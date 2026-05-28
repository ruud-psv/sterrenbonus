import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sterrenbonus — PSV",
  description: "PSV Sterrenbonus prijzentrekking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${inter.variable} h-full`}>
      <body className="h-full bg-[#0A0A1A] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
