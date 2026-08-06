# Perbaikan deployment GitHub Pages

1. Ekstrak paket ke root repositori.
2. Pastikan file berada di `.github/workflows/pages.yml`.
3. Di GitHub buka `Settings > Pages`.
4. Ubah `Source` menjadi `GitHub Actions`.
5. Jangan gunakan `Deploy from a branch` bersamaan dengan workflow ini.
6. Commit dan push sekali saja.
7. Buka tab `Actions` dan jalankan workflow `Deploy static site to GitHub Pages`.

Workflow ini tidak menjalankan npm atau Jekyll. Situs dipublikasikan sebagai HTML statis. File mentah `data/data.csv` tetap berada di repositori, tetapi tidak dimasukkan ke artefak Pages karena halaman memakai `summary.json` dan `books.min.json`.
