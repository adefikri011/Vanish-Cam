# Vanishing Cam

Vanishing Cam adalah proyek eksperimental ekstensi Google Chrome untuk mengembangkan efek menghilangkan tubuh dari video Google Meet sambil mempertahankan latar belakang ruangan.

## Tujuan

- Memisahkan tubuh pengguna dari latar belakang video.
- Menampilkan latar belakang ruangan tanpa tubuh pengguna.
- Menyediakan kontrol untuk menghilangkan dan memunculkan kembali tubuh.
- Mengembangkan transisi visual yang halus.
- Mengeksplorasi deteksi jentikan jari sebagai pemicu efek.
- Menguji integrasi video dengan Google Meet.

## Teknologi

- Chrome Extension Manifest V3
- JavaScript
- HTML dan CSS
- OpenCV atau teknologi pemrosesan video lain jika diperlukan
- MediaPipe untuk eksperimen segmentasi manusia
- Canvas API untuk komposisi gambar

## Status Pengembangan

**Versi:** 0.1.0

Status saat ini:
- [x] Kerangka dasar ekstensi
- [x] Popup kontrol
- [x] Penyimpanan status kontrol
- [ ] Segmentasi manusia
- [ ] Rekonstruksi latar belakang
- [ ] Integrasi video hasil pemrosesan dengan Google Meet
- [ ] Animasi menghilang dan muncul
- [ ] Deteksi jentikan jari

## Struktur Proyek

- `src/popup/`: antarmuka kontrol ekstensi
- `src/content/`: integrasi halaman Google Meet
- `src/processor/`: pemrosesan video
- `src/camera/`: pengelolaan sumber video
- `src/audio/`: deteksi jentikan jari
- `src/shared/`: utilitas bersama
- `assets/`: ikon dan gambar latar
- `tests/`: pengujian
- `docs/`: dokumentasi teknis

## Batasan

Ekstensi belum menghasilkan video menghilang yang dapat dilihat peserta lain. Integrasi sumber video hasil pemrosesan dengan Google Meet masih harus diuji.

## Privasi

Target pengembangan adalah pemrosesan video secara lokal. Akses kamera dan mikrofon harus meminta izin yang sesuai dan hanya digunakan ketika diperlukan.