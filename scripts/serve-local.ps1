$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $ProjectRoot

$Url = "http://localhost:8000/"
$Python = Get-Command py -ErrorAction SilentlyContinue
if (-not $Python) { $Python = Get-Command python -ErrorAction SilentlyContinue }
if (-not $Python) { throw "Python tidak ditemukan. Instal Python 3 atau gunakan Live Server di VS Code." }

Write-Host "Folder server: $ProjectRoot"
Write-Host "Membuka $Url"
Start-Job -ScriptBlock { Start-Sleep -Seconds 1; Start-Process $using:Url } | Out-Null

if ($Python.Name -eq "py.exe") { py -m http.server 8000 }
else { python -m http.server 8000 }
