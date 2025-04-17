// src/components/admin/WhitelistDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WhitelistedAddress {
    address: string;
    claimedAt: string;
}

interface ReferrerData {
    referrer: string;
    holderTokenCount: number;
    totalReferred: number;
    whitelistedAddresses: WhitelistedAddress[];
}

interface WhitelistData {
    totalWhitelisted: number;
    referrers: ReferrerData[];
}

interface ExportData {
    exportDate: string;
    totalWhitelisted: number;
    referrers: Array<{
        referrerAddress: string;
        nftCount: number;
        whitelistedAddresses: Array<{
            address: string;
            claimedAt: string;
        }>;
    }>;
    // Flat list for easy import to other systems
    allWhitelistedAddresses: string[];
}

export const WhitelistDashboard: React.FC = () => {
    const [data, setData] = useState<WhitelistData | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [lastExport, setLastExport] = useState<Date | null>(null);

    useEffect(() => {
        fetchWhitelist();
    }, []);

    const fetchWhitelist = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/whitelist');
            const result = await response.json();
            if (result.data) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching whitelist:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportWhitelist = async () => {
        if (!data) return;

        try {
            setExporting(true);

            // Prepare export data
            const exportData: ExportData = {
                exportDate: new Date().toISOString(),
                totalWhitelisted: data.totalWhitelisted,
                referrers: data.referrers.map(ref => ({
                    referrerAddress: ref.referrer,
                    nftCount: ref.holderTokenCount,
                    whitelistedAddresses: ref.whitelistedAddresses
                })),
                // Create flat list of all whitelisted addresses
                allWhitelistedAddresses: data.referrers.flatMap(
                    ref => ref.whitelistedAddresses.map(w => w.address)
                )
            };

            // Create and download file
            const blob = new Blob(
                [JSON.stringify(exportData, null, 2)],
                { type: 'application/json' }
            );
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `whitelist-export-${new Date().toISOString()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setLastExport(new Date());
        } catch (error) {
            console.error('Error exporting whitelist:', error);
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <Card className="w-full">
                <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (!data) return <div>No data available</div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Whitelist Dashboard</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Total Whitelisted: {data.totalWhitelisted}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Button
                        onClick={exportWhitelist}
                        disabled={exporting || !data}
                        className="flex items-center gap-2"
                    >
                        {exporting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Export JSON
                    </Button>
                    {lastExport && (
                        <span className="text-xs text-muted-foreground">
                            Last exported: {formatDistanceToNow(lastExport)} ago
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Referrer (Holder)</TableHead>
                                <TableHead className="text-right">Holder's NFTs</TableHead>
                                <TableHead className="text-right">Total Referred</TableHead>
                                <TableHead>Whitelisted Addresses</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.referrers.map((referrer) => (
                                <TableRow key={referrer.referrer}>
                                    <TableCell className="font-mono">
                                        {referrer.referrer}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {referrer.holderTokenCount}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {referrer.totalReferred}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {referrer.whitelistedAddresses.map((addr) => (
                                                <div key={addr.address} className="flex items-center justify-between text-sm">
                                                    <span className="font-mono">{addr.address}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(addr.claimedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default WhitelistDashboard;