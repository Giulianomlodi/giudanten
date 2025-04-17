import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, getCollectionNames } from "@/lib/mongodb";
import {
  fetchLeaderboard,
  fetchWalletDetails,
  fetchTradeHistory,
  withRetry,
} from "@/services/hyperliquidService";
import {
  transformLeaderboardData,
  transformWalletDetails,
  transformTradeHistory,
} from "@/utils/transformUtils";
import { calculateTotalScore } from "@/utils/scoringEngine";
import { qualifyWallet } from "@/utils/qualificationFilter";
import { assignBehaviorTags } from "@/utils/taggingEngine";
import { updateWalletWithCopyMode } from "@/utils/copyModeAssignment";
import { constructPortfolio } from "@/utils/portfolioConstructor";
import { WalletModel, TradeModel } from "@/types/hyperliquid";

// GET handler to retrieve all wallets
export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const collections = getCollectionNames();

    const wallets = await db.collection(collections.WALLETS).find().toArray();

    return NextResponse.json({ wallets });
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallets" },
      { status: 500 }
    );
  }
}

// POST handler to refresh and process wallet data
export async function POST(req: NextRequest) {
  try {
    // Connect to database
    const { db } = await connectToDatabase();
    const collections = getCollectionNames();

    // Fetch leaderboard data
    const leaderboardData = await withRetry(() => fetchLeaderboard());
    const walletDataList = transformLeaderboardData(leaderboardData);

    // Process each wallet
    const processedWallets: WalletModel[] = [];

    for (const walletData of walletDataList.slice(0, 50)) {
      // Limit to top 50 for performance
      const walletId = walletData._id as string;

      // Fetch wallet details
      const walletDetails = await withRetry(() => fetchWalletDetails(walletId));
      const transformedDetails = transformWalletDetails(
        walletDetails,
        walletId
      );

      // Merge with leaderboard data
      const mergedWallet: WalletModel = {
        ...(walletData as WalletModel),
        ...(transformedDetails as WalletModel),
      };

      // Fetch trade history (last 30 days)
      const startTime = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const tradeHistory = await withRetry(() =>
        fetchTradeHistory(walletId, startTime)
      );
      const trades = transformTradeHistory(tradeHistory, walletId);

      // Calculate score
      const scoredWallet = calculateTotalScore(mergedWallet, trades);

      // Qualify wallet
      const qualification = qualifyWallet(scoredWallet, trades);
      scoredWallet.qualified = qualification.qualified;

      // Assign behavior tags
      const taggedWallet = assignBehaviorTags(scoredWallet, trades);

      // Assign copy mode
      const finalWallet = updateWalletWithCopyMode(taggedWallet);

      processedWallets.push(finalWallet);

      // Store wallet data in database - use as any to bypass MongoDB ObjectId type checking
      await db
        .collection(collections.WALLETS)
        .updateOne(
          { _id: walletId as any },
          { $set: finalWallet as any },
          { upsert: true }
        );

      // Store trade data in database
      if (trades.length > 0) {
        // Create bulk operation
        const bulkOps = trades.map((trade) => ({
          updateOne: {
            filter: {
              wallet: trade.wallet,
              timestamp: trade.timestamp,
              coin: trade.coin,
              side: trade.side,
              price: trade.price,
              size: trade.size,
            },
            update: { $set: trade },
            upsert: true,
          },
        }));

        await db.collection(collections.TRADES).bulkWrite(bulkOps);
      }
    }

    // Construct portfolio from qualified wallets
    const qualifiedWallets = processedWallets.filter((w) => w.qualified);

    // Get trades for each qualified wallet
    const tradesByWallet: Record<string, TradeModel[]> = {};
    for (const wallet of qualifiedWallets) {
      const walletTrades = (await db
        .collection(collections.TRADES)
        .find({ wallet: wallet._id })
        .sort({ timestamp: -1 })
        .toArray()) as unknown as TradeModel[];

      tradesByWallet[wallet._id] = walletTrades;
    }

    const portfolio = constructPortfolio(qualifiedWallets, tradesByWallet);

    // Store portfolio in database with type assertion to handle MongoDB document expectations
    await db.collection(collections.PORTFOLIOS).insertOne(portfolio as any);

    return NextResponse.json({
      success: true,
      processed: processedWallets.length,
      qualified: qualifiedWallets.length,
      portfolio: portfolio,
    });
  } catch (error) {
    console.error("Error processing wallets:", error);
    return NextResponse.json(
      { error: "Failed to process wallets" },
      { status: 500 }
    );
  }
}
