import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "School Management dApp",
  description: "Professional school management frontend connected to the on-chain student and staff contracts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
