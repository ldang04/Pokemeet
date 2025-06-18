import type { Metadata } from "next";
import { Pixelify_Sans, Orbitron } from "next/font/google";
import "./globals.css";

const pixelifySans = Pixelify_Sans({
  variable: "--font-pixelify-sans",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokémeet - Pokemon Dating App",
  description: "Meet your perfect Pokemon trainer partner at the Pokemon Center!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pixelifySans.variable} ${orbitron.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
