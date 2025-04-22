# Script di verifica e ottimizzazione del sistema Giudanten
# Eseguire in un'unica finestra PowerShell con privilegi di amministratore

# Colori per l'output
$colors = @{
    Reset = "`e[0m"
    Red = "`e[31m"
    Green = "`e[32m"
    Yellow = "`e[33m"
    Blue = "`e[34m"
    Magenta = "`e[35m"
    Cyan = "`e[36m"
}

# Funzione per stampare un titolo
function Print-Title {
    param([string]$title)
    Write-Host "`n$($colors.Cyan)=== $title ===$($colors.Reset)`n"
}

# Funzione per stampare un risultato
function Print-Result {
    param(
        [string]$test,
        [bool]$passed,
        [string]$details = ""
    )
    $icon = if ($passed) { "✅" } else { "❌" }
    $color = if ($passed) { $colors.Green } else { $colors.Red }
    $detailsText = if ($details) { ": $details" } else { "" }
    Write-Host "$color$icon $test$($colors.Reset)$detailsText"
    return $passed
}

# Funzione per chiedere conferma
function Ask-Confirmation {
    param([string]$message)
    $response = Read-Host "$($colors.Yellow)$message (s/n)$($colors.Reset)"
    return $response.ToLower() -eq "s" -or $response.ToLower() -eq "si" -or $response.ToLower() -eq "y" -or $response.ToLower() -eq "yes"
}

