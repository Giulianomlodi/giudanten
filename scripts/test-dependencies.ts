// Modifica le importazioni per risolvere gli errori
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Colori per l'output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
};

// Funzione per stampare un titolo
function printTitle(title: string) {
  console.log(`\n${colors.cyan}=== ${title} ===${colors.reset}\n`);
}

// Funzione per stampare un risultato
function printResult(test: string, passed: boolean, details?: string) {
  const icon = passed ? '✅' : '❌';
  const color = passed ? colors.green : colors.red;
  console.log(`${color}${icon} ${test}${colors.reset}${details ? `: ${details}` : ''}`);
  return passed;
}

// Percorso del package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
// Modifica la definizione di PROJECT_ROOT per puntare alla cartella principale del progetto
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Verifica delle dipendenze critiche
function checkCriticalDependencies() {
  printTitle("Verifica delle dipendenze critiche");
  
  try {
    // Leggi il package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Dipendenze critiche per il progetto
    const criticalDependencies = [
      'next', 'react', 'react-dom', 'mongoose', 
      'typescript', 'tailwindcss', 'node-fetch', 
      '@radix-ui/react-dialog', '@rainbow-me/rainbowkit',
      'ethers', 'wagmi', 'mongodb'
    ];
    
    let allPassed = true;
    
    // Verifica ogni dipendenza critica
    for (const dep of criticalDependencies) {
      const exists = packageJson.dependencies[dep] !== undefined || 
                    packageJson.devDependencies[dep] !== undefined;
      
      allPassed = printResult(`Dipendenza ${dep}`, exists) && allPassed;
      
      if (exists) {
        // Verifica che il modulo sia effettivamente installato
        try {
          const nodeModulesPath = path.join(PROJECT_ROOT, 'node_modules', dep);
          const moduleExists = fs.existsSync(nodeModulesPath);
          
          if (!moduleExists) {
            console.log(`${colors.yellow}⚠️ ${dep} è presente nel package.json ma potrebbe non essere installato${colors.reset}`);
          }
        } catch (error) {
          console.log(`${colors.yellow}⚠️ Impossibile verificare l'installazione di ${dep}: ${error.message}${colors.reset}`);
        }
      }
    }
    
    return allPassed;
  } catch (error) {
    printResult("Lettura package.json", false, error.message);
    return false;
  }
}

// Verifica delle versioni di Node.js e npm
function checkNodeVersion() {
  printTitle("Verifica delle versioni di Node.js e npm");
  
  try {
    // Ottieni la versione di Node.js
    const nodeVersion = process.version;
    console.log(`Versione Node.js: ${nodeVersion}`);
    
    // Verifica che la versione di Node.js sia >= 20.0.0
    const nodeVersionNumber = nodeVersion.substring(1).split('.').map(Number);
    const isNodeVersionValid = nodeVersionNumber[0] >= 20;
    
    printResult("Versione Node.js >= 20.0.0", isNodeVersionValid);
    
    // Ottieni la versione di npm
    try {
      const npmVersionOutput = execSync('npm --version', { encoding: 'utf8' }).trim();
      console.log(`Versione npm: ${npmVersionOutput}`);
      
      // Verifica che la versione di npm sia >= 9.0.0
      const npmVersionNumber = npmVersionOutput.split('.').map(Number);
      const isNpmVersionValid = npmVersionNumber[0] >= 9;
      
      printResult("Versione npm >= 9.0.0", isNpmVersionValid);
      
      return isNodeVersionValid && isNpmVersionValid;
    } catch (error) {
      printResult("Verifica versione npm", false, error.message);
      return false;
    }
  } catch (error) {
    printResult("Verifica versione Node.js", false, error.message);
    return false;
  }
}

// Verifica delle configurazioni di Next.js
function checkNextJsConfig() {
  printTitle("Verifica delle configurazioni di Next.js");
  
  try {
    // Verifica il file next.config.mjs
    const nextConfigPath = path.join(PROJECT_ROOT, 'next.config.mjs');
    const nextConfigExists = fs.existsSync(nextConfigPath);
    
    printResult("File next.config.mjs", nextConfigExists);
    
    if (nextConfigExists) {
      const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Verifica che il file contenga una configurazione valida
      const hasExportDefault = nextConfig.includes('export default');
      printResult("Configurazione Next.js valida", hasExportDefault);
      
      // Verifica le impostazioni specifiche
      const hasReactStrictMode = nextConfig.includes('reactStrictMode');
      printResult("React Strict Mode", hasReactStrictMode);
      
      return nextConfigExists && hasExportDefault;
    }
    
    return false;
  } catch (error) {
    printResult("Verifica configurazione Next.js", false, error.message);
    return false;
  }
}

