import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, getCollectionNames } from "@/lib/mongodb";
import { constructPortfolio } from "@/utils/portfolioConstructor";
import { updateWalletWithCopyMode } from "@/utils/copyModeAssignment";
import { WalletModel, TradeModel } from "@/types/hyperliquid";

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    const { db } = await connectToDatabase();
    const collections = getCollectionNames();

    // Get qualified wallets - limitiamo a 100 per migliorare le performance
    const qualifiedWallets = await db
      .collection(collections.WALLETS)
      .find({ qualified: true })
      .limit(100)
      .toArray() as WalletModel[];

    // Check if we have any qualified wallets
    if (qualifiedWallets.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "No qualified wallets found",
        count: 0
      });
    }

    // Ottimizzazione: aggiorniamo i copy_mode in batch invece che uno per uno
    const copyModeUpdates = qualifiedWallets.map(wallet => {
      const updatedWallet = updateWalletWithCopyMode(wallet);
      return {
        updateOne: {
          filter: { _id: wallet._id },
          update: { $set: { copy_mode: updatedWallet.copy_mode } }
        }
      };
    });

    // Eseguiamo l'aggiornamento in batch
    if (copyModeUpdates.length > 0) {
      await db.collection(collections.WALLETS).bulkWrite(copyModeUpdates);
    }

    // Ottimizzazione: recuperiamo i trade in batch con un'unica query
    const walletIds = qualifiedWallets.map(wallet => wallet._id);
    
    // Verifichiamo se la collezione TRADES esiste
    const collectionsList = await db.listCollections({ name: collections.TRADES }).toArray();
    
    let allTrades: TradeModel[] = [];
    if (collectionsList.length > 0) {
      // La collezione esiste, recuperiamo i trade
      allTrades = await db
        .collection(collections.TRADES)
        .find({ wallet: { $in: walletIds } })
        .toArray() as TradeModel[];
    }
    
    // Organizziamo i trade per wallet
    const tradesByWallet: Record<string, TradeModel[]> = {};
    for (const wallet of qualifiedWallets) {
      tradesByWallet[wallet._id] = [];
    }
    
    for (const trade of allTrades) {
      if (tradesByWallet[trade.wallet]) {
        tradesByWallet[trade.wallet].push(trade);
      }
    }

    // Construct portfolio with trades data
    const portfolio = constructPortfolio(qualifiedWallets, tradesByWallet);

    // Verifica che il portfolio sia valido
    if (!portfolio || !portfolio.wallets) {
      console.error("Invalid portfolio returned from constructPortfolio");
      return NextResponse.json({ 
        success: false, 
        message: "Failed to construct valid portfolio",
        count: 0
      }, { status: 500 });
    }

    // Save portfolio to database
    await db.collection(collections.PORTFOLIOS).insertOne({
      ...portfolio,
      created_at: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      count: portfolio.wallets.length
    });
  } catch (error) {
    console.error("Error constructing portfolio:", error);
    
    // Gestione più dettagliata dell'errore
    let errorMessage = "Failed to construct portfolio";
    let errorDetails = String(error);
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || String(error);
    }
    
    return NextResponse.json(
      { 
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
    
    // Check if type parameter is in the URL
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    
    if (type === 'copymodes') {
      // Return wallets grouped by copy mode
      const wallets = await db.collection(collections.WALLETS)
        .find({ qualified: true })
        .toArray();
      
      // Group wallets by copy mode
      const copyModes: Record<string, any[]> = {};
      wallets.forEach(wallet => {
        const mode = wallet.copy_mode || 'standard';
        if (!copyModes[mode]) {
          copyModes[mode] = [];
        }
        copyModes[mode].push(wallet);
      });
      
      // Check if format=csv is in the URL
      const format = url.searchParams.get('format');
      
      if (format === 'csv') {
        // Return CSV format
        const headers = ['copy_mode', 'address', 'displayName', 'totalScore'];
        const csvRows = [headers.join(',')];
        
        Object.entries(copyModes).forEach(([mode, modeWallets]) => {
          modeWallets.forEach(wallet => {
            const row = [
              mode,
              wallet._id,
              wallet.displayName || '',
              wallet.score?.total || 0
            ].join(',');
            csvRows.push(row);
          });
        });
        
        const csv = csvRows.join('\n');
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=copy_modes.csv'
          }
        });
      }
      
      // Default to JSON
      return NextResponse.json({ copy_modes: copyModes });
    } else {
      // Get the latest portfolio
      const portfolio = await db.collection(collections.PORTFOLIOS)
        .find()
        .sort({ created_at: -1 })
        .limit(1)
        .toArray();
      
      // Check if format=csv is in the URL
      const format = url.searchParams.get('format');
      
      if (format === 'csv' && portfolio.length > 0) {
        // Return CSV format
        const headers = ['address', 'displayName', 'weight', 'copy_mode', 'totalScore'];
        const csvRows = [headers.join(',')];
        
        portfolio[0].wallets.forEach(wallet => {
          const row = [
            wallet.address,
            wallet.displayName || '',
            wallet.weight || 0,
            wallet.copy_mode || 'standard',
            wallet.score?.total || 0
          ].join(',');
          csvRows.push(row);
        });
        
        const csv = csvRows.join('\n');
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=portfolio.csv'
          }
        });
      }
      
      // Default to JSON
      return NextResponse.json(portfolio.length > 0 ? portfolio[0] : { error: "No portfolio found" });
    }
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}