# Verifica se PowerShell è in esecuzione come amministratore
function Test-Admin {
    $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Verifica e termina processi
function Stop-ProjectProcesses {
    Print-Title "Terminazione dei processi esistenti"
    
    # Verifica se la porta 3000 è in uso
    Write-Host "$($colors.Yellow)Verifico se la porta 3000 è già in uso...$($colors.Reset)"
    $portInUse = $false
    
    try {
        $tcpConnections = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
        if ($tcpConnections) {
            $portInUse = $true
            Write-Host "$($colors.Yellow)La porta 3000 è già in uso. Terminazione del processo...$($colors.Reset)"
            
            foreach ($conn in $tcpConnections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "Terminazione del processo $($process.ProcessName) (PID: $($process.Id))"
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                }
            }
            
            Write-Host "$($colors.Green)Processo sulla porta 3000 terminato$($colors.Reset)"
        } else {
            Write-Host "$($colors.Yellow)La porta 3000 non è in uso$($colors.Reset)"
        }
    } catch {
        Write-Host "$($colors.Red)Errore durante la verifica della porta: $_$($colors.Reset)"
    }
    
    # Verifica se ci sono processi node.exe in esecuzione
    Write-Host "$($colors.Yellow)Verifico se ci sono processi Node.js in esecuzione...$($colors.Reset)"
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    if ($nodeProcesses) {
        Write-Host "$($colors.Yellow)Terminazione dei processi Node.js esistenti...$($colors.Reset)"
        $nodeProcesses | ForEach-Object {
            Write-Host "Terminazione del processo node.exe (PID: $($_.Id))"
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
        Write-Host "$($colors.Green)Processi Node.js terminati con successo$($colors.Reset)"
    } else {
        Write-Host "$($colors.Yellow)Nessun processo Node.js trovato in esecuzione$($colors.Reset)"
    }
    
    # Verifica se MongoDB è in esecuzione
    Write-Host "$($colors.Yellow)Verifico se MongoDB è in esecuzione...$($colors.Reset)"
    $mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
    
    if ($mongoProcess) {
        if (Ask-Confirmation "MongoDB è già in esecuzione. Vuoi riavviarlo?") {
            Write-Host "$($colors.Yellow)Terminazione di MongoDB...$($colors.Reset)"
            $mongoProcess | ForEach-Object {
                Write-Host "Terminazione del processo mongod.exe (PID: $($_.Id))"
                Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            }
            Write-Host "$($colors.Green)MongoDB terminato con successo$($colors.Reset)"
            return $false
        } else {
            Write-Host "$($colors.Green)MongoDB rimane in esecuzione$($colors.Reset)"
            return $true
        }
    } else {
        Write-Host "$($colors.Yellow)MongoDB non è in esecuzione$($colors.Reset)"
        return $false
    }
}

# Verifica e crea le directory per MongoDB
function Setup-MongoDBDirectories {
    Print-Title "Configurazione delle directory MongoDB"
    
    $dataCreated = $false
    $dbCreated = $false
    
    # Crea la directory C:\data se non esiste
    if (-not (Test-Path "C:\data")) {
        try {
            New-Item -Path "C:\data" -ItemType Directory | Out-Null
            $dataCreated = $true
            Print-Result "Directory C:\data" $true "Creata"
        } catch {
            Print-Result "Directory C:\data" $false $_.Exception.Message
        }
    } else {
        $dataCreated = $true
        Print-Result "Directory C:\data" $true "Già esistente"
    }
    
    # Crea la directory C:\data\db se non esiste
    if ($dataCreated -and -not (Test-Path "C:\data\db")) {
        try {
            New-Item -Path "C:\data\db" -ItemType Directory | Out-Null
            $dbCreated = $true
            Print-Result "Directory C:\data\db" $true "Creata"
        } catch {
            Print-Result "Directory C:\data\db" $false $_.Exception.Message
        }
    } elseif ($dataCreated) {
        $dbCreated = $true
        Print-Result "Directory C:\data\db" $true "Già esistente"
    }
    
    return $dataCreated -and $dbCreated
}

# Crea o aggiorna il file .env.local
function Setup-EnvFile {
    Print-Title "Configurazione del file .env.local"
    
    $envPath = "c:\Users\danie\Desktop\BOT COPY\giudanten\.env.local"
    $envContent = "MONGODB_URI=mongodb://127.0.0.1:27017/giudanten`n"
    
    try {
        Set-Content -Path $envPath -Value $envContent -Force
        Print-Result "File .env.local" $true "Creato/aggiornato con l'URI MongoDB corretto"
        return $true
    } catch {
        Print-Result "File .env.local" $false $_.Exception.Message
        return $false
    }
}

# Avvia MongoDB
function Start-MongoDB {
    Print-Title "Avvio di MongoDB"
    
    # Verifica se MongoDB è già in esecuzione
    $mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        Print-Result "MongoDB" $true "Già in esecuzione"
        return $true
    }
    
    # Trova il percorso di installazione di MongoDB
    $mongoPath = $null
    
    if (Test-Path "C:\Program Files\MongoDB\Server") {
        $versions = Get-ChildItem -Path "C:\Program Files\MongoDB\Server" | Sort-Object -Property Name
        if ($versions) {
            # Prendi la versione più recente
            $latestVersion = $versions[-1].Name
            $mongoPath = "C:\Program Files\MongoDB\Server\$latestVersion\bin\mongod.exe"
        }
    }
    
    if (-not $mongoPath -or -not (Test-Path $mongoPath)) {
        Print-Result "MongoDB" $false "Impossibile trovare l'eseguibile mongod.exe"
        return $false
    }
    
    # Avvia MongoDB
    Write-Host "$($colors.Yellow)Avvio di MongoDB...$($colors.Reset)"
    
    try {
        Start-Process -FilePath $mongoPath -ArgumentList "--dbpath=C:\data\db" -WindowStyle Hidden
        
        # Attendi che MongoDB si avvii
        Write-Host "$($colors.Yellow)Attendi l'avvio di MongoDB...$($colors.Reset)"
        Start-Sleep -Seconds 3
        
        # Verifica se MongoDB è stato avviato correttamente
        $mongoRunning = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
        
        if ($mongoRunning) {
            Print-Result "MongoDB" $true "Avviato correttamente"
            return $true
        } else {
            Print-Result "MongoDB" $false "Impossibile avviare il servizio"
            return $false
        }
    } catch {
        Print-Result "MongoDB" $false $_.Exception.Message
        return $false
    }
}

