const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const { promisify } = require('util');
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
  const icon = passed ? '✅' : '❌';
  const color = passed ? colors.green : colors.red;
  console.log(`${color}${icon} ${test}${colors.reset}${details ? `: ${details}` : ''}`);
  return passed;
}

// Funzione per trovare e sostituire tutte le occorrenze di localhost con qualsiasi porta a localhost:3000
async function standardizePort() {
  printTitle("Standardizzazione della porta a localhost:3000");
  
  const PROJECT_ROOT = path.resolve(__dirname, '..');
  const fileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
  
  // Funzione ricorsiva per trovare tutti i file con le estensioni specificate
  function findFiles(dir, extensions, fileList = []) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && file !== 'node_modules' && file !== '.git' && file !== '.next') {
        findFiles(filePath, extensions, fileList);
      } else if (stat.isFile() && extensions.includes(path.extname(file))) {
        fileList.push(filePath);
      }
    }
    
    return fileList;
  }
  
  const allFiles = findFiles(PROJECT_ROOT, fileExtensions);
  let totalReplacements = 0;
  let modifiedFiles = 0;
  
  for (const filePath of allFiles) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Sostituisci tutte le occorrenze di localhost con qualsiasi porta a localhost:3000
    const newContent = content.replace(/localhost:(\d+)/g, (match, port) => {
      if (port !== '3000') {
        return 'localhost:3000';
      }
      return match;
    });
    
    // Conta le sostituzioni
    const replacements = (originalContent.match(/localhost:\d+/g) || []).filter(match => !match.includes('localhost:3000')).length;
    totalReplacements += replacements;
    
    if (originalContent !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      modifiedFiles++;
      printResult(`File ${path.relative(PROJECT_ROOT, filePath)}`, true, `${replacements} sostituzioni`);
    }
  }
  
  // Aggiorna il package.json per rimuovere o modificare gli script che usano la porta 3004
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Rimuovi o modifica gli script che usano la porta 3004
    if (packageJson.scripts) {
      let scriptsModified = false;
      
      // Rimuovi lo script dev:3004 se esiste
      if (packageJson.scripts['dev:3004']) {
        delete packageJson.scripts['dev:3004'];
        scriptsModified = true;
      }
      
      // Aggiorna altri script che potrebbero contenere la porta 3004
      for (const [scriptName, scriptCommand] of Object.entries(packageJson.scripts)) {
        if (scriptCommand.includes('3004')) {
          packageJson.scripts[scriptName] = scriptCommand.replace(/3004/g, '3000');
          scriptsModified = true;
        }
      }
      
      if (scriptsModified) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
        printResult("package.json", true, "Script aggiornati");
      }
    }
  }
  
  // Aggiorna il file next.config.mjs per assicurarsi che non ci siano configurazioni di porta
  const nextConfigPath = path.join(PROJECT_ROOT, 'next.config.mjs');
  if (fs.existsSync(nextConfigPath)) {
    let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Rimuovi qualsiasi configurazione di porta
    if (nextConfig.includes('port:')) {
      nextConfig = nextConfig.replace(/server\s*:\s*{[^}]*port\s*:\s*\d+[^}]*}/g, '');
      fs.writeFileSync(nextConfigPath, nextConfig, 'utf8');
      printResult("next.config.mjs", true, "Configurazione della porta rimossa");
    }
  }
  
  printResult("Standardizzazione completata", true, `${modifiedFiles} file modificati, ${totalReplacements} sostituzioni totali`);
  return { modifiedFiles, totalReplacements };
}

// Funzione per creare o aggiornare il file .env.local con l'URI MongoDB corretto
async function setupMongoDBConnection() {
  printTitle("Configurazione della connessione MongoDB");
  
  const PROJECT_ROOT = path.resolve(__dirname, '..');
  const envPath = path.join(PROJECT_ROOT, '.env.local');
  
  // Crea la directory dei dati MongoDB se non esiste
  try {
    if (!fs.existsSync('C:\\data')) {
      fs.mkdirSync('C:\\data');
      printResult("Directory C:\\data", true, "Creata");
    }
    
    if (!fs.existsSync('C:\\data\\db')) {
      fs.mkdirSync('C:\\data\\db');
      printResult("Directory C:\\data\\db", true, "Creata");
    } else {
      printResult("Directory C:\\data\\db", true, "Già esistente");
    }
  } catch (error) {
    printResult("Creazione directory dati", false, error.message);
  }
  
  // Crea o aggiorna il file .env.local
  try {
    const envContent = `MONGODB_URI=mongodb://127.0.0.1:27017/giudanten\n`;
    fs.writeFileSync(envPath, envContent, 'utf8');
    printResult("File .env.local", true, "Creato/aggiornato con l'URI MongoDB corretto");
  } catch (error) {
    printResult("Creazione file .env.local", false, error.message);
    return false;
  }
  
  return true;
}

