import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google';

const inter = Inter({
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Hyper Boops',
  description: 'Hyper Boops',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-black text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-xl font-bold">Hyper Boops - Test Header</h1>
          </div>
        </header>
        <main className="min-h-screen">{children}</main>
        <footer className="bg-black text-white p-4 mt-auto">
          <div className="container mx-auto">
            <p className="text-center">© 2023 Hyper Boops - Test Footer</p>
          </div>
        </footer>
      </body>
    </html>
  );
}