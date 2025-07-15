import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/Providers/ToastProvider";

export const metadata: Metadata = {
  title: "Flamingo MVP V2",
  description: "협업 드로잉 솔루션",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="select-none">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
