'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Wallet {
    _id: string;
    displayName: string | null;
    accountValue: number;
    stats: {
        roi_day: number;
        roi_week: number;
        roi_month: number;
        roi_allTime: number;
        pnl_day: number;
        pnl_week: number;
        pnl_month: number;
        pnl_allTime: number;
    };
    score?: { total: number };
    qualified?: boolean;
    tags?: Record<string, string>;
}

interface Portfolio {
    created_at: string;
    wallets: Array<{
        wallet: string;
        score: number;
        tags: string[];
        copy_mode: string;
    }>;
    meta: {
        style_distribution: Record<string, number>;
        region_distribution: Record<string, number>;
    };
}

export default function DashboardPage() {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshLimit, setRefreshLimit] = useState(10);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch wallets
            const walletsResponse = await fetch('/api/wallets');
            if (!walletsResponse.ok) {
                throw new Error(`Failed to fetch wallets: ${walletsResponse.statusText}`);
            }
            const walletsData = await walletsResponse.json();
            setWallets(walletsData.wallets || []);

            // Fetch latest portfolio
            const portfolioResponse = await fetch('/api/portfolios');
            if (portfolioResponse.ok) {
                const portfolioData = await portfolioResponse.json();
                if (portfolioData.portfolios && portfolioData.portfolios.length > 0) {
                    setPortfolio(portfolioData.portfolios[0]);
                }
            }
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setError(null);

        try {
            const response = await fetch('/api/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: refreshLimit })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to refresh data: ${response.statusText}`);
            }

            const result = await response.json();
            alert(`Refresh successful! Processed ${result.processed} wallets.`);

            // Reload data to show updated results
            await loadData();
        } catch (err) {
            console.error('Error refreshing data:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsRefreshing(false);
        }
    };

    const formatNumber = (num: number, decimals = 2) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    };

    const formatCurrency = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    const formatPercent = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Hyperliquid Wallet Analyzer</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}

            <div className="bg-white shadow-md rounded p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Manual Refresh</h2>
                <div className="flex items-end gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number of wallets to process
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={refreshLimit}
                            onChange={(e) => setRefreshLimit(Number(e.target.value))}
                            className="border rounded px-3 py-2 w-24"
                        />
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`px-4 py-2 rounded ${isRefreshing
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                    >
                        {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>
                <p className="text-sm text-gray-600">
                    This will fetch the latest leaderboard data and process detailed information for the top wallets.
                    Processing more wallets takes longer but provides more comprehensive analysis.
                </p>
            </div>

            {portfolio && (
                <div className="bg-white shadow-md rounded p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Latest Portfolio</h2>
                    <p className="mb-2">
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(portfolio.created_at).toLocaleString()}
                    </p>
                    <p className="mb-4">
                        <span className="font-medium">Wallets in portfolio:</span> {portfolio.wallets.length}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Style Distribution</h3>
                            <ul className="space-y-1">
                                {Object.entries(portfolio.meta.style_distribution).map(([style, count]) => (
                                    <li key={style} className="flex justify-between">
                                        <span className="capitalize">{style.replace('_', ' ')}</span>
                                        <span className="font-medium">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Region Distribution</h3>
                            <ul className="space-y-1">
                                {Object.entries(portfolio.meta.region_distribution).map(([region, count]) => (
                                    <li key={region} className="flex justify-between">
                                        <span className="capitalize">{region.replace('_', ' ')}</span>
                                        <span className="font-medium">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <h3 className="text-lg font-medium mt-6 mb-2">Portfolio Wallets</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-3 text-left">Wallet</th>
                                    <th className="py-2 px-3 text-center">Score</th>
                                    <th className="py-2 px-3 text-left">Copy Mode</th>
                                    <th className="py-2 px-3 text-left">Tags</th>
                                </tr>
                            </thead>
                            <tbody>
                                {portfolio.wallets.map((wallet) => (
                                    <tr key={wallet.wallet} className="border-t">
                                        <td className="py-2 px-3 font-mono text-sm">
                                            <Link href={`/dashboard/wallet/${wallet.wallet}`} className="text-blue-600 hover:underline">
                                                {wallet.wallet.substring(0, 10)}...
                                            </Link>
                                        </td>
                                        <td className="py-2 px-3 text-center">{wallet.score}</td>
                                        <td className="py-2 px-3 capitalize">{wallet.copy_mode}</td>
                                        <td className="py-2 px-3">
                                            <div className="flex flex-wrap gap-1">
                                                {wallet.tags.slice(0, 3).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 capitalize"
                                                    >
                                                        {tag.replace('_', ' ')}
                                                    </span>
                                                ))}
                                                {wallet.tags.length > 3 && (
                                                    <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                                                        +{wallet.tags.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-md rounded p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Wallet Rankings</h2>

                    <div className="flex gap-2">
                        <button
                            onClick={loadData}
                            disabled={isLoading}
                            className={`px-3 py-1 rounded text-sm ${isLoading
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                        >
                            {isLoading ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <p className="text-center py-4">Loading wallet data...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-3 text-left">Wallet</th>
                                    <th className="py-2 px-3 text-right">Account Value</th>
                                    <th className="py-2 px-3 text-right">ROI (Day)</th>
                                    <th className="py-2 px-3 text-right">ROI (Month)</th>
                                    <th className="py-2 px-3 text-right">Score</th>
                                    <th className="py-2 px-3 text-center">Qualified</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wallets
                                    .sort((a, b) => (b.score?.total || 0) - (a.score?.total || 0))
                                    .slice(0, 50)
                                    .map((wallet) => (
                                        <tr key={wallet._id} className="border-t hover:bg-gray-50">
                                            <td className="py-2 px-3 font-mono text-sm">
                                                <Link href={`/dashboard/wallet/${wallet._id}`} className="text-blue-600 hover:underline">
                                                    {wallet.displayName || wallet._id.substring(0, 10) + '...'}
                                                </Link>
                                            </td>
                                            <td className="py-2 px-3 text-right">
                                                {formatCurrency(wallet.accountValue)}
                                            </td>
                                            <td className="py-2 px-3 text-right">
                                                <span
                                                    className={
                                                        wallet.stats.roi_day > 0
                                                            ? 'text-green-600'
                                                            : wallet.stats.roi_day < 0
                                                                ? 'text-red-600'
                                                                : ''
                                                    }
                                                >
                                                    {formatPercent(wallet.stats.roi_day)}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-right">
                                                <span
                                                    className={
                                                        wallet.stats.roi_month > 0
                                                            ? 'text-green-600'
                                                            : wallet.stats.roi_month < 0
                                                                ? 'text-red-600'
                                                                : ''
                                                    }
                                                >
                                                    {formatPercent(wallet.stats.roi_month)}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-right font-medium">
                                                {wallet.score ? wallet.score.total : '-'}
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                                {wallet.qualified ? (
                                                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                                                        No
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                        {wallets.length === 0 && (
                            <p className="text-center py-4 text-gray-500">
                                No wallet data available. Click the refresh button to fetch data.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}