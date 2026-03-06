import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RKDeamy Classes - Admin Dashboard",
  description: "Premium fee management dashboard for RKDeamy Classes administrators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
