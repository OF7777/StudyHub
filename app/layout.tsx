import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SleepReminder from "@/components/sleep-reminder";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "StudyHub",
  description:
    "Your all-in-one study companion. Organize notes, track progress, and master any subject.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {children}
        <SleepReminder />
      </body>
    </html>
  );
}
