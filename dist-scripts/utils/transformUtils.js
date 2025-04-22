"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformAlternativeLeaderboardFormat = exports.transformTradeHistory = exports.transformWalletDetails = exports.transformLeaderboardData = void 0;
function transformLeaderboardData(leaderboardResponse) {
    // Verifica che i dati siano validi
    if (!leaderboardResponse || !leaderboardResponse.leaderboardRows) {
        console.error('Invalid leaderboard data format:', leaderboardResponse);
        return [];
    }
    try {
        var wallets = [];
        for (var _i = 0, _a = leaderboardResponse.leaderboardRows; _i < _a.length; _i++) {
            var row = _a[_i];
            // Verifica che i campi essenziali esistano
            if (!row.ethAddress) {
                console.warn('Skipping leaderboard row without ethAddress:', row);
                continue;
            }
            try {
                var wallet = {
                    _id: row.ethAddress,
                    lastUpdated: new Date(),
                    accountValue: parseFloat(row.accountValue || '0'),
                    displayName: row.displayName || null,
                    stats: {
                        roi_day: 0,
                        roi_week: 0,
                        roi_month: 0,
                        roi_allTime: 0,
                        pnl_day: 0,
                        pnl_week: 0,
                        pnl_month: 0,
                        pnl_allTime: 0,
                        volume_day: 0,
                        volume_week: 0,
                        volume_month: 0,
                        volume_allTime: 0,
                    },
                };
                // Process window performances
                if (row.windowPerformances && Array.isArray(row.windowPerformances)) {
                    for (var _b = 0, _c = row.windowPerformances; _b < _c.length; _b++) {
                        var _d = _c[_b], timeWindow = _d[0], metrics = _d[1];
                        if (!timeWindow || !metrics)
                            continue;
                        var windowKey = timeWindow;
                        if (wallet.stats) {
                            try {
                                wallet.stats["roi_".concat(windowKey)] = parseFloat(metrics.roi || '0');
                                wallet.stats["pnl_".concat(windowKey)] = parseFloat(metrics.pnl || '0');
                                wallet.stats["volume_".concat(windowKey)] = parseFloat(metrics.vlm || '0');
                            }
                            catch (parseError) {
                                console.warn("Error parsing metrics for ".concat(row.ethAddress, ", window ").concat(timeWindow, ":"), parseError);
                                // Continua con i valori predefiniti
                            }
                        }
                    }
                }
                wallets.push(wallet);
            }
            catch (rowError) {
                console.error("Error processing leaderboard row for ".concat(row.ethAddress, ":"), rowError);
                // Continua con la prossima riga
            }
        }
        console.log("Successfully transformed ".concat(wallets.length, " wallets from leaderboard data"));
        return wallets;
    }
    catch (error) {
        console.error('Error transforming leaderboard data:', error);
        return [];
    }
}
exports.transformLeaderboardData = transformLeaderboardData;
function transformWalletDetails(walletDetails, walletId) {
    // Extract margin summary
    var marginSummary = walletDetails.marginSummary;
    var accountValue = parseFloat(marginSummary.accountValue);
    // Extract positions
    var positions = [];
    for (var _i = 0, _a = walletDetails.assetPositions; _i < _a.length; _i++) {
        var assetPosition = _a[_i];
        var positionData = assetPosition.position;
        var size = parseFloat(positionData.szi);
        var leverageInfo = positionData.leverage;
        var leverageValue = leverageInfo.value;
        var position = {
            coin: positionData.coin,
            size: size,
            leverage: leverageValue,
            entry_price: parseFloat(positionData.entryPx),
            position_value: parseFloat(positionData.positionValue),
            unrealized_pnl: parseFloat(positionData.unrealizedPnl),
            roi: parseFloat(positionData.returnOnEquity),
            margin_used: parseFloat(positionData.marginUsed),
        };
        positions.push(position);
    }
    return {
        _id: walletId,
        lastUpdated: new Date(walletDetails.time),
        accountValue: accountValue,
        withdrawable: parseFloat(walletDetails.withdrawable),
        positions: positions,
    };
}
exports.transformWalletDetails = transformWalletDetails;
function transformTradeHistory(tradeHistory, walletId) {
    var trades = [];
    for (var _i = 0, _a = tradeHistory.fills; _i < _a.length; _i++) {
        var fill = _a[_i];
        var side = fill.side;
        var tradeType = side === "B" ? "long" : "short";
        var size = fill.sz;
        var price = fill.px;
        var trade = {
            wallet: walletId,
            coin: fill.coin,
            side: side,
            size: size,
            price: price,
            timestamp: new Date(fill.time),
            leverage: fill.leverage,
            closed_pnl: fill.closedPnl,
            type: tradeType,
            trade_value_usd: size * price,
        };
        trades.push(trade);
    }
    return trades;
}
exports.transformTradeHistory = transformTradeHistory;
// Funzione di fallback per gestire formati di dati alternativi
function transformAlternativeLeaderboardFormat(data) {
    // Verifica che i dati siano validi
    if (!data || !data.leaderboard || !Array.isArray(data.leaderboard)) {
        console.error('Invalid alternative leaderboard data format:', data);
        return [];
    }
    try {
        return data.leaderboard.map(function (entry) {
            // Verifica che l'entry sia valida
            if (!entry || !entry.address) {
                console.warn('Invalid leaderboard entry:', entry);
                return null;
            }
            return {
                _id: entry.address,
                displayName: entry.displayName || "Wallet_".concat(entry.address.substring(0, 6)),
                accountValue: entry.accountValue || 0,
                lastUpdated: new Date(),
                stats: {
                    pnl: entry.pnl || 0,
                    volume: entry.volume || 0,
                    // Altri campi statistici
                }
            };
        }).filter(Boolean); // Rimuovi gli elementi null
    }
    catch (error) {
        console.error('Error transforming alternative leaderboard data:', error);
        return [];
    }
}
exports.transformAlternativeLeaderboardFormat = transformAlternativeLeaderboardFormat;
