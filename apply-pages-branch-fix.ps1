$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath ".\index.html")) {
    throw "index.html tidak ditemukan. Jalankan skrip ini dari root repositori."
}

if (-not (Test-Path -LiteralPath ".\.nojekyll")) {
    New-Item -ItemType File -Path ".\.nojekyll" -Force | Out-Null
}

$workflowDir = ".\.github\workflows"
$disabledDir = ".\.github\workflows-disabled"
New-Item -ItemType Directory -Path $disabledDir -Force | Out-Null

if (Test-Path -LiteralPath $workflowDir) {
    Get-ChildItem -LiteralPath $workflowDir -File -ErrorAction SilentlyContinue |
        Where-Object {
            $_.Extension -in ".yml", ".yaml" -and
            (Select-String -LiteralPath $_.FullName -Pattern "deploy-pages|upload-pages-artifact|github-pages" -Quiet)
        } |
        ForEach-Object {
            $target = Join-Path $disabledDir ($_.Name + ".disabled")
            Move-Item -LiteralPath $_.FullName -Destination $target -Force
            Write-Host "Dinonaktifkan: $($_.FullName)"
        }
}

if (Test-Path -LiteralPath ".\data\data.csv") {
    Write-Host "Catatan: data\data.csv tidak diperlukan oleh situs produksi."
    Write-Host "Simpan CSV di luar repo jika tidak ingin dipublikasikan."
}

Write-Host ""
Write-Host "Pemeriksaan selesai."
Write-Host "Selanjutnya buka GitHub > Settings > Pages:"
Write-Host "Source  : Deploy from a branch"
Write-Host "Branch  : main"
Write-Host "Folder  : / (root)"
Write-Host ""
git status --short
