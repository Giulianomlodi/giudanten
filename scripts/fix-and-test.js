const fs = require("fs");
const path = require("path");
const { exec, execSync } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

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
function printTitle(title) {
  console.log(`\n${colors.cyan}=== ${title} ===${colors.reset}\n`);
}

// Funzione per stampare un risultato
function printResult(test, passed, details) {
  const icon = passed ? "?" : "?";
  const color = passed ? colors.green : colors.red;
  console.log(`${color}${icon} ${test}${colors.reset}${details ? ": ${details}" : ""}`);
  return passed;
}

// Funzione principale
async function main() {
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  console.log(`${colors.magenta}   RISOLUZIONE AUTOMATICA DEI PROBLEMI           ${colors.reset}`);
  console.log(`${colors.magenta}==================================================${colors.reset}`);

  // Standardizza la porta
  printTitle("Standardizzazione della porta");
  try {
    const standardizeScript = path.join(__dirname, "standardize-and-verify.js");
    if (fs.existsSync(standardizeScript)) {
      console.log("Esecuzione dello script standardize-and-verify.js...");
      const { stdout, stderr } = await execAsync(`node "${standardizeScript}"`);
      console.log(stdout);
      if (stderr) console.error(stderr);
      printResult("Standardizzazione porta", true, "Completata");
    } else {
      printResult("Standardizzazione porta", false, "Script non trovato");
    }
  } catch (error) {
    printResult("Standardizzazione porta", false, error.message);
  }

  // Crea .env.local
  printTitle("Creazione .env.local");
  try {
    const envPath = path.join(__dirname, "..", ".env.local");
    fs.writeFileSync(envPath, "MONGODB_URI=mongodb://127.0.0.1:27017/giudanten", "utf8");
    printResult(".env.local", true, "Creato");
  } catch (error) {
    printResult(".env.local", false, error.message);
  }

  // Verifica directory MongoDB
  printTitle("Verifica directory MongoDB");
  try {
    if (!fs.existsSync("C:\\data")) {
      fs.mkdirSync("C:\\data");
      console.log("Directory C:\\data creata");
    }
    if (!fs.existsSync("C:\\data\\db")) {
      fs.mkdirSync("C:\\data\\db");
      printResult("Directory C:\\data\\db", true, "Creata");
    } else {
      printResult("Directory C:\\data\\db", true, "Già esistente");
    }
  } catch (error) {
    printResult("Directory C:\\data\\db", false, error.message);
  }

  // Avvia MongoDB se non è in esecuzione
  printTitle("Verifica MongoDB");
  try {
    console.log("Verifica MongoDB...");
    const mongoRunning = execSync("powershell -Command \"Get-Process mongod -ErrorAction SilentlyContinue\"").toString().trim();
    if (!mongoRunning) {
      console.log("Avvio MongoDB...");
      try {
        // Trova il percorso di installazione di MongoDB
        let mongoPath = "";
        if (fs.existsSync("C:\\Program Files\\MongoDB\\Server")) {
          const versions = fs.readdirSync("C:\\Program Files\\MongoDB\\Server");
          if (versions.length > 0) {
            // Prendi la versione più recente
            const latestVersion = versions.sort().pop();
            mongoPath = `C:\\Program Files\\MongoDB\\Server\\${latestVersion}\\bin\\mongod.exe`;
          }
        }
        
        if (!mongoPath || !fs.existsSync(mongoPath)) {
          printResult("MongoDB", false, "Impossibile trovare l'eseguibile mongod.exe");
        } else {
          execSync(`start /B "" "${mongoPath}" --dbpath="C:\\data\\db"`, { windowsHide: true });
          printResult("MongoDB", true, "Avviato");
        }
      } catch (error) {
        printResult("MongoDB", false, "Impossibile avviare MongoDB: " + error.message);
      }
    } else {
      printResult("MongoDB", true, "Già in esecuzione");
    }
  } catch (error) {
    printResult("MongoDB", false, "Errore nella verifica/avvio di MongoDB: " + error.message);
  }

  // Avvia il server Next.js in background
  printTitle("Avvio del server Next.js");
  try {
    console.log("Avvio del server Next.js...");
    const PROJECT_ROOT = path.resolve(__dirname, "..");
    
    // Verifica se il server è già in esecuzione
    try {
      const { stdout } = await execAsync("powershell -Command \"Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue\"");
      if (stdout.trim()) {
        printResult("Server Next.js", true, "Già in esecuzione");
      } else {
        throw new Error("Server non attivo");
      }
    } catch (error) {
      // Il server non è in esecuzione, lo avvieremo
      execSync("start /B npm run dev", { 
        cwd: PROJECT_ROOT,
        windowsHide: true,
        stdio: "ignore"
      });
      
      // Attendi che il server si avvii
      console.log(`${colors.yellow}Attendi l'avvio del server...${colors.reset}`);
      
      // Attendi fino a 30 secondi per l'avvio del server
      let serverStarted = false;
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const { stdout } = await execAsync("powershell -Command \"Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue\"");
          if (stdout.trim()) {
            serverStarted = true;
            break;
          }
        } catch (error) {
          // Continua ad attendere
        }
        process.stdout.write(".");
      }
      
      console.log(""); // Nuova riga dopo i puntini
      
      if (serverStarted) {
        printResult("Server Next.js", true, "Avviato correttamente");
      } else {
        printResult("Server Next.js", false, "Timeout durante l'avvio");
      }
    }
  } catch (error) {
    printResult("Server Next.js", false, "Errore nell'avvio del server Next.js: " + error.message);
  }

  // Esegui i test
  printTitle("Esecuzione test");
  
  console.log("\nEsecuzione test di connettività...");
  try {
    const { stdout: connOutput, stderr: connError } = await execAsync("node scripts/test-connectivity.js", { 
      cwd: path.resolve(__dirname, "..") 
    });
    console.log(connOutput);
    if (connError) console.error(connError);
  } catch (error) {
    console.error("Errore durante il test di connettività:", error.message);
  }
  
  console.log("\nEsecuzione test API Hyperliquid...");
  try {
    const { stdout: hyperOutput, stderr: hyperError } = await execAsync("npx tsx scripts/test-hyperliquid.ts", { 
      cwd: path.resolve(__dirname, "..") 
    });
    console.log(hyperOutput);
    if (hyperError) console.error(hyperError);
  } catch (error) {
    console.error("Errore durante il test API Hyperliquid:", error.message);
  }
  
  console.log("\nEsecuzione test API ingestione...");
  try {
    const { stdout: ingestOutput, stderr: ingestError } = await execAsync("npx tsx scripts/test-ingest-api.ts", { 
      cwd: path.resolve(__dirname, "..") 
    });
    console.log(ingestOutput);
    if (ingestError) console.error(ingestError);
  } catch (error) {
    console.error("Errore durante il test API ingestione:", error.message);
  }
  
  printTitle("Test completati");
  console.log("Tutti i test sono stati eseguiti. Verifica i risultati sopra per eventuali errori.");
}

// Esegui la funzione principale
main().catch(error => {
  console.error(`${colors.red}Errore durante l'esecuzione:${colors.reset}`, error);
});