// Funzione per verificare se MongoDB è in esecuzione e avviarlo se necessario
async function checkAndStartMongoDB() {
  printTitle("Verifica e avvio di MongoDB");
  
  try {
    // Verifica se MongoDB è in esecuzione
    const checkResult = await execAsync('powershell -Command "Get-Process mongod -ErrorAction SilentlyContinue"');
    
    if (checkResult.stdout.trim()) {
      printResult("MongoDB", true, "Già in esecuzione");
      return true;
    }
    
    // Trova il percorso di installazione di MongoDB
    let mongoPath = '';
    
    if (fs.existsSync('C:\\Program Files\\MongoDB\\Server')) {
      const versions = fs.readdirSync('C:\\Program Files\\MongoDB\\Server');
      if (versions.length > 0) {
        // Prendi la versione più recente
        const latestVersion = versions.sort().pop();
        mongoPath = `C:\\Program Files\\MongoDB\\Server\\${latestVersion}\\bin\\mongod.exe`;
      }
    }
    
    if (!mongoPath || !fs.existsSync(mongoPath)) {
      printResult("MongoDB", false, "Impossibile trovare l'eseguibile mongod.exe");
      return false;
    }
    
    // Avvia MongoDB in background
    console.log(`${colors.yellow}Avvio di MongoDB...${colors.reset}`);
    
    // Usa start /B per avviare in background
    execSync(`start /B "" "${mongoPath}" --dbpath="C:\\data\\db"`, { 
      windowsHide: true,
      stdio: 'ignore'
    });
    
    // Attendi che MongoDB si avvii
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verifica se MongoDB è stato avviato correttamente
    const verifyResult = await execAsync('powershell -Command "Get-Process mongod -ErrorAction SilentlyContinue"');
    
    if (verifyResult.stdout.trim()) {
      printResult("MongoDB", true, "Avviato correttamente");
      return true;
    } else {
      printResult("MongoDB", false, "Impossibile avviare il servizio");
      return false;
    }
  } catch (error) {
    printResult("Verifica/avvio MongoDB", false, error.message);
    return false;
  }
}

