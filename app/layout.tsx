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
        {/* PSV red border frame — four strips so they can't be covered by page content */}
        <div style={{position:'fixed',top:0,left:0,right:0,height:15,background:'#C8102E',pointerEvents:'none',zIndex:99999}} />
        <div style={{position:'fixed',bottom:0,left:0,right:0,height:15,background:'#C8102E',pointerEvents:'none',zIndex:99999}} />
        <div style={{position:'fixed',top:0,left:0,bottom:0,width:15,background:'#C8102E',pointerEvents:'none',zIndex:99999}} />
        <div style={{position:'fixed',top:0,right:0,bottom:0,width:15,background:'#C8102E',pointerEvents:'none',zIndex:99999}} />
      </body>
    </html>
  );
}
