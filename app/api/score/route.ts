import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, getCollectionNames } from "@/lib/mongodb";
import { calculateTotalScore } from "@/utils/scoringEngine";
import { WalletModel, TradeModel } from "@/types/hyperliquid";

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    const { db } = await connectToDatabase();
    const collections = getCollectionNames();

    // Get all wallets from database
    const wallets = await db.collection(collections.WALLETS).find().toArray();

    let processedCount = 0;

    // Process each wallet
    for (const wallet of wallets) {
      // Get trades for this wallet
      const trades = await db
        .collection(collections.TRADES)
        .find({ wallet: wallet._id })
        .toArray() as TradeModel[];

      // Calculate score
      const scoredWallet = calculateTotalScore(wallet as WalletModel, trades);

      // Update wallet with score
      await db.collection(collections.WALLETS).updateOne(
        { _id: wallet._id },
        { $set: { 
          score: scoredWallet.score,
          lastScored: new Date()
        }}
      );

      processedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      count: processedCount 
    });
  } catch (error) {
    console.error("Error calculating scores:", error);
    return NextResponse.json(
      { error: "Failed to calculate scores", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const collections = getCollectionNames();
    
    const wallets = await db.collection(collections.WALLETS)
      .find({}, { projection: { _id: 1, displayName: 1, score: 1 } })
      .toArray();
    
    // Check if format=csv is in the URL
    const url = new URL(req.url);
    const format = url.searchParams.get('format');
    
    if (format === 'csv') {
      // Return CSV format
      const headers = ['address', 'displayName', 'totalScore', 'profitScore', 'consistencyScore', 'activityScore'];
      const csvRows = [headers.join(',')];
      
      wallets.forEach(wallet => {
        const row = [
          wallet._id,
          wallet.displayName || '',
          wallet.score?.total || 0,
          wallet.score?.profit || 0,
          wallet.score?.consistency || 0,
          wallet.score?.activity || 0
        ].join(',');
        csvRows.push(row);
      });
      
      const csv = csvRows.join('\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=wallet_scores.csv'
        }
      });
    }
    
    // Default to JSON
    return NextResponse.json({ wallets });
  } catch (error) {
    console.error("Error fetching wallet scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet scores" },
      { status: 500 }
    );
  }
}