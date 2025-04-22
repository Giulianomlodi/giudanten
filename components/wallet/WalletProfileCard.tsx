import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// Aggiorna l'interfaccia WalletModel per includere qualification_reason
import { WalletModel } from '@/types/hyperliquid';

interface WalletProfileCardProps {
  wallet: WalletModel;
  showDetails?: boolean;
}

export function WalletProfileCard({ wallet, showDetails = false }: WalletProfileCardProps) {
  // Group tags by category for better organization
  const tagCategories = {
    style: ['scalper', 'swing_trader', 'position_trader', 'sniper', 'sniper_trader', 'trend_follower', 'range_trader'],
    bias: ['long_dominant', 'short_dominant', 'balanced_trader', 'profitable_long', 'profitable_short', 'efficient_long', 'efficient_short'],
    timing: ['night_operator', 'day_operator', 'weekend_specialist', 'us_session_dominant', 'asia_session_dominant', 'europe_session_dominant', '24h_operator'],
    risk: ['high_leverage', 'low_leverage', 'consistent', 'volatile', 'low_drawdown', 'high_drawdown'],
    activity: ['frequent_operator', 'occasional_operator'],
    performance: ['stable_performer', 'momentum_24h', 'momentum_7d', 'explosive_roi', 'resilient_trader'],
    special: ['early_momentum', 'likely_to_reverse', 'underrated_strategist', 'high_confidence_low_sample']
  };

  // Helper to get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  // Render profit orientation if available
  const renderProfitOrientation = () => {
    if (!wallet.tags?.profit_orientation) return null;
    
    return (
      <div className="mt-2">
        <span className="text-sm font-medium">Profit Orientation:</span>
        <span className="ml-2 text-sm">{formatTagName(wallet.tags.profit_orientation)}</span>
      </div>
    );
  };
  
  // Render market sessions if available
  const renderMarketSessions = () => {
    if (!wallet.tags?.market_sessions) return null;
    
    const sessions = wallet.tags.market_sessions.split(',');
    
    return (
      <div className="mt-2">
        <span className="text-sm font-medium">Market Sessions:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {sessions.map((session) => (
            <Badge key={session} variant="outline" className="text-xs">
              {formatTagName(session)}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="truncate">{wallet._id.substring(0, 8)}...{wallet._id.substring(wallet._id.length - 6)}</span>
          <Badge variant={wallet.qualified ? "default" : "outline"}>
            {wallet.qualified ? "Qualified" : "Not Qualified"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Copy Mode: <span className="font-semibold">{wallet.copy_mode || "Standard"}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score visualization */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Overall Score</span>
            <span className={`font-bold ${getScoreColor(wallet.score?.total || 0)}`}>
              {wallet.score?.total.toFixed(1) || 0}
            </span>
          </div>
          <Progress value={wallet.score?.total || 0} className="h-2" />
        </div>
        
        {/* Score breakdown */}
        {showDetails && wallet.score && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Performance: <span className={getScoreColor(wallet.score.performance || 0)}>
              {wallet.score.performance?.toFixed(1) || 0}
            </span></div>
            <div>Consistency: <span className={getScoreColor(wallet.score.consistency || 0)}>
              {wallet.score.consistency?.toFixed(1) || 0}
            </span></div>
            <div>Risk: <span className={getScoreColor(wallet.score.risk || 0)}>
              {wallet.score.risk?.toFixed(1) || 0}
            </span></div>
            <div>Activity: <span className={getScoreColor(wallet.score.activity || 0)}>
              {wallet.score.activity?.toFixed(1) || 0}
            </span></div>
          </div>
        )}
        
        {/* Tags visualization */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Trading Style</h4>
          <div className="flex flex-wrap gap-1">
            {wallet.tags?.filter(tag => tagCategories.style.includes(tag)).map(tag => (
              <TooltipProvider key={tag}>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="text-xs">{tag.replace(/_/g, ' ')}</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getTagDescription(tag)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
        
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Directional Bias</h4>
          <div className="flex flex-wrap gap-1">
            {wallet.tags?.filter(tag => tagCategories.bias.includes(tag)).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">{tag.replace(/_/g, ' ')}</Badge>
            ))}
          </div>
        </div>
        
        {showDetails && (
          <>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Special Characteristics</h4>
              <div className="flex flex-wrap gap-1">
                {wallet.tags?.filter(tag => tagCategories.special.includes(tag)).map(tag => (
                  <Badge key={tag} variant="destructive" className="text-xs">{tag.replace(/_/g, ' ')}</Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        Last updated: {new Date(wallet.last_updated || Date.now()).toLocaleString()}
      </CardFooter>
    </Card>
  );
}

// Helper function to get tag descriptions
function getTagDescription(tag: string): string {
  const descriptions: Record<string, string> = {
    'scalper': 'Makes quick trades with small profits',
    'swing_trader': 'Holds positions for days to weeks',
    'position_trader': 'Holds positions for weeks to months',
    'sniper': 'Takes precise entries with high win rate',
    'sniper_trader': 'Takes precise entries with high win rate',
    // Add more descriptions as needed
  };
  
  return descriptions[tag] || 'No description available';
}