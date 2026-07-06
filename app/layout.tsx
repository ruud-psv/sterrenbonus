import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sterrenbonus",
  description: "Prijzentrekking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="h-full">
      <body className="h-full bg-[#0D0D0D] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
