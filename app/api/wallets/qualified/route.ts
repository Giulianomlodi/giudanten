import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, getCollectionNames } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const collections = getCollectionNames();

    // Get qualified wallets, sorted by score descending
    const qualifiedWallets = await db
      .collection(collections.WALLETS)
      .find({ qualified: true })
      .sort({ "score.total": -1 })
      .toArray();

    return NextResponse.json({ wallets: qualifiedWallets });
  } catch (error) {
    console.error("Error fetching qualified wallets:", error);
    return NextResponse.json(
      { error: "Failed to fetch qualified wallets" },
      { status: 500 }
    );
  }
}
