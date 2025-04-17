import type { Metadata } from "next";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';

const inter = Inter({
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Hyper Boops',
  description: 'Hyper Boops',
  openGraph: {
    title: 'Hyper Boops',
    description: 'Hyper Boops',
    url: '',
    siteName: 'Hyper Boops',
    images: [
      {
        url: '/images/Logo.png',
        width: 1200,
        height: 630,
        alt: 'Hyper Boops',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hyper Boops',
    description: 'Hyper Boops',
    images: ['/images/Logo.png'],
    creator: '@hyperboops',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>

        <Header />
        {children}
        <Footer />
        <Toaster />

      </body>
    </html>
  );
}