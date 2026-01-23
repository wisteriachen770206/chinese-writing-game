# Build script for itch.io
# Creates a ZIP file with all necessary game files

# Configuration
$buildFolder = "itchio-build"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$zipName = "chinese-character-game-itchio-$timestamp.zip"

# Clean up old build folder if exists
if (Test-Path $buildFolder) {
    Write-Host "Cleaning up old build folder..."
    Remove-Item -Path $buildFolder -Recurse -Force
}

# Create build folder
Write-Host "Creating build folder..."
New-Item -ItemType Directory -Path $buildFolder | Out-Null

# Files and folders to include
$filesToCopy = @(
    "index.html",
    "level_config.json",
    "css",
    "js",
    "data",
    "res"
)

# Copy files
Write-Host "Copying files..."
foreach ($item in $filesToCopy) {
    if (Test-Path $item) {
        Copy-Item -Path $item -Destination $buildFolder -Recurse -Force
        Write-Host "  Copied: $item"
    } else {
        Write-Host "  Warning: $item not found"
    }
}

# Create ZIP file
Write-Host "Creating ZIP file..."
if (Test-Path $zipName) {
    Remove-Item -Path $zipName -Force
}

# Compress the build folder
Compress-Archive -Path "$buildFolder\*" -DestinationPath $zipName -Force

# Get ZIP file size
$zipSize = (Get-Item $zipName).Length
$zipSizeMB = [math]::Round($zipSize / 1MB, 2)

# Count files in ZIP
$fileCount = (Get-ChildItem -Path $buildFolder -Recurse -File).Count

Write-Host ""
Write-Host "Build completed successfully!"
Write-Host "ZIP file: $zipName"
Write-Host "Size: $zipSizeMB MB"
Write-Host "Files: $fileCount"
Write-Host ""
Write-Host "Upload instructions for itch.io:"
Write-Host "1. Go to your itch.io project page"
Write-Host "2. Click 'Edit game'"
Write-Host "3. Go to 'Uploads' section"
Write-Host "4. Upload the ZIP file: $zipName"
Write-Host "5. Set it as the main file for HTML5/WebGL"
Write-Host ""

# Ask if user wants to keep the build folder
$keepFolder = Read-Host "Keep the build folder? (y/n)"
if ($keepFolder -ne "y" -and $keepFolder -ne "Y") {
    Write-Host "Removing build folder..."
    Remove-Item -Path $buildFolder -Recurse -Force
    Write-Host "Build folder removed."
} else {
    Write-Host "Build folder kept at: $buildFolder"
}
