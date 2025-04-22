import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Implementazione semplice di colors per evitare problemi
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m"
};

const PROJECT_ROOT = path.resolve(__dirname, '..');

function printTitle(title: string) {
  console.log(`\n${colors.cyan}=== ${title} ===${colors.reset}\n`);
}

function printResult(test: string, passed: boolean, details?: string) {
  const icon = passed ? '✅' : '❌';
  const color = passed ? colors.green : colors.red;
  console.log(`${color}${icon} ${test}${colors.reset}${details ? `: ${details}` : ''}`);
  return passed;
}

async function main() {
  printTitle("Risoluzione problemi del progetto");
  
  // 1. Verifica spazio su disco
  try {
    console.log("Verifica spazio su disco...");
    const diskInfo = execSync('powershell -Command "Get-PSDrive C | Select-Object Used,Free"').toString();
    const freeSpaceMatch = diskInfo.match(/Free\s+:\s+(\d+)/);
    
    if (freeSpaceMatch && parseInt(freeSpaceMatch[1]) < 1000000000) { // Meno di 1GB
      printResult("Spazio su disco", false, "Spazio insufficiente");
      return;
    }
    printResult("Spazio su disco", true, "Sufficiente");
  } catch (error) {
    console.log("Impossibile verificare lo spazio su disco, continuo comunque...");
  }
  
  // 2. Pulisci la cache npm
  try {
    console.log("Pulizia cache npm...");
    execSync('npm cache clean --force', { cwd: PROJECT_ROOT, stdio: 'inherit' });
    printResult("Pulizia cache npm", true);
  } catch (error) {
    printResult("Pulizia cache npm", false, error.message);
  }
  
  // 3. Pulisci la cache di Next.js manualmente
  try {
    console.log("Pulizia cache Next.js...");
    const nextCacheDirs = [
      path.join(PROJECT_ROOT, '.next'),
      path.join(PROJECT_ROOT, 'node_modules', '.cache'),
      path.join(PROJECT_ROOT, 'node_modules', '.next')
    ];
    
    for (const dir of nextCacheDirs) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
    printResult("Pulizia cache Next.js", true);
  } catch (error) {
    printResult("Pulizia cache Next.js", false, error.message);
  }
  
  // 4. Aggiorna ws per risolvere la vulnerabilità
  try {
    console.log("Aggiornamento pacchetto ws...");
    execSync('npm install ws@8.17.1 --save-exact', { cwd: PROJECT_ROOT, stdio: 'inherit' });
    printResult("Aggiornamento ws", true);
  } catch (error) {
    printResult("Aggiornamento ws", false, error.message);
  }
  
  // 5. Verifica MongoDB
  try {
    console.log("Verifica servizio MongoDB...");
    try {
      const mongoStatus = execSync('powershell -Command "Get-Service -Name MongoDB -ErrorAction SilentlyContinue | Select-Object Status"', { 
        windowsHide: true, 
        encoding: 'utf8' 
      });
      
      if (mongoStatus.includes('Running')) {
        printResult("Servizio MongoDB", true, "In esecuzione");
      } else if (mongoStatus.includes('Status')) {
        console.log("MongoDB non è in esecuzione, avvio il servizio...");
        execSync('powershell -Command "Start-Service -Name MongoDB"', { windowsHide: true });
        printResult("Avvio MongoDB", true);
      }
    } catch (e) {
      console.log("Servizio MongoDB non trovato, verifico directory dati...");
      
      // Verifica directory MongoDB
      if (!fs.existsSync("C:\\data")) {
        fs.mkdirSync("C:\\data", { recursive: true });
      }
      if (!fs.existsSync("C:\\data\\db")) {
        fs.mkdirSync("C:\\data\\db", { recursive: true });
      }
      
      printResult("Directory MongoDB", true, "Verificate");
      console.log(`${colors.yellow}⚠️ MongoDB potrebbe non essere installato correttamente${colors.reset}`);
    }
  } catch (error) {
    printResult("Verifica MongoDB", false, error.message);
  }
  
  // 6. Verifica .env.local
  try {
    console.log("Verifica file .env.local...");
    const envPath = path.join(PROJECT_ROOT, '.env.local');
    
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, "MONGODB_URI=mongodb://127.0.0.1:27017/giudanten", "utf8");
      printResult("File .env.local", true, "Creato");
    } else {
      const content = fs.readFileSync(envPath, 'utf8');
      if (!content.includes('MONGODB_URI=')) {
        fs.appendFileSync(envPath, "\nMONGODB_URI=mongodb://127.0.0.1:27017/giudanten", "utf8");
        printResult("File .env.local", true, "Aggiornato");
      } else {
        printResult("File .env.local", true, "Già configurato");
      }
    }
  } catch (error) {
    printResult("Verifica .env.local", false, error.message);
  }
  
  // 7. Verifica porta 3000
  try {
    console.log("Verifica porta 3000...");
    const portCheck = execSync('powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object OwningProcess"', {
      windowsHide: true,
      encoding: 'utf8'
    });
    
    if (portCheck.includes('OwningProcess')) {
      console.log(`${colors.yellow}La porta 3000 è già in uso. Terminazione del processo...${colors.reset}`);
      execSync('powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"', {
        windowsHide: true
      });
      printResult("Liberazione porta 3000", true);
    } else {
      printResult("Porta 3000", true, "Libera");
    }
  } catch (error) {
    printResult("Verifica porta 3000", false, error.message);
  }
  
  console.log(`\n${colors.green}Processo completato. Prova ad avviare il server con 'npm run dev'${colors.reset}`);
  console.log(`${colors.yellow}Suggerimento: Esegui i test in una finestra separata dopo aver avviato il server${colors.reset}`);
}

main().catch(error => {
  console.error(`${colors.red}Errore non gestito:${colors.reset}`, error);
  process.exit(1);
});