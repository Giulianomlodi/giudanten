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
var EXCHANGE_API = "https://api.hyperliquid.xyz/exchange";
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
// Test dell'API di Market Data
function testMarketDataAPI() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, firstMarket, hasEssentialFields, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    printTitle("Test dell'API Market Data");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    console.log("Effettuo richiesta all'API Market Data...");
                    return [4 /*yield*/, (0, node_fetch_1.default)(INFO_API, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            body: JSON.stringify({ type: "allMids" })
                        })];
                case 2:
                    response = _a.sent();
                    console.log("Status: ".concat(response.status, " ").concat(response.statusText));
                    if (!response.ok) {
                        return [2 /*return*/, printResult("API Market Data", false, "".concat(response.status, " ").concat(response.statusText))];
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    console.log("Risposta ricevuta, analizzo il contenuto...");
                    if (!data) {
                        return [2 /*return*/, printResult("API Market Data", false, "Risposta vuota")];
                    }
                    if (!Array.isArray(data)) {
                        console.log("Struttura della risposta:", JSON.stringify(data).substring(0, 200) + "...");
                        return [2 /*return*/, printResult("API Market Data", false, "Risposta non è un array")];
                    }
                    console.log("Numero di mercati: ".concat(data.length));
                    if (data.length > 0) {
                        firstMarket = data[0];
                        console.log("Primo mercato:", JSON.stringify(firstMarket, null, 2));
                        hasEssentialFields = firstMarket.coin !== undefined &&
                            firstMarket.mid !== undefined;
                        if (!hasEssentialFields) {
                            return [2 /*return*/, printResult("API Market Data", false, "Campi essenziali mancanti nella risposta")];
                        }
                    }
                    return [2 /*return*/, printResult("API Market Data", true, "Ricevuti dati per ".concat(data.length, " mercati"))];
                case 4:
                    error_1 = _a.sent();
                    console.error("Errore completo:", error_1);
                    return [2 /*return*/, printResult("API Market Data", false, error_1.message)];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Test dell'API di Order Book
function testOrderBookAPI() {
    return __awaiter(this, void 0, void 0, function () {
        var marketsResponse, marketsData, testSymbol, response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    printTitle("Test dell'API Order Book");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    // Prima otteniamo un simbolo valido
                    console.log("Ottengo un simbolo valido...");
                    return [4 /*yield*/, (0, node_fetch_1.default)(INFO_API, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            body: JSON.stringify({ type: "metaAndAssetCtxs" })
                        })];
                case 2:
                    marketsResponse = _a.sent();
                    if (!marketsResponse.ok) {
                        return [2 /*return*/, printResult("API Order Book", false, "Impossibile ottenere un simbolo di test")];
                    }
                    return [4 /*yield*/, marketsResponse.json()];
                case 3:
                    marketsData = _a.sent();
                    if (!marketsData.universe || marketsData.universe.length === 0) {
                        return [2 /*return*/, printResult("API Order Book", false, "Nessun simbolo disponibile per il test")];
                    }
                    testSymbol = marketsData.universe[0].name;
                    console.log("Simbolo di test: ".concat(testSymbol));
                    console.log("Effettuo richiesta all'API Order Book...");
                    return [4 /*yield*/, (0, node_fetch_1.default)(INFO_API, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            body: JSON.stringify({
                                type: "l2Book",
                                coin: testSymbol
                            })
                        })];
                case 4:
                    response = _a.sent();
                    console.log("Status: ".concat(response.status, " ").concat(response.statusText));
                    if (!response.ok) {
                        return [2 /*return*/, printResult("API Order Book", false, "".concat(response.status, " ").concat(response.statusText))];
                    }
                    return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    console.log("Risposta ricevuta, analizzo il contenuto...");
                    if (!data) {
                        return [2 /*return*/, printResult("API Order Book", false, "Risposta vuota")];
                    }
                    if (!data.coin || !data.levels || !Array.isArray(data.levels.asks) || !Array.isArray(data.levels.bids)) {
                        console.log("Struttura della risposta:", JSON.stringify(data).substring(0, 200) + "...");
                        return [2 /*return*/, printResult("API Order Book", false, "Struttura dell'order book non valida")];
                    }
                    console.log("Order book per ".concat(data.coin, ":"));
                    console.log("- Asks: ".concat(data.levels.asks.length));
                    console.log("- Bids: ".concat(data.levels.bids.length));
                    return [2 /*return*/, printResult("API Order Book", true, "Order book ricevuto per ".concat(testSymbol))];
                case 6:
                    error_2 = _a.sent();
                    console.error("Errore completo:", error_2);
                    return [2 /*return*/, printResult("API Order Book", false, error_2.message)];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Test dell'API di Funding Rates
function testFundingRatesAPI() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, firstRate, hasEssentialFields, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    printTitle("Test dell'API Funding Rates");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    console.log("Effettuo richiesta all'API Funding Rates...");
                    return [4 /*yield*/, (0, node_fetch_1.default)(INFO_API, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            body: JSON.stringify({ type: "fundingHistory" })
                        })];
                case 2:
                    response = _a.sent();
                    console.log("Status: ".concat(response.status, " ").concat(response.statusText));
                    if (!response.ok) {
                        return [2 /*return*/, printResult("API Funding Rates", false, "".concat(response.status, " ").concat(response.statusText))];
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    console.log("Risposta ricevuta, analizzo il contenuto...");
                    if (!data) {
                        return [2 /*return*/, printResult("API Funding Rates", false, "Risposta vuota")];
                    }
                    if (!Array.isArray(data)) {
                        console.log("Struttura della risposta:", JSON.stringify(data).substring(0, 200) + "...");
                        return [2 /*return*/, printResult("API Funding Rates", false, "Risposta non è un array")];
                    }
                    console.log("Numero di funding rates: ".concat(data.length));
                    if (data.length > 0) {
                        firstRate = data[0];
                        console.log("Primo funding rate:", JSON.stringify(firstRate, null, 2));
                        hasEssentialFields = firstRate.coin !== undefined &&
                            firstRate.fundingRate !== undefined &&
                            firstRate.time !== undefined;
                        if (!hasEssentialFields) {
                            return [2 /*return*/, printResult("API Funding Rates", false, "Campi essenziali mancanti nella risposta")];
                        }
                    }
                    return [2 /*return*/, printResult("API Funding Rates", true, "Ricevuti ".concat(data.length, " funding rates"))];
                case 4:
                    error_3 = _a.sent();
                    console.error("Errore completo:", error_3);
                    return [2 /*return*/, printResult("API Funding Rates", false, error_3.message)];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Test dell'API di Recent Trades
function testRecentTradesAPI() {
    return __awaiter(this, void 0, void 0, function () {
        var marketsResponse, marketsData, testSymbol, response, data, firstTrade, hasEssentialFields, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    printTitle("Test dell'API Recent Trades");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    // Prima otteniamo un simbolo valido
                    console.log("Ottengo un simbolo valido...");
                    return [4 /*yield*/, (0, node_fetch_1.default)(INFO_API, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            body: JSON.stringify({ type: "metaAndAssetCtxs" })
                        })];
                case 2:
                    marketsResponse = _a.sent();
                    if (!marketsResponse.ok) {
                        return [2 /*return*/, printResult("API Recent Trades", false, "Impossibile ottenere un simbolo di test")];
                    }
                    return [4 /*yield*/, marketsResponse.json()];
                case 3:
                    marketsData = _a.sent();
                    if (!marketsData.universe || marketsData.universe.length === 0) {
                        return [2 /*return*/, printResult("API Recent Trades", false, "Nessun simbolo disponibile per il test")];
                    }
                    testSymbol = marketsData.universe[0].name;
                    console.log("Simbolo di test: ".concat(testSymbol));
                    console.log("Effettuo richiesta all'API Recent Trades...");
                    return [4 /*yield*/, (0, node_fetch_1.default)(INFO_API, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            body: JSON.stringify({
                                type: "recentTrades",
                                coin: testSymbol
                            })
                        })];
                case 4:
                    response = _a.sent();
                    console.log("Status: ".concat(response.status, " ").concat(response.statusText));
                    if (!response.ok) {
                        return [2 /*return*/, printResult("API Recent Trades", false, "".concat(response.status, " ").concat(response.statusText))];
                    }
                    return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    console.log("Risposta ricevuta, analizzo il contenuto...");
                    if (!data) {
                        return [2 /*return*/, printResult("API Recent Trades", false, "Risposta vuota")];
                    }
                    if (!Array.isArray(data)) {
                        console.log("Struttura della risposta:", JSON.stringify(data).substring(0, 200) + "...");
                        return [2 /*return*/, printResult("API Recent Trades", false, "Risposta non è un array")];
                    }
                    console.log("Numero di trade recenti: ".concat(data.length));
                    if (data.length > 0) {
                        firstTrade = data[0];
                        console.log("Primo trade:", JSON.stringify(firstTrade, null, 2));
                        hasEssentialFields = firstTrade.coin !== undefined &&
                            firstTrade.side !== undefined &&
                            firstTrade.px !== undefined &&
                            firstTrade.sz !== undefined &&
                            firstTrade.time !== undefined;
                        if (!hasEssentialFields) {
                            return [2 /*return*/, printResult("API Recent Trades", false, "Campi essenziali mancanti nella risposta")];
                        }
                    }
                    return [2 /*return*/, printResult("API Recent Trades", true, "Ricevuti ".concat(data.length, " trade recenti per ").concat(testSymbol))];
                case 6:
                    error_4 = _a.sent();
                    console.error("Errore completo:", error_4);
                    return [2 /*return*/, printResult("API Recent Trades", false, error_4.message)];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Funzione principale
function runTests() {
    return __awaiter(this, void 0, void 0, function () {
        var results, allPassed, _i, _a, _b, test, result, passed, testName;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
                    console.log("".concat(colors.magenta, "   TEST DELLE API DI TRADING HYPERLIQUID          ").concat(colors.reset));
                    console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
                    _c = {};
                    return [4 /*yield*/, testMarketDataAPI()];
                case 1:
                    _c.marketData = _d.sent();
                    return [4 /*yield*/, testOrderBookAPI()];
                case 2:
                    _c.orderBook = _d.sent();
                    return [4 /*yield*/, testFundingRatesAPI()];
                case 3:
                    _c.fundingRates = _d.sent();
                    return [4 /*yield*/, testRecentTradesAPI()];
                case 4:
                    results = (_c.recentTrades = _d.sent(),
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
                        console.log("".concat(colors.green, "\u2705 TUTTI I TEST DELLE API DI TRADING SONO STATI SUPERATI!").concat(colors.reset));
                    }
                    else {
                        console.log("".concat(colors.red, "\u274C ALCUNI TEST DELLE API DI TRADING NON SONO STATI SUPERATI.").concat(colors.reset));
                        console.log("".concat(colors.yellow, "Controlla i dettagli sopra per risolvere i problemi.").concat(colors.reset));
                    }
                    console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
                    return [2 /*return*/];
            }
        });
    });
}
// Esegui i test
runTests().catch(function (error) {
    console.error("".concat(colors.red, "Errore durante l'esecuzione dei test:").concat(colors.reset), error);
});
