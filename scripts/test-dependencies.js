const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Percorso del package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Leggi il package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Estrai le dipendenze
const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

console.log('Verifica delle dipendenze in corso...');

// Verifica ogni dipendenza
let allDependenciesValid = true;
const missingDependencies = [];

for (const [name, version] of Object.entries(dependencies)) {
  try {
    // Prova a richiedere il modulo
    require.resolve(name);
    console.log(`✅ ${name}: OK`);
  } catch (error) {
    console.error(`❌ ${name}: MANCANTE O NON INSTALLATO CORRETTAMENTE`);
    missingDependencies.push(name);
    allDependenciesValid = false;
  }
}

// Verifica configurazione RainbowKit
console.log('\nVerifica configurazione RainbowKit...');
try {
  const layoutPath = path.join(__dirname, '..', 'app', 'layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  if (layoutContent.includes('projectId: \'YOUR_PROJECT_ID\'')) {
    console.error('⚠️ ATTENZIONE: Il projectId di WalletConnect non è configurato!');
    console.error('Modifica il file app/layout.tsx e sostituisci YOUR_PROJECT_ID con un ID valido');
    console.error('Ottieni un ID su https://cloud.walletconnect.com/');
  } else {
    console.log('✅ Configurazione RainbowKit: OK');
  }
} catch (error) {
  console.error('❌ Impossibile verificare la configurazione RainbowKit:', error.message);
}

if (allDependenciesValid) {
  console.log('\n✅ Tutte le dipendenze sono installate correttamente!');
} else {
  console.error('\n❌ Alcune dipendenze non sono installate correttamente:');
  missingDependencies.forEach(dep => console.error(`   - ${dep}`));
  console.log('\nProva a eseguire: npm install --legacy-peer-deps');
}

// Suggerimenti per la risoluzione dei problemi
console.log('\n=== SUGGERIMENTI PER LA RISOLUZIONE DEI PROBLEMI ===');
console.log('1. Verifica i log del server Next.js per errori');
console.log('2. Assicurati di aver configurato un projectId valido in app/layout.tsx');
console.log('3. Prova a creare una pagina di test semplificata');
console.log('4. Controlla la console del browser per errori JavaScript');