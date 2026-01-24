# Build script for itch.io - FLAT STRUCTURE VERSION
# Creates a ZIP file with all files in root directory (no subdirectories)
# This may help with 403 errors on itch.io

[CmdletBinding()]
param(
    # Keep the staging folder after creating the zip
    [switch]$KeepBuildFolder
)

# Configuration
$buildFolder = "itchio-build-flat"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$zipName = "chinese-character-game-itchio-flat-$timestamp.zip"

# Clean up / create build folder
if (Test-Path $buildFolder) {
    Write-Host "Cleaning up old build folder contents..."
    Get-ChildItem -Path $buildFolder -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "Creating build folder..."
    New-Item -ItemType Directory -Path $buildFolder | Out-Null
}

# Copy index.html to root
Write-Host "Copying index.html..."
Copy-Item -Path "index.html" -Destination $buildFolder -Force

# Copy level_config.json to root
Write-Host "Copying level_config.json..."
Copy-Item -Path "level_config.json" -Destination $buildFolder -Force

# Copy CSS file to root with prefix
Write-Host "Copying CSS..."
Copy-Item -Path "css\styles.css" -Destination "$buildFolder\styles.css" -Force

# Copy JS files to root
Write-Host "Copying JS files..."
$jsFiles = @("game-state.js", "hp-system.js", "ui-manager.js", "auth.js", "hanzi-writer.js", "game.js")
foreach ($file in $jsFiles) {
    if (Test-Path "js\$file") {
        Copy-Item -Path "js\$file" -Destination "$buildFolder\$file" -Force
        Write-Host "  Copied: $file"
    }
}

# Copy data files to root
Write-Host "Copying data files..."
if (Test-Path "data\all_strokes.json") {
    Copy-Item -Path "data\all_strokes.json" -Destination "$buildFolder\all_strokes.json" -Force
}
if (Test-Path "data\graphics.txt") {
    Copy-Item -Path "data\graphics.txt" -Destination "$buildFolder\graphics.txt" -Force
}

# Copy res files to root
Write-Host "Copying resource files..."
Copy-Item -Path "res\*" -Destination $buildFolder -Force

# Update index.html to use flat structure
Write-Host "Updating paths in index.html..."
$indexPath = "$buildFolder\index.html"
$indexContent = Get-Content $indexPath -Raw -Encoding UTF8

# Replace paths
$indexContent = $indexContent -replace 'href="css/styles\.css"', 'href="styles.css"'
$indexContent = $indexContent -replace 'src="js/([^"]+)"', 'src="$1"'
$indexContent = $indexContent -replace 'src="res/([^"]+)"', 'src="$1"'

Set-Content -Path $indexPath -Value $indexContent -Encoding UTF8 -NoNewline

# Update CSS to use flat structure
Write-Host "Updating paths in styles.css..."
$cssPath = "$buildFolder\styles.css"
$cssContent = Get-Content $cssPath -Raw -Encoding UTF8

# Replace url('../res/...') with url('...')
$cssContent = $cssContent -replace 'url\([''"]?\.\./res/([^''"]+)[''"]?\)', 'url($1)'

Set-Content -Path $cssPath -Value $cssContent -Encoding UTF8 -NoNewline

# Update JS files to use flat structure for all_strokes.json and res files
Write-Host "Updating paths in JS files..."
$jsFiles = @("game-state.js", "hp-system.js", "ui-manager.js", "auth.js", "hanzi-writer.js", "game.js")
foreach ($file in $jsFiles) {
    $jsPath = "$buildFolder\$file"
    if (Test-Path $jsPath) {
        $jsContent = Get-Content $jsPath -Raw -Encoding UTF8
        # Replace data/all_strokes.json with all_strokes.json
        $jsContent = $jsContent -replace 'data/all_strokes\.json', 'all_strokes.json'
        $jsContent = $jsContent -replace 'data\\all_strokes\.json', 'all_strokes.json'
        # Replace res/ paths with flat structure
        $jsContent = $jsContent -replace 'src="res/([^"]+)"', 'src="$1"'
        $jsContent = $jsContent -replace "src='res/([^']+)'", "src='$1'"
        Set-Content -Path $jsPath -Value $jsContent -Encoding UTF8 -NoNewline
    }
}

# Create ZIP file
Write-Host "Creating ZIP file..."
if (Test-Path $zipName) {
    Remove-Item -Path $zipName -Force
}

# Compress from build folder
Push-Location $buildFolder
Compress-Archive -Path * -DestinationPath "..\$zipName" -Force
Pop-Location

# Get ZIP file size
$zipSize = (Get-Item $zipName).Length
$zipSizeMB = [math]::Round($zipSize / 1MB, 2)

# Count files in ZIP
$fileCount = (Get-ChildItem -Path $buildFolder -File).Count

Write-Host ""
Write-Host "Build completed successfully!"
Write-Host "ZIP file: $zipName"
Write-Host "Size: $zipSizeMB MB"
Write-Host "Files: $fileCount"
Write-Host ""
Write-Host "NOTE: This is a FLAT structure version (all files in root)"
Write-Host "This may help resolve 403 errors on itch.io"
Write-Host ""
Write-Host "Upload instructions for itch.io:"
Write-Host "1. Go to your itch.io project page"
Write-Host "2. Click 'Edit game'"
Write-Host "3. Go to 'Uploads' section"
Write-Host "4. Upload the ZIP file: $zipName"
Write-Host "5. Set it as the main file for HTML5/WebGL"
Write-Host ""

# Keep or remove build folder (non-interactive)
if (-not $KeepBuildFolder) {
    Write-Host "Removing build folder..."
    Remove-Item -Path $buildFolder -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Build folder removed."
} else {
    Write-Host "Build folder kept at: $buildFolder"
}
