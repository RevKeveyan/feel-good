# Applies a new Supabase project ref + keys across local env and deploy config.
# Usage (PowerShell):
#   .\scripts\apply-supabase-project.ps1 -ProjectRef "abcdefghijklmnop" -AnonKey "eyJ..." 
# Or with explicit URL:
#   .\scripts\apply-supabase-project.ps1 -ProjectRef "abcdefghijklmnop" -Url "https://abcdefghijklmnop.supabase.co" -AnonKey "eyJ..."
#
# Does NOT commit secrets. Does NOT call supabase login / db push (run deploy-backend.ps1 after).

param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectRef,

  [Parameter(Mandatory = $true)]
  [string]$AnonKey,

  [string]$Url = ""
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ProjectRef = $ProjectRef.Trim().Trim('"')
$AnonKey = $AnonKey.Trim().Trim('"')

if (-not $Url) {
  $Url = "https://$ProjectRef.supabase.co"
}
$Url = $Url.Trim().TrimEnd("/").Trim('"')

if ($ProjectRef -notmatch '^[a-z0-9]{15,}$') {
  Write-Warning "Project ref '$ProjectRef' looks unusual; continuing anyway."
}

Write-Host "==> Project ref: $ProjectRef"
Write-Host "==> URL: $Url"

# Root .env
$rootEnvPath = Join-Path $ProjectRoot ".env"
$rootEnv = @"
SUPABASE_PROJECT_ID="$ProjectRef"
SUPABASE_PUBLISHABLE_KEY="$AnonKey"
SUPABASE_URL="$Url"
VITE_SUPABASE_PROJECT_ID="$ProjectRef"
VITE_SUPABASE_PUBLISHABLE_KEY="$AnonKey"
VITE_SUPABASE_URL="$Url"
"@
[System.IO.File]::WriteAllText($rootEnvPath, $rootEnv.TrimEnd() + "`n", [System.Text.UTF8Encoding]::new($false))
Write-Host "==> Wrote $rootEnvPath"

# Mobile .env (preserve mindset CDN if present)
$mobileEnvPath = Join-Path $ProjectRoot "apps\mobile\.env"
$mindset = ""
if (Test-Path $mobileEnvPath) {
  $existing = Get-Content $mobileEnvPath
  foreach ($line in $existing) {
    if ($line -match '^EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL=(.*)$') {
      $mindset = $Matches[1]
    }
  }
}
$mobileEnv = @"
EXPO_PUBLIC_SUPABASE_URL=$Url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$AnonKey
EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL=$mindset
"@
[System.IO.File]::WriteAllText($mobileEnvPath, $mobileEnv.TrimEnd() + "`n", [System.Text.UTF8Encoding]::new($false))
Write-Host "==> Wrote $mobileEnvPath"

# config.toml project_id
$configPath = Join-Path $ProjectRoot "supabase\config.toml"
$config = Get-Content $configPath -Raw
$config = $config -replace 'project_id\s*=\s*"[^"]+"', "project_id = `"$ProjectRef`""
[System.IO.File]::WriteAllText($configPath, $config, [System.Text.UTF8Encoding]::new($false))
Write-Host "==> Updated supabase/config.toml"

# deploy-backend.ps1 default ref
$deployPath = Join-Path $ProjectRoot "scripts\deploy-backend.ps1"
$deploy = Get-Content $deployPath -Raw
$deploy = $deploy -replace '\$ProjectRef\s*=\s*"[^"]+"', "`$ProjectRef = `"$ProjectRef`""
[System.IO.File]::WriteAllText($deployPath, $deploy, [System.Text.UTF8Encoding]::new($false))
Write-Host "==> Updated scripts/deploy-backend.ps1"

# Docs: replace known old refs (ids/URLs only — keep historical names like tblafyz… in "former project" prose if needed)
$oldRefs = @("tblafyztaidgwbrabajw")
$docFiles = @(
  "docs\mobile\BACKEND_DEPLOY.md",
  "docs\mobile\AUTH_SETUP.md",
  "docs\mobile\AUTH_NOTIFY_GUIDE.md",
  "docs\mobile\EAS_BUILD.md",
  "docs\mobile\email-templates\README.md",
  "docs\mobile\NEW_SUPABASE_SETUP.md",
  "docs\mobile\PREPUBLISH_STATUS.md"
)
foreach ($rel in $docFiles) {
  $path = Join-Path $ProjectRoot $rel
  if (-not (Test-Path $path)) { continue }
  $text = [System.IO.File]::ReadAllText($path)
  foreach ($old in $oldRefs) {
    $text = $text.Replace($old, $ProjectRef)
    $text = $text.Replace("https://$old.supabase.co", $Url)
  }
  [System.IO.File]::WriteAllText($path, $text, [System.Text.UTF8Encoding]::new($false))
  Write-Host "==> Updated $rel"
}

Write-Host ""
Write-Host "Done. Next:"
Write-Host "  1. npx supabase login"
Write-Host "  2. .\scripts\deploy-backend.ps1"
Write-Host "  3. Follow docs/mobile/NEW_SUPABASE_SETUP.md (Google + emails + QA)"
Write-Host "  4. cd apps/mobile; npx expo start -c"
