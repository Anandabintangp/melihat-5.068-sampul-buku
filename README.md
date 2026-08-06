# Melihat 5.068 Sampul Buku V5

Dashboard penuh tetap menggunakan alur vertikal. Mode `?embed=1` menggunakan sistem tab yang mengganti panel tanpa menggulir antarbab.

## Uji lokal

Jalankan dari folder utama:

```powershell
py -m http.server 8000
```

Buka:

```text
http://localhost:8000/embeds/eksplorasi-analisis.html?embed=1
```

Jangan membuka HTML melalui `file:///`, karena browser akan memblokir pembacaan JSON lokal.
