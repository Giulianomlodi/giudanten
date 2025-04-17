'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface WalletDetail {
    _id: string;
    displayName: string | null;
    accountValue: number;
    withdrawable?: number;
    lastUpdated: string;
    stats: {
        roi_day: number;
        roi_week: number;
        roi_month: number;
        roi_allTime: number;
        pnl_day: number;
        pnl_week: number;
        pnl_month: number;
        pnl_allTime: number;
        volume_day: number;
        volume_week: number;
        volume_month: number;
        volume_allTime: number;
        total_trades?: number;
        win_rate?: number;
    };
    score?: {
        total: number;
        components: {
            roi_30d: number;
            win_rate: number;
            pnl_per_trade: number;
            leverage_avg: number;
            drawdown: number;
            consistency: number;
            frequency: number;
            post_loss: number;
            roi_trend: number;
        };
    };
    tags?: {
        style?: string;
        behavior?: string;
        time_pattern?: string;
        utc_zone?: string;
        continent?: string;
        asset_focus?: string;
        directional_bias?: string;
        direction_percent?: string;
    };
    positions?: {
        coin: string;
        size: number;
        leverage: number;
        entry_price: number;
        position_value: number;
        unrealized_pnl: number;
        roi: number;
        margin_used: number;
    }[];
    qualified?: boolean;
    copy_mode?: string;
    limits?: {
        max_leverage: number;
        max_position_pct: number;
    };
}

interface Trade {
    _id?: string;
    wallet: string;
    coin: string;
    side: string;
    size: number;
    price: number;
    timestamp: string;
    leverage: number;
    closed_pnl: number;
    type: string;
    trade_value_usd: number;
}

