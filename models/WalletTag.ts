import mongoose, { Schema, Document, Model } from "mongoose";

// Define types for trading style
export type TradingStyle =
  | "scalper"
  | "swing"
  | "trend_follower"
  | "range_trader";

// Define types for trading behavior
export type TradingBehavior =
  | "disciplined"
  | "aggressive"
  | "opportunistic"
  | "inactive";

// Define types for trading time pattern
export type TimePattern = "day_trader" | "night_trader" | "24h_operator";

// Define types for continents
export type Continent =
  | "europe"
  | "north_america"
  | "south_america"
  | "asia"
  | "africa";

// Define types for asset focus
export type AssetFocus =
  | "btc_focused"
  | "eth_focused"
  | "altcoin_hunter"
  | "diversified";

// Define types for directional bias
export type DirectionalBias =
  | "long_dominant"
  | "short_dominant"
  | "balanced_positioning";

// Define type for Tags
export interface ITags {
  style: TradingStyle;
  behavior: TradingBehavior;
  time_pattern: TimePattern;
  utc_zone: string; // UTC_plus_X or UTC_minus_X
  continent: Continent;
  asset_focus: AssetFocus;
  directional_bias: DirectionalBias;
  direction_percent: string; // e.g., long_74_short_26
}

// Define type for WalletTag document
export interface IWalletTag extends Document {
  wallet: string;
  tags: ITags;
  last_updated: Date;
}

// Define Tags Schema
const TagsSchema: Schema = new Schema<ITags>(
  {
    style: {
      type: String,
      enum: ["scalper", "swing", "trend_follower", "range_trader"],
      required: true,
    },
    behavior: {
      type: String,
      enum: ["disciplined", "aggressive", "opportunistic", "inactive"],
      required: true,
    },
    time_pattern: {
      type: String,
      enum: ["day_trader", "night_trader", "24h_operator"],
      required: true,
    },
    utc_zone: { type: String, required: true },
    continent: {
      type: String,
      enum: ["europe", "north_america", "south_america", "asia", "africa"],
      required: true,
    },
    asset_focus: {
      type: String,
      enum: ["btc_focused", "eth_focused", "altcoin_hunter", "diversified"],
      required: true,
    },
    directional_bias: {
      type: String,
      enum: ["long_dominant", "short_dominant", "balanced_positioning"],
      required: true,
    },
    direction_percent: { type: String, required: true },
  },
  { _id: false }
); // No need for _id in subdocument

// Define WalletTag Schema
const WalletTagSchema: Schema = new Schema<IWalletTag>({
  wallet: { type: String, required: true, unique: true, index: true },
  tags: { type: TagsSchema, required: true },
  last_updated: { type: Date, default: Date.now },
});

// Create the model - ensure it's only created once
const WalletTag: Model<IWalletTag> =
  mongoose.models.WalletTag ||
  mongoose.model<IWalletTag>("WalletTag", WalletTagSchema);

export default WalletTag;
