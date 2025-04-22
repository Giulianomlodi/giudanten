import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, getCollectionNames } from "@/lib/mongodb";
import { withRetry, fetchLeaderboard } from "@/services/hyperliquidService";
import { transformLeaderboardData } from "@/utils/transformUtils";

export async function POST(req: NextRequest) {
  try {
    console.log("Starting data ingestion process...");
    
    // Connessione al database con timeout
    let dbConnection;
    try {
      dbConnection = await Promise.race([
        connectToDatabase(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Database connection timed out")), 10000))
      ]);
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { 
          success: false, 
          error: "Database connection failed", 
          details: dbError instanceof Error ? dbError.message : String(dbError)
        },
        { status: 500 }
      );
    }
    
    const { db } = dbConnection;
    const collections = getCollectionNames();

    console.log("Connected to database, fetching leaderboard data...");
    
    // Fetch leaderboard data with retry and error handling
    let leaderboardData;
    try {
      leaderboardData = await withRetry(() => fetchLeaderboard(), 3, 5000);
    } catch (apiError) {
      console.error("Leaderboard API error:", apiError);
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to fetch leaderboard data", 
          details: apiError instanceof Error ? apiError.message : String(apiError)
        },
        { status: 502 }
      );
    }
    
    if (!leaderboardData || !leaderboardData.leaderboardRows) {
      return NextResponse.json(
        { success: false, error: "Invalid or empty leaderboard data received" },
        { status: 502 }
      );
    }
    
    console.log(`Received ${leaderboardData.leaderboardRows.length} leaderboard entries`);
    
    // Transform data with error handling
    let walletDataList;
    try {
      walletDataList = transformLeaderboardData(leaderboardData);
    } catch (transformError) {
      console.error("Data transformation error:", transformError);
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to transform leaderboard data", 
          details: transformError instanceof Error ? transformError.message : String(transformError)
        },
        { status: 500 }
      );
    }
    
    if (!walletDataList || walletDataList.length === 0) {
      return NextResponse.json(
        { success: false, error: "No wallet data after transformation" },
        { status: 500 }
      );
    }
    
    console.log(`Transformed ${walletDataList.length} wallet entries`);

    // Prepare bulk operations with error handling
    try {
      // Prepare bulk operations
      const bulkOps = walletDataList.map((walletData) => ({
        updateOne: {
          filter: { _id: walletData._id },
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

      // Execute bulk write with error handling
      try {
        console.log(`Executing bulk write for ${bulkOps.length} operations...`);
        const result = await db.collection(collections.WALLETS).bulkWrite(bulkOps);
        console.log("Bulk write completed successfully");
        
        return NextResponse.json({
          success: true,
          count: walletDataList.length,
          upserted: result.upsertedCount,
          modified: result.modifiedCount,
        });
      } catch (dbError) {
        console.error("Database bulk operation failed:", dbError);
        
        // Fallback to individual inserts if bulk operation fails
        console.log("Attempting individual inserts as fallback...");
        let successCount = 0;
        
        for (const walletData of walletDataList) {
          try {
            await db.collection(collections.WALLETS).updateOne(
              { _id: walletData._id },
              { $set: walletData },
              { upsert: true }
            );
            successCount++;
          } catch (individualError) {
            console.error(`Failed to insert wallet ${walletData._id}:`, individualError);
          }
        }
        
        if (successCount > 0) {
          return NextResponse.json({
            success: true,
            count: successCount,
            message: "Used fallback individual inserts due to bulk write failure",
          });
        } else {
          throw new Error("Both bulk and individual database operations failed");
        }
      }
    } catch (error) {
      console.error("Error during database operations:", error);
      return NextResponse.json(
        { 
          success: false, 
          error: "Database operations failed", 
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Ingest API error:", error);
    
    // Fornisci un messaggio di errore dettagliato
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Unknown error during data ingestion";
      
    const errorDetails = error instanceof Error && error.stack 
      ? error.stack.split('\n').slice(0, 3).join('\n')
      : "No stack trace available";
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const collections = getCollectionNames();
    
    const wallets = await db.collection(collections.WALLETS).find().toArray();
    
    // Check if format=csv is in the URL
    const url = new URL(req.url);
    const format = url.searchParams.get('format');
    
    if (format === 'csv') {
      // Return CSV format
      const headers = ['address', 'displayName', 'accountValue', 'lastUpdated'];
      const csvRows = [headers.join(',')];
      
      wallets.forEach((wallet: { _id: string; displayName?: string; accountValue?: number; lastUpdated?: string }) => {
        const row = [
          wallet._id,
          wallet.displayName || '',
          wallet.accountValue || 0,
          wallet.lastUpdated || ''
        ].join(',');
        csvRows.push(row);
      });
      
      const csv = csvRows.join('\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=wallets.csv'
        }
      });
    }
    
    // Default to JSON
    return NextResponse.json({ wallets });
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallets" },
      { status: 500 }
    );
  }
}

// RIMUOVI TUTTO IL CODICE DOPO QUESTA RIGA