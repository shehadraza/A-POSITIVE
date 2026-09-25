import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A-POSITIVE | Premium Fashion",
  description:
    "A modern fashion destination bringing multiple identities together under one roof.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}