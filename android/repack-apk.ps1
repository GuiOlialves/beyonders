# Script para atualizar os arquivos web (assets/www/) dentro dos APKs originais
# Uso: .\android\repack-apk.ps1

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = Split-Path -Parent $PSScriptRoot

function Update-ApkAssets {
    param(
        [string]$BaseApk,
        [string]$WebDir,
        [string]$OutUnsignedApk
    )

    if (Test-Path $OutUnsignedApk) { Remove-Item $OutUnsignedApk -Force }
    Copy-Item $BaseApk $OutUnsignedApk -Force

    $zip = [System.IO.Compression.ZipFile]::Open($OutUnsignedApk, [System.IO.Compression.ZipArchiveMode]::Update)
    try {
        # Remove entradas antigas de assets/www/ e META-INF/ (assinatura anterior)
        $toRemove = $zip.Entries | Where-Object {
            $_.FullName.StartsWith("assets/www/") -or $_.FullName.StartsWith("META-INF/")
        } | ForEach-Object { $_ }
        foreach ($entry in $toRemove) {
            $entry.Delete()
        }

        # Adiciona todos os arquivos atuais da pasta web em assets/www/
        $files = Get-ChildItem -Path $WebDir -Recurse -File
        foreach ($file in $files) {
            $relPath = $file.FullName.Substring($WebDir.Length).TrimStart('\', '/') -replace '\\', '/'
            $entryName = "assets/www/$relPath"
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $zip,
                $file.FullName,
                $entryName,
                [System.IO.Compression.CompressionLevel]::Optimal
            ) | Out-Null
        }
    }
    finally {
        $zip.Dispose()
    }
    Write-Host "APK atualizado gerado em: $OutUnsignedApk"
    Write-Host "Nota: Assine com 'apksigner sign --ks sua-chave.jks $OutUnsignedApk' antes de instalar no Android."
}

Update-ApkAssets `
    -BaseApk "$root\android\apks\beyonders.apk" `
    -WebDir "$root\app-jogadores" `
    -OutUnsignedApk "$root\android\apks\beyonders-unsigned.apk"

Update-ApkAssets `
    -BaseApk "$root\android\apks\arquivo-beyonder-mestre.apk" `
    -WebDir "$root\app-mestre" `
    -OutUnsignedApk "$root\android\apks\arquivo-beyonder-mestre-unsigned.apk"
