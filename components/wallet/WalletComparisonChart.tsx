import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { WalletModel } from '@/types/hyperliquid';

interface WalletComparisonChartProps {
  wallets: WalletModel[];
  type?: 'performance' | 'radar';
}

export function WalletComparisonChart({ wallets, type = 'performance' }: WalletComparisonChartProps) {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  if (type === 'radar') {
    return <WalletRadarChart wallets={wallets} />;
  }
  
  // Format data for performance chart
  const performanceData = wallets.map(wallet => {
    return {
      name: wallet._id.substring(0, 6),
      performance: wallet.score?.performance || 0,
      consistency: wallet.score?.consistency || 0,
      risk: wallet.score?.risk || 0,
      activity: wallet.score?.activity || 0,
      total: wallet.score?.total || 0,
    };
  });
  
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={performanceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="total" stroke={COLORS[0]} name="Total Score" strokeWidth={2} />
          <Line type="monotone" dataKey="performance" stroke={COLORS[1]} name="Performance" />
          <Line type="monotone" dataKey="consistency" stroke={COLORS[2]} name="Consistency" />
          <Line type="monotone" dataKey="risk" stroke={COLORS[3]} name="Risk Management" />
          <Line type="monotone" dataKey="activity" stroke={COLORS[4]} name="Activity" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Define a proper type for radar data
interface RadarDataItem {
  subject: string;
  fullMark: number;
  [key: string]: string | number; // Allow dynamic wallet keys
}

function WalletRadarChart({ wallets }: { wallets: WalletModel[] }) {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  // Format data for radar chart with proper typing
  const radarData: RadarDataItem[] = [
    { subject: 'Performance', fullMark: 100 },
    { subject: 'Consistency', fullMark: 100 },
    { subject: 'Risk Mgmt', fullMark: 100 },
    { subject: 'Activity', fullMark: 100 },
    { subject: 'Win Rate', fullMark: 100 },
  ];
  
  // Add wallet data to radar chart
  wallets.slice(0, 5).forEach((wallet, index) => {
    const walletKey = wallet._id.substring(0, 6);
    radarData[0][walletKey] = wallet.score?.performance || 0;
    radarData[1][walletKey] = wallet.score?.consistency || 0;
    radarData[2][walletKey] = wallet.score?.risk || 0;
    radarData[3][walletKey] = wallet.score?.activity || 0;
    radarData[4][walletKey] = (wallet.stats?.winRate || 0) * 100;
  });
  
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          
          {wallets.slice(0, 5).map((wallet, index) => {
            const walletKey = wallet._id.substring(0, 6);
            return (
              <Radar
                key={wallet._id}
                name={walletKey}
                dataKey={walletKey}
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.2}
              />
            );
          })}
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}