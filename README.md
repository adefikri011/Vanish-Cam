# Vanishing Cam

Vanishing Cam adalah proof of concept ekstensi Chrome untuk memproses video kamera secara lokal dan menguji apakah Google Meet menerima video hasil pemrosesan.

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

Halaman [src/processor/test.html](./src/processor/test.html) memvalidasi preview lokal. Integrasi Meet masih berupa eksperimen: hook MAIN world membungkus `getUserMedia()`, membuat video track dari `canvas.captureStream()`, dan mempertahankan audio asli. MediaPipe berjalan di iframe ekstensi lokal; mask frame diteruskan ke compositor tanpa mengunggah video.

Status `processedTrackReturned` hanya berarti `getUserMedia()` mengembalikan track canvas ke halaman. Status itu **tidak membuktikan** Google Meet mengirim track tersebut atau peserta lain melihat efek. Verifikasi terakhir harus dilakukan dengan peserta kedua.

Integrasi dipasang pada `document_start`. Setelah memuat ulang ekstensi, refresh tab Meet sebelum mengaktifkan kamera. Capture Background hanya tersedia setelah kamera dan segmentasi aktif; kosongkan frame terlebih dahulu.

## Menjalankan dan menguji

1. Muat folder proyek sebagai unpacked extension di `chrome://extensions`.
2. Setelah setiap perubahan manifest atau script, tekan **Reload** pada ekstensi dan refresh tab Meet.
3. Aktifkan kamera di Meet dan tunggu status segmentasi siap.
4. Keluar dari frame, lalu gunakan **Capture background** pada popup.
5. Masuk kembali dan pilih **Vanish**. Pilih **Reveal** untuk kembali ke kamera normal.
6. Konfirmasi hasil dari peserta lain, bukan hanya preview sendiri.

Di Google Meet, tekan **Ctrl+Shift+Y** untuk toggle Vanish/Reveal. Shortcut hanya bereaksi saat tab Meet aktif. Shortcut dapat diubah dari `chrome://extensions/shortcuts`.

Efek lokal dapat diuji dengan membuka `src/processor/test.html` melalui halaman ekstensi.

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

- Google Meet dapat mengganti jalur kamera atau tidak menggunakan track pengganti; kompatibilitas belum dapat dijamin.
- Hook hanya menangani pemanggilan `navigator.mediaDevices.getUserMedia()` yang terjadi setelah content script `document_start` dipasang.
- Model berjalan di CPU dan menargetkan maksimal 640×360 pada sekitar 15 FPS. Performa aktual bergantung pada perangkat.
- Background statis tidak dapat merekonstruksi bayangan atau objek yang bergerak.
- Status popup tidak membuktikan video keluar sudah diverifikasi oleh peserta lain.

## Privasi

Target pengembangan adalah pemrosesan video secara lokal. Akses kamera dan mikrofon harus meminta izin yang sesuai dan hanya digunakan ketika diperlukan.