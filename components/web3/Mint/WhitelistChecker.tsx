'use client'

import React, { useState, useEffect } from 'react';
import { useWhitelistStatus } from './useWhitelistStatus';
import { isAddress } from 'viem';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const WhitelistChecker = () => {
    const [inputAddress, setInputAddress] = useState('');
    const [checkAddress, setCheckAddress] = useState('');
    const [isValidAddress, setIsValidAddress] = useState(true);
    const [error, setError] = useState('');

    // Check if the address is valid
    useEffect(() => {
        if (inputAddress && !isAddress(inputAddress)) {
            setIsValidAddress(false);
            setError('Please enter a valid Ethereum address');
        } else {
            setIsValidAddress(true);
            setError('');
        }
    }, [inputAddress]);

    // Use the whitelist status hook with the address to check
    const {
        isWhitelisted,
        isGtdWhitelisted,
        eligibleForCurrentPhase
    } = useWhitelistStatus(checkAddress || undefined);

    // Handle the address check form submission
    const handleCheck = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!inputAddress) {
            setError('Please enter an address to check');
            return;
        }

        if (!isValidAddress) {
            return;
        }

        setCheckAddress(inputAddress);
    };

    // Get the appropriate status message and alert style
    const getStatusMessage = () => {
        if (!checkAddress) return null;

        if (isGtdWhitelisted) {
            return {
                message: "✨ This address is on the GTD whitelist! ✨",
                bgColor: "bg-[#9B3157]/20",
                borderColor: "border-[#9B3157]"
            };
        } else if (isWhitelisted) {
            return {
                message: "✅ This address is on the FCFS whitelist!",
                bgColor: "bg-[#57319B]/20",
                borderColor: "border-[#57319B]"
            };
        } else {
            return {
                message: "❌ This address is not on any whitelist. You can still mint during the Public phase.",
                bgColor: "bg-red-500/20",
                borderColor: "border-red-500"
            };
        }
    };

    const statusInfo = getStatusMessage();

    return (
        <Card className="w-full max-w-md bg-[#1B513F] backdrop-blur-sm rounded-lg shadow-xl overflow-hidden pb-4 my-10">
            <CardHeader>
                <CardTitle className="text-center text-white">Whitelist Checker</CardTitle>
                <CardDescription className="text-center text-white/70">
                    Check if your wallet address is whitelisted
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCheck} className="space-y-4">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Enter wallet address (0x...)"
                            value={inputAddress}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputAddress(e.target.value)}
                            className={`w-full bg-black/20 border border-white/20 text-white placeholder:text-white/50 h-12 ${!isValidAddress && inputAddress ? 'border-red-500' : ''
                                }`}
                        />
                        {error && (
                            <p className="text-red-500 text-xs mt-1">{error}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#57319B] hover:bg-[#57319B]/80 text-white font-bold"
                        disabled={!isValidAddress || !inputAddress}
                    >
                        <Search className="h-4 w-4 mr-2" />
                        Check Address
                    </Button>
                </form>

                {statusInfo && checkAddress && (
                    <div className="mt-6">
                        <Alert className={`${statusInfo.bgColor} ${statusInfo.borderColor}`}>
                            <div className="flex items-center justify-center">
                                <AlertDescription className="font-medium text-white text-center">
                                    {statusInfo.message}
                                </AlertDescription>
                            </div>
                        </Alert>

                        <div className="mt-4 p-3 pb-4 bg-black/40 rounded-md">
                            <h3 className="text-white text-sm font-medium mb-2 text-center">
                                Whitelist Status
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {/* GTD Status */}
                                <div className={`p-2 rounded ${isGtdWhitelisted ? 'bg-[#9B3157]/30' : 'bg-black/20'} flex flex-col items-center`}>
                                    <div className="mb-1">
                                        <span className="text-xs font-medium text-white">GTD Whitelist</span>
                                    </div>
                                    <div className="text-center">
                                        <span className={`text-xs ${isGtdWhitelisted ? 'text-green-400' : 'text-red-400'}`}>
                                            {isGtdWhitelisted ? 'Eligible' : 'Not Eligible'}
                                        </span>
                                    </div>
                                </div>

                                {/* Regular Whitelist Status */}
                                <div className={`p-2 rounded ${isWhitelisted ? 'bg-[#57319B]/30' : 'bg-black/20'} flex flex-col items-center`}>
                                    <div className="mb-1">
                                        <span className="text-xs font-medium text-white">FCFS Whitelist</span>
                                    </div>
                                    <div className="text-center">
                                        <span className={`text-xs ${isWhitelisted ? 'text-green-400' : 'text-red-400'}`}>
                                            {isWhitelisted ? 'Eligible' : 'Not Eligible'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Public Mint Status */}
                            <div className="mt-3 mb-2 p-2 rounded bg-[#319B57]/30 flex flex-col items-center">
                                <div className="mb-1">
                                    <span className="text-xs font-medium text-white">Public Mint</span>
                                </div>
                                <div className="text-center">
                                    <span className="text-xs text-green-400">Everyone Eligible</span>
                                </div>
                            </div>

                            <div className="mt-4 text-center">
                                <p className="text-xs text-white/70">
                                    Address checked:
                                </p>
                                <p className="text-xs text-white/90 break-all font-mono">
                                    {checkAddress}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 mb-8 text-xs text-center text-white/50">
                    <p>This tool checks if your address is on the GTD or FCFS whitelist for the HyperBoops NFT mint.</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default WhitelistChecker;