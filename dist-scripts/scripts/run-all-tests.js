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
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var readline = __importStar(require("readline"));
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
// Funzione per eseguire un comando e restituire l'output
function runCommand(command) {
    try {
        console.log("".concat(colors.yellow, "Esecuzione: ").concat(command).concat(colors.reset));
        (0, child_process_1.execSync)(command, { stdio: 'inherit' });
        return true;
    }
    catch (error) {
        console.error("".concat(colors.red, "Errore durante l'esecuzione di: ").concat(command).concat(colors.reset));
        console.error(error);
        return false;
    }
}
// Funzione per chiedere all'utente se continuare
function askToContinue(message) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(function (resolve) {
        rl.question("".concat(colors.yellow).concat(message, " (s/n): ").concat(colors.reset), function (answer) {
            rl.close();
            resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'si' || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });
}
// Funzione principale
function runAllTests() {
    return __awaiter(this, void 0, void 0, function () {
        var dependenciesResult, continueAfterDependencies, connectivityResult, continueAfterConnectivity, hyperliquidResult, continueAfterHyperliquid, tradingResult, continueAfterTrading, ingestResult, startLocalServer, spawn, server, stopServer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
                    console.log("".concat(colors.magenta, "   TEST COMPLETI DEL PROGETTO GIUDANTEN           ").concat(colors.reset));
                    console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
                    // Test delle dipendenze
                    printTitle("Test delle dipendenze");
                    dependenciesResult = runCommand('npm run test:dependencies');
                    if (!!dependenciesResult) return [3 /*break*/, 2];
                    return [4 /*yield*/, askToContinue("Ci sono problemi con le dipendenze. Vuoi continuare con gli altri test?")];
                case 1:
                    continueAfterDependencies = _a.sent();
                    if (!continueAfterDependencies) {
                        console.log("".concat(colors.yellow, "Test interrotti. Risolvi i problemi con le dipendenze prima di continuare.").concat(colors.reset));
                        return [2 /*return*/];
                    }
                    _a.label = 2;
                case 2:
                    // Test di connettività
                    printTitle("Test di connettività");
                    connectivityResult = runCommand('npm run test:connectivity');
                    if (!!connectivityResult) return [3 /*break*/, 4];
                    return [4 /*yield*/, askToContinue("Ci sono problemi di connettività. Vuoi continuare con gli altri test?")];
                case 3:
                    continueAfterConnectivity = _a.sent();
                    if (!continueAfterConnectivity) {
                        console.log("".concat(colors.yellow, "Test interrotti. Risolvi i problemi di connettivit\u00E0 prima di continuare.").concat(colors.reset));
                        return [2 /*return*/];
                    }
                    _a.label = 4;
                case 4:
                    // Test delle API Hyperliquid
                    printTitle("Test delle API Hyperliquid");
                    hyperliquidResult = runCommand('npm run test:hyperliquid');
                    if (!!hyperliquidResult) return [3 /*break*/, 6];
                    return [4 /*yield*/, askToContinue("Ci sono problemi con le API Hyperliquid. Vuoi continuare con gli altri test?")];
                case 5:
                    continueAfterHyperliquid = _a.sent();
                    if (!continueAfterHyperliquid) {
                        console.log("".concat(colors.yellow, "Test interrotti. Risolvi i problemi con le API Hyperliquid prima di continuare.").concat(colors.reset));
                        return [2 /*return*/];
                    }
                    _a.label = 6;
                case 6:
                    // Test delle API di trading
                    printTitle("Test delle API di trading");
                    tradingResult = runCommand('npm run test:trading');
                    if (!!tradingResult) return [3 /*break*/, 8];
                    return [4 /*yield*/, askToContinue("Ci sono problemi con le API di trading. Vuoi continuare con gli altri test?")];
                case 7:
                    continueAfterTrading = _a.sent();
                    if (!continueAfterTrading) {
                        console.log("".concat(colors.yellow, "Test interrotti. Risolvi i problemi con le API di trading prima di continuare.").concat(colors.reset));
                        return [2 /*return*/];
                    }
                    _a.label = 8;
                case 8:
                    ingestResult = false;
                    return [4 /*yield*/, askToContinue("Vuoi avviare il server locale per testare le API di ingestione?")];
                case 9:
                    startLocalServer = _a.sent();
                    if (!startLocalServer) return [3 /*break*/, 12];
                    printTitle("Avvio del server locale");
                    console.log("".concat(colors.yellow, "Avvio del server Next.js in background...").concat(colors.reset));
                    console.log("".concat(colors.yellow, "Premi Ctrl+C per terminare il server quando hai finito i test.").concat(colors.reset));
                    spawn = require('child_process').spawn;
                    server = spawn('npm', ['run', 'dev'], {
                        shell: true,
                        detached: true,
                        stdio: 'inherit'
                    });
                    // Attendi che il server si avvii
                    console.log("".concat(colors.yellow, "Attendi 10 secondi per l'avvio del server...").concat(colors.reset));
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 10000); })];
                case 10:
                    _a.sent();
                    // Test delle API di ingestione
                    printTitle("Test delle API di ingestione");
                    ingestResult = runCommand('npm run test:ingest');
                    if (!ingestResult) {
                        console.log("".concat(colors.yellow, "Ci sono problemi con le API di ingestione. Controlla i log del server per maggiori dettagli.").concat(colors.reset));
                    }
                    return [4 /*yield*/, askToContinue("Vuoi terminare il server locale?")];
                case 11:
                    stopServer = _a.sent();
                    if (stopServer) {
                        console.log("".concat(colors.yellow, "Terminazione del server...").concat(colors.reset));
                        process.kill(-server.pid);
                    }
                    else {
                        console.log("".concat(colors.yellow, "Il server continuer\u00E0 a funzionare in background. Premi Ctrl+C per terminarlo quando hai finito.").concat(colors.reset));
                    }
                    _a.label = 12;
                case 12:
                    // Riepilogo finale
                    printTitle("RIEPILOGO DEI TEST");
                    console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
                    console.log("".concat(colors.green, "\u2705 Test delle dipendenze: ").concat(dependenciesResult ? 'Superato' : 'Non superato').concat(colors.reset));
                    console.log("".concat(colors.green, "\u2705 Test di connettivit\u00E0: ").concat(connectivityResult ? 'Superato' : 'Non superato').concat(colors.reset));
                    console.log("".concat(colors.green, "\u2705 Test delle API Hyperliquid: ").concat(hyperliquidResult ? 'Superato' : 'Non superato').concat(colors.reset));
                    console.log("".concat(colors.green, "\u2705 Test delle API di trading: ").concat(tradingResult ? 'Superato' : 'Non superato').concat(colors.reset));
                    if (startLocalServer) {
                        console.log("".concat(colors.green, "\u2705 Test delle API di ingestione: ").concat(ingestResult ? 'Superato' : 'Non superato').concat(colors.reset));
                    }
                    console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
                    if (dependenciesResult && connectivityResult && hyperliquidResult && tradingResult && (!startLocalServer || ingestResult)) {
                        console.log("".concat(colors.green, "\u2705 TUTTI I TEST SONO STATI SUPERATI!").concat(colors.reset));
                        console.log("".concat(colors.green, "Il progetto Giudanten \u00E8 pronto per essere utilizzato.").concat(colors.reset));
                    }
                    else {
                        console.log("".concat(colors.red, "\u274C ALCUNI TEST NON SONO STATI SUPERATI.").concat(colors.reset));
                        console.log("".concat(colors.yellow, "Controlla i dettagli sopra per risolvere i problemi.").concat(colors.reset));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// Esegui i test
runAllTests().catch(function (error) {
    console.error("".concat(colors.red, "Errore durante l'esecuzione dei test:").concat(colors.reset), error);
});
