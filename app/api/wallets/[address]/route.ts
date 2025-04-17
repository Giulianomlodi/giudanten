import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, getCollectionNames } from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address;

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();
    const collections = getCollectionNames();

    // Get wallet data - use string directly since our _id is a string (ETH address), not an ObjectId
    const wallet = await db
      .collection(collections.WALLETS)
      .findOne({ _id: address as any });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Get trades for this wallet, sorted by timestamp descending (most recent first)
    const trades = await db
      .collection(collections.TRADES)
      .find({ wallet: address })
      .sort({ timestamp: -1 })
      .limit(100) // Limit to last 100 trades for performance
      .toArray();

    return NextResponse.json({
      wallet,
      trades: trades as any, // Type assertion to handle MongoDB document conversion
    });
  } catch (error) {
    console.error("Error fetching wallet details:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet details" },
      { status: 500 }
    );
  }
}
