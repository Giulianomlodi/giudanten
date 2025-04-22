const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Esecuzione test completo dell\'applicazione...');

// Verifica struttura delle cartelle
console.log('\n1. Verifica struttura delle cartelle');
const requiredFolders = ['app', 'components', 'public'];
let allFoldersExist = true;

for (const folder of requiredFolders) {
  const folderPath = path.join(__dirname, '..', folder);
  if (fs.existsSync(folderPath)) {
    console.log(`✅ Cartella ${folder}: OK`);
  } else {
    console.error(`❌ Cartella ${folder}: MANCANTE`);
    allFoldersExist = false;
  }
}

// Verifica file critici
console.log('\n2. Verifica file critici');
const criticalFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'components/layout/Header.tsx',
  'components/layout/Footer.tsx'
];
let allFilesExist = true;

for (const file of criticalFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ File ${file}: OK`);
  } else {
    console.error(`❌ File ${file}: MANCANTE`);
    allFilesExist = false;
  }
}

// Verifica dipendenze web3 nel layout
console.log('\n3. Verifica dipendenze web3 nel layout');
const layoutPath = path.join(__dirname, '..', 'app', 'layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');

if (layoutContent.includes('@rainbow-me/rainbowkit') || 
    layoutContent.includes('wagmi') || 
    layoutContent.includes('WagmiConfig')) {
  console.error('❌ Il layout contiene ancora riferimenti a RainbowKit o Wagmi');
} else {
  console.log('✅ Layout senza dipendenze web3: OK');
}

// Verifica componenti Header e Footer
console.log('\n4. Verifica componenti Header e Footer');
const headerPath = path.join(__dirname, '..', 'components', 'layout', 'Header.tsx');
const footerPath = path.join(__dirname, '..', 'components', 'layout', 'Footer.tsx');

try {
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  if (headerContent.includes('@rainbow-me/rainbowkit') || 
      headerContent.includes('wagmi') || 
      headerContent.includes('ConnectButton')) {
    console.error('❌ Header contiene riferimenti a RainbowKit o Wagmi');
  } else {
    console.log('✅ Header senza dipendenze web3: OK');
  }
} catch (error) {
  console.error('❌ Impossibile leggere il file Header.tsx:', error.message);
}

try {
  const footerContent = fs.readFileSync(footerPath, 'utf8');
  if (footerContent.includes('@rainbow-me/rainbowkit') || 
      footerContent.includes('wagmi') || 
      footerContent.includes('ConnectButton')) {
    console.error('❌ Footer contiene riferimenti a RainbowKit o Wagmi');
  } else {
    console.log('✅ Footer senza dipendenze web3: OK');
  }
} catch (error) {
  console.error('❌ Impossibile leggere il file Footer.tsx:', error.message);
}

// Verifica ClientSideMenu
console.log('\n5. Verifica ClientSideMenu');
const menuPath = path.join(__dirname, '..', 'components', 'layout', 'ClientSideMenu.tsx');

try {
  const menuContent = fs.readFileSync(menuPath, 'utf8');
  if (menuContent.includes('@rainbow-me/rainbowkit') || 
      menuContent.includes('ConnectButton')) {
    console.error('❌ ClientSideMenu contiene ancora riferimenti a RainbowKit');
    console.log('   Rimuovi la riga: import { ConnectButton } from "@rainbow-me/rainbowkit";');
    console.log('   E rimuovi qualsiasi utilizzo del componente <ConnectButton />');
  } else {
    console.log('✅ ClientSideMenu senza dipendenze RainbowKit: OK');
  }
} catch (error) {
  console.error('❌ Impossibile leggere il file ClientSideMenu.tsx:', error.message);
}

// Verifica MenuVoices
console.log('\n6. Verifica MenuVoices');
const menuVoicesPath = path.join(__dirname, '..', 'components', 'layout', 'MenuVoices.tsx');

try {
  const menuVoicesContent = fs.readFileSync(menuVoicesPath, 'utf8');
  if (menuVoicesContent.includes('@rainbow-me/rainbowkit') || 
      menuVoicesContent.includes('wagmi')) {
    console.error('❌ MenuVoices contiene riferimenti a RainbowKit o Wagmi');
  } else {
    console.log('✅ MenuVoices senza dipendenze web3: OK');
  }
} catch (error) {
  console.error('❌ Impossibile leggere il file MenuVoices.tsx:', error.message);
}

console.log('\n=== SUGGERIMENTI PER LA RISOLUZIONE DEI PROBLEMI ===');
console.log('1. Verifica che tutti i componenti importati nel layout esistano');
console.log('2. Controlla la console del browser per errori JavaScript');
console.log('3. Prova a utilizzare i componenti Header e Footer semplificati forniti');
console.log('4. Verifica che non ci siano riferimenti a componenti web3 nei file di layout');