$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

$Python = Get-Command python -ErrorAction SilentlyContinue
if (-not $Python) {
  $Python = Get-Command py -ErrorAction SilentlyContinue
}
if (-not $Python) {
  throw "Python tidak ditemukan. Instal Python 3 atau gunakan ekstensi Live Server di VS Code."
}

Write-Host "Buka http://localhost:8000"
if ($Python.Name -eq "py.exe") {
  py -m http.server 8000
} else {
  python -m http.server 8000
}
