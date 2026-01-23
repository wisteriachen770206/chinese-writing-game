# Script to remove all console.log/warn/debug/info from JS files
# Keeps console.error for critical errors

$jsFiles = @(
    "js\game.js",
    "js\auth.js",
    "js\hp-system.js",
    "js\crazygames-integration.js",
    "js\game-state.js",
    "js\ui-manager.js",
    "js\hanzi-writer.js"
)

Write-Host "Cleaning console logs from JS files..." -ForegroundColor Cyan

foreach ($file in $jsFiles) {
    if (Test-Path $file) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        
        # Remove lines with console.log, console.warn, console.debug, console.info
        # But keep console.error
        $lines = $content -split "`n"
        $cleanedLines = @()
        
        foreach ($line in $lines) {
            # Skip lines that are ONLY console.log/warn/debug/info (with optional whitespace)
            if ($line -match '^\s*console\.(log|warn|debug|info)\s*\(') {
                # Skip this line
                continue
            }
            # Keep console.error lines
            $cleanedLines += $line
        }
        
        $cleanedContent = $cleanedLines -join "`n"
        
        # Write back
        Set-Content -Path $file -Value $cleanedContent -NoNewline
        
        Write-Host "  ✓ Cleaned: $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nDone! All console.log/warn/debug/info removed." -ForegroundColor Green
Write-Host "console.error lines were kept for error handling." -ForegroundColor Gray
