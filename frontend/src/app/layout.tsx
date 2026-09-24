import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";

export const metadata: Metadata = {
  title: "Lyrahub | The intelligence behind the AI department",
  description: "Centralize, evaluate, and elevate AI/ML talent. The single source of truth for student rankings, projects, and placements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased bg-canvas text-ink">
        {children}
      </body>
    </html>
  );
}
