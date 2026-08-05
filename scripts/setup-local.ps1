param(
  [string]$Source = "C:\Users\asus\Documents\File Bintang\Riset\0. ESAI DKJ\0. Data Fix\Sampul"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Assets = Join-Path $ProjectRoot "assets"
$Target = Join-Path $Assets "covers"

if (-not (Test-Path $Source)) {
  throw "Folder sampul tidak ditemukan: $Source"
}

if (-not (Test-Path $Assets)) {
  New-Item -ItemType Directory -Path $Assets | Out-Null
}

if (Test-Path $Target) {
  Write-Host "assets\covers sudah tersedia. Tidak ada perubahan."
  exit 0
}

cmd /c mklink /J "$Target" "$Source"
if ($LASTEXITCODE -ne 0) {
  throw "Gagal membuat junction. Jalankan PowerShell dari folder proyek dan pastikan drive menggunakan NTFS."
}

Write-Host "Junction berhasil dibuat:"
Write-Host "$Target -> $Source"
