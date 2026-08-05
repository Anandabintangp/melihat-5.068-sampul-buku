# Catatan Audit Data

Halaman scrollytelling membaca ringkasan yang dibentuk ulang dari `data/data.csv`. Beberapa koreksi utama terhadap angka pada HTML awal adalah sebagai berikut.

## Korpus dan genre

* Jumlah sampul: 5.068.
* Jumlah label genre mentah: 132, bukan 111.
* Jumlah buku berlabel Cerita Pendek: 257.
* Label `Roman` dalam CSV ditampilkan sebagai `Romansa`, dengan 1.434 buku.
* Label `Fiksi Ilmiah` ditampilkan sebagai `Fiksi Sains`, dengan 48 buku.
* `Thriller/Misteri` menggabungkan buku berlabel Thriller atau Misteri, dengan 170 buku.

## Overlap genre

Koefisien overlap menggunakan rumus:

```text
jumlah irisan / jumlah buku pada genre yang lebih kecil × 100
```

Nilai yang digunakan dalam visual:

| Pasangan | Irisan | Koefisien overlap |
|---|---:|---:|
| Chick Lit dan Romansa | 167 | 93,8% |
| Persahabatan dan Romansa | 115 | 89,1% |
| Drama dan Novel | 158 | 81,0% |
| Remaja dan Romansa | 419 | 80,1% |
| Dewasa dan Romansa | 102 | 76,1% |
| Keluarga dan Romansa | 122 | 73,1% |
| Drama dan Romansa | 140 | 71,8% |
| Fiksi Sains dan Fantasi | 33 | 68,8% |
| Fantasi dan Petualangan | 48 | 55,8% |
| Horor dan Thriller/Misteri | 44 | 47,3% |
| Puisi dan Romansa | 26 | 3,9% |

## Warna

Distribusi global dihitung dari rata-rata proporsi lima warna utama setiap sampul:

| Warna | Proporsi |
|---|---:|
| Putih | 30,7% |
| Oranye | 14,4% |
| Biru | 13,0% |
| Hitam | 8,7% |
| Merah | 5,8% |

Koreksi penting pada Fiksi Sejarah adalah biru 9,4%, bukan 20%. Komposisi utamanya adalah putih 25,5%, oranye 19,8%, hitam 9,0%, cokelat 8,4%, dan merah 8,3%.

## Tipografi

Jumlah akhir berdasarkan `typeface_paper`:

| Kategori | Jumlah | Proporsi |
|---|---:|---:|
| Serif | 2.343 | 46,2% |
| Script | 1.402 | 27,7% |
| Sans-serif | 702 | 13,9% |
| Fancy | 621 | 12,3% |

Sebanyak 66,4% baris memiliki penanda kepercayaan rendah. Oleh karena itu, visual tipografi ditafsirkan sebagai pola agregat, bukan identifikasi font yang pasti pada setiap sampul.

## Gaya ilustrasi

Distribusi global berdasarkan `corak_ilustrasi`:

| Gaya | Jumlah | Proporsi |
|---|---:|---:|
| Kartunal | 1.381 | 27,2% |
| Minimalis | 1.314 | 25,9% |
| Ekspresionisme | 938 | 18,5% |
| Fotografi/Kolase Digital | 425 | 8,4% |
| Abstrak | 297 | 5,9% |
| Dekoratif | 241 | 4,8% |
| Realisme | 200 | 3,9% |
| Surealis/Absurd | 140 | 2,8% |
| Pop Art | 112 | 2,2% |
| Kubisme | 20 | 0,4% |

Visual dalam halaman dan halaman embed menggunakan nilai yang dibentuk langsung oleh `scripts/build_data.py`.
