# Script to remove build folders from git tracking
# This script will:
# 1. Remove the git lock file if it exists
# 2. Remove build folders from git tracking
# 3. Show the updated git status

Write-Host "=== Cleaning up build folders from git ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Try to remove git lock file
$lockFile = ".git\index.lock"
if (Test-Path $lockFile) {
    Write-Host "Found git lock file. Attempting to remove..." -ForegroundColor Yellow
    $maxAttempts = 5
    $attempt = 0
    $removed = $false
    
    while ($attempt -lt $maxAttempts -and -not $removed) {
        Start-Sleep -Seconds 2
        try {
            Remove-Item $lockFile -Force -ErrorAction Stop
            Write-Host "Lock file removed successfully!" -ForegroundColor Green
            $removed = $true
        } catch {
            $attempt++
            if ($attempt -lt $maxAttempts) {
                Write-Host "  Attempt $attempt failed, retrying..." -ForegroundColor Yellow
            } else {
                Write-Host "Could not remove lock file after $maxAttempts attempts" -ForegroundColor Red
                Write-Host "  Continuing anyway - you may need to manually delete: $lockFile" -ForegroundColor Yellow
                Write-Host "  Or close Cursor and run this script again" -ForegroundColor Yellow
                # Continue anyway - don't exit
            }
        }
    }
} else {
    Write-Host "No lock file found" -ForegroundColor Green
}

Write-Host ""

# Step 2: Remove build folders from git tracking
Write-Host "Removing build folders from git tracking..." -ForegroundColor Cyan

$buildFolders = @("crazygames-build", "itchio-build", "itchio-build-flat")

foreach ($folder in $buildFolders) {
    if (Test-Path $folder) {
        Write-Host "  Checking $folder..." -ForegroundColor Gray
        $gitFiles = git ls-files "$folder/" 2>$null
        if ($gitFiles) {
            Write-Host "  Removing $folder from git tracking..." -ForegroundColor Yellow
            git rm -r --cached "$folder/" 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  $folder removed from git tracking" -ForegroundColor Green
            } else {
                Write-Host "  Failed to remove $folder (may not be tracked)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  $folder is not tracked by git" -ForegroundColor Green
        }
    } else {
        Write-Host "  $folder does not exist" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host ""

# Show git status for build-related files
Write-Host "Git status for build-related files:" -ForegroundColor Cyan
$status = git status --short 2>$null
if ($status) {
    $status | Select-String -Pattern "build" | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Note: The folders are still on your disk, but git will no longer track them." -ForegroundColor Yellow
Write-Host "New build folders will be automatically ignored thanks to '*build*/' in .gitignore" -ForegroundColor Yellow
