import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Future Search-platform - Chat with internet",
  description:
    "Future Search is an AI powered that is connected to the internet",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} h-full`}
      >
        <Sidebar>{children}</Sidebar>
      </body>
    </html>
  );
}