# Avvia il server Next.js
function Start-NextServer {
    Print-Title "Avvio del server Next.js"
    
    # Verifica se il server è già in esecuzione
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -ne 404 -and $response.StatusCode -ne 500) {
            Print-Result "Server Next.js" $true "Già in esecuzione"
            return $true
        }
    } catch {
        # Il server non è in esecuzione, lo avbieremo
        Write-Host "$($colors.Yellow)Il server Next.js non è in esecuzione, lo avvieremo...$($colors.Reset)"
    }
    
    Write-Host "$($colors.Yellow)Avvio del server Next.js...$($colors.Reset)"
    
    try {
        $projectRoot = "c:\Users\danie\Desktop\BOT COPY\giudanten"
        
        # Termina eventuali processi node.exe esistenti
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if ($nodeProcesses) {
            Write-Host "$($colors.Yellow)Terminazione dei processi Node.js esistenti...$($colors.Reset)"
            $nodeProcesses | ForEach-Object {
                Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            }
            Start-Sleep -Seconds 2
        }
        
        # Avvia il server Next.js in una nuova finestra
        Write-Host "$($colors.Yellow)Esecuzione di 'npm run dev'...$($colors.Reset)"
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory $projectRoot
        
        # Attendi che il server si avvii
        Write-Host "$($colors.Yellow)Attendi l'avvio del server (fino a 60 secondi)...$($colors.Reset)"
        
        # Attendi fino a 60 secondi per l'avvio del server
        $serverStarted = $false
        for ($i = 0; $i -lt 60; $i++) {
            Start-Sleep -Seconds 1
            Write-Host "." -NoNewline
            
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction SilentlyContinue
                if ($response.StatusCode -ne 404 -and $response.StatusCode -ne 500) {
                    $serverStarted = $true
                    break
                }
            } catch {
                # Continua ad attendere
            }
        }
        
        Write-Host "" # Nuova riga dopo i puntini
        
        if ($serverStarted) {
            Print-Result "Server Next.js" $true "Avviato correttamente"
            return $true
        } else {
            Print-Result "Server Next.js" $false "Timeout durante l'avvio"
            
            # Verifica se ci sono errori nei log
            Write-Host "$($colors.Yellow)Verifica dei processi Node.js in esecuzione...$($colors.Reset)"
            $runningNodes = Get-Process -Name "node" -ErrorAction SilentlyContinue
            if ($runningNodes) {
                Write-Host "$($colors.Yellow)Ci sono processi Node.js in esecuzione, ma non è possibile connettersi alla porta 3000.$($colors.Reset)"
                Write-Host "$($colors.Yellow)Potrebbe esserci un problema con la configurazione del server.$($colors.Reset)"
            } else {
                Write-Host "$($colors.Red)Nessun processo Node.js trovato. Il server potrebbe non essere stato avviato correttamente.$($colors.Reset)"
            }
            
            return $false
        }
    } catch {
        Print-Result "Server Next.js" $false $_.Exception.Message
        return $false
    }
}

# Esegui i test di connettività
function Test-Connectivity {
    Print-Title "Esecuzione dei test di connettività"
    
    try {
        $projectRoot = "c:\Users\danie\Desktop\BOT COPY\giudanten"
        
        Write-Host "$($colors.Yellow)Esecuzione di test-connectivity.js...$($colors.Reset)"
        
        $process = Start-Process -FilePath "node" -ArgumentList "scripts/test-connectivity.js" -WorkingDirectory $projectRoot -NoNewWindow -PassThru -Wait -RedirectStandardOutput "connectivity-test-output.txt"
        
        $output = Get-Content -Path "$projectRoot\connectivity-test-output.txt" -Raw
        Write-Host $output
        
        # Verifica se tutti i test sono stati superati
        $allPassed = $output -match "TUTTI I TEST DI CONNETTIVITÀ SONO STATI SUPERATI"
        
        Print-Result "Test di connettività" $allPassed
        
        # Rimuovi il file temporaneo
        Remove-Item -Path "$projectRoot\connectivity-test-output.txt" -Force -ErrorAction SilentlyContinue
        
        return $allPassed
    } catch {
        Print-Result "Test di connettività" $false $_.Exception.Message
        return $false
    }
}

# Esegui il test dell'API di ingestione
function Test-IngestAPI {
    Print-Title "Test dell'API di ingestione"
    
    try {
        $projectRoot = "c:\Users\danie\Desktop\BOT COPY\giudanten"
        
        Write-Host "$($colors.Yellow)Esecuzione di test-ingest-api.ts...$($colors.Reset)"
        
        $process = Start-Process -FilePath "npx" -ArgumentList "tsx scripts/test-ingest-api.ts" -WorkingDirectory $projectRoot -NoNewWindow -PassThru -Wait -RedirectStandardOutput "ingest-test-output.txt"
        
        $output = Get-Content -Path "$projectRoot\ingest-test-output.txt" -Raw
        Write-Host $output
        
        # Verifica se il test è stato superato
        $testPassed = $output -match "API di ingestione: ✅"
        
        Print-Result "Test API di ingestione" $testPassed
        
        # Rimuovi il file temporaneo
        Remove-Item -Path "$projectRoot\ingest-test-output.txt" -Force -ErrorAction SilentlyContinue
        
        return $testPassed
    } catch {
        Print-Result "Test API di ingestione" $false $_.Exception.Message
        return $false
    }
}

