// components/web3/BoopFartGame.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Wind, Star } from 'lucide-react';
import { abi } from '@/contract-abi';

// Get contract address from environment
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

// Define interface for NFT
interface NFT {
    tokenId: number;
    name: string;
    image: string;
    fartCount: number;
}

const BoopFartGame = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [myNfts, setMyNfts] = useState<NFT[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNft, setSelectedNft] = useState<number | null>(null);
    const [isFarting, setIsFarting] = useState(false);
    const [gamePoints, setGamePoints] = useState(0);
    const [fartStreak, setFartStreak] = useState(0);
    const [lastFartTime, setLastFartTime] = useState(0);

    const { address, isConnected } = useAccount();
    const { toast } = useToast();

    // Simplified Read Contract Hook - Only get balance
    const { data: balanceData, isLoading: isBalanceLoading } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: isConnected && !!address,
        }
    });

    // Watch for TokenFart events
    useWatchContractEvent({
        address: CONTRACT_ADDRESS,
        abi,
        eventName: 'TokenFart',
        onLogs(logs) {
            try {
                const event = logs[0];
                const tokenId = event.args?.tokenId ? Number(event.args.tokenId) : 0;
                const fartCount = event.args?.fartCount ? Number(event.args.fartCount) : 0;

                if (event.args?.farter === address) {
                    // Update NFT data locally
                    setMyNfts(prev => prev.map(nft =>
                        nft.tokenId === tokenId
                            ? { ...nft, fartCount }
                            : nft
                    ));

                    // Update game state
                    const now = Date.now();
                    const timeDiff = now - lastFartTime;
                    const newStreak = timeDiff < 300000 ? fartStreak + 1 : 1; // 5 minutes for streak
                    const pointsEarned = calculatePoints(newStreak);

                    setFartStreak(newStreak);
                    setGamePoints(prev => prev + pointsEarned);
                    setLastFartTime(now);

                    // Show success toast with animation
                    toast({
                        title: `💨 FART #${fartCount} EMITTED!`,
                        description: `+${pointsEarned} points! ${newStreak > 1 ? `${newStreak}x STREAK!` : ''}`,
                        variant: "default",
                    });

                    // Play fart sound if available
                    const fartSound = new Audio('/sounds/fart.mp3');
                    fartSound.volume = 0.5;
                    fartSound.play().catch(e => console.log('Sound play failed:', e));
                }

                setIsFarting(false);
                setSelectedNft(null);
            } catch (error) {
                console.error('Error processing fart event:', error);
                setIsFarting(false);
            }
        },
    });

    // Calculate points based on streak
    const calculatePoints = (streak: number): number => {
        const basePoints = 10;
        const multiplier = Math.min(streak, 5); // Cap multiplier at 5x
        return basePoints * multiplier;
    };

    // Write contract function to emit a fart
    const { writeContract, isPending } = useWriteContract();

    // Effect to fetch user's NFTs - Simplified to reduce RPC calls
    useEffect(() => {
        const fetchUserNfts = async () => {
            if (!isConnected || !address || isBalanceLoading || balanceData === undefined) {
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const balance = Number(balanceData);

                if (balance === 0) {
                    setMyNfts([]);
                    setIsLoading(false);
                    return;
                }

                // Use a more efficient approach - batch requests when possible
                // For slow RPCs, just get the token IDs first
                const tokenIds = [];

                for (let i = 0; i < balance; i++) {
                    try {
                        const response = await fetch(`/api/getTokenOfOwnerByIndex?owner=${address}&index=${i}`);

                        if (!response.ok) {
                            console.error(`Failed to fetch token at index ${i}: ${response.status}`);
                            continue;
                        }

                        const data = await response.json();
                        const tokenId = typeof data.tokenIdNumber === 'number'
                            ? data.tokenIdNumber
                            : Number(data.tokenId);

                        if (!isNaN(tokenId)) {
                            tokenIds.push(tokenId);
                        }
                    } catch (err) {
                        console.error(`Error fetching token at index ${i}:`, err);
                    }
                }

                // Build NFT objects with basic data, fetch fart counts separately
                const nfts: NFT[] = tokenIds.map(id => ({
                    tokenId: id,
                    name: `HyperBoops #${id}`,
                    image: `/BoopsNFTS/images/${id}.png`,
                    fartCount: 0
                }));

                setMyNfts(nfts);

                // Fetch fart counts after setting the NFTs to improve perceived loading
                for (const nft of nfts) {
                    try {
                        const response = await fetch(`/api/getFartCount?tokenId=${nft.tokenId}`);
                        if (response.ok) {
                            const data = await response.json();

                            setMyNfts(prev => prev.map(item =>
                                item.tokenId === nft.tokenId
                                    ? { ...item, fartCount: Number(data.fartCount) }
                                    : item
                            ));
                        }
                    } catch (err) {
                        console.error(`Error fetching fart count for token ${nft.tokenId}:`, err);
                    }
                }
            } catch (err) {
                console.error('Error fetching NFTs:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch your NFTs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserNfts();
    }, [address, isConnected, balanceData, isBalanceLoading]);

    // Handle emitting a fart
    const emitFart = async (tokenId: number) => {
        if (!isConnected) {
            toast({
                title: "Wallet not connected",
                description: "Please connect your wallet to fart.",
                variant: "destructive",
            });
            return;
        }

        setIsFarting(true);

        try {
            writeContract({
                address: CONTRACT_ADDRESS,
                abi,
                functionName: 'emitFart',
                args: [BigInt(tokenId)],
            });
        } catch (err) {
            console.error('Error emitting fart:', err);
            toast({
                title: "Error",
                description: "Failed to emit fart. Please try again.",
                variant: "destructive",
            });
            setIsFarting(false);
        }
    };

    // Effects for handling component state
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setIsFarting(isPending);
    }, [isPending]);

    if (!isMounted) return null;

    // Render loading skeletons
    const renderSkeletons = () => {
        return Array(3).fill(0).map((_, index) => (
            <div key={`skeleton-${index}`} className="animate-pulse flex space-x-4 mb-4">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <div className="flex-1 space-y-2 py-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-8 w-full mt-2" />
                </div>
            </div>
        ));
    };

    return (
        <div className="w-full">
            <Card className="bg-[#1B513F] border-0 shadow-lg overflow-hidden rounded-xl">
                <CardHeader className="pb-2 text-center">
                    <CardTitle className="text-white text-2xl flex items-center justify-center gap-2">
                        <Star className="h-6 w-6 text-yellow-400" />
                        <span>HyperBoops Fart Arcade</span>
                        <Star className="h-6 w-6 text-yellow-400" />
                    </CardTitle>

                    {/* Game score display */}
                    <div className="flex justify-center items-center mt-1">
                        <div className="bg-[#57319B] py-1 px-4 rounded-full text-white font-bold text-xl flex items-center gap-2">
                            <span>Score:</span>
                            <span className="text-yellow-300">{gamePoints}</span>

                            {fartStreak > 1 && (
                                <Badge className="ml-2 bg-[#9B3157] text-white border-none">
                                    {fartStreak}x Streak!
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4">
                    {!isConnected ? (
                        <div className="p-8 flex flex-col items-center justify-center">
                            <Alert className="mb-6 bg-[#57319B]/20 border-[#57319B]">
                                <AlertDescription className="text-center font-medium text-white">
                                    Connect your wallet to play the Fart Arcade
                                </AlertDescription>
                            </Alert>
                            <ConnectButton />
                        </div>
                    ) : isLoading ? (
                        <div className="p-4">
                            {renderSkeletons()}
                        </div>
                    ) : error ? (
                        <Alert className="bg-red-500/20 border-red-500">
                            <AlertDescription className="text-center font-medium text-white">
                                {error}
                            </AlertDescription>
                        </Alert>
                    ) : myNfts.length === 0 ? (
                        <div className="p-8 text-center">
                            <Alert className="bg-[#57319B]/20 border-[#57319B]">
                                <AlertDescription className="text-center font-medium text-white">
                                    You don't own any HyperBoops NFTs yet. Mint one to get started!
                                </AlertDescription>
                            </Alert>
                            <Button
                                className="mt-4 bg-[#57319B] hover:bg-[#57319B]/80 text-white font-bold"
                                onClick={() => window.location.href = '/mint'}
                            >
                                Go to Mint Page
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {myNfts.map((nft) => (
                                    <div
                                        key={nft.tokenId}
                                        className={`relative cursor-pointer p-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${selectedNft === nft.tokenId
                                                ? 'bg-[#57319B]/80 ring-4 ring-yellow-400'
                                                : 'bg-[#1B513F]/80 hover:bg-[#57319B]/40'
                                            }`}
                                        onClick={() => setSelectedNft(selectedNft === nft.tokenId ? null : nft.tokenId)}
                                    >
                                        <div className="relative h-40 w-full mb-2 rounded-md overflow-hidden">
                                            <Image
                                                src={nft.image}
                                                alt={nft.name}
                                                fill
                                                className="object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/api/placeholder/160/160";
                                                }}
                                            />
                                        </div>

                                        <div className="text-center">
                                            <h3 className="text-white font-bold text-lg">#{nft.tokenId}</h3>
                                            <div className="flex justify-center mt-1">
                                                <Badge className="bg-[#9B3157]/80 text-white border-none">
                                                    <Wind className="mr-1 h-3 w-3" /> {nft.fartCount} farts
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Selected NFT overlay */}
                                        {selectedNft === nft.tokenId && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        emitFart(nft.tokenId);
                                                    }}
                                                    disabled={isFarting}
                                                    className="animate-bounce bg-[#9B3157] hover:bg-[#9B3157]/80 text-white font-bold px-8 py-6 text-xl rounded-full"
                                                >
                                                    {isFarting ? "Farting... 💨" : "FART! 💨"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Instructions */}
                            {!selectedNft && (
                                <div className="mt-4 text-center text-white/70">
                                    <p>Select a Boop to make it fart!</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default BoopFartGame;