// Funzione per avviare il server Next.js in background
async function startNextServer() {
  printTitle("Avvio del server Next.js");
  
  try {
    // Verifica se il server è già in esecuzione
    try {
      const response = await fetch('http://localhost:3000');
      if (response.status !== 404 && response.status !== 500) {
        printResult("Server Next.js", true, "Già in esecuzione");
        return true;
      }
    } catch (error) {
      // Il server non è in esecuzione, lo avbieremo
    }
    
    console.log(`${colors.yellow}Avvio del server Next.js...${colors.reset}`);
    
    // Termina eventuali processi Next.js esistenti
    try {
      // Verifica se la porta 3000 è in uso
      console.log(`${colors.yellow}Verifico se la porta 3000 è già in uso...${colors.reset}`);
      const portCheckResult = execSync('powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object OwningProcess"', {
        windowsHide: true,
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      if (portCheckResult.includes('OwningProcess')) {
        console.log(`${colors.yellow}La porta 3000 è già in uso. Terminazione del processo...${colors.reset}`);
        // Termina il processo che sta usando la porta 3000
        execSync('powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"', {
          windowsHide: true,
          stdio: 'ignore'
        });
        console.log(`${colors.green}Processo sulla porta 3000 terminato${colors.reset}`);
      } else {
        console.log(`${colors.yellow}La porta 3000 non è in uso${colors.reset}`);
      }
      
      // Verifica anche se ci sono processi node.exe in esecuzione
      const checkNodeProcess = execSync('tasklist /FI "IMAGENAME eq node.exe" /NH', {
        windowsHide: true,
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      if (checkNodeProcess.includes('node.exe')) {
        console.log(`${colors.yellow}Terminazione dei processi Node.js esistenti...${colors.reset}`);
        // Comando per terminare i processi node
        execSync('taskkill /F /IM node.exe /T', {
          windowsHide: true,
          stdio: 'ignore'
        });
        console.log(`${colors.green}Processi Node.js terminati con successo${colors.reset}`);
      } else {
        console.log(`${colors.yellow}Nessun processo Node.js trovato in esecuzione${colors.reset}`);
      }
      
      // Attendi che i processi vengano terminati
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      // Ignora eventuali errori nella terminazione dei processi
      console.log(`${colors.yellow}Nota: Errore durante la verifica/terminazione dei processi: ${error.message}${colors.reset}`);
    }
    
    // Avvia il server Next.js in background
    const PROJECT_ROOT = path.resolve(__dirname, '..');
    
    // Usa start start cmd /c per avviare in una nuova finestra
    execSync('start cmd /c "npm run dev"', { 
      cwd: PROJECT_ROOT,
      windowsHide: false,
      stdio: 'ignore'
    });
    
    // Attendi che il server si avvii
    console.log(`${colors.yellow}Attendi l'avvio del server...${colors.reset}`);
    
    // Attendi fino a 30 secondi per l'avvio del server
    let serverStarted = false;
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        const response = await fetch('http://localhost:3000');
        if (response.status !== 404 && response.status !== 500) {
          serverStarted = true;
          break;
        }
      } catch (error) {
        // Continua ad attendere
      }
      process.stdout.write('.');
    }
    
    console.log(''); // Nuova riga dopo i puntini
    
    if (serverStarted) {
      printResult("Server Next.js", true, "Avviato correttamente");
      return true;
    } else {
      printResult("Server Next.js", false, "Timeout durante l'avvio");
      return false;
    }
  } catch (error) {
    printResult("Avvio server Next.js", false, error.message);
    return false;
  }
}

// Funzione per eseguire i test di connettività
async function runConnectivityTests() {
  printTitle("Esecuzione dei test di connettività");
  
  try {
    const PROJECT_ROOT = path.resolve(__dirname, '..');
    
    console.log(`${colors.yellow}Esecuzione di test-connectivity.js...${colors.reset}`);
    
    const { stdout, stderr } = await execAsync('node scripts/test-connectivity.js', {
      cwd: PROJECT_ROOT
    });
    
    console.log(stdout);
    
    if (stderr) {
      console.error(stderr);
    }
    
    // Verifica se tutti i test sono stati superati
    const allPassed = stdout.includes('TUTTI I TEST DI CONNETTIVITÀ SONO STATI SUPERATI');
    
    printResult("Test di connettività", allPassed);
    return allPassed;
  } catch (error) {
    printResult("Test di connettività", false, error.message);
    return false;
  }
}

// Funzione per eseguire il test dell'API di ingestione
async function runIngestAPITest() {
  printTitle("Test dell'API di ingestione");
  
  try {
    const PROJECT_ROOT = path.resolve(__dirname, '..');
    
    console.log(`${colors.yellow}Esecuzione di test-ingest-api.js...${colors.reset}`);
    
    const { stdout, stderr } = await execAsync('npx tsx scripts/test-ingest-api.ts', {
      cwd: PROJECT_ROOT
    });
    
    console.log(stdout);
    
    if (stderr) {
      console.error(stderr);
    }
    
    // Verifica se il test è stato superato
    const testPassed = stdout.includes('API di ingestione: ✅');
    
    printResult("Test API di ingestione", testPassed);
    return testPassed;
  } catch (error) {
    printResult("Test API di ingestione", false, error.message);
    return false;
  }
}

// Funzione principale
async function standardizeAndVerify() {
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  console.log(`${colors.magenta}   STANDARDIZZAZIONE E VERIFICA AUTOMATICA        ${colors.reset}`);
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  
  // Passo 1: Standardizza la porta a 3000
  const standardizeResult = await standardizePort();
  
  // Passo 2: Configura la connessione MongoDB
  const mongoConfigResult = await setupMongoDBConnection();
  
  if (!mongoConfigResult) {
    console.log(`${colors.red}❌ Impossibile configurare MongoDB. Interruzione dei test.${colors.reset}`);
    return;
  }
  
  // Passo 3: Verifica e avvia MongoDB se necessario
  const mongoRunningResult = await checkAndStartMongoDB();
  
  if (!mongoRunningResult) {
    console.log(`${colors.red}❌ MongoDB non è in esecuzione. Interruzione dei test.${colors.reset}`);
    return;
  }
  
  // Passo 4: Avvia il server Next.js
  const serverStartResult = await startNextServer();
  
  if (!serverStartResult) {
    console.log(`${colors.red}❌ Impossibile avviare il server Next.js. Interruzione dei test.${colors.reset}`);
    return;
  }
  
  // Passo 5: Esegui i test di connettività
  const connectivityTestResult = await runConnectivityTests();
  
  // Passo 6: Esegui il test dell'API di ingestione
  const ingestTestResult = await runIngestAPITest();
  
  // Riepilogo finale
  console.log(`\n${colors.magenta}==================================================${colors.reset}`);
  console.log(`${colors.magenta}   RIEPILOGO DELLA STANDARDIZZAZIONE E VERIFICA   ${colors.reset}`);
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  
  printResult("Standardizzazione porta", standardizeResult.modifiedFiles > 0, `${standardizeResult.modifiedFiles} file modificati`);
  printResult("Configurazione MongoDB", mongoConfigResult);
  printResult("MongoDB in esecuzione", mongoRunningResult);
  printResult("Server Next.js", serverStartResult);
  printResult("Test di connettività", connectivityTestResult);
  printResult("Test API di ingestione", ingestTestResult);
  
  const allPassed = mongoConfigResult && mongoRunningResult && serverStartResult && 
                    connectivityTestResult && ingestTestResult;
  
  console.log(`\n${colors.magenta}==================================================${colors.reset}`);
  if (allPassed) {
    console.log(`${colors.green}✅ STANDARDIZZAZIONE E VERIFICA COMPLETATE CON SUCCESSO!${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ ALCUNI PASSAGGI NON SONO STATI COMPLETATI.${colors.reset}`);
    console.log(`${colors.yellow}Controlla i dettagli sopra per risolvere i problemi.${colors.reset}`);
  }
  console.log(`${colors.magenta}==================================================${colors.reset}`);
}

// Esegui la funzione principale
standardizeAndVerify().catch(error => {
  console.error(`${colors.red}Errore durante l'esecuzione:${colors.reset}`, error);
});
