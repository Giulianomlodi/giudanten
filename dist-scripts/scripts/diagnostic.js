"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var mongodb_1 = require("mongodb");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var dotenv_1 = __importDefault(require("dotenv"));
// Carica le variabili d'ambiente
dotenv_1.default.config();
// Costanti
var LEADERBOARD_API = "https://api.hyperliquid.xyz/info";
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:3000/hyperliquid";
var PROJECT_ROOT = path_1.default.resolve(__dirname, '..');
// Colori per l'output
var colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m"
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
// Test di connettività alle API Hyperliquid
function testHyperliquidAPI() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    printTitle("Test di connettività alle API Hyperliquid");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, node_fetch_1.default)(LEADERBOARD_API, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            body: JSON.stringify({ type: "metaAndAssetCtxs" })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        return [2 /*return*/, printResult("API Hyperliquid base", false, "".concat(response.status, " ").concat(response.statusText))];
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    return [2 /*return*/, printResult("API Hyperliquid base", true, "Risposta ricevuta correttamente")];
                case 4:
                    error_1 = _a.sent();
                    return [2 /*return*/, printResult("API Hyperliquid base", false, error_1.message)];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Test dell'API Leaderboard
function testLeaderboardAPI() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, node_fetch_1.default)(LEADERBOARD_API, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            body: JSON.stringify({ type: "leaderboard" })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        return [2 /*return*/, printResult("API Leaderboard", false, "".concat(response.status, " ").concat(response.statusText))];
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (!data || !data.leaderboardRows || !Array.isArray(data.leaderboardRows)) {
                        return [2 /*return*/, printResult("API Leaderboard", false, "Formato dati non valido")];
                    }
                    return [2 /*return*/, printResult("API Leaderboard", true, "Ricevute ".concat(data.leaderboardRows.length, " righe"))];
                case 3:
                    error_2 = _a.sent();
                    return [2 /*return*/, printResult("API Leaderboard", false, error_2.message)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Test dell'API Wallet Details
function testWalletDetailsAPI() {
    return __awaiter(this, void 0, void 0, function () {
        var leaderboardResponse, leaderboardData, testAddress, response, data, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, node_fetch_1.default)(LEADERBOARD_API, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            body: JSON.stringify({ type: "leaderboard" })
                        })];
                case 1:
                    leaderboardResponse = _a.sent();
                    if (!leaderboardResponse.ok) {
                        return [2 /*return*/, printResult("API Wallet Details", false, "Impossibile ottenere un indirizzo di test")];
                    }
                    return [4 /*yield*/, leaderboardResponse.json()];
                case 2:
                    leaderboardData = _a.sent();
                    if (!leaderboardData.leaderboardRows || leaderboardData.leaderboardRows.length === 0) {
                        return [2 /*return*/, printResult("API Wallet Details", false, "Nessun indirizzo disponibile per il test")];
                    }
                    testAddress = leaderboardData.leaderboardRows[0].ethAddress;
                    return [4 /*yield*/, (0, node_fetch_1.default)(LEADERBOARD_API, {
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
                case 3:
                    response = _a.sent();
                    if (!response.ok) {
                        return [2 /*return*/, printResult("API Wallet Details", false, "".concat(response.status, " ").concat(response.statusText))];
                    }
                    return [4 /*yield*/, response.json()];
                case 4:
                    data = _a.sent();
                    if (!data || !data.marginSummary) {
                        return [2 /*return*/, printResult("API Wallet Details", false, "Formato dati non valido")];
                    }
                    return [2 /*return*/, printResult("API Wallet Details", true, "Dettagli wallet ricevuti per ".concat(testAddress.substring(0, 8), "..."))];
                case 5:
                    error_3 = _a.sent();
                    return [2 /*return*/, printResult("API Wallet Details", false, error_3.message)];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Test dell'API Trade History
function testTradeHistoryAPI() {
    return __awaiter(this, void 0, void 0, function () {
        var leaderboardResponse, leaderboardData, testAddress, startTime, response, data, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, node_fetch_1.default)(LEADERBOARD_API, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            body: JSON.stringify({ type: "leaderboard" })
                        })];
                case 1:
                    leaderboardResponse = _a.sent();
                    if (!leaderboardResponse.ok) {
                        return [2 /*return*/, printResult("API Trade History", false, "Impossibile ottenere un indirizzo di test")];
                    }
                    return [4 /*yield*/, leaderboardResponse.json()];
                case 2:
                    leaderboardData = _a.sent();
                    if (!leaderboardData.leaderboardRows || leaderboardData.leaderboardRows.length === 0) {
                        return [2 /*return*/, printResult("API Trade History", false, "Nessun indirizzo disponibile per il test")];
                    }
                    testAddress = leaderboardData.leaderboardRows[0].ethAddress;
                    startTime = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
                    return [4 /*yield*/, (0, node_fetch_1.default)(LEADERBOARD_API, {
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
                case 3:
                    response = _a.sent();
                    if (!response.ok) {
                        return [2 /*return*/, printResult("API Trade History", false, "".concat(response.status, " ").concat(response.statusText))];
                    }
                    return [4 /*yield*/, response.json()];
                case 4:
                    data = _a.sent();
                    if (!data || !data.fills || !Array.isArray(data.fills)) {
                        return [2 /*return*/, printResult("API Trade History", false, "Formato dati non valido")];
                    }
                    return [2 /*return*/, printResult("API Trade History", true, "Ricevuti ".concat(data.fills.length, " trade per ").concat(testAddress.substring(0, 8), "..."))];
                case 5:
                    error_4 = _a.sent();
                    return [2 /*return*/, printResult("API Trade History", false, error_4.message)];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Test della connessione MongoDB
function testMongoDBConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var client, db, collections, collectionNames, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    printTitle("Test della connessione MongoDB");
                    client = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 9]);
                    client = new mongodb_1.MongoClient(MONGODB_URI, {
                        connectTimeoutMS: 5000,
                        socketTimeoutMS: 30000,
                    });
                    return [4 /*yield*/, client.connect()];
                case 2:
                    _a.sent();
                    db = client.db();
                    return [4 /*yield*/, db.command({ ping: 1 })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, db.listCollections().toArray()];
                case 4:
                    collections = _a.sent();
                    collectionNames = collections.map(function (c) { return c.name; }).join(', ');
                    return [2 /*return*/, printResult("Connessione MongoDB", true, "Connesso a ".concat(db.databaseName, ", collezioni: ").concat(collectionNames))];
                case 5:
                    error_5 = _a.sent();
                    return [2 /*return*/, printResult("Connessione MongoDB", false, error_5.message)];
                case 6:
                    if (!client) return [3 /*break*/, 8];
                    return [4 /*yield*/, client.close()];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Verifica la struttura del progetto
function testProjectStructure() {
    printTitle("Verifica della struttura del progetto");
    var requiredFolders = ['app', 'components', 'lib', 'services', 'utils', 'types'];
    var requiredFiles = [
        'app/page.tsx',
        'app/layout.tsx',
        'lib/mongodb.ts',
        'services/hyperliquidService.ts',
        'utils/transformUtils.ts',
        'utils/scoringEngine.ts',
        'utils/qualificationFilter.ts',
        'utils/taggingEngine.ts',
        'utils/portfolioConstructor.ts'
    ];
    var allPassed = true;
    // Verifica cartelle
    for (var _i = 0, requiredFolders_1 = requiredFolders; _i < requiredFolders_1.length; _i++) {
        var folder = requiredFolders_1[_i];
        var folderPath = path_1.default.join(PROJECT_ROOT, folder);
        var exists = fs_1.default.existsSync(folderPath) && fs_1.default.statSync(folderPath).isDirectory();
        allPassed = printResult("Cartella ".concat(folder), exists) && allPassed;
    }
    // Verifica file
    for (var _a = 0, requiredFiles_1 = requiredFiles; _a < requiredFiles_1.length; _a++) {
        var file = requiredFiles_1[_a];
        var filePath = path_1.default.join(PROJECT_ROOT, file);
        var exists = fs_1.default.existsSync(filePath) && fs_1.default.statSync(filePath).isFile();
        allPassed = printResult("File ".concat(file), exists) && allPassed;
    }
    // Verifica API routes
    var apiFolder = path_1.default.join(PROJECT_ROOT, 'app/api');
    if (fs_1.default.existsSync(apiFolder) && fs_1.default.statSync(apiFolder).isDirectory()) {
        var apiRoutes = fs_1.default.readdirSync(apiFolder);
        printResult("API routes", true, apiRoutes.join(', '));
    }
    else {
        printResult("API routes", false, "Cartella API non trovata");
        allPassed = false;
    }
    return allPassed;
}
// Verifica le dipendenze del progetto
function testDependencies() {
    printTitle("Verifica delle dipendenze del progetto");
    try {
        var packageJsonPath = path_1.default.join(PROJECT_ROOT, 'package.json');
        var packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, 'utf8'));
        var criticalDependencies = [
            'next', 'react', 'react-dom', 'mongodb', 'node-fetch'
        ];
        var allPassed = true;
        for (var _i = 0, criticalDependencies_1 = criticalDependencies; _i < criticalDependencies_1.length; _i++) {
            var dep = criticalDependencies_1[_i];
            var exists = packageJson.dependencies[dep] !== undefined;
            allPassed = printResult("Dipendenza ".concat(dep), exists) && allPassed;
        }
        return allPassed;
    }
    catch (error) {
        printResult("Lettura package.json", false, error.message);
        return false;
    }
}
// Test delle funzioni di trasformazione
function testTransformFunctions() {
    return __awaiter(this, void 0, void 0, function () {
        var transformLeaderboardData, leaderboardResponse, leaderboardData, transformedData, firstWallet, hasRequiredFields, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    printTitle("Test delle funzioni di trasformazione");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../utils/transformUtils')); })];
                case 2:
                    transformLeaderboardData = (_a.sent()).transformLeaderboardData;
                    return [4 /*yield*/, (0, node_fetch_1.default)(LEADERBOARD_API, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            body: JSON.stringify({ type: "leaderboard" })
                        })];
                case 3:
                    leaderboardResponse = _a.sent();
                    if (!leaderboardResponse.ok) {
                        return [2 /*return*/, printResult("Funzione transformLeaderboardData", false, "Impossibile ottenere dati di test")];
                    }
                    return [4 /*yield*/, leaderboardResponse.json()];
                case 4:
                    leaderboardData = _a.sent();
                    // Testa la funzione di trasformazione
                    try {
                        transformedData = transformLeaderboardData(leaderboardData);
                        if (!Array.isArray(transformedData)) {
                            return [2 /*return*/, printResult("Funzione transformLeaderboardData", false, "Output non è un array")];
                        }
                        if (transformedData.length === 0) {
                            return [2 /*return*/, printResult("Funzione transformLeaderboardData", false, "Output è un array vuoto")];
                        }
                        firstWallet = transformedData[0];
                        hasRequiredFields = firstWallet._id !== undefined &&
                            firstWallet.lastUpdated !== undefined &&
                            firstWallet.accountValue !== undefined &&
                            firstWallet.stats !== undefined;
                        return [2 /*return*/, printResult("Funzione transformLeaderboardData", hasRequiredFields, "Trasformati ".concat(transformedData.length, " wallet"))];
                    }
                    catch (error) {
                        return [2 /*return*/, printResult("Funzione transformLeaderboardData", false, error.message)];
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_6 = _a.sent();
                    return [2 /*return*/, printResult("Import delle funzioni di trasformazione", false, error_6.message)];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Test delle API locali
function testLocalAPIs() {
    return __awaiter(this, void 0, void 0, function () {
        var response, apis, _i, apis_1, api, response_1, error_7, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    printTitle("Test delle API locali");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    return [4 /*yield*/, (0, node_fetch_1.default)('http://localhost:3000')];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        printResult("Server Next.js", false, "".concat(response.status, " ").concat(response.statusText));
                        console.log("".concat(colors.yellow, "\u26A0\uFE0F Il server Next.js non sembra essere in esecuzione sulla porta 3004.").concat(colors.reset));
                        console.log("".concat(colors.yellow, "\u26A0\uFE0F Avvia il server con 'npm run dev' prima di eseguire questo test.").concat(colors.reset));
                        return [2 /*return*/, false];
                    }
                    printResult("Server Next.js", true, "Server in esecuzione");
                    apis = [
                        { name: "API Ingest", endpoint: "http://localhost:3000/api/ingest" },
                        { name: "API Score", endpoint: "http://localhost:3000/api/score" },
                        { name: "API Filter", endpoint: "http://localhost:3000/api/filter" },
                        { name: "API Tag", endpoint: "http://localhost:3000/api/tag" },
                        { name: "API Portfolio", endpoint: "http://localhost:3000/api/portfolio" },
                        { name: "API Wallets", endpoint: "http://localhost:3000/api/wallets" },
                        { name: "API Refresh", endpoint: "http://localhost:3000/api/refresh" }
                    ];
                    _i = 0, apis_1 = apis;
                    _a.label = 3;
                case 3:
                    if (!(_i < apis_1.length)) return [3 /*break*/, 8];
                    api = apis_1[_i];
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, node_fetch_1.default)(api.endpoint)];
                case 5:
                    response_1 = _a.sent();
                    printResult(api.name, response_1.status !== 404, "Status: ".concat(response_1.status, " ").concat(response_1.statusText));
                    return [3 /*break*/, 7];
                case 6:
                    error_7 = _a.sent();
                    printResult(api.name, false, error_7.message);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8: return [2 /*return*/, true];
                case 9:
                    error_8 = _a.sent();
                    printResult("Server Next.js", false, error_8.message);
                    return [2 /*return*/, false];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// Verifica il file di configurazione MongoDB
function testMongoDBConfig() {
    printTitle("Verifica della configurazione MongoDB");
    var mongodbPath = path_1.default.join(PROJECT_ROOT, 'lib/mongodb.ts');
    try {
        var content = fs_1.default.readFileSync(mongodbPath, 'utf8');
        var hasConnectFunction = content.includes('export async function connectToDatabase');
        var hasCollectionNames = content.includes('export function getCollectionNames');
        printResult("Funzione connectToDatabase", hasConnectFunction);
        printResult("Funzione getCollectionNames", hasCollectionNames);
        // Verifica la presenza di MONGODB_URI
        var envPath = path_1.default.join(PROJECT_ROOT, '.env.local');
        if (fs_1.default.existsSync(envPath)) {
            var envContent = fs_1.default.readFileSync(envPath, 'utf8');
            var hasMongoDB_URI = envContent.includes('MONGODB_URI=');
            printResult("Variabile d'ambiente MONGODB_URI", hasMongoDB_URI);
        }
        else {
            printResult("File .env.local", false, "File non trovato");
        }
        return hasConnectFunction && hasCollectionNames;
    }
    catch (error) {
        printResult("Lettura configurazione MongoDB", false, error.message);
        return false;
    }
}
// Funzione principale
function runDiagnostic() {
    return __awaiter(this, void 0, void 0, function () {
        var results, _a, _b, _c, _d, _e, _f, readline, allPassed, _i, _g, _h, test, result, passed, testName;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
                    console.log("".concat(colors.magenta, "   DIAGNOSTICA COMPLETA DEL PROGETTO GIUDANTEN    ").concat(colors.reset));
                    console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
                    results = {
                        projectStructure: false,
                        dependencies: false,
                        mongoConfig: null
                    };
                    _a = results;
                    return [4 /*yield*/, testHyperliquidAPI()];
                case 1:
                    _a.hyperliquidAPI = _j.sent();
                    _b = results;
                    return [4 /*yield*/, testLeaderboardAPI()];
                case 2:
                    _b.leaderboardAPI = _j.sent();
                    _c = results;
                    return [4 /*yield*/, testWalletDetailsAPI()];
                case 3:
                    _c.walletDetailsAPI = _j.sent();
                    _d = results;
                    return [4 /*yield*/, testTradeHistoryAPI()];
                case 4:
                    _d.tradeHistoryAPI = _j.sent();
                    _e = results;
                    return [4 /*yield*/, testMongoDBConnection()];
                case 5:
                    _e.mongoDBConnection = _j.sent();
                    _f = results;
                    return [4 /*yield*/, testTransformFunctions()];
                case 6:
                    _f.transformFunctions = _j.sent();
                    // Test opzionale delle API locali
                    console.log("\n".concat(colors.yellow, "Vuoi testare le API locali? Assicurati che il server Next.js sia in esecuzione (npm run dev).").concat(colors.reset));
                    console.log("".concat(colors.yellow, "Se il server \u00E8 in esecuzione, premi Enter per continuare, altrimenti scrivi 'skip'.").concat(colors.reset));
                    readline = require('readline').createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
                    return [4 /*yield*/, new Promise(function (resolve) {
                            readline.question('', function (answer) {
                                if (answer.toLowerCase() !== 'skip') {
                                    testLocalAPIs().then(function () {
                                        readline.close();
                                        resolve();
                                    });
                                }
                                else {
                                    console.log("".concat(colors.yellow, "Test delle API locali saltato.").concat(colors.reset));
                                    readline.close();
                                    resolve();
                                }
                            });
                        })];
                case 7:
                    _j.sent();
                    // Riepilogo
                    printTitle("RIEPILOGO DEI TEST");
                    allPassed = true;
                    for (_i = 0, _g = Object.entries(results); _i < _g.length; _i++) {
                        _h = _g[_i], test = _h[0], result = _h[1];
                        passed = !!result;
                        allPassed = allPassed && passed;
                        testName = test
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, function (str) { return str.toUpperCase(); });
                        printResult(testName, passed);
                    }
                    console.log("\n".concat(colors.magenta, "==================================================").concat(colors.reset));
                    if (allPassed) {
                        console.log("".concat(colors.green, "\u2705 TUTTI I TEST SONO STATI SUPERATI!").concat(colors.reset));
                    }
                    else {
                        console.log("".concat(colors.red, "\u274C ALCUNI TEST NON SONO STATI SUPERATI.").concat(colors.reset));
                        console.log("".concat(colors.yellow, "Controlla i dettagli sopra per risolvere i problemi.").concat(colors.reset));
                    }
                    console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
                    return [2 /*return*/];
            }
        });
    });
}
// Esegui la diagnostica
runDiagnostic().catch(function (error) {
    console.error("".concat(colors.red, "Errore durante l'esecuzione della diagnostica:").concat(colors.reset), error);
});
