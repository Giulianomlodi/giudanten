'use client';

import { useState } from 'react';
import Link from 'next/link';

// Rinominato da Dashboard a Home per evitare confusione con il dashboard/page.tsx
export default function Home() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle data ingestion
  const handleIngest = async () => {
    setLoading(true);
    setStatus('Ingesting data from Hyperdash...');

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST'
      });

      const data = await response.json();
      setStatus(`Ingestion completed: ${data.count} wallets processed`);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle scoring
  const handleScore = async () => {
    setLoading(true);
    setStatus('Calculating wallet scores...');

    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      setStatus(`Scoring completed: ${data.count} wallets scored`);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle filtering
  const handleFilter = async () => {
    setLoading(true);
    setStatus('Filtering qualified wallets...');

    try {
      const response = await fetch('/api/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      setStatus(`Filtering completed: ${data.qualified_count} of ${data.count} wallets qualified`);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle tagging
  const handleTag = async () => {
    setLoading(true);
    setStatus('Generating behavior tags...');

    try {
      const response = await fetch('/api/tag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      setStatus(`Tagging completed: ${data.count} wallets tagged`);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle portfolio construction
  const handlePortfolio = async () => {
    setLoading(true);
    setStatus('Constructing optimal portfolio...');

    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST'
      });

      const data = await response.json();
      setStatus(`Portfolio construction completed: ${data.count} wallets selected`);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle complete pipeline
  const handleFullPipeline = async () => {
    setLoading(true);

    try {
      // Step 1: Ingesting data
      setStatus('Step 1/5: Ingesting data...');
      const controller1 = new AbortController();
      const timeoutId1 = setTimeout(() => controller1.abort(), 180000); // 3 minuti timeout
      
      try {
        const ingestResponse = await fetch('/api/ingest', { 
          method: 'POST',
          signal: controller1.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId1);
        
        if (!ingestResponse.ok) {
          let errorMessage = `Ingest API error: ${ingestResponse.status} ${ingestResponse.statusText}`;
          
          try {
            const errorData = await ingestResponse.json();
            if (errorData.error) {
              errorMessage += ` - ${errorData.error}`;
            }
            if (errorData.details) {
              console.error("Error details:", errorData.details);
            }
          } catch (e) {
            console.error("Failed to parse error response:", e);
          }
          
          throw new Error(errorMessage);
        }
        
        // Leggi e verifica la risposta
        const ingestData = await ingestResponse.json();
        console.log("Ingest step completed:", ingestData);
        
        if (!ingestData.success) {
          throw new Error(`Ingest operation failed: ${ingestData.error || "Unknown error"}`);
        }
        
        setStatus(`Step 1/5 completed: Ingested ${ingestData.count} wallets`);
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error("Ingest API request timed out after 3 minutes. Hyperliquid API might be experiencing delays.");
        }
        throw error;
      } finally {
        clearTimeout(timeoutId1);
      }

      // Implementazione simile per gli altri passaggi
      // Step 2: Calculating scores
      setStatus('Step 2/5: Calculating scores...');
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 60000);
      
      try {
        const scoreResponse = await fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
          signal: controller2.signal
        });
        
        if (!scoreResponse.ok) {
          const errorData = await scoreResponse.json().catch(() => null);
          throw new Error(`Score API error: ${scoreResponse.status} ${scoreResponse.statusText}${
            errorData?.error ? ` - ${errorData.error}` : ''
          }`);
        }
      } finally {
        clearTimeout(timeoutId2);
      }
      
      // Step 3: Filtering wallets
      setStatus('Step 3/5: Filtering wallets...');
      const controller3 = new AbortController();
      const timeoutId3 = setTimeout(() => controller3.abort(), 60000);
      
      try {
        const filterResponse = await fetch('/api/filter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
          signal: controller3.signal
        });
        
        if (!filterResponse.ok) {
          const errorData = await filterResponse.json().catch(() => null);
          throw new Error(`Filter API error: ${filterResponse.status} ${filterResponse.statusText}${
            errorData?.error ? ` - ${errorData.error}` : ''
          }`);
        }
      } finally {
        clearTimeout(timeoutId3);
      }
      
      // Step 4: Generating tags
      setStatus('Step 4/5: Generating tags...');
      const controller4 = new AbortController();
      const timeoutId4 = setTimeout(() => controller4.abort(), 60000);
      
      try {
        const tagResponse = await fetch('/api/tag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
          signal: controller4.signal
        });
        
        if (!tagResponse.ok) {
          const errorData = await tagResponse.json().catch(() => null);
          throw new Error(`Tag API error: ${tagResponse.status} ${tagResponse.statusText}${
            errorData?.error ? ` - ${errorData.error}` : ''
          }`);
        }
      } finally {
        clearTimeout(timeoutId4);
      }
      
      // Step 5: Constructing portfolio
      setStatus('Step 5/5: Constructing portfolio...');
      const controller5 = new AbortController();
      const timeoutId5 = setTimeout(() => controller5.abort(), 120000); // 120 secondi per portfolio
      
      try {
        const portfolioResponse = await fetch('/api/portfolio', { 
          method: 'POST',
          signal: controller5.signal
        });
        
        if (!portfolioResponse.ok) {
          const errorText = await portfolioResponse.text();
          let errorMessage = `Portfolio API error: ${portfolioResponse.status} ${portfolioResponse.statusText}`;
          
          try {
            // Prova a parsare il testo come JSON
            const errorData = JSON.parse(errorText);
            if (errorData.error) {
              errorMessage += ` - ${errorData.error}`;
            }
          } catch (e) {
            // Se non è JSON, usa il testo dell'errore
            if (errorText) {
              errorMessage += ` - ${errorText.substring(0, 100)}`;
            }
          }
          
          throw new Error(errorMessage);
        }
        
        const portfolioData = await portfolioResponse.json();
        setStatus(`Full pipeline completed: ${portfolioData.count || 0} wallets in portfolio`);
      } finally {
        clearTimeout(timeoutId5);
      }
    } catch (error) {
      console.error('Pipeline error:', error);
      if (error.name === 'AbortError') {
        setStatus(`Error in pipeline: signal timed out - L'operazione ha richiesto troppo tempo. Verifica la connessione a Hyperliquid API.`);
      } else {
        setStatus(`Error in pipeline: ${error instanceof Error ? error.message : String(error)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Hyperliquid Wallet Analyzer</h1>
        <p className="text-sm">Analysis system for top trader wallets</p>
      </header>

      <main className="max-w-6xl mx-auto mt-8 p-4">
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Run Analysis Pipeline</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Individual Steps</h3>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleIngest}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                  1. Ingest Data
                </button>
                <button
                  onClick={handleScore}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                  2. Calculate Scores
                </button>
                <button
                  onClick={handleFilter}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                  3. Filter Wallets
                </button>
                <button
                  onClick={handleTag}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                  4. Generate Tags
                </button>
                <button
                  onClick={handlePortfolio}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                  5. Construct Portfolio
                </button>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Full Pipeline</h3>
              <p className="text-sm text-gray-600 mb-4">
                Run the complete analysis pipeline from data ingestion to portfolio construction.
              </p>
              <button
                onClick={handleFullPipeline}
                disabled={loading}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
              >
                Run Full Pipeline
              </button>
            </div>
          </div>

          {/* Status display */}
          <div className="mt-4">
            <div className="font-medium mb-1">Status:</div>
            <div className="border rounded p-3 bg-gray-50 min-h-10">
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{status || 'Processing...'}</span>
                </div>
              ) : (
                <span>{status || 'Ready'}</span>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Data Exports</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Wallet Data</h3>
              <div className="flex flex-col space-y-2">
                <Link href="/api/ingest" className="text-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                  JSON Format
                </Link>
                <Link href="/api/ingest?format=csv" className="text-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                  CSV Format
                </Link>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Scoring Data</h3>
              <div className="flex flex-col space-y-2">
                <Link href="/api/score" className="text-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                  JSON Format
                </Link>
                <Link href="/api/score?format=csv" className="text-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                  CSV Format
                </Link>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Qualified Wallets</h3>
              <div className="flex flex-col space-y-2">
                <Link href="/api/filter?qualified=true" className="text-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                  JSON Format
                </Link>
                <Link href="/api/filter?qualified=true&format=csv" className="text-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                  CSV Format
                </Link>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Wallet Tags</h3>
              <div className="flex flex-col space-y-2">
                <Link href="/api/tag" className="text-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                  JSON Format
                </Link>
                <Link href="/api/tag?format=csv" className="text-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                  CSV Format
                </Link>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Portfolio</h3>
              <div className="flex flex-col space-y-2">
                <Link href="/api/portfolio" className="text-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                  JSON Format
                </Link>
                <Link href="/api/portfolio?format=csv" className="text-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                  CSV Format
                </Link>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Copy Modes</h3>
              <div className="flex flex-col space-y-2">
                <Link href="/api/portfolio?type=copymodes" className="text-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                  JSON Format
                </Link>
                <Link href="/api/portfolio?type=copymodes&format=csv" className="text-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                  CSV Format
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm">
            Hyperliquid Wallet Analyzer © {new Date().getFullYear()} - Built for the Hyperliquid ecosystem
          </p>
        </div>
      </footer>
    </div>
  );
}