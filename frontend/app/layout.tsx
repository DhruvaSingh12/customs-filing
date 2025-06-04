import type { Metadata } from "next";
import "./globals.css";
import { Session } from "@/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Customs Filing",
  description: "A simple customs filing system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Session>
          {children}
        </Session>
      </body>
    </html>
  );
}
