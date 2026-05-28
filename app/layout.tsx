import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="nl" className="h-full">
      <body className="h-full bg-[#0D0D0D] text-white antialiased">
        {children}
        {/* Red border frame — fixed overlay, all pages */}
        <div style={{
          position: 'fixed',
          inset: 0,
          border: '15px solid #C8102E',
          pointerEvents: 'none',
          zIndex: 99999,
        }} />
      </body>
    </html>
  );
}
