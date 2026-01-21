# ============================================
# CrazyGames Build Script
# ============================================
# This script creates a clean ZIP file ready for CrazyGames upload

Write-Host "CrazyGames Build Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$buildFolder = "crazygames-build"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$zipNameWithTimestamp = "chinese-character-game-$timestamp.zip"

# Clean up old build folder if exists
if (Test-Path $buildFolder) {
    Write-Host "Cleaning old build folder..." -ForegroundColor Yellow
    Remove-Item $buildFolder -Recurse -Force
}

# Create build folder structure
Write-Host "Creating build folder structure..." -ForegroundColor Green
New-Item -ItemType Directory -Path $buildFolder | Out-Null
New-Item -ItemType Directory -Path "$buildFolder\css" | Out-Null
New-Item -ItemType Directory -Path "$buildFolder\js" | Out-Null
New-Item -ItemType Directory -Path "$buildFolder\data" | Out-Null
New-Item -ItemType Directory -Path "$buildFolder\res" | Out-Null

# Copy files
Write-Host "Copying files..." -ForegroundColor Green

# Root files
Copy-Item "index.html" -Destination $buildFolder
Copy-Item "level_config.json" -Destination $buildFolder

# CSS
Copy-Item "css\styles.css" -Destination "$buildFolder\css\"

# JavaScript
$jsFiles = @(
    "auth.js",
    "game.js",
    "game-state.js",
    "hanzi-writer.js",
    "hp-system.js",
    "ui-manager.js",
    "crazygames-integration.js"
)

foreach ($file in $jsFiles) {
    Copy-Item "js\$file" -Destination "$buildFolder\js\"
    Write-Host "  OK js\$file" -ForegroundColor Gray
}

# Data
Copy-Item "data\all_strokes.json" -Destination "$buildFolder\data\"
Copy-Item "data\graphics.txt" -Destination "$buildFolder\data\"

# Resources
$resFiles = @(
    "guanyin.jpg",
    "heart-sutra-wiki.mp3",
    "XJ0106.mp3"
)

foreach ($file in $resFiles) {
    if (Test-Path "res\$file") {
        Copy-Item "res\$file" -Destination "$buildFolder\res\"
        Write-Host "  OK res\$file" -ForegroundColor Gray
    } else {
        Write-Host "  WARNING res\$file not found (skipped)" -ForegroundColor Yellow
    }
}

# Calculate build folder size
$buildSize = (Get-ChildItem -Path $buildFolder -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
$buildSizeFormatted = "{0:N2} MB" -f $buildSize

# Count files
$fileCount = (Get-ChildItem -Path $buildFolder -Recurse -File | Measure-Object).Count

Write-Host ""
Write-Host "BUILD COMPLETE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Build folder: $buildFolder\" -ForegroundColor White
Write-Host "Total files: $fileCount" -ForegroundColor White
Write-Host "Total size: $buildSizeFormatted" -ForegroundColor White
Write-Host "Location: $PSScriptRoot\$buildFolder\" -ForegroundColor White
Write-Host ""
Write-Host "Ready to upload to CrazyGames!" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Go to CrazyGames Developer Portal" -ForegroundColor White
Write-Host "2. Upload the '$buildFolder' folder" -ForegroundColor White
Write-Host "3. Make sure 'index.html' is at the root" -ForegroundColor White

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
