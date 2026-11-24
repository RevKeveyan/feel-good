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
Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "expo","start","--clear","--port","8081"
Start-Sleep -Seconds 8
adb shell am force-stop host.exp.exponent
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081"
Write-Host "APP_REOPENED"
