import { execSync } from 'child_process';
import * as readline from 'readline';

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

// Funzione per eseguire un comando e restituire l'output
function runCommand(command: string): boolean {
  try {
    console.log(`${colors.yellow}Esecuzione: ${command}${colors.reset}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`${colors.red}Errore durante l'esecuzione di: ${command}${colors.reset}`);
    console.error(error);
    return false;
  }
}

// Funzione per chiedere all'utente se continuare
function askToContinue(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${message} (s/n): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'si' || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Funzione principale
async function runAllTests() {
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  console.log(`${colors.magenta}   TEST COMPLETI DEL PROGETTO GIUDANTEN           ${colors.reset}`);
  console.log(`${colors.magenta}==================================================${colors.reset}`);

  // Test delle dipendenze
  printTitle("Test delle dipendenze");
  const dependenciesResult = runCommand('npm run test:dependencies');
  
  if (!dependenciesResult) {
    const continueAfterDependencies = await askToContinue("Ci sono problemi con le dipendenze. Vuoi continuare con gli altri test?");
    if (!continueAfterDependencies) {
      console.log(`${colors.yellow}Test interrotti. Risolvi i problemi con le dipendenze prima di continuare.${colors.reset}`);
      return;
    }
  }

  // Test di connettività
  printTitle("Test di connettività");
  const connectivityResult = runCommand('npm run test:connectivity');
  
  if (!connectivityResult) {
    const continueAfterConnectivity = await askToContinue("Ci sono problemi di connettività. Vuoi continuare con gli altri test?");
    if (!continueAfterConnectivity) {
      console.log(`${colors.yellow}Test interrotti. Risolvi i problemi di connettività prima di continuare.${colors.reset}`);
      return;
    }
  }

  // Test delle API Hyperliquid
  printTitle("Test delle API Hyperliquid");
  const hyperliquidResult = runCommand('npm run test:hyperliquid');
  
  if (!hyperliquidResult) {
    const continueAfterHyperliquid = await askToContinue("Ci sono problemi con le API Hyperliquid. Vuoi continuare con gli altri test?");
    if (!continueAfterHyperliquid) {
      console.log(`${colors.yellow}Test interrotti. Risolvi i problemi con le API Hyperliquid prima di continuare.${colors.reset}`);
      return;
    }
  }

  // Test delle API di trading
  printTitle("Test delle API di trading");
  const tradingResult = runCommand('npm run test:trading');
  
  if (!tradingResult) {
    const continueAfterTrading = await askToContinue("Ci sono problemi con le API di trading. Vuoi continuare con gli altri test?");
    if (!continueAfterTrading) {
      console.log(`${colors.yellow}Test interrotti. Risolvi i problemi con le API di trading prima di continuare.${colors.reset}`);
      return;
    }
  }

  // Dichiariamo ingestResult fuori dal blocco if per renderlo accessibile in tutto lo scope della funzione
  let ingestResult = false;

  // Chiedi all'utente se vuole avviare il server locale
  const startLocalServer = await askToContinue("Vuoi avviare il server locale per testare le API di ingestione?");
  
  if (startLocalServer) {
    printTitle("Avvio del server locale");
    console.log(`${colors.yellow}Avvio del server Next.js in background...${colors.reset}`);
    console.log(`${colors.yellow}Premi Ctrl+C per terminare il server quando hai finito i test.${colors.reset}`);
    
    // Avvia il server in un nuovo processo
    const { spawn } = require('child_process');
    const server = spawn('npm', ['run', 'dev'], { 
      shell: true,
      detached: true,
      stdio: 'inherit'
    });
    
    // Attendi che il server si avvii
    console.log(`${colors.yellow}Attendi 10 secondi per l'avvio del server...${colors.reset}`);
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Test delle API di ingestione
    printTitle("Test delle API di ingestione");
    ingestResult = runCommand('npm run test:ingest');
    
    if (!ingestResult) {
      console.log(`${colors.yellow}Ci sono problemi con le API di ingestione. Controlla i log del server per maggiori dettagli.${colors.reset}`);
    }
    
    // Chiedi all'utente se vuole terminare il server
    const stopServer = await askToContinue("Vuoi terminare il server locale?");
    
    if (stopServer) {
      console.log(`${colors.yellow}Terminazione del server...${colors.reset}`);
      process.kill(-server.pid);
    } else {
      console.log(`${colors.yellow}Il server continuerà a funzionare in background. Premi Ctrl+C per terminarlo quando hai finito.${colors.reset}`);
    }
  }

  // Riepilogo finale
  printTitle("RIEPILOGO DEI TEST");
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  console.log(`${colors.green}✅ Test delle dipendenze: ${dependenciesResult ? 'Superato' : 'Non superato'}${colors.reset}`);
  console.log(`${colors.green}✅ Test di connettività: ${connectivityResult ? 'Superato' : 'Non superato'}${colors.reset}`);
  console.log(`${colors.green}✅ Test delle API Hyperliquid: ${hyperliquidResult ? 'Superato' : 'Non superato'}${colors.reset}`);
  console.log(`${colors.green}✅ Test delle API di trading: ${tradingResult ? 'Superato' : 'Non superato'}${colors.reset}`);
  
  if (startLocalServer) {
    console.log(`${colors.green}✅ Test delle API di ingestione: ${ingestResult ? 'Superato' : 'Non superato'}${colors.reset}`);
  }
  
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  
  if (dependenciesResult && connectivityResult && hyperliquidResult && tradingResult && (!startLocalServer || ingestResult)) {
    console.log(`${colors.green}✅ TUTTI I TEST SONO STATI SUPERATI!${colors.reset}`);
    console.log(`${colors.green}Il progetto Giudanten è pronto per essere utilizzato.${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ ALCUNI TEST NON SONO STATI SUPERATI.${colors.reset}`);
    console.log(`${colors.yellow}Controlla i dettagli sopra per risolvere i problemi.${colors.reset}`);
  }
}

// Esegui i test
runAllTests().catch(error => {
  console.error(`${colors.red}Errore durante l'esecuzione dei test:${colors.reset}`, error);
});