import { PortfolioModel } from "@/types/hyperliquid";

export function PortfolioDistribution({ portfolio }: { portfolio: PortfolioModel }) {
  // ... existing code ...
  
  const distributions = [
    {
      title: "Trading Styles",
      data: portfolio.meta.style_distribution,
      colorScale: "blues"
    },
    {
      title: "Regions",
      data: portfolio.meta.region_distribution,
      colorScale: "greens"
    },
    {
      title: "Directional Bias",
      data: portfolio.meta.directional_bias_distribution || {},
      colorScale: "oranges"
    },
    {
      title: "Time Patterns",
      data: portfolio.meta.time_pattern_distribution || {},
      colorScale: "purples"
    },
    {
      title: "Profit Orientation",
      data: portfolio.meta.profit_orientation_distribution || {},
      colorScale: "reds"
    },
    {
      title: "Market Sessions",
      data: portfolio.meta.market_sessions_distribution || {},
      colorScale: "teals"
    }
  ];
  
  // ... existing code ...
}