export default function WalletDetailPage() {
    const params = useParams();
    const address = params.address as string;

    const [wallet, setWallet] = useState<WalletDetail | null>(null);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (address) {
            loadWalletData();
        }
    }, [address]);

    const loadWalletData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/wallets/${address}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch wallet data: ${response.statusText}`);
            }

            const data = await response.json();
            setWallet(data.wallet);
            setTrades(data.trades || []);
        } catch (err) {
            console.error('Error loading wallet data:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsLoading(false);
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

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white shadow-md rounded p-6">
                    <p className="text-center">Loading wallet data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p><strong>Error:</strong> {error}</p>
                </div>
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                    &larr; Back to Dashboard
                </Link>
            </div>
        );
    }

    if (!wallet) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white shadow-md rounded p-6">
                    <p className="text-center">Wallet not found</p>
                </div>
                <div className="mt-4">
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        &larr; Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-4">
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                    &larr; Back to Dashboard
                </Link>
            </div>

            <div className="bg-white shadow-md rounded p-6 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {wallet.displayName || 'Anonymous Trader'}
                        </h1>
                        <p className="font-mono text-sm text-gray-500 mt-1">{wallet._id}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Last updated: {new Date(wallet.lastUpdated).toLocaleString()}
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0">
                        <div className="text-right">
                            <p className="text-lg">
                                <span className="font-medium">Score:</span>{' '}
                                <span className="text-xl font-bold">{wallet.score?.total || '-'}</span>
                            </p>
                            <p>
                                <span className="font-medium">Qualified:</span>{' '}
                                <span
                                    className={`${wallet.qualified ? 'text-green-600' : 'text-red-600'
                                        } font-medium`}
                                >
                                    {wallet.qualified ? 'Yes' : 'No'}
                                </span>
                            </p>
                            {wallet.copy_mode && (
                                <p>
                                    <span className="font-medium">Copy Mode:</span>{' '}
                                    <span className="capitalize">{wallet.copy_mode}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Account Summary</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between py-1 border-b">
                                <span>Account Value</span>
                                <span className="font-medium">{formatCurrency(wallet.accountValue)}</span>
                            </div>
                            {wallet.withdrawable !== undefined && (
                                <div className="flex justify-between py-1 border-b">
                                    <span>Withdrawable</span>
                                    <span className="font-medium">{formatCurrency(wallet.withdrawable)}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-1 border-b">
                                <span>Total Trades</span>
                                <span className="font-medium">{wallet.stats.total_trades || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                                <span>Win Rate</span>
                                <span className="font-medium">
                                    {wallet.stats.win_rate !== undefined
                                        ? formatPercent(wallet.stats.win_rate / 100)
                                        : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-3">Performance</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between py-1 border-b">
                                <span>ROI (Day)</span>
                                <span
                                    className={`font-medium ${wallet.stats.roi_day > 0
                                            ? 'text-green-600'
                                            : wallet.stats.roi_day < 0
                                                ? 'text-red-600'
                                                : ''
                                        }`}
                                >
                                    {formatPercent(wallet.stats.roi_day)}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                                <span>ROI (Week)</span>
                                <span
                                    className={`font-medium ${wallet.stats.roi_week > 0
                                            ? 'text-green-600'
                                            : wallet.stats.roi_week < 0
                                                ? 'text-red-600'
                                                : ''
                                        }`}
                                >
                                    {formatPercent(wallet.stats.roi_week)}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                                <span>ROI (Month)</span>
                                <span
                                    className={`font-medium ${wallet.stats.roi_month > 0
                                            ? 'text-green-600'
                                            : wallet.stats.roi_month < 0
                                                ? 'text-red-600'
                                                : ''
                                        }`}
                                >
                                    {formatPercent(wallet.stats.roi_month)}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                                <span>ROI (All Time)</span>
                                <span
                                    className={`font-medium ${wallet.stats.roi_allTime > 0
                                            ? 'text-green-600'
                                            : wallet.stats.roi_allTime < 0
                                                ? 'text-red-600'
                                                : ''
                                        }`}
                                >
                                    {formatPercent(wallet.stats.roi_allTime)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {wallet.score?.components && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">Score Components</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(wallet.score.components).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="bg-gray-50 p-3 rounded border"
                                >
                                    <div className="text-sm text-gray-500 capitalize">
                                        {key.replace(/_/g, ' ')}
                                    </div>
                                    <div className="font-medium">{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {wallet.tags && Object.keys(wallet.tags).length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">Trader Profile</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(wallet.tags)
                                .filter(([_, value]) => value)
                                .map(([key, value]) => (
                                    <div key={key} className="bg-blue-50 p-3 rounded border border-blue-100">
                                        <div className="text-sm text-blue-500 capitalize">
                                            {key.replace(/_/g, ' ')}
                                        </div>
                                        <div className="font-medium capitalize">
                                            {value?.replace(/_/g, ' ')}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {wallet.positions && wallet.positions.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">Current Positions</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="py-2 px-3 text-left">Coin</th>
                                        <th className="py-2 px-3 text-right">Size</th>
                                        <th className="py-2 px-3 text-right">Entry Price</th>
                                        <th className="py-2 px-3 text-right">Value</th>
                                        <th className="py-2 px-3 text-right">Leverage</th>
                                        <th className="py-2 px-3 text-right">Unrealized PnL</th>
                                        <th className="py-2 px-3 text-right">ROI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {wallet.positions.map((position, idx) => (
                                        <tr key={`${position.coin}-${idx}`} className="border-t">
                                            <td className="py-2 px-3 font-medium">{position.coin}</td>
                                            <td className="py-2 px-3 text-right">
                                                <span
                                                    className={position.size > 0 ? 'text-green-600' : 'text-red-600'}
                                                >
                                                    {formatNumber(position.size)}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-right">{formatNumber(position.entry_price)}</td>
                                            <td className="py-2 px-3 text-right">{formatCurrency(position.position_value)}</td>
                                            <td className="py-2 px-3 text-right">{position.leverage}x</td>
                                            <td className="py-2 px-3 text-right">
                                                <span
                                                    className={
                                                        position.unrealized_pnl > 0
                                                            ? 'text-green-600'
                                                            : position.unrealized_pnl < 0
                                                                ? 'text-red-600'
                                                                : ''
                                                    }
                                                >
                                                    {formatCurrency(position.unrealized_pnl)}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-right">
                                                <span
                                                    className={
                                                        position.roi > 0
                                                            ? 'text-green-600'
                                                            : position.roi < 0
                                                                ? 'text-red-600'
                                                                : ''
                                                    }
                                                >
                                                    {formatPercent(position.roi)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white shadow-md rounded p-6">
                <h2 className="text-lg font-semibold mb-3">Recent Trades</h2>

                {trades.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-3 text-left">Time</th>
                                    <th className="py-2 px-3 text-left">Coin</th>
                                    <th className="py-2 px-3 text-left">Side</th>
                                    <th className="py-2 px-3 text-right">Size</th>
                                    <th className="py-2 px-3 text-right">Price</th>
                                    <th className="py-2 px-3 text-right">Leverage</th>
                                    <th className="py-2 px-3 text-right">Value</th>
                                    <th className="py-2 px-3 text-right">Closed PnL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trades.map((trade, idx) => (
                                    <tr key={idx} className="border-t">
                                        <td className="py-2 px-3 text-sm">
                                            {new Date(trade.timestamp).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-3">{trade.coin}</td>
                                        <td className="py-2 px-3">
                                            <span
                                                className={`px-2 py-1 text-xs rounded ${trade.side === 'B'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {trade.side === 'B' ? 'BUY' : 'SELL'}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 text-right">{formatNumber(trade.size)}</td>
                                        <td className="py-2 px-3 text-right">{formatNumber(trade.price)}</td>
                                        <td className="py-2 px-3 text-right">{trade.leverage}x</td>
                                        <td className="py-2 px-3 text-right">{formatCurrency(trade.trade_value_usd)}</td>
                                        <td className="py-2 px-3 text-right">
                                            <span
                                                className={
                                                    trade.closed_pnl > 0
                                                        ? 'text-green-600'
                                                        : trade.closed_pnl < 0
                                                            ? 'text-red-600'
                                                            : ''
                                                }
                                            >
                                                {formatCurrency(trade.closed_pnl)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center py-4 text-gray-500">No trade history available.</p>
                )}
            </div>
        </div>
    );
}