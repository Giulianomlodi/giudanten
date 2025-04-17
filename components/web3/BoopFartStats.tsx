// components/web3/BoopFartStats.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Wind, Flame, Trophy, Clock, Award } from 'lucide-react';

// Define types
interface NFT {
    tokenId: number;
    fartCount: number;
    lastFartTime?: number;
}

interface UserStats {
    totalFarts: number;
    topFarter: NFT | null;
    averageFartsPerBoop: number;
    personalRank: number | null;
    totalBoops: number;
}

const BoopFartStats = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [stats, setStats] = useState<UserStats>({
        totalFarts: 0,
        topFarter: null,
        averageFartsPerBoop: 0,
        personalRank: null,
        totalBoops: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [achievementUnlocked, setAchievementUnlocked] = useState<string | null>(null);

    const { address, isConnected } = useAccount();

    // Calculate user stats from NFT data
    const calculateStats = async () => {
        if (!isConnected || !address) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            // Fetch leaderboard first to get global rankings
            const leaderboardResponse = await fetch('/api/getFartLeaderboard');
            const leaderboardData = await leaderboardResponse.json();

            if (!leaderboardData.success) {
                throw new Error('Failed to fetch leaderboard');
            }

            // Get user's NFTs with their fart counts
            const nftsWithFarts: NFT[] = [];
            let personalRank = null;
            let totalFarts = 0;

            // Find user's NFTs in the leaderboard and determine rank
            const userEntries = leaderboardData.leaderboard.filter(
                (entry: any) => entry.owner.toLowerCase() === address.toLowerCase()
            );

            // If we found user entries in the leaderboard
            if (userEntries.length > 0) {
                // Calculate total farts across all user's Boops
                totalFarts = userEntries.reduce((sum: number, entry: any) => sum + entry.fartCount, 0);

                // Map to our NFT format
                userEntries.forEach((entry: any) => {
                    nftsWithFarts.push({
                        tokenId: entry.tokenIdNumber,
                        fartCount: entry.fartCount,
                        lastFartTime: entry.lastFartTime
                    });
                });

                // Find the user's best ranked Boop
                const bestBoop = userEntries.reduce((best: any, current: any) => {
                    const bestRank = leaderboardData.leaderboard.findIndex(
                        (e: any) => e.tokenId === best?.tokenId
                    );
                    const currentRank = leaderboardData.leaderboard.findIndex(
                        (e: any) => e.tokenId === current.tokenId
                    );
                    return bestRank < currentRank ? best : current;
                }, userEntries[0]);

                if (bestBoop) {
                    personalRank = leaderboardData.leaderboard.findIndex(
                        (e: any) => e.tokenId === bestBoop.tokenId
                    ) + 1;
                }
            } else {
                // If no entries in leaderboard, fetch from direct API calls
                // This is a fallback when user has NFTs but hasn't farted yet

                // Get balance first (limit API calls to conserve RPC)
                const balanceResponse = await fetch(`/api/getBalance?address=${address}`);
                if (balanceResponse.ok) {
                    const balanceData = await balanceResponse.json();
                    const balance = Number(balanceData.balance);

                    if (balance > 0) {
                        // Get limited number of tokens to reduce RPC load
                        const maxTokensToFetch = Math.min(balance, 5);

                        for (let i = 0; i < maxTokensToFetch; i++) {
                            try {
                                const tokenResponse = await fetch(`/api/getTokenOfOwnerByIndex?owner=${address}&index=${i}`);

                                if (tokenResponse.ok) {
                                    const tokenData = await tokenResponse.json();
                                    const tokenId = Number(tokenData.tokenIdNumber || tokenData.tokenId);

                                    if (!isNaN(tokenId)) {
                                        // Get fart count
                                        const fartResponse = await fetch(`/api/getFartCount?tokenId=${tokenId}`);
                                        if (fartResponse.ok) {
                                            const fartData = await fartResponse.json();
                                            const fartCount = Number(fartData.fartCount);

                                            nftsWithFarts.push({
                                                tokenId: tokenId,
                                                fartCount: fartCount
                                            });

                                            totalFarts += fartCount;
                                        }
                                    }
                                }
                            } catch (err) {
                                console.error('Error fetching token data:', err);
                            }
                        }
                    }
                }
            }

            // Find top farter among user's NFTs
            const topFarter = nftsWithFarts.length > 0
                ? nftsWithFarts.reduce((max, nft) => nft.fartCount > max.fartCount ? nft : max, nftsWithFarts[0])
                : null;

            // Calculate average farts per Boop
            const averageFartsPerBoop = nftsWithFarts.length > 0
                ? totalFarts / nftsWithFarts.length
                : 0;

            // Update stats
            setStats({
                totalFarts,
                topFarter,
                averageFartsPerBoop,
                personalRank,
                totalBoops: nftsWithFarts.length
            });

            // Check for achievements
            if (totalFarts >= 50) {
                setAchievementUnlocked('Gassy Legend');
            } else if (totalFarts >= 25) {
                setAchievementUnlocked('Fart Master');
            } else if (totalFarts >= 10) {
                setAchievementUnlocked('Fart Enthusiast');
            } else if (totalFarts >= 1) {
                setAchievementUnlocked('First Fart');
            }

        } catch (err) {
            console.error('Error calculating stats:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Effects
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && isConnected) {
            calculateStats();
        }
    }, [isMounted, isConnected, address]);

    if (!isMounted) return null;

    // Get rank color based on position
    const getRankColor = (rank: number | null): string => {
        if (!rank) return 'text-white/70';
        if (rank <= 3) return 'text-yellow-400';
        if (rank <= 10) return 'text-purple-400';
        if (rank <= 50) return 'text-blue-400';
        return 'text-white';
    };

    return (
        <Card className="bg-[#1B513F] border-0 shadow-lg overflow-hidden rounded-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-white text-xl">Your Fart Stats</CardTitle>
            </CardHeader>

            <CardContent className="p-4">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-6 w-1/2" />
                    </div>
                ) : !isConnected ? (
                    <div className="text-white/70 text-center py-2">
                        Connect your wallet to see your stats
                    </div>
                ) : stats.totalBoops === 0 ? (
                    <div className="text-white/70 text-center py-2">
                        You don't have any HyperBoops yet. Mint one to start tracking your stats!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Total Farts */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Wind className="h-5 w-5 text-[#9B3157]" />
                                <span className="text-white">Total Farts</span>
                            </div>
                            <span className="text-white font-bold">{stats.totalFarts}</span>
                        </div>

                        {/* Top Farter */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-400" />
                                <span className="text-white">Top Farter</span>
                            </div>
                            {stats.topFarter ? (
                                <Badge className="bg-[#57319B] text-white">
                                    #{stats.topFarter.tokenId} ({stats.topFarter.fartCount} farts)
                                </Badge>
                            ) : (
                                <span className="text-white/70">None</span>
                            )}
                        </div>

                        {/* Average Farts */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Flame className="h-5 w-5 text-orange-400" />
                                <span className="text-white">Avg Farts per Boop</span>
                            </div>
                            <span className="text-white font-bold">{stats.averageFartsPerBoop.toFixed(1)}</span>
                        </div>

                        {/* Best Rank */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-blue-400" />
                                <span className="text-white">Best Ranking</span>
                            </div>
                            {stats.personalRank ? (
                                <span className={`font-bold ${getRankColor(stats.personalRank)}`}>
                                    #{stats.personalRank}
                                </span>
                            ) : (
                                <span className="text-white/70">Not ranked</span>
                            )}
                        </div>

                        {/* Achievement */}
                        {achievementUnlocked && (
                            <div className="mt-4 p-2 bg-[#57319B]/40 rounded-md border border-[#57319B] text-center">
                                <div className="text-xs text-yellow-400 uppercase font-bold">Achievement Unlocked</div>
                                <div className="text-white font-bold">{achievementUnlocked}</div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default BoopFartStats;