$ErrorActionPreference = "SilentlyContinue"
foreach ($port in 5173, 5174) {
  $pids = Get-NetTCPConnection -LocalPort $port | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($procId in $pids) {
    if ($procId -and $procId -ne 0) {
      Stop-Process -Id $procId -Force
    }
  }
}
Start-Sleep -Seconds 2
$ErrorActionPreference = "Stop"
Set-Location "d:\feel good\web codebase"
npm run dev -- --host 127.0.0.1 --port 5173
