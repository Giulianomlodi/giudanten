import mongoose, { Schema, Document, Model } from "mongoose";

// Define type for Score Components
export interface IScoreComponents {
  roi_30d: number;
  win_rate: number;
  pnl_per_trade: number;
  leverage_avg: number;
  drawdown: number;
  consistency: number;
  frequency: number;
  post_loss: number;
  roi_trend: number;
}

// Define type for WalletScore document
export interface IWalletScore extends Document {
  wallet: string;
  score: number;
  components: IScoreComponents;
  qualified: boolean;
  disqualification_reason?: string;
  last_updated: Date;
}

// Define Score Components Schema
const ScoreComponentsSchema: Schema = new Schema<IScoreComponents>(
  {
    roi_30d: { type: Number, required: true },
    win_rate: { type: Number, required: true },
    pnl_per_trade: { type: Number, required: true },
    leverage_avg: { type: Number, required: true },
    drawdown: { type: Number, required: true },
    consistency: { type: Number, required: true },
    frequency: { type: Number, required: true },
    post_loss: { type: Number, required: true },
    roi_trend: { type: Number, required: true },
  },
  { _id: false }
); // No need for _id in subdocument

// Define WalletScore Schema
const WalletScoreSchema: Schema = new Schema<IWalletScore>({
  wallet: { type: String, required: true, unique: true, index: true },
  score: { type: Number, required: true },
  components: { type: ScoreComponentsSchema, required: true },
  qualified: { type: Boolean, required: true },
  disqualification_reason: { type: String },
  last_updated: { type: Date, default: Date.now },
});

// Create the model - ensure it's only created once
const WalletScore: Model<IWalletScore> =
  mongoose.models.WalletScore ||
  mongoose.model<IWalletScore>("WalletScore", WalletScoreSchema);

export default WalletScore;
