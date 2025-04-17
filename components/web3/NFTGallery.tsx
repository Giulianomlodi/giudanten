'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageIcon, InfoIcon, X } from 'lucide-react';

// Define metadata interfaces
interface NFTAttribute {
    trait_type: string;
    value: string | number;
}

interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    attributes: NFTAttribute[];
}

// Get contract address from environment
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

/**
 * Component to display a user's NFT collection
 */
const NFTGallery = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [nftIds, setNftIds] = useState<number[]>([]);
    const [metadata, setMetadata] = useState<Record<number, NFTMetadata>>({});
    const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
    const [selectedNft, setSelectedNft] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { address, isConnected } = useAccount();

    // Get user's balance - using useMemo to stabilize contract read parameters
    const readContractParams = useMemo(() => ({
        address: CONTRACT_ADDRESS,
        abi: [{
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'owner', type: 'address' }],
            outputs: [{ name: '', type: 'uint256' }]
        }],
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: isConnected && !!address,
            retry: 5,
            retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
        }
    }), [address, isConnected]);

    const { data: balanceData, isLoading: isBalanceLoading } = useReadContract(readContractParams);

    // Fetch NFT metadata after we know the user's balance
    useEffect(() => {
        const fetchMetadata = async () => {
            if (!isConnected || !address || isBalanceLoading || balanceData === undefined) {
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Convert balance to number
                const balance = Number(balanceData);

                if (balance === 0) {
                    setNftIds([]);
                    setIsLoading(false);
                    return;
                }

                console.log(`User has ${balance} NFTs`);

                // Fetch each token using fetch API
                const ids: number[] = [];
                for (let i = 0; i < balance; i++) {
                    try {
                        const response = await fetch(`/api/getTokenOfOwnerByIndex?owner=${address}&index=${i}`);

                        if (!response.ok) {
                            console.error(`Failed to fetch token at index ${i}: ${response.status}`);
                            continue;
                        }

                        const data = await response.json();
                        // Ensure we convert to a number properly
                        const tokenId = typeof data.tokenIdNumber === 'number'
                            ? data.tokenIdNumber
                            : Number(data.tokenId);

                        if (!isNaN(tokenId)) {
                            ids.push(tokenId);
                            console.log(`Found token ID: ${tokenId}`);
                        } else {
                            console.error(`Invalid token ID format: ${data.tokenId}`);
                        }
                    } catch (err) {
                        console.error(`Error fetching token at index ${i}:`, err);
                    }
                }

                setNftIds(ids);

                // Fetch metadata for each token
                const metadataMap: Record<number, NFTMetadata> = {};
                for (const id of ids) {
                    try {
                        // Try to fetch metadata from the /BoopsNFTS/json folder
                        const response = await fetch(`/BoopsNFTS/json/${id}.json`);

                        if (response.ok) {
                            const data = await response.json();
                            // Ensure the data has the expected format
                            metadataMap[id] = {
                                name: data.name || `HyperBoops #${id}`,
                                description: data.description || "A HyperBoops NFT.",
                                image: data.image || `/BoopsNFTS/images/${id}.png`, // Use the correct path
                                attributes: Array.isArray(data.attributes) ? data.attributes : []
                            };
                        } else {
                            console.log(`Metadata not found for token ${id}, using fallback`);
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

        fetchMetadata();
    }, [address, isConnected, balanceData, isBalanceLoading]);

    // Set mounted state for client-side rendering
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    // Render loading skeletons
    const renderSkeletons = () => {
        return Array(4).fill(0).map((_, index) => (
            <Card key={`skeleton-${index}`} className="bg-[#1B513F]/80 border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                    <div className="aspect-square bg-black/20">
                        <Skeleton className="w-full h-full" />
                    </div>
                </CardContent>
                <CardFooter className="p-3 flex flex-col items-start">
                    <Skeleton className="w-3/4 h-4 mb-2" />
                    <Skeleton className="w-1/2 h-3" />
                </CardFooter>
            </Card>
        ));
    };

    // Render a single NFT card
    const renderNftCard = (id: number) => {
        const nft = metadata[id];
        // Ensure we use the correct image path - direct reference to the images folder
        const imageUrl = `/BoopsNFTS/images/${id}.png`;

        return (
            <Card
                key={`nft-${id}`}
                className="bg-[#1B513F]/80 border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedNft(id)}
            >
                <CardContent className="p-0">
                    <div className="relative h-64">
                        <Image
                            src={imageUrl}
                            alt={nft?.name || `HyperBoops #${id}`}
                            fill
                            priority
                            className="object-contain"
                            onError={(e) => {
                                console.log(`Error loading image for token ${id}, using fallback`);
                                // Fallback to a placeholder if the image fails to load
                                (e.target as HTMLImageElement).src = "/api/placeholder/400/400";
                            }}
                        />
                    </div>
                </CardContent>
                <CardFooter className="p-3 flex flex-col items-start">
                    <h3 className="text-white font-bold">{nft?.name || `HyperBoops #${id}`}</h3>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {nft?.attributes?.slice(0, 3).map((attr: NFTAttribute, index) => (
                            <Badge key={`${id}-attr-${index}`} variant="outline" className="bg-[#57319B]/30 text-white border-[#57319B] text-xs">
                                {attr.trait_type}: {attr.value}
                            </Badge>
                        ))}
                    </div>
                    {nft?.attributes && nft.attributes.length > 3 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#57319B] hover:text-[#57319B]/80 p-0 h-auto mt-2 text-xs font-medium"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNft(id);
                            }}
                        >
                            Discover {nft.attributes.length - 3} more traits
                        </Button>
                    )}
                </CardFooter>
            </Card>
        );
    };

    // Render NFT detail view
    const renderNftDetail = () => {
        if (selectedNft === null) return null;

        const nft = metadata[selectedNft];
        const imageUrl = `/BoopsNFTS/images/${selectedNft}.png`;

        return (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedNft(null)}>
                <div className="bg-[#1B513F] rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 flex justify-between items-center border-b border-white/10">
                        <h2 className="text-xl font-bold text-white">{nft?.name || `HyperBoops #${selectedNft}`}</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedNft(null)}
                            className="text-white hover:bg-white/10"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="p-4">
                        <div className="relative h-64">
                            <Image
                                src={imageUrl}
                                alt={nft?.name || `HyperBoops #${selectedNft}`}
                                fill
                                priority
                                className="object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/api/placeholder/400/400";
                                }}
                            />
                        </div>

                        {nft?.description && (
                            <div className="mb-3">
                                <h3 className="text-white/80 text-sm font-medium mb-1">Description</h3>
                                <p className="text-white">{nft.description}</p>
                            </div>
                        )}

                        {nft?.attributes && nft.attributes.length > 0 && (
                            <div>
                                <h3 className="text-white/80 text-sm font-medium mb-1">Attributes</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {nft.attributes.map((attr: NFTAttribute, index) => (
                                        <div
                                            key={`detail-attr-${index}`}
                                            className="bg-[#57319B]/30 p-2 rounded-md"
                                        >
                                            <div className="text-white/70 text-xs">{attr.trait_type}</div>
                                            <div className="text-white font-medium">{attr.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-white/10 flex justify-end">
                        <Button
                            onClick={() => setSelectedNft(null)}
                            className="bg-[#57319B] hover:bg-[#57319B]/80 text-white"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full">
            <div className="bg-[#1B513F] backdrop-blur-sm rounded-lg shadow-xl overflow-hidden">
                <div className="p-6 pb-4">
                    <h2 className="text-center text-2xl text-white font-bold">Your HyperBoops Collection</h2>
                    <p className="text-center text-white/70 mt-1">
                        View your HyperBoops NFT collection.
                    </p>
                </div>

                {!isConnected ? (
                    <div className="p-8 flex flex-col items-center justify-center">
                        <Alert className="mb-6 bg-[#57319B]/20 border-[#57319B]">
                            <AlertDescription className="text-center font-medium text-white">
                                Connect your wallet to view your NFTs
                            </AlertDescription>
                        </Alert>
                        <ConnectButton />
                    </div>
                ) : isLoading || isBalanceLoading ? (
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {renderSkeletons()}
                        </div>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <Alert className="bg-red-500/20 border-red-500">
                            <AlertDescription className="text-center font-medium text-white">
                                {error}
                            </AlertDescription>
                        </Alert>
                        <div className="mt-4">
                            <Button
                                onClick={() => window.location.reload()}
                                className="bg-[#57319B] hover:bg-[#57319B]/80 text-white font-bold mx-2"
                            >
                                Retry
                            </Button>
                            <a
                                href={`https://purrsec.com/address/${address}/nfts`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-[#57319B] hover:underline mx-2"
                            >
                                View collection on Purrsec →
                            </a>
                        </div>
                    </div>
                ) : nftIds.length === 0 ? (
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
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-white font-medium">
                                {nftIds.length} {nftIds.length === 1 ? 'NFT' : 'NFTs'} in your collection
                            </div>
                        </div>

                        <Tabs defaultValue="grid" onValueChange={(value) => setActiveView(value as 'grid' | 'list')}>
                            <TabsList className="bg-black/30">
                                <TabsTrigger value="grid" className="data-[state=active]:bg-[#57319B]">
                                    <ImageIcon className="h-4 w-4 mr-1" /> Grid
                                </TabsTrigger>
                                <TabsTrigger value="list" className="data-[state=active]:bg-[#57319B]">
                                    <InfoIcon className="h-4 w-4 mr-1" /> List
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="grid" className="mt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {nftIds.map(id => renderNftCard(id))}
                                </div>
                            </TabsContent>

                            <TabsContent value="list" className="mt-0">
                                <div className="space-y-2">
                                    {nftIds.map(id => {
                                        const nft = metadata[id];
                                        return (
                                            <Card
                                                key={`list-nft-${id}`}
                                                className="bg-[#1B513F]/60 border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                                                onClick={() => setSelectedNft(id)}
                                            >
                                                <CardContent className="p-3 flex items-center gap-4">
                                                    <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                                                        <Image
                                                            src={`/BoopsNFTS/images/${id}.png`}
                                                            alt={nft?.name || `HyperBoops #${id}`}
                                                            fill
                                                            className="object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = "/api/placeholder/48/48";
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h3 className="text-white font-bold">{nft?.name || `HyperBoops #${id}`}</h3>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {nft?.attributes?.slice(0, 3).map((attr: NFTAttribute, index) => (
                                                                <Badge key={`${id}-list-attr-${index}`} variant="outline" className="bg-[#57319B]/30 text-white border-[#57319B] text-xs">
                                                                    {attr.trait_type}: {attr.value}
                                                                </Badge>
                                                            ))}
                                                            {nft?.attributes && nft.attributes.length > 3 && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-[#57319B]/20 text-[#57319B] border-[#57319B]/50 text-xs cursor-pointer hover:bg-[#57319B]/30"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedNft(id);
                                                                    }}
                                                                >
                                                                    Discover {nft.attributes.length - 3} more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-white/80">#{id}</div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </div>

            {/* NFT Detail Modal */}
            {selectedNft !== null && renderNftDetail()}
        </div>
    );
};

export default NFTGallery;