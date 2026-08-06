# Reset GitHub Pages ke Deploy from a branch

Log menunjukkan artefak sudah berhasil dibuat dan deployment sudah tercipta,
tetapi layanan Pages tetap berada pada status `deployment_in_progress` hingga
`actions/deploy-pages` menghentikannya. Karena situs ini berupa HTML statis,
gunakan publikasi langsung dari branch.

## Langkah di GitHub

1. Buka `Settings > Pages`.
2. Jika tersedia, pilih `Unpublish site`.
3. Pada `Source`, pilih `Deploy from a branch`.
4. Pilih branch `main`.
5. Pilih folder `/(root)`.
6. Klik `Save`.
7. Jangan menjalankan workflow custom `Deploy static site to GitHub Pages`.

## Langkah di folder lokal

Jalankan PowerShell berikut dari root repositori:

```powershell
.\apply-pages-branch-fix.ps1
```

Setelah itu lakukan satu kali:

```text
Commit to main
Push origin
```

Pastikan `index.html` dan `.nojekyll` berada langsung di root repositori.
