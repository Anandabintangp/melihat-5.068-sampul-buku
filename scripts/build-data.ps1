$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

$Python = Get-Command python -ErrorAction SilentlyContinue
if (-not $Python) {
  $Python = Get-Command py -ErrorAction SilentlyContinue
}
if (-not $Python) {
  throw "Python tidak ditemukan. Instal Python 3 terlebih dahulu."
}

if ($Python.Name -eq "py.exe") {
  py -m pip install -r requirements.txt
  py scripts/build_data.py --input data/data.csv --output data
} else {
  python -m pip install -r requirements.txt
  python scripts/build_data.py --input data/data.csv --output data
}

Write-Host "summary.json dan books.min.json telah diperbarui dari data.csv."
