# Build script for itch.io - FLAT STRUCTURE VERSION
# Creates a ZIP file with all files in root directory (no subdirectories)
# This may help with 403 errors on itch.io

[CmdletBinding()]
param(
    # (Deprecated) kept for backward compatibility; no staging folder is created anymore
    [switch]$KeepBuildFolder
)

$ErrorActionPreference = 'Stop'

# Configuration
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$zipName = "chinese-character-game-itchio-flat-$timestamp.zip"

# Helpers
function Add-ZipTextEntry {
    param(
        [Parameter(Mandatory=$true)]$Zip,
        [Parameter(Mandatory=$true)][string]$EntryName,
        [Parameter(Mandatory=$true)][string]$Content
    )
    $entry = $Zip.CreateEntry($EntryName, [System.IO.Compression.CompressionLevel]::Optimal)
    $stream = $entry.Open()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Content)
        $stream.Write($bytes, 0, $bytes.Length)
    } finally {
        $stream.Dispose()
    }
}

function Add-ZipFileEntry {
    param(
        [Parameter(Mandatory=$true)]$Zip,
        [Parameter(Mandatory=$true)][string]$EntryName,
        [Parameter(Mandatory=$true)][string]$SourcePath
    )
    if (-not (Test-Path $SourcePath)) { return $false }
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($Zip, $SourcePath, $EntryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    return $true
}

# NOTE:
# We do not include the local 'res' directory in the flat itch.io build,
# because background images/music/icons are now loaded from the CDN.

# Create ZIP file directly (no staging folder)
Write-Host "Creating ZIP file (no staging folder)..."
if (Test-Path $zipName) { Remove-Item -Path $zipName -Force }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

# Ensure we're in the project root (where the script is located)
$scriptPath = $MyInvocation.MyCommand.Path
$scriptDir = Split-Path -Parent $scriptPath
Push-Location $scriptDir

$zip = [System.IO.Compression.ZipFile]::Open((Join-Path $scriptDir $zipName), [System.IO.Compression.ZipArchiveMode]::Create)
$entryCount = 0
try {
    # index.html (rewrite paths for flat structure)
    Write-Host "Adding index.html..."
    $indexContent = Get-Content "index.html" -Raw -Encoding UTF8
    $indexContent = $indexContent -replace 'href="css/styles\.css"', 'href="styles.css"'
    $indexContent = $indexContent -replace 'src="js/([^"]+)"', 'src="$1"'
    $indexContent = $indexContent -replace 'src="res/([^"]+)"', 'src="$1"'
    Add-ZipTextEntry -Zip $zip -EntryName "index.html" -Content $indexContent
    $entryCount++

    # level_config.json (local)
    Write-Host "Adding level_config.json..."
    if (Add-ZipFileEntry -Zip $zip -EntryName "level_config.json" -SourcePath "level_config.json") { $entryCount++ }

    # styles.css (rewrite res urls if any)
    Write-Host "Adding styles.css..."
    $cssContent = Get-Content "css\\styles.css" -Raw -Encoding UTF8
    $cssContent = $cssContent -replace 'url\([''"]?\.\./res/([^''"]+)[''"]?\)', 'url($1)'
    Add-ZipTextEntry -Zip $zip -EntryName "styles.css" -Content $cssContent
    $entryCount++

    # JS files (rewrite flat paths)
    Write-Host "Adding JS files..."
    $jsFiles = @("game-state.js", "hp-system.js", "ui-manager.js", "auth.js", "hanzi-writer.js", "game.js")
    foreach ($file in $jsFiles) {
        $src = Join-Path "js" $file
        if (-not (Test-Path $src)) { continue }
        $jsContent = Get-Content $src -Raw -Encoding UTF8
        $jsContent = $jsContent -replace 'data/all_strokes\.json', 'all_strokes.json'
        $jsContent = $jsContent -replace 'data\\all_strokes\.json', 'all_strokes.json'
        $jsContent = $jsContent -replace 'src="res/([^"]+)"', 'src="$1"'
        $jsContent = $jsContent -replace "src='res/([^']+)'", "src='$1'"
        Add-ZipTextEntry -Zip $zip -EntryName $file -Content $jsContent
        $entryCount++
        Write-Host "  Added: $file"
    }

    # Data files (kept local)
    Write-Host "Adding data files..."
    if (Add-ZipFileEntry -Zip $zip -EntryName "all_strokes.json" -SourcePath "data\\all_strokes.json") { $entryCount++ }
    # NOTE: graphics.txt is NOT included (large file, can be downloaded when needed)
} finally {
    $zip.Dispose()
    Pop-Location
}

# Get ZIP file size
$zipPath = Join-Path $scriptDir $zipName
$zipSize = (Get-Item $zipPath).Length
$zipSizeMB = [math]::Round($zipSize / 1MB, 2)

Write-Host ""
Write-Host "Build completed successfully!"
Write-Host "ZIP file: $zipPath"
Write-Host "Size: $zipSizeMB MB"
Write-Host "Files: $entryCount"
Write-Host ""
Write-Host "NOTE: This is a FLAT structure version (all files in root)"
Write-Host "This may help resolve 403 errors on itch.io"
Write-Host ""
Write-Host "Upload instructions for itch.io:"
Write-Host "1. Go to your itch.io project page"
Write-Host "2. Click 'Edit game'"
Write-Host "3. Go to 'Uploads' section"
Write-Host "4. Upload the ZIP file: $zipPath"
Write-Host "5. Set it as the main file for HTML5/WebGL"
Write-Host ""
