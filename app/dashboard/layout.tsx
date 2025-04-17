import { ReactNode } from 'react';

export default function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Hyperliquid Wallet Analyzer</h1>
          <p className="text-sm text-blue-100">Analyze trader performance on Hyperliquid</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-gray-300 py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>Hyperliquid Wallet Analyzer &copy; {new Date().getFullYear()}</p>
          <p className="text-gray-400 mt-1">
            Data is provided by the Hyperliquid API and is updated periodically.
          </p>
        </div>
      </footer>
    </div>
  );
}