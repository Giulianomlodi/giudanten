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

/**
 * POST handler to manually refresh the leaderboard and process a specified number of wallets
 *
 * Request body:
 * {
 *   limit: number // Optional: Number of top wallets to process (default: 10)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(body.limit || 10, 50); // Default to 10, max 50

    // Connect to database
    const { db } = await connectToDatabase();
    const collections = getCollectionNames();

    // Fetch leaderboard data
    const leaderboardData = await withRetry(() => fetchLeaderboard());
    const walletDataList = transformLeaderboardData(leaderboardData);

    // First, bulk upsert all leaderboard data
    const bulkOps = walletDataList.map((walletData) => ({
      updateOne: {
        filter: { _id: walletData._id as any },
        update: {
          $set: {
            lastUpdated: walletData.lastUpdated,
            accountValue: walletData.accountValue,
            displayName: walletData.displayName,
            stats: walletData.stats,
          },
        },
        upsert: true,
      },
    }));

    await db.collection(collections.WALLETS).bulkWrite(bulkOps);

    // Process top N wallets in more detail
    const processedWallets: WalletModel[] = [];

    for (const walletData of walletDataList.slice(0, limit)) {
      const walletId = walletData._id as string;

      // Fetch wallet details
      const walletDetails = await withRetry(() => fetchWalletDetails(walletId));
      const transformedDetails = transformWalletDetails(
        walletDetails,
        walletId
      );

      // Get existing wallet data
      const existingWallet = (await db
        .collection(collections.WALLETS)
        .findOne({ _id: walletId as any })) as any;

      // Merge with existing and new data
      const mergedWallet: WalletModel = {
        ...(existingWallet || {}),
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

      // Store wallet data in database
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

    // Get all qualified wallets from database
    const allQualifiedWallets = (await db
      .collection(collections.WALLETS)
      .find({ qualified: true })
      .sort({ "score.total": -1 })
      .toArray()) as unknown as WalletModel[];

    // Get trades for each qualified wallet
    const tradesByWallet: Record<string, TradeModel[]> = {};
    for (const wallet of allQualifiedWallets) {
      const walletTrades = (await db
        .collection(collections.TRADES)
        .find({ wallet: wallet._id })
        .sort({ timestamp: -1 })
        .toArray()) as unknown as TradeModel[];

      tradesByWallet[wallet._id] = walletTrades;
    }

    const portfolio = constructPortfolio(allQualifiedWallets, tradesByWallet);

    // Store portfolio in database
    await db.collection(collections.PORTFOLIOS).insertOne(portfolio as any);

    return NextResponse.json({
      success: true,
      leaderboard: walletDataList.length,
      processed: processedWallets.length,
      qualified: allQualifiedWallets.length,
      portfolio: {
        wallets: portfolio.wallets.length,
        created_at: portfolio.created_at,
      },
    });
  } catch (error) {
    console.error("Error refreshing data:", error);
    return NextResponse.json(
      {
        error: "Failed to refresh data",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
