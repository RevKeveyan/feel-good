# Deploy Supabase migration + Edge Functions for Feel Good Challenge
# Prerequisites: npx supabase login  (or $env:SUPABASE_ACCESS_TOKEN)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ProjectRef = "tblafyztaidgwbrabajw"

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
Write-Host "Next: configure Google + Apple OAuth redirects in Dashboard (see docs/mobile/BACKEND_DEPLOY.md)"