// Verifica delle configurazioni di TypeScript
function checkTypeScriptConfig() {
  printTitle("Verifica delle configurazioni di TypeScript");
  
  try {
    // Verifica il file tsconfig.json
    const tsConfigPath = path.join(PROJECT_ROOT, 'tsconfig.json');
    const tsConfigExists = fs.existsSync(tsConfigPath);
    
    printResult("File tsconfig.json", tsConfigExists);
    
    if (tsConfigExists) {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      
      // Verifica che il file contenga una configurazione valida
      const hasCompilerOptions = tsConfig.compilerOptions !== undefined;
      printResult("Configurazione TypeScript valida", hasCompilerOptions);
      
      if (hasCompilerOptions) {
        // Verifica le impostazioni specifiche
        const hasStrictMode = tsConfig.compilerOptions.strict === true;
        printResult("TypeScript Strict Mode", hasStrictMode);
        
        const hasEsModuleInterop = tsConfig.compilerOptions.esModuleInterop === true;
        printResult("ES Module Interop", hasEsModuleInterop);
        
        return tsConfigExists && hasCompilerOptions && hasStrictMode && hasEsModuleInterop;
      }
    }
    
    return false;
  } catch (error) {
    printResult("Verifica configurazione TypeScript", false, error.message);
    return false;
  }
}

// Verifica delle configurazioni di Tailwind CSS
function checkTailwindConfig() {
  printTitle("Verifica delle configurazioni di Tailwind CSS");
  
  try {
    // Verifica il file tailwind.config.ts
    const tailwindConfigPath = path.join(PROJECT_ROOT, 'tailwind.config.ts');
    const tailwindConfigExists = fs.existsSync(tailwindConfigPath);
    
    printResult("File tailwind.config.ts", tailwindConfigExists);
    
    if (tailwindConfigExists) {
      const tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');
      
      // Verifica che il file contenga una configurazione valida
      const hasExportDefault = tailwindConfig.includes('export default');
      printResult("Configurazione Tailwind CSS valida", hasExportDefault);
      
      // Verifica le impostazioni specifiche
      const hasContent = tailwindConfig.includes('content:');
      printResult("Configurazione content", hasContent);
      
      return tailwindConfigExists && hasExportDefault && hasContent;
    }
    
    return false;
  } catch (error) {
    printResult("Verifica configurazione Tailwind CSS", false, error.message);
    return false;
  }
}

// Verifica delle configurazioni di MongoDB
function checkMongoDBConfig() {
  printTitle("Verifica delle configurazioni di MongoDB");
  
  try {
    // Verifica il file lib/mongodb.ts
    const mongodbPath = path.join(PROJECT_ROOT, 'lib', 'mongodb.ts');
    const mongodbExists = fs.existsSync(mongodbPath);
    
    printResult("File lib/mongodb.ts", mongodbExists);
    
    if (mongodbExists) {
      const mongodbConfig = fs.readFileSync(mongodbPath, 'utf8');
      
      // Verifica che il file contenga le funzioni necessarie
      const hasConnectFunction = mongodbConfig.includes('export async function connectToDatabase');
      printResult("Funzione connectToDatabase", hasConnectFunction);
      
      const hasCollectionNames = mongodbConfig.includes('export function getCollectionNames');
      printResult("Funzione getCollectionNames", hasCollectionNames);
      
      // Verifica la presenza di MONGODB_URI
      const envLocalPath = path.join(PROJECT_ROOT, '.env.local');
      const envPath = path.join(PROJECT_ROOT, '.env');
      
      let envExists = fs.existsSync(envLocalPath);
      let envFilePath = envLocalPath;
      
      if (!envExists) {
        envExists = fs.existsSync(envPath);
        envFilePath = envPath;
      }
      
      printResult("File .env o .env.local", envExists);
      
      if (envExists) {
        const envContent = fs.readFileSync(envFilePath, 'utf8');
        const hasMongoDB_URI = envContent.includes('MONGODB_URI=');
        printResult("Variabile d'ambiente MONGODB_URI", hasMongoDB_URI);
        
        return mongodbExists && hasConnectFunction && hasCollectionNames && hasMongoDB_URI;
      }
      
      return mongodbExists && hasConnectFunction && hasCollectionNames;
    }
    
    return false;
  } catch (error) {
    printResult("Verifica configurazione MongoDB", false, error.message);
    return false;
  }
}

// Funzione principale
async function runDependencyTests() {
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  console.log(`${colors.magenta}   VERIFICA DELLE DIPENDENZE DEL PROGETTO         ${colors.reset}`);
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  
  const results = {
    criticalDependencies: checkCriticalDependencies(),
    nodeVersion: checkNodeVersion(),
    nextJsConfig: checkNextJsConfig(),
    typeScriptConfig: checkTypeScriptConfig(),
    tailwindConfig: checkTailwindConfig(),
    mongoDBConfig: checkMongoDBConfig()
  };
  
  // Riepilogo
  printTitle("RIEPILOGO DEI TEST");
  
  let allPassed = true;
  for (const [test, result] of Object.entries(results)) {
    const passed = !!result;
    allPassed = allPassed && passed;
    
    const testName = test
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
    
    printResult(testName, passed);
  }
  
  console.log(`\n${colors.magenta}==================================================${colors.reset}`);
  if (allPassed) {
    console.log(`${colors.green}✅ TUTTE LE VERIFICHE DELLE DIPENDENZE SONO STATE SUPERATE!${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ ALCUNE VERIFICHE DELLE DIPENDENZE NON SONO STATE SUPERATE.${colors.reset}`);
    console.log(`${colors.yellow}Controlla i dettagli sopra per risolvere i problemi.${colors.reset}`);
  }
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  
  return allPassed;
}

// Esegui i test
runDependencyTests().catch(error => {
  console.error(`${colors.red}Errore durante l'esecuzione dei test:${colors.reset}`, error);
});