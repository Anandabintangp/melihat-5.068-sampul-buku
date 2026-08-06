# Scrollytelling Update

Perubahan utama pada `index.html`:

1. Menambahkan kartu statistik kontekstual pada panel visual sticky.
2. Angka muncul ketika langkah narasi terkait melewati garis aktivasi viewport.
3. Angka menggunakan animasi count-up dan bar proporsi.
4. Kartu memudar ketika narasi berikutnya aktif dan tidak memiliki statistik terkait.
5. Menambahkan tampilan kartu inline responsif untuk layar tablet dan seluler.
6. Memperbaiki nilai `rootMargin` IntersectionObserver yang sebelumnya tidak valid.
7. Mengubah logika aktivasi langkah berdasarkan posisi awal narasi agar transisi terasa lebih langsung.

Contoh yang telah diterapkan:

- Komedi: Oranye 27,5% dan Putih 24,5%.
- Horor dan Thriller/Misteri: perbandingan hitam dan putih.
- Distribusi warna putih pada fiksi populer.
- Overlap genre.
- Distribusi typeface.
- Distribusi gaya ilustrasi.
