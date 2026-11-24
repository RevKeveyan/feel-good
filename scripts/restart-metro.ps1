$ErrorActionPreference = "SilentlyContinue"
$pids = Get-NetTCPConnection -LocalPort 8081 | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $pids) {
  if ($procId -and $procId -ne 0) {
    Stop-Process -Id $procId -Force
  }
}
Start-Sleep -Seconds 2
$ErrorActionPreference = "Stop"
adb reverse tcp:8081 tcp:8081
Set-Location "d:\feel good\apps\mobile"
npx expo start --clear --port 8081
