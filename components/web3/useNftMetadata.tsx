'use client'

import { useState, useEffect } from 'react';

// Define metadata interface - export as a type
export type NFTMetadata = {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
};

/**
 * Hook to fetch and manage NFT metadata
 * @param tokenIds Array of token IDs to fetch metadata for
 * @returns Object containing metadata and loading state
 */
export function useNftMetadata(tokenIds: number[] | undefined): {
  metadata: Record<number, NFTMetadata>;
  isLoading: boolean;
  error: Error | null;
} {
  const [metadata, setMetadata] = useState<Record<number, NFTMetadata>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!tokenIds || tokenIds.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const metadataMap: Record<number, NFTMetadata> = {};

        await Promise.all(
          tokenIds.map(async (id) => {
            try {
              // Try to fetch the JSON file from the public folder
              const response = await fetch(`/BoopsNFTS/json/${id}.json`);

              if (!response.ok) {
                throw new Error(`Failed to fetch metadata for token ${id}`);
              }

              const data = await response.json();
              metadataMap[id] = data;
            } catch (err) {
              console.error(`Error loading metadata for token ${id}:`, err);
              // Create fallback metadata when actual metadata can't be loaded
              metadataMap[id] = {
                name: `BoopsNFT #${id}`,
                description: "Metadata could not be loaded",
                image: `/BoopsNFTS/images/${id}.png`,
                attributes: []
              };
            }
          })
        );

        setMetadata(metadataMap);
      } catch (err) {
        console.error('Error loading metadata:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [tokenIds]);

  return { metadata, isLoading, error };
}