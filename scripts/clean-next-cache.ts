import * as fs from 'fs';
import * as path from 'path';
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
  printTitle("Pulizia cache Next.js");
  
  // Percorsi delle directory di cache
  const cacheDirs = [
    path.join(PROJECT_ROOT, '.next'),
    path.join(PROJECT_ROOT, 'node_modules', '.cache'),
    path.join(PROJECT_ROOT, 'node_modules', '.next')
  ];
  
  // Elimina le directory di cache
  for (const dir of cacheDirs) {
    try {
      if (fs.existsSync(dir)) {
        console.log(`Eliminazione di ${dir}...`);
        fs.rmSync(dir, { recursive: true, force: true });
        printResult(`Pulizia ${path.basename(dir)}`, true);
      } else {
        console.log(`Directory ${dir} non trovata, nessuna azione necessaria.`);
      }
    } catch (error) {
      printResult(`Pulizia ${path.basename(dir)}`, false, error.message);
    }
  }
  
  console.log(`\n${colors.green}Pulizia cache completata. Ora puoi avviare il server con:${colors.reset}`);
  console.log(`${colors.yellow}npm run dev${colors.reset}`);
}

main().catch(error => {
  console.error(`${colors.red}Errore non gestito:${colors.reset}`, error);
  process.exit(1);
});