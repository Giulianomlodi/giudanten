import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, getCollectionNames } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const collections = getCollectionNames();

    // Get portfolios, sorted by creation date descending (most recent first)
    const portfolios = await db
      .collection(collections.PORTFOLIOS)
      .find()
      .sort({ created_at: -1 })
      .limit(10) // Get last 10 portfolios
      .toArray();

    return NextResponse.json({ portfolios });
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolios" },
      { status: 500 }
    );
  }
}
