import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, getCollectionNames } from "@/lib/mongodb";
import { assignBehaviorTags, evaluateProfitOrientation } from "@/utils/taggingEngine";
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

      // Assign behavior tags
      const taggedWallet = assignBehaviorTags(wallet as WalletModel, trades);
      
      // Update wallet with tags
      await db.collection(collections.WALLETS).updateOne(
        { _id: wallet._id },
        { $set: { 
          tags: taggedWallet.tags,
          lastTagged: new Date()
        }}
      );

      processedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      count: processedCount
    });
  } catch (error) {
    console.error("Error generating tags:", error);
    return NextResponse.json(
      { error: "Failed to generate tags", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const collections = getCollectionNames();
    
    const wallets = await db.collection(collections.WALLETS)
      .find({}, { projection: { _id: 1, displayName: 1, tags: 1 } })
      .toArray();
    
    // Check if format=csv is in the URL
    const url = new URL(req.url);
    const format = url.searchParams.get('format');
    
    if (format === 'csv') {
      // Return CSV format
      const headers = ['address', 'displayName', 'tags'];
      const csvRows = [headers.join(',')];
      
      wallets.forEach(wallet => {
        const tagsString = wallet.tags ? 
          Object.entries(wallet.tags)
            .map(([key, value]) => `${key}:${value}`)
            .join(';') : '';
            
        const row = [
          wallet._id,
          wallet.displayName || '',
          tagsString
        ].join(',');
        csvRows.push(row);
      });
      
      const csv = csvRows.join('\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=wallet_tags.csv'
        }
      });
    }
    
    // Default to JSON
    return NextResponse.json({ wallets });
  } catch (error) {
    console.error("Error fetching wallet tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet tags" },
      { status: 500 }
    );
  }
}