'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { truncateAddress, formatTimeAgo } from '@/lib/utils';
import { Wind, Trophy, Medal, Cpu, Zap, Crown, Heart, Star, ThumbsUp, Music, AlertTriangle } from 'lucide-react';
import { abi } from '@/contract-abi';

// Get contract address from environment
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

// Define interface for NFT Metadata
interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    attributes: {
        trait_type: string;
        value: string | number;
    }[];
}

// Interface for leaderboard entry
interface LeaderboardEntry {
    tokenId: string;
    tokenIdNumber: number;
    fartCount: number;
    lastFartTime: number;
    owner: string;
}

const BoopFartLeaderboard = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'my-boops' | 'leaderboard'>('my-boops');
    const [myNfts, setMyNfts] = useState<number[]>([]);
    const [metadata, setMetadata] = useState<Record<number, NFTMetadata>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);
    const [selectedNft, setSelectedNft] = useState<number | null>(null);
    const [isFarting, setIsFarting] = useState(false);
    const [fartCounts, setFartCounts] = useState<Record<number, number>>({});
    const [selectedLeaderboardToken, setSelectedLeaderboardToken] = useState<LeaderboardEntry | null>(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const { address, isConnected } = useAccount();
    const { toast } = useToast();

    // Get user's balance using wagmi hooks
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
        onLogs(logs: any[]) {
            try {
                // Check if the event was triggered by the current user
                const event = logs[0];
                const tokenId = event.args?.tokenId ? Number(event.args.tokenId) : 0;
                const fartCount = event.args?.fartCount ? Number(event.args.fartCount) : 0;

                if (event.args?.farter === address) {
                    // Update the local fart count
                    setFartCounts(prev => ({
                        ...prev,
                        [tokenId]: fartCount
                    }));

                    toast({
                        title: "Fart emitted! 💨",
                        description: `Your HyperBoop #${tokenId} has farted ${fartCount} times.`,
                        variant: "default",
                    });

                    // Refresh leaderboard after a fart
                    fetchLeaderboard();
                }

                setIsFarting(false);
            } catch (error) {
                console.error('Error processing fart event:', error);
            }
        },
    });

    // Write contract function to emit a fart
    const { writeContract, isPending, isError, error: writeError } = useWriteContract();

    // Effect to fetch user's NFTs
    useEffect(() => {
        const fetchUserNfts = async () => {
            if (!isConnected || !address || isBalanceLoading || balanceData === undefined) {
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Convert balance to number
                const balance = Number(balanceData);

                if (balance === 0) {
                    setMyNfts([]);
                    setIsLoading(false);
                    return;
                }

                console.log(`User has ${balance} NFTs`);

                // Fetch each token
                const ids: number[] = [];
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
                            ids.push(tokenId);

                            // Fetch fart count for this token
                            try {
                                const fartCountResponse = await fetch(`/api/getFartCount?tokenId=${tokenId}`);
                                if (fartCountResponse.ok) {
                                    const fartData = await fartCountResponse.json();
                                    setFartCounts(prev => ({
                                        ...prev,
                                        [tokenId]: Number(fartData.fartCount)
                                    }));
                                }
                            } catch (err) {
                                console.error(`Error fetching fart count for token ${tokenId}:`, err);
                            }
                        }
                    } catch (err) {
                        console.error(`Error fetching token at index ${i}:`, err);
                    }
                }

                setMyNfts(ids);

                // Fetch metadata for each token
                const metadataMap: Record<number, NFTMetadata> = {};
                for (const id of ids) {
                    try {
                        // Try to fetch metadata from the /BoopsNFTS/json folder
                        const response = await fetch(`/BoopsNFTS/json/${id}.json`);

                        if (response.ok) {
                            const data = await response.json();
                            metadataMap[id] = {
                                name: data.name || `HyperBoops #${id}`,
                                description: data.description || "A HyperBoops NFT.",
                                image: data.image || `/BoopsNFTS/images/${id}.png`,
                                attributes: Array.isArray(data.attributes) ? data.attributes : []
                            };
                        } else {
                            // Use fallback metadata if JSON file not found
                            metadataMap[id] = {
                                name: `HyperBoops #${id}`,
                                description: "A HyperBoops NFT.",
                                image: `/BoopsNFTS/images/${id}.png`,
                                attributes: []
                            };
                        }
                    } catch (err) {
                        console.error(`Error loading metadata for token ${id}:`, err);
                        // Create fallback metadata
                        metadataMap[id] = {
                            name: `HyperBoops #${id}`,
                            description: "A HyperBoops NFT.",
                            image: `/BoopsNFTS/images/${id}.png`,
                            attributes: []
                        };
                    }
                }

                setMetadata(metadataMap);
            } catch (err) {
                console.error('Error fetching NFTs:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch your NFTs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserNfts();
    }, [address, isConnected, balanceData, isBalanceLoading]);

    // Function to fetch leaderboard data
    const fetchLeaderboard = async () => {
        setIsLeaderboardLoading(true);
        try {
            const response = await fetch('/api/getFartLeaderboard');

            if (!response.ok) {
                throw new Error(`Failed to fetch leaderboard: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && Array.isArray(data.leaderboard)) {
                setLeaderboard(data.leaderboard);
            } else {
                throw new Error('Invalid leaderboard data format');
            }
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
        } finally {
            setIsLeaderboardLoading(false);
        }
    };

    // Fetch leaderboard on mount and after state changes
    useEffect(() => {
        if (isMounted) {
            fetchLeaderboard();
        }
    }, [isMounted]);

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

    // Effects for handling loading state
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Effect to handle pending transaction state
    useEffect(() => {
        setIsFarting(isPending);
    }, [isPending]);

    // Effect to handle transaction errors
    useEffect(() => {
        if (isError && writeError) {
            console.error('Transaction error:', writeError);
            toast({
                title: "Transaction failed",
                description: writeError.message,
                variant: "destructive",
            });
            setIsFarting(false);
        }
    }, [isError, writeError, toast]);

    if (!isMounted) return null;

    // Get medal based on rank
    const getMedal = (rank: number) => {
        switch (rank) {
            case 0: return <Trophy className="h-5 w-5 text-yellow-400" />;
            case 1: return <Medal className="h-5 w-5 text-gray-400" />;
            case 2: return <Medal className="h-5 w-5 text-amber-700" />;
            default: return null;
        }
    };

    // Render skeletons for loading state
    const renderSkeletons = () => {
        return Array(4).fill(0).map((_, index) => (
            <Card key={`skeleton-${index}`} className="bg-[#1B513F]/80 border-0 shadow-lg overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex items-center space-x-4 mb-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-8 w-full" />
                </CardContent>
            </Card>
        ));
    };

    // Render NFT card with fart button
    const renderNftCard = (tokenId: number) => {
        const nft = metadata[tokenId];
        const imageUrl = `/BoopsNFTS/images/${tokenId}.png`;
        const fartCount = fartCounts[tokenId] || 0;

        return (
            <Card key={`nft-${tokenId}`} className="bg-[#1B513F]/80 border-0 shadow-lg overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
                            <Image
                                src={imageUrl}
                                alt={nft?.name || `HyperBoops #${tokenId}`}
                                fill
                                className="object-cover rounded-lg"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/api/placeholder/96/96";
                                }}
                            />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-white font-bold text-lg">{nft?.name || `HyperBoops #${tokenId}`}</h3>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-1 mt-1 mb-2">
                                <Badge variant="outline" className="bg-[#57319B]/30 text-white border-[#57319B]">
                                    #{tokenId}
                                </Badge>
                                <Badge variant="outline" className="bg-[#9B3157]/30 text-white border-[#9B3157]">
                                    <Wind className="mr-1 h-3 w-3" /> {fartCount} {fartCount === 1 ? 'fart' : 'farts'}
                                </Badge>
                            </div>
                            <div className="mt-3">
                                <Button
                                    onClick={() => setSelectedNft(tokenId)}
                                    disabled={isFarting}
                                    className="w-full bg-[#57319B] hover:bg-[#57319B]/80 text-white font-bold"
                                >
                                    {isFarting && selectedNft === tokenId ? (
                                        <>Farting... 💨</>
                                    ) : (
                                        <>Make It Fart 💨</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    // Render the leaderboard table
    const renderLeaderboard = () => {
        if (isLeaderboardLoading) {
            return (
                <div className="w-full p-8 flex justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <p className="text-white/70">Loading fart leaderboard...</p>
                    </div>
                </div>
            );
        }

        if (leaderboard.length === 0) {
            return (
                <Alert className="bg-[#57319B]/20 border-[#57319B] mb-4">
                    <AlertDescription className="text-center font-medium text-white">
                        No farts have been recorded yet. Be the first to make your Boop fart!
                    </AlertDescription>
                </Alert>
            );
        }

        return (
            <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                    <TableHeader className="bg-black/20">
                        <TableRow>
                            <TableHead className="text-white w-16 text-center">Rank</TableHead>
                            <TableHead className="text-white">Boop</TableHead>
                            <TableHead className="text-white text-right">Fart Count</TableHead>
                            <TableHead className="text-white text-right hidden md:table-cell">Last Fart</TableHead>
                            <TableHead className="text-white text-right hidden md:table-cell">Owner</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaderboard.map((entry, index) => (
                            <TableRow
                                key={entry.tokenId}
                                className="hover:bg-white/5 cursor-pointer"
                                onClick={() => setSelectedLeaderboardToken(entry)}
                            >
                                <TableCell className="text-center font-medium">
                                    <div className="flex justify-center items-center">
                                        {getMedal(index) || <span className="text-white">{index + 1}</span>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage
                                                src={`/BoopsNFTS/images/${entry.tokenIdNumber}.png`}
                                                alt={`HyperBoops #${entry.tokenIdNumber}`}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/api/placeholder/40/40";
                                                }}
                                            />
                                            <AvatarFallback>#{entry.tokenIdNumber}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-white font-medium">HyperBoops #{entry.tokenIdNumber}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="outline" className="bg-[#9B3157]/30 text-white border-[#9B3157]">
                                        {entry.fartCount} {entry.fartCount === 1 ? 'fart' : 'farts'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-white/70 hidden md:table-cell">
                                    {formatTimeAgo(entry.lastFartTime * 1000)}
                                </TableCell>
                                <TableCell className="text-right hidden md:table-cell">
                                    <span className="text-white/70 text-sm">{truncateAddress(entry.owner)}</span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    // Main component render
    return (
        <div className="w-full">
            <Card className="bg-[#1B513F] backdrop-blur-sm rounded-lg shadow-xl overflow-hidden border-0">
                <CardHeader className="pb-0">
                    <CardTitle className="text-center text-white text-2xl">HyperBoops Fart Competition</CardTitle>
                    <CardDescription className="text-center text-white/70">
                        Make your Boops fart and compete for the title of Gassiest Boop!
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                    <Tabs defaultValue="my-boops" onValueChange={(v) => setActiveTab(v as 'my-boops' | 'leaderboard')}>
                        <TabsList className="grid grid-cols-2 mb-6 bg-black/30">
                            <TabsTrigger value="my-boops" className="data-[state=active]:bg-[#57319B]">
                                My Boops
                            </TabsTrigger>
                            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-[#57319B]">
                                Leaderboard
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="my-boops" className="mt-0">
                            {!isConnected ? (
                                <div className="p-8 flex flex-col items-center justify-center">
                                    <Alert className="mb-6 bg-[#57319B]/20 border-[#57319B]">
                                        <AlertDescription className="text-center font-medium text-white">
                                            Connect your wallet to make your Boops fart
                                        </AlertDescription>
                                    </Alert>
                                    <ConnectButton />
                                </div>
                            ) : isLoading ? (
                                <div className="grid grid-cols-1 gap-4">
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
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-white font-semibold">Your Boops ({myNfts.length})</h3>
                                        <Badge variant="outline" className="bg-[#9B3157]/30 text-white border-[#9B3157]">
                                            Total Farts: {Object.values(fartCounts).reduce((a, b) => a + b, 0)}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {myNfts.map(id => renderNftCard(id))}
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="leaderboard" className="mt-0">
                            <div className="mb-4">
                                <h3 className="text-white font-semibold mb-2">Top Farting Boops</h3>
                                <p className="text-white/70 text-sm mb-4">
                                    The leaderboard shows the HyperBoops with the most farts. Make your Boops fart to climb the ranks!
                                </p>
                                {renderLeaderboard()}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Fart Confirmation Dialog */}
            <Dialog open={selectedNft !== null} onOpenChange={(open: boolean) => !open && setSelectedNft(null)}>
                <DialogContent className="bg-[#1B513F] text-white border-[#57319B]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Ready to Fart?</DialogTitle>
                        <DialogDescription className="text-white/70">
                            You're about to make HyperBoop #{selectedNft} fart. This will emit a blockchain transaction.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedNft !== null && (
                        <div className="flex items-center justify-center py-4">
                            <div className="relative w-32 h-32">
                                <Image
                                    src={`/BoopsNFTS/images/${selectedNft}.png`}
                                    alt={`HyperBoops #${selectedNft}`}
                                    fill
                                    className="object-contain"
                                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                        (e.target as HTMLImageElement).src = "/api/placeholder/128/128";
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center items-center gap-2 py-2">
                        <Wind className="h-5 w-5 text-[#9B3157]" />
                        <span className="text-white font-medium">
                            Current Fart Count: {selectedNft !== null ? (fartCounts[selectedNft] || 0) : 0}
                        </span>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setSelectedNft(null)}
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => selectedNft !== null && emitFart(selectedNft)}
                            disabled={isFarting}
                            className="bg-[#9B3157] hover:bg-[#9B3157]/80 text-white font-bold"
                        >
                            {isFarting ? "Farting... 💨" : "Let It Rip! 💨"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Leaderboard Entry Details Dialog */}
            <Dialog
                open={selectedLeaderboardToken !== null}
                onOpenChange={(open: boolean) => !open && setSelectedLeaderboardToken(null)}
            >
                <DialogContent className="bg-[#1B513F] text-white border-[#57319B]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">HyperBoops #{selectedLeaderboardToken?.tokenIdNumber}</DialogTitle>
                        <DialogDescription className="text-white/70">
                            This Boop has farted {selectedLeaderboardToken?.fartCount} times
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLeaderboardToken && (
                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="relative w-40 h-40 mb-4">
                                <Image
                                    src={`/BoopsNFTS/images/${selectedLeaderboardToken.tokenIdNumber}.png`}
                                    alt={`HyperBoops #${selectedLeaderboardToken.tokenIdNumber}`}
                                    fill
                                    className="object-contain"
                                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                        (e.target as HTMLImageElement).src = "/api/placeholder/160/160";
                                    }}
                                />
                            </div>

                            <div className="space-y-2 w-full">
                                <div className="flex justify-between items-center p-2 bg-black/20 rounded">
                                    <span className="text-white/70">Fart Count:</span>
                                    <span className="text-white font-bold">{selectedLeaderboardToken.fartCount}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-black/20 rounded">
                                    <span className="text-white/70">Last Fart:</span>
                                    <span className="text-white">{formatTimeAgo(selectedLeaderboardToken.lastFartTime * 1000)}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-black/20 rounded">
                                    <span className="text-white/70">Owner:</span>
                                    <span className="text-white">{truncateAddress(selectedLeaderboardToken.owner)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            onClick={() => setSelectedLeaderboardToken(null)}
                            className="bg-[#57319B] hover:bg-[#57319B]/80 text-white font-bold"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BoopFartLeaderboard;