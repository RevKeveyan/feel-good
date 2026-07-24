# Deploy Supabase migration + Edge Functions for Feel Good Challenge
# Prerequisites: npx supabase login  (or $env:SUPABASE_ACCESS_TOKEN)
# Project ref: $env:SUPABASE_PROJECT_ID, else value below (updated by apply-supabase-project.ps1)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ProjectRef = "bruvmdcstlkszvjruska"

if ($env:SUPABASE_PROJECT_ID) {
  $ProjectRef = $env:SUPABASE_PROJECT_ID.Trim().Trim('"')
} elseif (Test-Path (Join-Path $ProjectRoot ".env")) {
  Get-Content (Join-Path $ProjectRoot ".env") | ForEach-Object {
    if ($_ -match '^\s*SUPABASE_PROJECT_ID\s*=\s*"?([^"=]+)"?\s*$') {
      $ProjectRef = $Matches[1].Trim()
    }
  }
}

Set-Location $ProjectRoot

Write-Host "==> Linking project $ProjectRef"
npx supabase link --project-ref $ProjectRef

Write-Host "==> Pushing database migrations"
npx supabase db push

Write-Host "==> Deploying Edge Functions"
npx supabase functions deploy submit-testimonial --project-ref $ProjectRef
npx supabase functions deploy register-device --project-ref $ProjectRef
npx supabase functions deploy delete-account --project-ref $ProjectRef

Write-Host "==> Done"
Write-Host "Next: Google OAuth + Redirect URLs + email templates - docs/mobile/NEW_SUPABASE_SETUP.md"
