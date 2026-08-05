# Kartografi Sampul Sastra Indonesia, Scrollytelling

Paket statis ini disiapkan untuk tiga kebutuhan:

1. Menjalankan scrollytelling secara lokal.
2. Menerbitkannya pada GitHub Pages di dalam repositori `portfolio`.
3. Menyediakan visual HTML mandiri yang dapat ditanam melalui iframe di Tengara.id.

## Struktur utama

```text
kartografi-scrollytelling/
├── index.html
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── app.js
│       ├── charts.js
│       ├── config.js
│       └── embed.js
├── data/
│   ├── data.csv
│   ├── summary.json
│   └── books.min.json
├── embeds/
│   ├── genre.html
│   ├── warna.html
│   ├── tipografi.html
│   └── ilustrasi.html
└── scripts/
    ├── build_data.py
    ├── build-data.ps1
    ├── setup-local.ps1
    └── serve-local.ps1
```

## Menjalankan secara lokal di Windows

Buka PowerShell pada folder proyek, lalu jalankan:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\setup-local.ps1
.\scripts\serve-local.ps1
```

Skrip `setup-local.ps1` membuat junction dari:

```text
C:\Users\asus\Documents\File Bintang\Riset\0. ESAI DKJ\0. Data Fix\Sampul
```

ke:

```text
assets\covers
```

Junction membuat gambar dapat dibaca sebagai aset relatif tanpa menyalin 5.068 berkas. Jika junction tidak dibuat, halaman akan mencoba memuat gambar dari repositori Kartografi Sampul Sastra Indonesia sebagai cadangan.

Buka:

```text
http://localhost:8000
```

Jangan membuka `index.html` langsung melalui `file://`, karena browser akan memblokir pembacaan JSON.

## Memperbarui data

Setelah `data/data.csv` diganti, jalankan:

```powershell
.\scripts\build-data.ps1
```

Visual tidak menyimpan angka analisis secara manual. Skrip akan membentuk ulang:

```text
data/summary.json
data/books.min.json
```

Normalisasi yang digunakan:

* `Roman` ditampilkan sebagai `Romansa`.
* `Fiksi Ilmiah` ditampilkan sebagai `Fiksi Sains`.
* `Thriller/Misteri` merupakan gabungan buku yang memiliki label `Thriller` atau `Misteri`.
* Koefisien overlap dihitung sebagai irisan dibagi jumlah buku pada genre yang lebih kecil.
* Distribusi warna dihitung dari rata-rata proporsi lima klaster warna pada setiap sampul.

## Deploy ke repositori portfolio

Salin seluruh folder ini ke repositori portfolio dengan nama:

```text
portfolio/kartografi-sampul/
```

Setelah di-push ke branch yang digunakan GitHub Pages, alamatnya menjadi:

```text
https://anandabintangp.github.io/portfolio/kartografi-sampul/
```

Contoh item portfolio tersedia di:

```text
_portfolio/kartografi-sampul.md
```

Salin berkas tersebut ke folder `_portfolio` pada repositori utama.

## Embed untuk Tengara.id

Gunakan iframe dengan salah satu alamat berikut setelah deploy:

```html
<iframe
  src="https://anandabintangp.github.io/portfolio/kartografi-sampul/embeds/warna.html"
  width="100%"
  height="720"
  style="border:0"
  loading="lazy"
  title="Peta panas distribusi warna sampul buku">
</iframe>
```

Ganti `warna.html` dengan:

```text
genre.html
tipografi.html
ilustrasi.html
```

## Pertimbangan desain

Tampilan menggunakan pendekatan editorial dengan latar kertas, garis tipis, tipografi konvensional, dan sampul buku asli. Efek dekoratif, kartu membulat, gradien berlebihan, ikon generik, dan kutipan rekaan sengaja tidak digunakan. Interaksi dipusatkan pada perubahan visual yang mengikuti narasi, pemilihan kategori, tooltip, dan penyorotan baris data.
