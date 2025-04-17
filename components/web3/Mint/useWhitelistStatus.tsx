import { useState, useEffect } from 'react';
import { MerkleTree } from 'merkletreejs';
import { keccak256, encodePacked } from 'viem';
import whitelistAddresses from './whitelistAddresses';
import gtdWhitelistAddresses from './whitelistAddresses2';

export const useWhitelistStatus = (address: string | undefined) => {
    const [isWhitelisted, setIsWhitelisted] = useState(false);
    const [isGtdWhitelisted, setIsGtdWhitelisted] = useState(false);
    const [merkleProof, setMerkleProof] = useState<`0x${string}`[]>([]);
    const [whitelistMerkleRoot, setWhitelistMerkleRoot] = useState<string>('');
    const [gtdMerkleRoot, setGtdMerkleRoot] = useState<string>('');
    const [activeProofType, setActiveProofType] = useState<'whitelist' | 'gtd'>('whitelist');

    useEffect(() => {
        // Process regular whitelist
        const leafNodes = whitelistAddresses.map((addr: string) =>
            keccak256(encodePacked(['address'], [addr.toLowerCase() as `0x${string}`]))
        );
        const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
        const rootHash = merkleTree.getHexRoot();

        setWhitelistMerkleRoot(rootHash);
        console.log('Whitelist Merkle Root:', rootHash);

        // Process GTD whitelist
        const gtdLeafNodes = gtdWhitelistAddresses.map((addr: string) =>
            keccak256(encodePacked(['address'], [addr.toLowerCase() as `0x${string}`]))
        );
        const gtdMerkleTree = new MerkleTree(gtdLeafNodes, keccak256, { sortPairs: true });
        const gtdRootHash = gtdMerkleTree.getHexRoot();

        setGtdMerkleRoot(gtdRootHash);
        console.log('GTD Merkle Root:', gtdRootHash);

        if (!address) {
            setIsWhitelisted(false);
            setIsGtdWhitelisted(false);
            setMerkleProof([]);
            return;
        }

        // Check regular whitelist status
        const claimingAddress = keccak256(encodePacked(['address'], [address.toLowerCase() as `0x${string}`]));
        const hexProof = merkleTree.getHexProof(claimingAddress);
        const verified = merkleTree.verify(hexProof, claimingAddress, rootHash);

        // Check GTD whitelist status
        const gtdHexProof = gtdMerkleTree.getHexProof(claimingAddress);
        const gtdVerified = gtdMerkleTree.verify(gtdHexProof, claimingAddress, gtdRootHash);

        setIsWhitelisted(verified);
        setIsGtdWhitelisted(gtdVerified);

        // Set the active proof based on priority: GTD first, then regular whitelist
        if (gtdVerified) {
            setMerkleProof(gtdHexProof as `0x${string}`[]);
            setActiveProofType('gtd');
        } else if (verified) {
            setMerkleProof(hexProof as `0x${string}`[]);
            setActiveProofType('whitelist');
        } else {
            setMerkleProof([]);
        }

        // Log all status for debugging
        console.log('Address:', address);
        console.log('Is FCFS Whitelisted:', verified);
        console.log('Is GTD Whitelisted:', gtdVerified);
        console.log('Active Proof Type:', gtdVerified ? 'GTD' : verified ? 'Whitelist' : 'None');
        console.log('Merkle Proof:', gtdVerified ? gtdHexProof : verified ? hexProof : []);
    }, [address]);

    return {
        isWhitelisted,
        isGtdWhitelisted,
        merkleProof,
        whitelistMerkleRoot,
        gtdMerkleRoot,
        activeProofType,
        eligibleForCurrentPhase: isWhitelisted || isGtdWhitelisted
    };
};

export default useWhitelistStatus;