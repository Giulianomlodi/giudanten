"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_fetch_1 = __importDefault(require("node-fetch"));
// Costanti
var LEADERBOARD_API = "https://api.hyperliquid.xyz/info";
var INFO_API = "https://api.hyperliquid.xyz/info";
// Colori per l'output
var colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m"
};
// Funzione per stampare un titolo
function printTitle(title) {
    console.log("\n".concat(colors.cyan, "=== ").concat(title, " ===").concat(colors.reset, "\n"));
}
// Funzione per stampare un risultato
function printResult(test, passed, details) {
    var icon = passed ? '✅' : '❌';
    var color = passed ? colors.green : colors.red;
    console.log("".concat(color).concat(icon, " ").concat(test).concat(colors.reset).concat(details ? ": ".concat(details) : ''));
    return passed;
}
// Test dell'API Leaderboard
function testLeaderboardAPI() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, firstRow, hasEssentialFields, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    printTitle("Test dell'API Leaderboard");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    console.log("Effettuo richiesta all'API Leaderboard...");
                    return [4 /*yield*/, (0, node_fetch_1.default)(LEADERBOARD_API, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            body: JSON.stringify({ type: "leaderboard" })
                        })];
                case 2:
                    response = _a.sent();
                    console.log("Status: ".concat(response.status, " ").concat(response.statusText));
                    if (!response.ok) {
                        return [2 /*return*/, printResult("API Leaderboard", false, "".concat(response.status, " ").concat(response.statusText))];
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    console.log("Risposta ricevuta, analizzo il contenuto...");
                    if (!data) {
                        return [2 /*return*/, printResult("API Leaderboard", false, "Risposta vuota")];
                    }
                    if (!data.leaderboardRows) {
                        console.log("Struttura della risposta:", JSON.stringify(data).substring(0, 200) + "...");
                        return [2 /*return*/, printResult("API Leaderboard", false, "Campo leaderboardRows mancante")];
                    }
                    if (!Array.isArray(data.leaderboardRows)) {
                        return [2 /*return*/, printResult("API Leaderboard", false, "leaderboardRows non è un array")];
                    }
                    console.log("Numero di righe nella leaderboard: ".concat(data.leaderboardRows.length));
                    if (data.leaderboardRows.length > 0) {
                        firstRow = data.leaderboardRows[0];
                        console.log("Prima riga della leaderboard:", JSON.stringify(firstRow, null, 2));
                        hasEssentialFields = firstRow.ethAddress !== undefined &&
                            firstRow.accountValue !== undefined &&
                            firstRow.windowPerformances !== undefined;
                        if (!hasEssentialFields) {
                            return [2 /*return*/, printResult("API Leaderboard", false, "Campi essenziali mancanti nella risposta")];
                        }
                    }
                    return [2 /*return*/, printResult("API Leaderboard", true, "Ricevute ".concat(data.leaderboardRows.length, " righe"))];
                case 4:
                    error_1 = _a.sent();
                    console.error("Errore completo:", error_1);
                    return [2 /*return*/, printResult("API Leaderboard", false, error_1.message)];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Test dell'API Wallet Details
function testWalletDetailsAPI() {
    return __awaiter(this, void 0, void 0, function () {
        var leaderboardResponse, leaderboardData, testAddress, response, data, hasEssentialFields, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    printTitle("Test dell'API Wallet Details");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    // Prima otteniamo un indirizzo dalla leaderboard
                    console.log("Ottengo un indirizzo dalla leaderboard...");
                    return [4 /*yield*/, (0, node_fetch_1.default)(LEADERBOARD_API, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            body: JSON.stringify({ type: "leaderboard" })
                        })];
                case 2:
                    leaderboardResponse = _a.sent();
                    if (!leaderboardResponse.ok) {
                        return [2 /*return*/, printResult("API Wallet Details", false, "Impossibile ottenere un indirizzo di test")];
                    }
                    return [4 /*yield*/, leaderboardResponse.json()];
                case 3:
                    leaderboardData = _a.sent();
                    if (!leaderboardData.leaderboardRows || leaderboardData.leaderboardRows.length === 0) {
                        return [2 /*return*/, printResult("API Wallet Details", false, "Nessun indirizzo disponibile per il test")];
                    }
                    testAddress = leaderboardData.leaderboardRows[0].ethAddress;
                    console.log("Indirizzo di test: ".concat(testAddress));
                    console.log("Effettuo richiesta all'API Wallet Details...");
                    return [4 /*yield*/, (0, node_fetch_1.default)(INFO_API, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            body: JSON.stringify({
                                type: "clearinghouseState",
                                user: testAddress
                            })
                        })];
                case 4:
                    response = _a.sent();
                    console.log("Status: ".concat(response.status, " ").concat(response.statusText));
                    if (!response.ok) {
                        return [2 /*return*/, printResult("API Wallet Details", false, "".concat(response.status, " ").concat(response.statusText))];
                    }
                    return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    console.log("Risposta ricevuta, analizzo il contenuto...");
                    if (!data) {
                        return [2 /*return*/, printResult("API Wallet Details", false, "Risposta vuota")];
                    }
                    if (!data.marginSummary) {
                        console.log("Struttura della risposta:", JSON.stringify(data).substring(0, 200) + "...");
                        return [2 /*return*/, printResult("API Wallet Details", false, "Campo marginSummary mancante")];
                    }
                    console.log("Dettagli del wallet:", JSON.stringify(data.marginSummary, null, 2));
                    hasEssentialFields = data.marginSummary.accountValue !== undefined &&
                        data.marginSummary.totalMarginUsed !== undefined;
                    if (!hasEssentialFields) {
                        return [2 /*return*/, printResult("API Wallet Details", false, "Campi essenziali mancanti nella risposta")];
                    }
                    return [2 /*return*/, printResult("API Wallet Details", true, "Dettagli wallet ricevuti per ".concat(testAddress.substring(0, 8), "..."))];
                case 6:
                    error_2 = _a.sent();
                    console.error("Errore completo:", error_2);
                    return [2 /*return*/, printResult("API Wallet Details", false, error_2.message)];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Test dell'API Trade History
function testTradeHistoryAPI() {
    return __awaiter(this, void 0, void 0, function () {
        var leaderboardResponse, leaderboardData, testAddress, startTime, response, data, firstTrade, hasEssentialFields, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    printTitle("Test dell'API Trade History");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    // Prima otteniamo un indirizzo dalla leaderboard
                    console.log("Ottengo un indirizzo dalla leaderboard...");
                    return [4 /*yield*/, (0, node_fetch_1.default)(LEADERBOARD_API, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            body: JSON.stringify({ type: "leaderboard" })
                        })];
                case 2:
                    leaderboardResponse = _a.sent();
                    if (!leaderboardResponse.ok) {
                        return [2 /*return*/, printResult("API Trade History", false, "Impossibile ottenere un indirizzo di test")];
                    }
                    return [4 /*yield*/, leaderboardResponse.json()];
                case 3:
                    leaderboardData = _a.sent();
                    if (!leaderboardData.leaderboardRows || leaderboardData.leaderboardRows.length === 0) {
                        return [2 /*return*/, printResult("API Trade History", false, "Nessun indirizzo disponibile per il test")];
                    }
                    testAddress = leaderboardData.leaderboardRows[0].ethAddress;
                    console.log("Indirizzo di test: ".concat(testAddress));
                    startTime = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
                    console.log("Data di inizio: ".concat(new Date(startTime * 1000).toISOString()));
                    console.log("Effettuo richiesta all'API Trade History...");
                    return [4 /*yield*/, (0, node_fetch_1.default)(INFO_API, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            body: JSON.stringify({
                                type: "userFills",
                                user: testAddress,
                                startTime: startTime
                            })
                        })];
                case 4:
                    response = _a.sent();
                    console.log("Status: ".concat(response.status, " ").concat(response.statusText));
                    if (!response.ok) {
                        return [2 /*return*/, printResult("API Trade History", false, "".concat(response.status, " ").concat(response.statusText))];
                    }
                    return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    console.log("Risposta ricevuta, analizzo il contenuto...");
                    if (!data) {
                        return [2 /*return*/, printResult("API Trade History", false, "Risposta vuota")];
                    }
                    if (!data.fills || !Array.isArray(data.fills)) {
                        console.log("Struttura della risposta:", JSON.stringify(data).substring(0, 200) + "...");
                        return [2 /*return*/, printResult("API Trade History", false, "Campo fills mancante o non è un array")];
                    }
                    console.log("Numero di trade trovati: ".concat(data.fills.length));
                    if (data.fills.length > 0) {
                        firstTrade = data.fills[0];
                        console.log("Primo trade:", JSON.stringify(firstTrade, null, 2));
                        hasEssentialFields = firstTrade.coin !== undefined &&
                            firstTrade.side !== undefined &&
                            firstTrade.px !== undefined &&
                            firstTrade.sz !== undefined;
                        if (!hasEssentialFields) {
                            return [2 /*return*/, printResult("API Trade History", false, "Campi essenziali mancanti nella risposta")];
                        }
                    }
                    return [2 /*return*/, printResult("API Trade History", true, "Ricevuti ".concat(data.fills.length, " trade per ").concat(testAddress.substring(0, 8), "..."))];
                case 6:
                    error_3 = _a.sent();
                    console.error("Errore completo:", error_3);
                    return [2 /*return*/, printResult("API Trade History", false, error_3.message)];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Test di tutte le API di Hyperliquid
function testAllAPIs() {
    return __awaiter(this, void 0, void 0, function () {
        var results, allPassed, _i, _a, _b, test, result, passed, testName;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
                    console.log("".concat(colors.magenta, "   TEST DELLE API HYPERLIQUID                     ").concat(colors.reset));
                    console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
                    _c = {};
                    return [4 /*yield*/, testLeaderboardAPI()];
                case 1:
                    _c.leaderboard = _d.sent();
                    return [4 /*yield*/, testWalletDetailsAPI()];
                case 2:
                    _c.walletDetails = _d.sent();
                    return [4 /*yield*/, testTradeHistoryAPI()];
                case 3:
                    results = (_c.tradeHistory = _d.sent(),
                        _c);
                    // Riepilogo
                    printTitle("RIEPILOGO DEI TEST");
                    allPassed = true;
                    for (_i = 0, _a = Object.entries(results); _i < _a.length; _i++) {
                        _b = _a[_i], test = _b[0], result = _b[1];
                        passed = !!result;
                        allPassed = allPassed && passed;
                        testName = test
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, function (str) { return str.toUpperCase(); });
                        printResult(testName, passed);
                    }
                    console.log("\n".concat(colors.magenta, "==================================================").concat(colors.reset));
                    if (allPassed) {
                        console.log("".concat(colors.green, "\u2705 TUTTI I TEST DELLE API SONO STATI SUPERATI!").concat(colors.reset));
                        console.log("".concat(colors.green, "Le API di Hyperliquid funzionano correttamente.").concat(colors.reset));
                    }
                    else {
                        console.log("".concat(colors.red, "\u274C ALCUNI TEST DELLE API NON SONO STATI SUPERATI.").concat(colors.reset));
                        console.log("".concat(colors.yellow, "Controlla i dettagli sopra per risolvere i problemi.").concat(colors.reset));
                    }
                    console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
                    return [2 /*return*/];
            }
        });
    });
}
// Esegui i test
testAllAPIs().catch(function (error) {
    console.error("".concat(colors.red, "Errore durante l'esecuzione dei test:").concat(colors.reset), error);
});
