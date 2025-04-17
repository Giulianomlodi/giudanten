import mongoose, { Schema, Document, Model } from "mongoose";

// Define type for Trade
export interface ITrade {
  asset: string;
  type: "long" | "short";
  size_usd: number;
  leverage: number;
  pnl_pct: number;
  duration_min: number;
  timestamp: Date;
}

// Define type for Wallet document
export interface IWallet extends Document {
  wallet: string; // wallet address
  roi_7d: number;
  roi_30d: number;
  roi_alltime: number;
  win_rate: number;
  total_trades: number;
  pnl_usd: number;
  trades: ITrade[];
  last_updated: Date;
}

// Define Trade Schema
const TradeSchema: Schema = new Schema<ITrade>({
  asset: { type: String, required: true },
  type: { type: String, enum: ["long", "short"], required: true },
  size_usd: { type: Number, required: true },
  leverage: { type: Number, required: true },
  pnl_pct: { type: Number, required: true },
  duration_min: { type: Number, required: true },
  timestamp: { type: Date, required: true },
});

// Define Wallet Schema
const WalletSchema: Schema = new Schema<IWallet>({
  wallet: { type: String, required: true, unique: true, index: true },
  roi_7d: { type: Number, required: true },
  roi_30d: { type: Number, required: true },
  roi_alltime: { type: Number, required: true },
  win_rate: { type: Number, required: true },
  total_trades: { type: Number, required: true },
  pnl_usd: { type: Number, required: true },
  trades: [TradeSchema],
  last_updated: { type: Date, default: Date.now },
});

// Create the model - ensure it's only created once
const Wallet: Model<IWallet> =
  mongoose.models.Wallet || mongoose.model<IWallet>("Wallet", WalletSchema);

export default Wallet;
