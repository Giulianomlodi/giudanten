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
var mongodb_1 = require("../lib/mongodb");
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
// Test della connessione al database
function testDatabaseConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var db, collections, collectionsList, collectionNames, walletsExists, count, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    printTitle("Test della connessione al database");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    console.log("Connessione al database...");
                    return [4 /*yield*/, (0, mongodb_1.connectToDatabase)()];
                case 2:
                    db = (_a.sent()).db;
                    console.log("Connessione riuscita");
                    collections = (0, mongodb_1.getCollectionNames)();
                    console.log("Collezioni configurate:", collections);
                    return [4 /*yield*/, db.listCollections().toArray()];
                case 3:
                    collectionsList = _a.sent();
                    collectionNames = collectionsList.map(function (c) { return c.name; });
                    console.log("Collezioni esistenti:", collectionNames);
                    walletsExists = collectionNames.includes(collections.WALLETS);
                    printResult("Collezione WALLETS", walletsExists);
                    if (!walletsExists) return [3 /*break*/, 5];
                    return [4 /*yield*/, db.collection(collections.WALLETS).countDocuments()];
                case 4:
                    count = _a.sent();
                    console.log("Numero di documenti nella collezione WALLETS: ".concat(count));
                    _a.label = 5;
                case 5: return [2 /*return*/, printResult("Connessione al database", true, "Database accessibile e collezioni verificate")];
                case 6:
                    error_1 = _a.sent();
                    console.error("Errore completo:", error_1);
                    return [2 /*return*/, printResult("Connessione al database", false, error_1.message)];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Test dell'API di ingestione
function testIngestAPI() {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, response, endTime, duration, errorMessage, errorData, e_1, text, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    printTitle("Test dell'API di ingestione");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    console.log("Effettuo richiesta all'API di ingestione...");
                    startTime = Date.now();
                    return [4 /*yield*/, (0, node_fetch_1.default)('http://localhost:3000/api/ingest', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                'Cache-Control': 'no-cache',
                                'Pragma': 'no-cache'
                            }
                        })];
                case 2:
                    response = _a.sent();
                    endTime = Date.now();
                    duration = (endTime - startTime) / 1000;
                    console.log("Status: ".concat(response.status, " ").concat(response.statusText));
                    console.log("Tempo di risposta: ".concat(duration.toFixed(2), " secondi"));
                    if (!!response.ok) return [3 /*break*/, 8];
                    errorMessage = "".concat(response.status, " ").concat(response.statusText);
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 7]);
                    return [4 /*yield*/, response.json()];
                case 4:
                    errorData = _a.sent();
                    console.log("Dettagli errore:", errorData);
                    if (errorData.error) {
                        errorMessage += " - ".concat(errorData.error);
                    }
                    return [3 /*break*/, 7];
                case 5:
                    e_1 = _a.sent();
                    return [4 /*yield*/, response.text()];
                case 6:
                    text = _a.sent();
                    console.log("Risposta non JSON:", text.substring(0, 500));
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, printResult("API di ingestione", false, errorMessage)];
                case 8: return [4 /*yield*/, response.json()];
                case 9:
                    data = _a.sent();
                    console.log("Risposta ricevuta:", data);
                    if (!data.success) {
                        return [2 /*return*/, printResult("API di ingestione", false, data.message || "Operazione non riuscita")];
                    }
                    return [2 /*return*/, printResult("API di ingestione", true, "Operazione completata: ".concat(data.count, " wallet elaborati"))];
                case 10:
                    error_2 = _a.sent();
                    console.error("Errore completo:", error_2);
                    return [2 /*return*/, printResult("API di ingestione", false, error_2.message)];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// Test del database dopo l'ingestione
function testDatabaseAfterIngest() {
    return __awaiter(this, void 0, void 0, function () {
        var db, collections, count, sampleWallets, sampleWallet, hasEssentialFields, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    printTitle("Verifica del database dopo l'ingestione");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, (0, mongodb_1.connectToDatabase)()];
                case 2:
                    db = (_a.sent()).db;
                    collections = (0, mongodb_1.getCollectionNames)();
                    return [4 /*yield*/, db.collection(collections.WALLETS).countDocuments()];
                case 3:
                    count = _a.sent();
                    console.log("Numero di documenti nella collezione WALLETS: ".concat(count));
                    if (count === 0) {
                        return [2 /*return*/, printResult("Database dopo ingestione", false, "Nessun wallet trovato nel database")];
                    }
                    return [4 /*yield*/, db.collection(collections.WALLETS)
                            .find({})
                            .limit(1)
                            .toArray()];
                case 4:
                    sampleWallets = _a.sent();
                    if (sampleWallets.length === 0) {
                        return [2 /*return*/, printResult("Campione wallet", false, "Impossibile recuperare un wallet di esempio")];
                    }
                    sampleWallet = sampleWallets[0];
                    console.log("Esempio di wallet nel database:", JSON.stringify(sampleWallet, null, 2));
                    hasEssentialFields = sampleWallet._id !== undefined &&
                        sampleWallet.accountValue !== undefined &&
                        sampleWallet.stats !== undefined;
                    if (!hasEssentialFields) {
                        return [2 /*return*/, printResult("Struttura wallet", false, "Campi essenziali mancanti nei wallet")];
                    }
                    return [2 /*return*/, printResult("Database dopo ingestione", true, "".concat(count, " wallet trovati nel database"))];
                case 5:
                    error_3 = _a.sent();
                    console.error("Errore completo:", error_3);
                    return [2 /*return*/, printResult("Database dopo ingestione", false, error_3.message)];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Funzione principale
function runTests() {
    return __awaiter(this, void 0, void 0, function () {
        var dbConnected, ingestSuccess;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
                    console.log("".concat(colors.magenta, "   TEST DELL'API DI INGESTIONE                    ").concat(colors.reset));
                    console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
                    return [4 /*yield*/, testDatabaseConnection()];
                case 1:
                    dbConnected = _a.sent();
                    if (!dbConnected) {
                        console.log("".concat(colors.red, "\u274C Test interrotto: impossibile connettersi al database").concat(colors.reset));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, testIngestAPI()];
                case 2:
                    ingestSuccess = _a.sent();
                    if (!ingestSuccess) return [3 /*break*/, 4];
                    // Verifica il database dopo l'ingestione
                    return [4 /*yield*/, testDatabaseAfterIngest()];
                case 3:
                    // Verifica il database dopo l'ingestione
                    _a.sent();
                    _a.label = 4;
                case 4:
                    console.log("\n".concat(colors.magenta, "==================================================").concat(colors.reset));
                    console.log("".concat(colors.yellow, "Suggerimenti per risolvere problemi di ingestione:").concat(colors.reset));
                    console.log("".concat(colors.yellow, "1. Verifica che il server Next.js sia in esecuzione").concat(colors.reset));
                    console.log("".concat(colors.yellow, "2. Controlla i log del server per errori dettagliati").concat(colors.reset));
                    console.log("".concat(colors.yellow, "3. Verifica che MongoDB sia accessibile").concat(colors.reset));
                    console.log("".concat(colors.yellow, "4. Controlla che le API di Hyperliquid siano raggiungibili").concat(colors.reset));
                    console.log("".concat(colors.yellow, "5. Verifica la struttura dei dati restituiti dalle API").concat(colors.reset));
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