# Funzione principale
function Main {
    Write-Host "$($colors.Magenta)==================================================$($colors.Reset)"
    Write-Host "$($colors.Magenta)   VERIFICA E OTTIMIZZAZIONE DEL SISTEMA          $($colors.Reset)"
    Write-Host "$($colors.Magenta)==================================================$($colors.Reset)"
    
    # Verifica se PowerShell è in esecuzione come amministratore
    if (-not (Test-Admin)) {
        Write-Host "$($colors.Red)Questo script deve essere eseguito come amministratore.$($colors.Reset)"
        Write-Host "$($colors.Yellow)Riavvia PowerShell come amministratore e riprova.$($colors.Reset)"
        return
    }
    
    # Passo 1: Termina i processi esistenti
    $mongoRunning = Stop-ProjectProcesses
    
    # Passo 2: Configura le directory per MongoDB
    $directoriesSetup = Setup-MongoDBDirectories
    
    if (-not $directoriesSetup) {
        Write-Host "$($colors.Red)❌ Impossibile configurare le directory per MongoDB. Interruzione dei test.$($colors.Reset)"
        return
    }
    
    # Passo 3: Configura il file .env.local
    $envSetup = Setup-EnvFile
    
    if (-not $envSetup) {
        Write-Host "$($colors.Red)❌ Impossibile configurare il file .env.local. Interruzione dei test.$($colors.Reset)"
        return
    }
    
    # Passo 4: Avvia MongoDB se non è già in esecuzione
    if (-not $mongoRunning) {
        $mongoStarted = Start-MongoDB
        
        if (-not $mongoStarted) {
            Write-Host "$($colors.Red)❌ Impossibile avviare MongoDB. Interruzione dei test.$($colors.Reset)"
            return
        }
    }
    
    # Passo 5: Avvia il server Next.js
    $serverStarted = Start-NextServer
    
    if (-not $serverStarted) {
        Write-Host "$($colors.Red)❌ Impossibile avviare il server Next.js. Interruzione dei test.$($colors.Reset)"
        return
    }
    
    # Passo 6: Esegui i test di connettività
    $connectivityTestPassed = Test-Connectivity
    
    # Passo 7: Esegui il test dell'API di ingestione
    $ingestTestPassed = Test-IngestAPI
    
    # Riepilogo finale
    Write-Host "`n$($colors.Magenta)==================================================$($colors.Reset)"
    Write-Host "$($colors.Magenta)   RIEPILOGO DELLA VERIFICA E OTTIMIZZAZIONE      $($colors.Reset)"
    Write-Host "$($colors.Magenta)==================================================$($colors.Reset)"
    
    Print-Result "Directory MongoDB" $directoriesSetup
    Print-Result "File .env.local" $envSetup
    Print-Result "MongoDB in esecuzione" $mongoRunning -or $mongoStarted
    Print-Result "Server Next.js" $serverStarted
    Print-Result "Test di connettività" $connectivityTestPassed
    Print-Result "Test API di ingestione" $ingestTestPassed
    
    $allPassed = $directoriesSetup -and $envSetup -and ($mongoRunning -or $mongoStarted) -and $serverStarted -and $connectivityTestPassed -and $ingestTestPassed
    
    Write-Host "`n$($colors.Magenta)==================================================$($colors.Reset)"
    if ($allPassed) {
        Write-Host "$($colors.Green)✅ VERIFICA E OTTIMIZZAZIONE COMPLETATE CON SUCCESSO!$($colors.Reset)"
    } else {
        Write-Host "$($colors.Red)❌ ALCUNI PASSAGGI NON SONO STATI COMPLETATI.$($colors.Reset)"
        Write-Host "$($colors.Yellow)Controlla i dettagli sopra per risolvere i problemi.$($colors.Reset)"
    }
    Write-Host "$($colors.Magenta)==================================================$($colors.Reset)"
    
    # Apri il browser se tutto è andato bene
    if ($allPassed) {
        if (Ask-Confirmation "Vuoi aprire l'applicazione nel browser?") {
            Start-Process "http://localhost:3000"
        }
    }
}

# Esegui la funzione principale