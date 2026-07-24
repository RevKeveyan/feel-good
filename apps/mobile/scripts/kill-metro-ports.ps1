$ports = @(8081, 8082)
foreach ($port in $ports) {
  $pids = @()
  try {
    $pids = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
      Select-Object -ExpandProperty OwningProcess -Unique
  } catch {
    $lines = netstat -ano | Select-String ":$port\s"
    foreach ($line in $lines) {
      $parts = ($line.ToString() -split "\s+") | Where-Object { $_ -ne "" }
      if ($parts.Length -ge 5) {
        $pids += [int]$parts[-1]
      }
    }
    $pids = $pids | Select-Object -Unique
  }
  foreach ($procId in $pids) {
    if ($procId -and $procId -ne 0) {
      try {
        Stop-Process -Id $procId -Force -ErrorAction Stop
        Write-Host "Killed PID $procId on port $port"
      } catch {
        Write-Host "Could not kill PID $procId on port $port"
      }
    }
  }
}
