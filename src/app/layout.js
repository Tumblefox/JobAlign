// import type { Metadata } from "next";
import '@shoelace-style/shoelace/dist/themes/light.css';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ShoelaceSetup from "./shoelace-setup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "JobAlign",
  description: "Match your work experience to a job description with AI tools.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ShoelaceSetup>
          {children}
        </ShoelaceSetup>
      </body>
    </html>
  );
}
