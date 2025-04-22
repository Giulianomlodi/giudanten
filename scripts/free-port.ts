import { execSync } from 'child_process';

// Implementazione semplice di colors per evitare dipendenze esterne
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m"
};

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
  printTitle("Liberazione porta 3000");
  
  try {
    console.log("Verifica processi sulla porta 3000...");
    
    // Ottieni i processi che usano la porta 3000
    const portCheck = execSync('powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object OwningProcess"', {
      windowsHide: true,
      encoding: 'utf8'
    });
    
    if (portCheck.includes('OwningProcess')) {
      console.log(`${colors.yellow}La porta 3000 è in uso. Terminazione dei processi...${colors.reset}`);
      
      // Termina tutti i processi che usano la porta 3000
      execSync('powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"', {
        windowsHide: true
      });
      
      // Verifica che la porta sia stata liberata
      const portCheckAfter = execSync('powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object OwningProcess"', {
        windowsHide: true,
        encoding: 'utf8'
      });
      
      if (!portCheckAfter.includes('OwningProcess')) {
        printResult("Liberazione porta 3000", true);
      } else {
        printResult("Liberazione porta 3000", false, "Impossibile terminare tutti i processi");
      }
    } else {
      printResult("Porta 3000", true, "Già libera");
    }
  } catch (error) {
    printResult("Verifica porta 3000", false, error.message);
  }
  
  console.log(`\n${colors.green}Ora puoi avviare il server con:${colors.reset}`);
  console.log(`${colors.yellow}npm run dev${colors.reset}`);
}

main().catch(error => {
  console.error(`${colors.red}Errore non gestito:${colors.reset}`, error);
  process.exit(1);
});