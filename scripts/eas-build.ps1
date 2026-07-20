param(
  [ValidateSet("development", "preview", "production")]
  [string]$Profile = "preview",
  [ValidateSet("ios", "android", "all")]
  [string]$Platform = "all"
)

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..\apps\mobile")

Write-Host "EAS build profile=$Profile platform=$Platform"
eas build --profile $Profile --platform $Platform --non-interactive
