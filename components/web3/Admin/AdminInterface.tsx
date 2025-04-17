'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useWriteContract, useReadContract, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Toast from '../../layout/Toast';
import { abi } from '@/contract-abi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check, Award, Users, Globe, Power, AlertCircle, Wallet, RefreshCw } from 'lucide-react';
import { formatEther, parseEther } from 'viem';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

// Define phases from the updated smart contract
enum Phase {
    Inactive = 0,
    GTD = 1,
    Whitelist = 2,
    Public = 3
}

// Define the contract function names as literal types
type ContractFunction =
    | 'disableMint'
    | 'startGtdPhase'
    | 'startWhitelistPhase'
    | 'startPublicPhase'
    | 'updateGtdMerkleRoot'
    | 'updateWhitelistMerkleRoot';

const AdminInterface = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [gtdMerkleRoot, setGtdMerkleRoot] = useState("");
    const [whitelistMerkleRoot, setWhitelistMerkleRoot] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [isWithdrawingAll, setIsWithdrawingAll] = useState(false);
    const { address, isConnected } = useAccount();

    // Read current phase
    const {
        data: currentPhase,
        refetch: refetchPhase,
        isLoading: phaseLoading,
        isError: phaseError,
        error: phaseErrorDetails
    } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'currentPhase',
    });

    // Read total minted
    const {
        data: totalMinted,
        refetch: refetchTotalMinted,
        isLoading: totalMintedLoading
    } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'totalMinted',
    });

    // Read remaining supply
    const {
        data: remainingSupply,
        refetch: refetchRemainingSupply,
        isLoading: remainingSupplyLoading
    } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'remainingSupply',
    });

    // Read max supply
    const { data: maxSupply } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'MAX_SUPPLY',
    });

    // Read contract balance
    const {
        data: contractBalance,
        refetch: refetchContractBalance,
        isLoading: contractBalanceLoading
    } = useBalance({
        address: CONTRACT_ADDRESS,
    });

    // Read current merkle roots
    const { data: contractGtdMerkleRoot, refetch: refetchGtdMerkleRoot } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'gtdMerkleRoot',
    });

    const { data: contractWhitelistMerkleRoot, refetch: refetchWhitelistMerkleRoot } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'whitelistMerkleRoot',
    });

    // Read owner
    const {
        data: contractOwner,
        isLoading: ownerLoading,
        isError: ownerError,
        error: ownerErrorDetails
    } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'owner',
    });

    // Contract write function
    const { writeContract } = useWriteContract();

    // Check if current address is the owner
    const isOwner = useMemo(() => {
        if (!contractOwner || !address) return false;

        // Safely convert to string and lowercase to handle TypeScript error
        const ownerString = String(contractOwner).toLowerCase();
        const addressString = String(address).toLowerCase();

        return ownerString === addressString;
    }, [contractOwner, address]);

    // Phase management functions
    const setPhase = async (phase: Phase) => {
        if (!isOwner) {
            setToastMessage('Only the contract owner can perform this action.');
            return;
        }

        setIsProcessing(true);

        try {
            const phaseFunctions: Record<Phase, ContractFunction> = {
                [Phase.Inactive]: 'disableMint',
                [Phase.GTD]: 'startGtdPhase',
                [Phase.Whitelist]: 'startWhitelistPhase',
                [Phase.Public]: 'startPublicPhase',
            };

            const functionName = phaseFunctions[phase];

            await writeContract({
                address: CONTRACT_ADDRESS,
                abi,
                functionName,
                args: [],
            });

            setToastMessage(`Setting phase to ${Phase[phase]}...`);

            // Wait briefly then refetch the status
            setTimeout(() => {
                refetchPhase();
                setIsProcessing(false);
            }, 5000);

        } catch (err) {
            console.error("Transaction error:", err);
            setToastMessage(err instanceof Error ? err.message : 'Error updating phase. Please try again.');
            setIsProcessing(false);
        }
    };

    const updateGtdMerkleRoot = async () => {
        if (!isOwner) {
            setToastMessage('Only the contract owner can perform this action.');
            return;
        }

        if (!gtdMerkleRoot || !gtdMerkleRoot.startsWith('0x') || gtdMerkleRoot.length !== 66) {
            setToastMessage('Please enter a valid merkle root (66 characters starting with 0x).');
            return;
        }

        setIsProcessing(true);

        try {
            await writeContract({
                address: CONTRACT_ADDRESS,
                abi,
                functionName: 'updateGtdMerkleRoot',
                args: [gtdMerkleRoot as `0x${string}`],
            });

            setToastMessage('GTD Merkle root is being updated');
            setGtdMerkleRoot("");

            // Wait briefly then refetch
            setTimeout(() => {
                refetchGtdMerkleRoot();
                setIsProcessing(false);
            }, 5000);

        } catch (err) {
            console.error("Transaction error:", err);
            setToastMessage(err instanceof Error ? err.message : 'Error updating GTD merkle root. Please try again.');
            setIsProcessing(false);
        }
    };

    const updateWhitelistMerkleRoot = async () => {
        if (!isOwner) {
            setToastMessage('Only the contract owner can perform this action.');
            return;
        }

        if (!whitelistMerkleRoot || !whitelistMerkleRoot.startsWith('0x') || whitelistMerkleRoot.length !== 66) {
            setToastMessage('Please enter a valid merkle root (66 characters starting with 0x).');
            return;
        }

        setIsProcessing(true);

        try {
            await writeContract({
                address: CONTRACT_ADDRESS,
                abi,
                functionName: 'updateWhitelistMerkleRoot',
                args: [whitelistMerkleRoot as `0x${string}`],
            });

            setToastMessage('Whitelist Merkle root is being updated');
            setWhitelistMerkleRoot("");

            // Wait briefly then refetch
            setTimeout(() => {
                refetchWhitelistMerkleRoot();
                setIsProcessing(false);
            }, 5000);

        } catch (err) {
            console.error("Transaction error:", err);
            setToastMessage(err instanceof Error ? err.message : 'Error updating whitelist merkle root. Please try again.');
            setIsProcessing(false);
        }
    };

    // Withdraw function
    const withdrawFunds = async () => {
        if (!isOwner) {
            setToastMessage('Only the contract owner can perform this action.');
            return;
        }

        let amountToWithdraw = BigInt(0);

        if (!isWithdrawingAll) {
            // Make sure the amount is valid
            if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
                setToastMessage('Please enter a valid amount to withdraw.');
                return;
            }

            try {
                amountToWithdraw = parseEther(withdrawAmount);
            } catch (error) {
                setToastMessage('Invalid amount format. Please enter a valid number.');
                return;
            }
        }

        // If we're withdrawing all or the specified amount is 0, we'll pass 0 to the contract
        // The contract will handle this as "withdraw all"
        if (isWithdrawingAll || amountToWithdraw === BigInt(0)) {
            amountToWithdraw = BigInt(0);
        }

        setIsProcessing(true);
        try {
            await writeContract({
                address: CONTRACT_ADDRESS,
                abi,
                functionName: 'withdraw',
                args: [amountToWithdraw],
            });

            const actionText = isWithdrawingAll ? 'all funds' : withdrawAmount + ' ETH';
            setToastMessage(`Withdrawing ${actionText}...`);
            setWithdrawAmount("");
            setIsWithdrawingAll(false);

            // Wait briefly then refetch balance
            setTimeout(() => {
                refetchContractBalance();
                setIsProcessing(false);
            }, 5000);

        } catch (err) {
            console.error("Withdrawal error:", err);
            setToastMessage(err instanceof Error ? err.message : 'Error withdrawing funds. Please try again.');
            setIsProcessing(false);
        }
    };

    // Refetch all data
    const refetchAllData = () => {
        refetchPhase();
        refetchTotalMinted();
        refetchRemainingSupply();
        refetchGtdMerkleRoot();
        refetchWhitelistMerkleRoot();
        refetchContractBalance();
    };

    // Client-side only rendering
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    // Calculate progress percentage for the progress bar
    const mintProgress = totalMinted && maxSupply
        ? (Number(totalMinted) / Number(maxSupply)) * 100
        : 0;

    // Get phase name for display
    const getPhaseName = (phase: number | undefined) => {
        if (phase === undefined) return "Loading...";
        return Phase[phase] || "Unknown";
    };

    // Get phase color
    const getPhaseColor = (phase: number | undefined) => {
        switch (phase) {
            case Phase.Inactive: return "text-gray-400";
            case Phase.GTD: return "text-pink-500";
            case Phase.Whitelist: return "text-purple-500";
            case Phase.Public: return "text-green-500";
            default: return "text-gray-400";
        }
    };

    // Get phase icon
    const getPhaseIcon = (phase: number | undefined) => {
        switch (phase) {
            case Phase.Inactive: return <Power className="h-5 w-5 text-gray-400" />;
            case Phase.GTD: return <Award className="h-5 w-5 text-pink-500" />;
            case Phase.Whitelist: return <Users className="h-5 w-5 text-purple-500" />;
            case Phase.Public: return <Globe className="h-5 w-5 text-green-500" />;
            default: return <AlertCircle className="h-5 w-5 text-gray-400" />;
        }
    };

    return (
        <div className="flex flex-col items-center bg-white bg-opacity-20 rounded-2xl shadow-lg backdrop-blur-sm border border-white border-opacity-30 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">HyperBoops Admin Interface</h2>

            {/* Debug info panel - always visible */}
            <div className="w-full mb-4 p-2 bg-black bg-opacity-30 rounded-lg text-white text-xs">
                <div>Contract: {CONTRACT_ADDRESS}</div>
                <div>Owner: {contractOwner ? String(contractOwner) : "Unknown"}</div>
                <div>Your address: {address || "Not connected"}</div>
                <div>Owner status: {isOwner ? "✅ Yes" : "❌ No"}</div>
                <div className="mt-1">
                    <button
                        onClick={refetchAllData}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>

            {isConnected ? (
                <>
                    {isOwner ? (
                        <div className="w-full">
                            {/* Stats Box */}
                            <Card className="mb-4">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Collection Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <span className="text-gray-300 mr-2">Current Phase:</span>
                                            <div className="flex items-center">
                                                {getPhaseIcon(Number(currentPhase))}
                                                <span className={`ml-1 font-semibold ${getPhaseColor(Number(currentPhase))}`}>
                                                    {phaseLoading ? 'Loading...' : getPhaseName(Number(currentPhase))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-300">Minted</span>
                                                <span className="text-white font-medium">
                                                    {totalMintedLoading ? 'Loading...' : `${totalMinted}/${maxSupply || 3333}`}
                                                </span>
                                            </div>
                                            <Progress value={mintProgress} className="h-2" />
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-300">Contract Balance</span>
                                            <span className="text-white font-medium">
                                                {contractBalanceLoading ? 'Loading...' : `${contractBalance ? formatEther(contractBalance.value) : '0'} ETH`}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Phase Control */}
                            <Card className="mb-4">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Phase Control</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3 mb-2">
                                        <Button
                                            onClick={() => setPhase(Phase.Inactive)}
                                            disabled={isProcessing || phaseLoading || Number(currentPhase) === Phase.Inactive}
                                            variant="outline"
                                            className={`border-gray-600 ${Number(currentPhase) === Phase.Inactive ? 'bg-gray-800 text-white' : ''}`}
                                        >
                                            <Power className="h-4 w-4 mr-2" />
                                            Disable Mint
                                        </Button>

                                        <Button
                                            onClick={() => setPhase(Phase.GTD)}
                                            disabled={isProcessing || phaseLoading || Number(currentPhase) === Phase.GTD}
                                            variant="outline"
                                            className={`border-pink-600 ${Number(currentPhase) === Phase.GTD ? 'bg-pink-800 text-white' : ''}`}
                                        >
                                            <Award className="h-4 w-4 mr-2" />
                                            GTD Phase
                                        </Button>

                                        <Button
                                            onClick={() => setPhase(Phase.Whitelist)}
                                            disabled={isProcessing || phaseLoading || Number(currentPhase) === Phase.Whitelist}
                                            variant="outline"
                                            className={`border-purple-600 ${Number(currentPhase) === Phase.Whitelist ? 'bg-purple-800 text-white' : ''}`}
                                        >
                                            <Users className="h-4 w-4 mr-2" />
                                            Whitelist Phase
                                        </Button>

                                        <Button
                                            onClick={() => setPhase(Phase.Public)}
                                            disabled={isProcessing || phaseLoading || Number(currentPhase) === Phase.Public}
                                            variant="outline"
                                            className={`border-green-600 ${Number(currentPhase) === Phase.Public ? 'bg-green-800 text-white' : ''}`}
                                        >
                                            <Globe className="h-4 w-4 mr-2" />
                                            Public Phase
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Withdraw Funds */}
                            <Card className="mb-4">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center text-lg">
                                        <Wallet className="h-5 w-5 mr-2 text-yellow-500" />
                                        Withdraw Funds
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-300 text-sm">Available Balance:</span>
                                            <div className="flex items-center">
                                                <span className="text-white font-medium">
                                                    {contractBalanceLoading
                                                        ? 'Loading...'
                                                        : `${contractBalance ? formatEther(contractBalance.value) : '0'} ETH`}
                                                </span>
                                                <button
                                                    onClick={() => refetchContractBalance()}
                                                    className="ml-1 text-blue-400 hover:text-blue-300"
                                                    disabled={contractBalanceLoading}
                                                >
                                                    <RefreshCw className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2 mb-2">
                                            <input
                                                type="text"
                                                value={withdrawAmount}
                                                onChange={(e) => {
                                                    setWithdrawAmount(e.target.value);
                                                    setIsWithdrawingAll(false);
                                                }}
                                                placeholder="Amount in ETH"
                                                className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm"
                                                disabled={isProcessing || isWithdrawingAll}
                                            />
                                            <Button
                                                onClick={withdrawFunds}
                                                disabled={isProcessing || (!withdrawAmount && !isWithdrawingAll) || contractBalanceLoading || Number(contractBalance?.value || 0) === 0}
                                                className="bg-yellow-700 hover:bg-yellow-800 whitespace-nowrap"
                                            >
                                                Withdraw
                                            </Button>
                                        </div>

                                        <Button
                                            onClick={() => {
                                                setIsWithdrawingAll(true);
                                                setWithdrawAmount('');
                                            }}
                                            disabled={isProcessing || contractBalanceLoading || Number(contractBalance?.value || 0) === 0}
                                            variant="outline"
                                            className={`w-full border-yellow-600 ${isWithdrawingAll ? 'bg-yellow-900/50 text-white' : ''}`}
                                        >
                                            Withdraw All Funds
                                        </Button>

                                        <div className="text-xs text-gray-400 mt-2">
                                            Funds will be sent to the contract owner: {contractOwner ? String(contractOwner).substring(0, 6) + '...' + String(contractOwner).substring(38) : "Unknown"}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Merkle Root Updates */}
                            <Card className="mb-4">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Whitelist Management</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* GTD Merkle Root */}
                                    <div className="mb-4">
                                        <div className="text-sm mb-1 flex justify-between">
                                            <span className="text-gray-300">GTD Merkle Root</span>
                                            <span className="text-gray-400 text-xs truncate w-32 text-right">
                                                {contractGtdMerkleRoot ? `${String(contractGtdMerkleRoot).substring(0, 10)}...` : 'Not set'}
                                            </span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={gtdMerkleRoot}
                                                onChange={(e) => setGtdMerkleRoot(e.target.value)}
                                                placeholder="0x..."
                                                className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm"
                                                disabled={isProcessing}
                                            />
                                            <Button
                                                onClick={updateGtdMerkleRoot}
                                                disabled={isProcessing || !gtdMerkleRoot}
                                                className="bg-pink-700 hover:bg-pink-800"
                                            >
                                                Update
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Whitelist Merkle Root */}
                                    <div>
                                        <div className="text-sm mb-1 flex justify-between">
                                            <span className="text-gray-300">Whitelist Merkle Root</span>
                                            <span className="text-gray-400 text-xs truncate w-32 text-right">
                                                {contractWhitelistMerkleRoot ? `${String(contractWhitelistMerkleRoot).substring(0, 10)}...` : 'Not set'}
                                            </span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={whitelistMerkleRoot}
                                                onChange={(e) => setWhitelistMerkleRoot(e.target.value)}
                                                placeholder="0x..."
                                                className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm"
                                                disabled={isProcessing}
                                            />
                                            <Button
                                                onClick={updateWhitelistMerkleRoot}
                                                disabled={isProcessing || !whitelistMerkleRoot}
                                                className="bg-purple-700 hover:bg-purple-800"
                                            >
                                                Update
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Processing Indicator */}
                            {isProcessing && (
                                <Alert className="mb-4 bg-yellow-900/20 border-yellow-600">
                                    <AlertDescription className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing transaction...
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    ) : (
                        <div className="text-red-400 font-bold text-center p-4 bg-red-900 bg-opacity-20 rounded-lg w-full">
                            <div className="mb-2">⚠️ Access Denied</div>
                            <div className="text-sm">Only the contract owner can access controls.</div>
                        </div>
                    )}
                </>
            ) : (
                <div className="w-full flex flex-col items-center">
                    <p className="text-white mb-4 text-center">Connect your wallet to access controls</p>
                    <ConnectButton />
                </div>
            )}

            {toastMessage && <Toast onClose={() => setToastMessage(null)}>{toastMessage}</Toast>}
        </div>
    );
};

export default AdminInterface;