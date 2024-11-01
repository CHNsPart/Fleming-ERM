import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "@/components/navbar/Footer";
import Header from "@/components/navbar/Header";
import { KindeProvider } from "@/components/auth/KindeProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: 'Equipment Request System',
  description: 'Streamline your equipment requests and manage resources efficiently',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <KindeProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Skip to main content
          </a>
          <Header />
          {children}
          <Footer />
        </body>
      </KindeProvider>
    </html>
  );
}
