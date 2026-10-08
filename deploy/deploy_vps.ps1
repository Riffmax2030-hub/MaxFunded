<#
.SYNOPSIS
    MaxFunded Prop Firm - Automated Windows PowerShell VPS Deployment Tool

.DESCRIPTION
    Runs on your local Windows PC to deploy MaxFunded Prop Firm to your remote Linux VPS
    using OpenSSH and SCP (built-in on Windows 10/11).

.PARAMETER VpsHost
    The public IP address or hostname of your VPS (e.g., 142.93.120.45).

.PARAMETER VpsUser
    The SSH username on your VPS (default: root or ubuntu).

.PARAMETER Domain
    Your domain name (e.g., maxfunded.com). If empty, your VPS IP will be used.

.EXAMPLE
    .\deploy\deploy_vps.ps1 -VpsHost "142.93.120.45" -VpsUser "root" -Domain "maxfunded.com"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false, HelpMessage="Enter your VPS public IP address")]
    [string]$VpsHost = "",

    [Parameter(Mandatory=$false, HelpMessage="Enter your VPS SSH user")]
    [string]$VpsUser = "root",

    [Parameter(Mandatory=$false, HelpMessage="Enter your domain name (or leave empty for IP)")]
    [string]$Domain = ""
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ">>> MAXFUNDED PROP FIRM - VPS DEPLOYMENT AUTOMATOR <<<" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# Prompt for VPS Host if not provided
if (-not $VpsHost) {
    $VpsHost = Read-Host "Enter your VPS Public IP Address"
    if (-not $VpsHost) {
        Write-Error "VPS IP Address is required to deploy."
        exit 1
    }
}

# Prompt for Domain if not provided
if (-not $Domain) {
    $DomainInput = Read-Host "Enter your domain name (e.g. maxfunded.com) [Press Enter to use IP: $VpsHost]"
    if ($DomainInput) {
        $Domain = $DomainInput.Trim()
    } else {
        $Domain = $VpsHost
    }
}

$RemoteTargetDir = "/opt/maxfunded"
$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

Write-Host "`nTarget VPS:  $VpsUser@$VpsHost" -ForegroundColor Yellow
Write-Host "Domain/Host: $Domain" -ForegroundColor Yellow
Write-Host "Local Path:  $ProjectRoot" -ForegroundColor Yellow
Write-Host "Remote Path: $RemoteTargetDir" -ForegroundColor Yellow

# Step 1: Run VPS Bootstrap Script
Write-Host "`n[Step 1/5] Running bootstrap setup script on VPS (installing Docker, UFW, Caddy)..." -ForegroundColor Cyan
$BootstrapScript = Join-Path $PSScriptRoot "setup_vps.sh"
scp -o StrictHostKeyChecking=no "$BootstrapScript" "${VpsUser}@${VpsHost}:/tmp/setup_vps.sh"
ssh -o StrictHostKeyChecking=no "${VpsUser}@${VpsHost}" "chmod +x /tmp/setup_vps.sh && /tmp/setup_vps.sh"

# Step 2: Push codebase to VPS
Write-Host "`n[Step 2/5] Transferring project files to $RemoteTargetDir on VPS..." -ForegroundColor Cyan

# Exclude large local development folders (node_modules, .next, .venv)
$RsyncExclude = @"
node_modules
.next
.venv
.git
__pycache__
*.pyc
*.db
*.log
"@
$ExcludeFile = Join-Path $PSScriptRoot ".deploy_ignore"
Set-Content -Path $ExcludeFile -Value $RsyncExclude

# Check if rsync is available, else use scp archive
if (Get-Command rsync -ErrorAction SilentlyContinue) {
    rsync -avz --exclude-from="$ExcludeFile" "$ProjectRoot/" "${VpsUser}@${VpsHost}:${RemoteTargetDir}/"
} else {
    Write-Host "  Packing project archive for fast transfer..." -ForegroundColor Gray
    $TempArchive = Join-Path $env:TEMP "maxfunded_deploy.tar.gz"
    
    # Use tar (built into Windows 10/11)
    tar -czf "$TempArchive" --exclude="node_modules" --exclude=".next" --exclude=".venv" --exclude=".git" --exclude="*.db" -C "$ProjectRoot" .
    
    Write-Host "  Uploading archive..." -ForegroundColor Gray
    scp "$TempArchive" "${VpsUser}@${VpsHost}:/tmp/maxfunded_deploy.tar.gz"
    ssh "${VpsUser}@${VpsHost}" "mkdir -p $RemoteTargetDir && tar -xzf /tmp/maxfunded_deploy.tar.gz -C $RemoteTargetDir && rm /tmp/maxfunded_deploy.tar.gz"
    Remove-Item -Force "$TempArchive" -ErrorAction SilentlyContinue
}

# Step 3: Configure Caddy Reverse Proxy
Write-Host "`n[Step 3/5] Configuring Caddy SSL Reverse Proxy..." -ForegroundColor Cyan
$CaddyRemoteConfig = @"
$Domain {
    reverse_proxy localhost:3000

    handle /api/* {
        reverse_proxy localhost:8000
    }
    handle /docs* {
        reverse_proxy localhost:8000
    }
    handle /openapi.json {
        reverse_proxy localhost:8000
    }
    handle /health {
        reverse_proxy localhost:8000
    }

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
    }

    encode zstd gzip
}
"@

$RemoteCaddyCmd = "echo '$CaddyRemoteConfig' | sudo tee /etc/caddy/Caddyfile > /dev/null && sudo systemctl reload caddy || sudo systemctl restart caddy"
ssh "${VpsUser}@${VpsHost}" "$RemoteCaddyCmd"

# Step 4: Launch Docker Stack
Write-Host "`n[Step 4/5] Building and launching Docker containers on VPS..." -ForegroundColor Cyan
ssh "${VpsUser}@${VpsHost}" "cd $RemoteTargetDir && docker compose up -d --build"

# Step 5: Test Remote Health
Write-Host "`n[Step 5/5] Verifying remote service health..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

try {
    $TestUrl = if ($Domain -match "^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$") { "http://${Domain}:8000/health" } else { "https://${Domain}/health" }
    Write-Host "Pinging health endpoint: $TestUrl" -ForegroundColor Gray
    $HealthResponse = Invoke-RestMethod -Uri $TestUrl -TimeoutSec 10 -ErrorAction SilentlyContinue
    if ($HealthResponse.status -eq "healthy") {
        Write-Host "`nSUCCESS! Platform is live and healthy:" -ForegroundColor Green
        Write-Host "  Status:  $($HealthResponse.status)" -ForegroundColor Green
        Write-Host "  App:     $($HealthResponse.app)" -ForegroundColor Green
        Write-Host "  URL:     $TestUrl" -ForegroundColor Green
    }
} catch {
    Write-Host "Note: Domain DNS or containers may still be initializing. Check with: ssh ${VpsUser}@${VpsHost} 'docker compose -f $RemoteTargetDir/docker-compose.yml ps'" -ForegroundColor Yellow
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host ">>> DEPLOYMENT PROCESS COMPLETED <<<" -ForegroundColor Green
Write-Host "Web Portal:  http://$Domain (or https://$Domain once DNS propagates)" -ForegroundColor White
Write-Host "Admin Hub:   https://$Domain/admin" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
