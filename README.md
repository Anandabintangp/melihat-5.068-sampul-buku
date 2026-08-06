# Melihat 5.068 Sampul Buku — V3

Paket deploy GitHub Pages untuk `https://anandabintangp.github.io/melihat-5.068-sampul-buku/`.

## Halaman
- `index.html`: scrollytelling utama.
- `tengara-preview.html`: simulasi tata letak artikel Tengara dengan iframe inline.
- `embeds/eksplorasi-analisis.html`: dashboard eksplorasi penuh dan mode embed.
- `kode-iframe-tengara.txt`: kode iframe publik Gambar 1–9.

## Uji lokal
```powershell
py -m http.server 8000
```
Buka `http://localhost:8000/`, `http://localhost:8000/tengara-preview.html`, dan `http://localhost:8000/embeds/eksplorasi-analisis.html?embed=1`.

## Deploy
Commit perubahan di GitHub Desktop, lalu **Push origin**.
