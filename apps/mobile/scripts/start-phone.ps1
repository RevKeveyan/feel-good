$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MobileRoot = Split-Path -Parent $ScriptDir

& "$ScriptDir\kill-metro-ports.ps1"

function Test-ExcludedAdapterName([string]$name) {
  $n = $name.ToLowerInvariant()
  $blocked = @(
    "vethernet",
    "wsl",
    "hyper-v",
    "loopback",
    "virtualbox",
    "vmware",
    "docker",
    "bluetooth",
    "vpn",
    "tap-windows",
    "nordlynx",
    "wireguard",
    "tunnel"
  )
  foreach ($b in $blocked) {
    if ($n -like "*$b*") { return $true }
  }
  return $false
}

function Get-LanIPv4 {
  $candidates = @()
  try {
    $adapters = Get-NetAdapter -ErrorAction SilentlyContinue |
      Where-Object { $_.Status -eq "Up" -and -not (Test-ExcludedAdapterName $_.Name) -and -not (Test-ExcludedAdapterName $_.InterfaceDescription) }
    foreach ($adapter in $adapters) {
      $addrs = Get-NetIPAddress -InterfaceIndex $adapter.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object {
          $_.IPAddress -notlike "169.254.*" -and
          $_.IPAddress -ne "127.0.0.1" -and
          $_.PrefixOrigin -ne "WellKnown"
        }
      foreach ($a in $addrs) {
        $prio = 100
        $desc = ($adapter.InterfaceDescription + " " + $adapter.Name).ToLowerInvariant()
        if ($desc -match "wi-?fi|wireless|wlan") { $prio = 1 }
        elseif ($desc -match "ethernet") { $prio = 2 }
        $candidates += [pscustomobject]@{
          IP = $a.IPAddress
          Priority = $prio
          Name = $adapter.Name
        }
      }
    }
  } catch {
    Write-Host "Get-NetAdapter failed, falling back to ipconfig"
  }

  if ($candidates.Count -eq 0) {
    $ipconfig = ipconfig
    $currentName = ""
    foreach ($line in $ipconfig) {
      if ($line -match "^\s*(.+):\s*$") {
        $currentName = $Matches[1].Trim()
      }
      if ($line -match "IPv4 Address[.\s]*:\s*([0-9.]+)") {
        $ip = $Matches[1]
        if ($ip -like "169.254.*" -or $ip -eq "127.0.0.1") { continue }
        if (Test-ExcludedAdapterName $currentName) { continue }
        $prio = 100
        $n = $currentName.ToLowerInvariant()
        if ($n -match "wi-?fi|wireless|wlan") { $prio = 1 }
        elseif ($n -match "ethernet") { $prio = 2 }
        $candidates += [pscustomobject]@{ IP = $ip; Priority = $prio; Name = $currentName }
      }
    }
  }

  $best = $candidates | Sort-Object Priority, Name | Select-Object -First 1
  if ($best) { return $best.IP }
  return $null
}

$lanIp = Get-LanIPv4
if (-not $lanIp) {
  Write-Host "Could not detect LAN IPv4. Connect to Wi-Fi/Ethernet and retry."
  exit 1
}

$env:REACT_NATIVE_PACKAGER_HOSTNAME = $lanIp
Write-Host "Using packager host: $lanIp"

$ruleName = "Expo Metro 8081"
try {
  $existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
  if (-not $existing) {
    New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow -Profile Any -ErrorAction Stop | Out-Null
    Write-Host "Firewall rule created: $ruleName (TCP 8081)"
  } else {
    Write-Host "Firewall rule already exists: $ruleName"
  }
} catch {
  Write-Host "Could not create firewall rule (run PowerShell as Administrator if iPhone cannot connect):"
  Write-Host "  New-NetFirewallRule -DisplayName '$ruleName' -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow -Profile Any"
}

Write-Host "Start Expo LAN. On iPhone: same Wi-Fi, Camera/Expo Go -> scan QR."
Write-Host "Safari check: http://${lanIp}:8081"
Set-Location $MobileRoot
npx expo start --lan -c
