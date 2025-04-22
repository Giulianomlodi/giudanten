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
// Modifica le importazioni per risolvere gli errori
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var child_process_1 = require("child_process");
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
// Percorso del package.json
var packageJsonPath = path.join(__dirname, '..', 'package.json');
// Modifica la definizione di PROJECT_ROOT per puntare alla cartella principale del progetto
var PROJECT_ROOT = path.resolve(__dirname, '..');
// Verifica delle dipendenze critiche
function checkCriticalDependencies() {
    printTitle("Verifica delle dipendenze critiche");
    try {
        // Leggi il package.json
        var packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        // Dipendenze critiche per il progetto
        var criticalDependencies = [
            'next', 'react', 'react-dom', 'mongoose',
            'typescript', 'tailwindcss', 'node-fetch',
            '@radix-ui/react-dialog', '@rainbow-me/rainbowkit',
            'ethers', 'wagmi', 'mongodb'
        ];
        var allPassed = true;
        // Verifica ogni dipendenza critica
        for (var _i = 0, criticalDependencies_1 = criticalDependencies; _i < criticalDependencies_1.length; _i++) {
            var dep = criticalDependencies_1[_i];
            var exists = packageJson.dependencies[dep] !== undefined ||
                packageJson.devDependencies[dep] !== undefined;
            allPassed = printResult("Dipendenza ".concat(dep), exists) && allPassed;
            if (exists) {
                // Verifica che il modulo sia effettivamente installato
                try {
                    var nodeModulesPath = path.join(PROJECT_ROOT, 'node_modules', dep);
                    var moduleExists = fs.existsSync(nodeModulesPath);
                    if (!moduleExists) {
                        console.log("".concat(colors.yellow, "\u26A0\uFE0F ").concat(dep, " \u00E8 presente nel package.json ma potrebbe non essere installato").concat(colors.reset));
                    }
                }
                catch (error) {
                    console.log("".concat(colors.yellow, "\u26A0\uFE0F Impossibile verificare l'installazione di ").concat(dep, ": ").concat(error.message).concat(colors.reset));
                }
            }
        }
        return allPassed;
    }
    catch (error) {
        printResult("Lettura package.json", false, error.message);
        return false;
    }
}
// Verifica delle versioni di Node.js e npm
function checkNodeVersion() {
    printTitle("Verifica delle versioni di Node.js e npm");
    try {
        // Ottieni la versione di Node.js
        var nodeVersion = process.version;
        console.log("Versione Node.js: ".concat(nodeVersion));
        // Verifica che la versione di Node.js sia >= 20.0.0
        var nodeVersionNumber = nodeVersion.substring(1).split('.').map(Number);
        var isNodeVersionValid = nodeVersionNumber[0] >= 20;
        printResult("Versione Node.js >= 20.0.0", isNodeVersionValid);
        // Ottieni la versione di npm
        try {
            var npmVersionOutput = (0, child_process_1.execSync)('npm --version', { encoding: 'utf8' }).trim();
            console.log("Versione npm: ".concat(npmVersionOutput));
            // Verifica che la versione di npm sia >= 9.0.0
            var npmVersionNumber = npmVersionOutput.split('.').map(Number);
            var isNpmVersionValid = npmVersionNumber[0] >= 9;
            printResult("Versione npm >= 9.0.0", isNpmVersionValid);
            return isNodeVersionValid && isNpmVersionValid;
        }
        catch (error) {
            printResult("Verifica versione npm", false, error.message);
            return false;
        }
    }
    catch (error) {
        printResult("Verifica versione Node.js", false, error.message);
        return false;
    }
}
// Verifica delle configurazioni di Next.js
function checkNextJsConfig() {
    printTitle("Verifica delle configurazioni di Next.js");
    try {
        // Verifica il file next.config.mjs
        var nextConfigPath = path.join(PROJECT_ROOT, 'next.config.mjs');
        var nextConfigExists = fs.existsSync(nextConfigPath);
        printResult("File next.config.mjs", nextConfigExists);
        if (nextConfigExists) {
            var nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
            // Verifica che il file contenga una configurazione valida
            var hasExportDefault = nextConfig.includes('export default');
            printResult("Configurazione Next.js valida", hasExportDefault);
            // Verifica le impostazioni specifiche
            var hasReactStrictMode = nextConfig.includes('reactStrictMode');
            printResult("React Strict Mode", hasReactStrictMode);
            return nextConfigExists && hasExportDefault;
        }
        return false;
    }
    catch (error) {
        printResult("Verifica configurazione Next.js", false, error.message);
        return false;
    }
}
// Verifica delle configurazioni di TypeScript
function checkTypeScriptConfig() {
    printTitle("Verifica delle configurazioni di TypeScript");
    try {
        // Verifica il file tsconfig.json
        var tsConfigPath = path.join(PROJECT_ROOT, 'tsconfig.json');
        var tsConfigExists = fs.existsSync(tsConfigPath);
        printResult("File tsconfig.json", tsConfigExists);
        if (tsConfigExists) {
            var tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
            // Verifica che il file contenga una configurazione valida
            var hasCompilerOptions = tsConfig.compilerOptions !== undefined;
            printResult("Configurazione TypeScript valida", hasCompilerOptions);
            if (hasCompilerOptions) {
                // Verifica le impostazioni specifiche
                var hasStrictMode = tsConfig.compilerOptions.strict === true;
                printResult("TypeScript Strict Mode", hasStrictMode);
                var hasEsModuleInterop = tsConfig.compilerOptions.esModuleInterop === true;
                printResult("ES Module Interop", hasEsModuleInterop);
                return tsConfigExists && hasCompilerOptions && hasStrictMode && hasEsModuleInterop;
            }
        }
        return false;
    }
    catch (error) {
        printResult("Verifica configurazione TypeScript", false, error.message);
        return false;
    }
}
// Verifica delle configurazioni di Tailwind CSS
function checkTailwindConfig() {
    printTitle("Verifica delle configurazioni di Tailwind CSS");
    try {
        // Verifica il file tailwind.config.ts
        var tailwindConfigPath = path.join(PROJECT_ROOT, 'tailwind.config.ts');
        var tailwindConfigExists = fs.existsSync(tailwindConfigPath);
        printResult("File tailwind.config.ts", tailwindConfigExists);
        if (tailwindConfigExists) {
            var tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');
            // Verifica che il file contenga una configurazione valida
            var hasExportDefault = tailwindConfig.includes('export default');
            printResult("Configurazione Tailwind CSS valida", hasExportDefault);
            // Verifica le impostazioni specifiche
            var hasContent = tailwindConfig.includes('content:');
            printResult("Configurazione content", hasContent);
            return tailwindConfigExists && hasExportDefault && hasContent;
        }
        return false;
    }
    catch (error) {
        printResult("Verifica configurazione Tailwind CSS", false, error.message);
        return false;
    }
}
// Verifica delle configurazioni di MongoDB
function checkMongoDBConfig() {
    printTitle("Verifica delle configurazioni di MongoDB");
    try {
        // Verifica il file lib/mongodb.ts
        var mongodbPath = path.join(PROJECT_ROOT, 'lib', 'mongodb.ts');
        var mongodbExists = fs.existsSync(mongodbPath);
        printResult("File lib/mongodb.ts", mongodbExists);
        if (mongodbExists) {
            var mongodbConfig = fs.readFileSync(mongodbPath, 'utf8');
            // Verifica che il file contenga le funzioni necessarie
            var hasConnectFunction = mongodbConfig.includes('export async function connectToDatabase');
            printResult("Funzione connectToDatabase", hasConnectFunction);
            var hasCollectionNames = mongodbConfig.includes('export function getCollectionNames');
            printResult("Funzione getCollectionNames", hasCollectionNames);
            // Verifica la presenza di MONGODB_URI
            var envLocalPath = path.join(PROJECT_ROOT, '.env.local');
            var envPath = path.join(PROJECT_ROOT, '.env');
            var envExists = fs.existsSync(envLocalPath);
            var envFilePath = envLocalPath;
            if (!envExists) {
                envExists = fs.existsSync(envPath);
                envFilePath = envPath;
            }
            printResult("File .env o .env.local", envExists);
            if (envExists) {
                var envContent = fs.readFileSync(envFilePath, 'utf8');
                var hasMongoDB_URI = envContent.includes('MONGODB_URI=');
                printResult("Variabile d'ambiente MONGODB_URI", hasMongoDB_URI);
                return mongodbExists && hasConnectFunction && hasCollectionNames && hasMongoDB_URI;
            }
            return mongodbExists && hasConnectFunction && hasCollectionNames;
        }
        return false;
    }
    catch (error) {
        printResult("Verifica configurazione MongoDB", false, error.message);
        return false;
    }
}
// Funzione principale
function runDependencyTests() {
    return __awaiter(this, void 0, void 0, function () {
        var results, allPassed, _i, _a, _b, test, result, passed, testName;
        return __generator(this, function (_c) {
            console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
            console.log("".concat(colors.magenta, "   VERIFICA DELLE DIPENDENZE DEL PROGETTO         ").concat(colors.reset));
            console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
            results = {
                criticalDependencies: checkCriticalDependencies(),
                nodeVersion: checkNodeVersion(),
                nextJsConfig: checkNextJsConfig(),
                typeScriptConfig: checkTypeScriptConfig(),
                tailwindConfig: checkTailwindConfig(),
                mongoDBConfig: checkMongoDBConfig()
            };
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
                console.log("".concat(colors.green, "\u2705 TUTTE LE VERIFICHE DELLE DIPENDENZE SONO STATE SUPERATE!").concat(colors.reset));
            }
            else {
                console.log("".concat(colors.red, "\u274C ALCUNE VERIFICHE DELLE DIPENDENZE NON SONO STATE SUPERATE.").concat(colors.reset));
                console.log("".concat(colors.yellow, "Controlla i dettagli sopra per risolvere i problemi.").concat(colors.reset));
            }
            console.log("".concat(colors.magenta, "==================================================").concat(colors.reset));
            return [2 /*return*/, allPassed];
        });
    });
}
// Esegui i test
runDependencyTests().catch(function (error) {
    console.error("".concat(colors.red, "Errore durante l'esecuzione dei test:").concat(colors.reset), error);
});
