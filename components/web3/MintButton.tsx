'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ShoppingCart, Trophy, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const MintOut = () => {
    return (
        <div className="w-full max-w-md bg-[#1B513F] backdrop-blur-sm rounded-lg shadow-xl overflow-hidden">
            <div className="p-6 pb-0">
                <h2 className="text-center text-2xl text-white font-bold">HyperBoops</h2>
                <p className="text-center text-white/70 mt-1">
                    <strong>3,333</strong> unique stinking NFTs that you don't know why you are buying.
                </p>
            </div>

            <div className="p-6">
                {/* Sold Out Banner */}
                <div className="bg-[#57319B]/30 px-4 py-4 rounded-lg mb-6 flex flex-col items-center">
                    <Trophy className="h-12 w-12 text-yellow-300 mb-2" />
                    <h3 className="text-center text-xl text-white font-bold">SOLD OUT!</h3>
                    <p className="text-center text-white/80 mt-1">
                        All 3,333 HyperBoops have been minted
                    </p>
                </div>

                {/* Success Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-black/40 p-3 rounded-md flex flex-col items-center">
                        <div className="text-2xl font-bold text-white">3,333</div>
                        <div className="text-xs text-white/70">Total Minted</div>
                    </div>
                    <div className="bg-black/40 p-3 rounded-md flex flex-col items-center">
                        <div className="text-2xl font-bold text-white">100%</div>
                        <div className="text-xs text-white/70">Sold Out</div>
                    </div>
                </div>

                {/* Progress bar - full */}
                <div className="mb-6">
                    <div className="flex justify-between text-white mb-1">
                        <span>Total Minted</span>
                        <span className="font-bold">3,333/3,333</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-[#57319B] h-full rounded-full"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="text-right text-sm text-white/70 mt-1">
                        Remaining: 0
                    </div>
                </div>

                {/* Message */}
                <div className="bg-[#319B57]/20 border-[#319B57] p-3 rounded-md mb-6">
                    <div className="flex items-center justify-center">
                        <CheckCircle className="mr-2 h-5 w-5 text-[#319B57]" />
                        <p className="text-white font-medium">
                            Mint successfully completed!
                        </p>
                    </div>
                </div>

                {/* Secondary Market Section */}
                <div className="mb-4">
                    <h3 className="text-center text-white font-medium mb-4">
                        Get your HyperBoops on secondary markets:
                    </h3>

                    {/* Drip Marketplace Button */}
                    <a
                        href="https://app.drip.trade/collections/hyperboops"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                    >
                        <Button
                            className="w-full bg-[#57319B] hover:bg-[#57319B]/80 text-white font-bold mb-3 flex items-center justify-center"
                        >
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Buy on Drip Marketplace
                        </Button>
                    </a>

                    {/* Contract Link */}
                    <a
                        className="w-full my-4 flex justify-center gap-2 text-white hover:text-white/80"
                        href="https://purrsec.com/address/0xf0cfC95ae99c10530df30545043bd25F93d0b8A1/contract"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Contract Address
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>

                {/* Community Message */}
                <div className="text-center text-white/80 text-sm mt-4">
                    Thank you for being part of the HyperBoops community!
                </div>
            </div>
        </div>
    );
};

export default MintOut;