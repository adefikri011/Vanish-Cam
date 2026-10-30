# VANISHCAM
## Product Requirements Document (PRD)

**Nama proyek:** VanishCam  
**Versi dokumen:** 1.0  
**Status:** Draft untuk persetujuan dan perencanaan teknis  
**Platform pengembangan awal:** Ubuntu Linux  
**Target platform rapat awal:** Zoom dan Google Meet  
**Kategori produk:** Real-time AI Video Processing / Virtual Camera Application  
**Jenis aplikasi:** Aplikasi desktop dengan dukungan kamera virtual  
**Bahasa dokumen:** Bahasa Indonesia

---

# 1. Executive Summary

## 1.1. Ringkasan Produk

VanishCam adalah aplikasi pemrosesan video real-time yang memungkinkan pengguna menghilangkan tampilan tubuhnya dari video kamera, tetapi tetap mempertahankan background asli secara visual.

Aplikasi ini dirancang untuk menghasilkan efek seolah-olah pengguna benar-benar menghilang seperti pesulap, bukan sekadar mematikan kamera atau mengganti tampilan video menjadi layar hitam.

Pengguna dapat mengaktifkan efek tersebut melalui tombol aplikasi, dengan dukungan pemicu suara jentikan jari sebagai fitur interaksi yang dikembangkan secara bertahap.

Ketika efek aktif, VanishCam akan mendeteksi tubuh pengguna, memisahkannya dari background, mengganti area tubuh dengan rekonstruksi background, lalu mengirimkan hasil video melalui perangkat kamera virtual.

Dengan demikian, aplikasi rapat menerima video hasil pemrosesan VanishCam, sedangkan pengguna tetap dapat mengikuti rapat dan menggunakan mikrofon secara normal.

## 1.2. Visi Produk

Menjadi aplikasi efek video real-time yang memungkinkan pengguna melakukan transformasi visual secara halus, interaktif, dan mudah digunakan pada berbagai platform komunikasi video.

## 1.3. Misi Produk

1. Menghasilkan efek menghilang yang terlihat alami.
2. Mempertahankan background asli ketika pengguna menghilang.
3. Menyediakan interaksi yang cepat melalui tombol dan jentikan jari.
4. Meminimalkan latensi serta penggunaan sumber daya komputer.
5. Mengutamakan pemrosesan lokal untuk menjaga privasi.
6. Membuat arsitektur perangkat lunak modular dan mudah dikembangkan.
7. Mendukung platform rapat yang berbeda melalui satu mesin pemrosesan video.

## 1.4. Masalah yang Ingin Diselesaikan

Sebagian besar fitur kamera pada aplikasi rapat berfokus pada penggantian background, pengaburan background, filter wajah, dan efek visual.

VanishCam berfokus pada kebutuhan yang berbeda: pengguna ingin menghilangkan dirinya dari video tanpa menghilangkan lingkungan di sekitarnya.

Tantangan utamanya adalah kamera tidak dapat melihat bagian background yang tertutup oleh tubuh pengguna. Oleh karena itu, aplikasi harus memiliki mekanisme untuk memperkirakan atau merekonstruksi bagian gambar yang tersembunyi.

Selain itu, efek harus dijalankan secara real-time, sehingga pemrosesan gambar, transisi visual, dan pengiriman video tidak boleh menyebabkan keterlambatan yang berlebihan.

## 1.5. Prinsip Utama Produk

VanishCam harus dibangun berdasarkan lima prinsip berikut.

- **Real-time:** pemrosesan dilakukan saat kamera aktif.
- **Natural:** hasil akhir tidak boleh meninggalkan lubang atau artefak visual yang mengganggu.
- **Interactive:** pengguna dapat mengaktifkan atau menonaktifkan efek dengan mudah.
- **Modular:** setiap komponen memiliki tanggung jawab yang jelas.
- **Platform-independent core:** mesin pemrosesan video tidak bergantung pada logika internal Zoom atau Google Meet.

---

# 2. Product Goals and Non-Goals

## 2.1. Tujuan Produk

### Goal 1 — Menghilangkan tubuh pengguna

Aplikasi harus dapat mendeteksi tubuh pengguna dari video kamera dan mengganti bagian tersebut dengan background yang telah disiapkan.

### Goal 2 — Mempertahankan background

Ketika pengguna menghilang, background harus tetap terlihat dan tidak berubah menjadi warna hitam atau transparan.

### Goal 3 — Menyediakan efek transisi yang halus

Perubahan dari kondisi normal menuju kondisi menghilang harus terasa alami, bukan berupa pergantian gambar yang mendadak.

### Goal 4 — Mendukung interaksi jentikan jari

Pengguna dapat mengaktifkan atau menonaktifkan efek melalui suara jentikan jari apabila fitur tersebut telah diaktifkan.

### Goal 5 — Mendukung aplikasi rapat

Versi awal harus dapat diuji dengan Zoom dan Google Meet melalui perangkat kamera virtual yang kompatibel.

### Goal 6 — Memudahkan pengembangan selanjutnya

Aplikasi harus memiliki struktur kode, pengujian, konfigurasi, dan dokumentasi yang mendukung penambahan fitur tanpa perubahan besar pada keseluruhan sistem.

## 2.2. Non-Goals

Hal-hal berikut tidak termasuk dalam tujuan versi awal.

1. Menghilangkan identitas pengguna dari daftar peserta rapat.
2. Menyembunyikan status kehadiran pengguna dari penyelenggara rapat.
3. Mengubah sistem autentikasi atau mekanisme kehadiran Zoom maupun Google Meet.
4. Mengubah video peserta lain.
5. Menghasilkan rekonstruksi background yang sempurna untuk semua situasi.
6. Menjamin hasil identik pada seluruh perangkat keras.
7. Mendukung semua platform komunikasi video sejak versi pertama.
8. Menggunakan layanan cloud sebagai persyaratan wajib pemrosesan video.
9. Mengembangkan model AI sendiri dari nol sebelum kemampuan model yang tersedia dievaluasi.

**Batasan produk:** VanishCam mengubah tampilan video yang dikirim melalui kamera virtual. Aplikasi ini tidak menjamin bahwa pengguna akan tersembunyi dari daftar peserta, identitas akun, atau sistem kehadiran platform rapat.

---

# 3. Target Pengguna

## 3.1. Primary Persona — Pengguna Rapat Online

Pengguna yang sering mengikuti rapat, kelas daring, diskusi, atau konferensi video.

Kebutuhan utama:
- Efek menghilang yang mudah digunakan.
- Tidak perlu melakukan pengaturan rumit setiap kali rapat.
- Kualitas video tetap nyaman dilihat.
- Dapat kembali ke tampilan normal dengan cepat.

## 3.2. Secondary Persona — Content Creator

Pengguna yang ingin membuat konten video dengan efek visual interaktif.

Kebutuhan utama:
- Efek yang dapat dikendalikan secara real-time.
- Kemampuan mengatur durasi transisi.
- Dukungan terhadap aplikasi perekaman atau streaming.
- Kemungkinan menambahkan efek visual lain.

## 3.3. Developer dan Maintainer

Pengembang yang bertugas memperbaiki, mengembangkan, dan memelihara VanishCam.

Kebutuhan utama:
- Pemisahan komponen yang jelas.
- Dokumentasi arsitektur.
- Pengujian otomatis.
- Konfigurasi yang terstruktur.
- Logging yang membantu debugging tanpa merekam data pribadi pengguna.

---

# 4. Product Scope

## 4.1. MVP — Minimum Viable Product

MVP adalah versi pertama yang membuktikan bahwa konsep utama dapat bekerja.

Fitur wajib:

1. Membuka kamera dan menampilkan preview.
2. Mengambil gambar background referensi.
3. Mendeteksi manusia menggunakan model segmentasi.
4. Menghilangkan tubuh pengguna dengan mengganti area tersebut menggunakan background referensi.
5. Menyediakan tombol untuk mengaktifkan dan menonaktifkan efek.
6. Menyediakan transisi visual sederhana.
7. Mengirimkan video hasil pemrosesan melalui kamera virtual di Ubuntu.
8. Menguji video keluaran pada Zoom dan Google Meet.
9. Menyediakan penanganan kesalahan kamera dan perangkat virtual.
10. Menyediakan kontrol untuk menghentikan pemrosesan dan melepaskan kamera.

MVP belum harus memiliki semua efek visual yang kompleks.

Keberhasilan MVP ditentukan oleh kemampuan menghilangkan tubuh secara konsisten pada kondisi kamera dan background yang terkendali.

## 4.2. Versi 1.0

Setelah MVP berhasil, versi 1.0 dapat mencakup:

- Deteksi suara jentikan jari.
- Efek menghilang dan muncul kembali.
- Pengaturan durasi transisi.
- Preview video sebelum digunakan dalam rapat.
- Pengaturan resolusi dan frame rate.
- Pemilihan kamera.
- Pemilihan perangkat kamera virtual.
- Pengelolaan background referensi.
- Pengaturan sensitivitas deteksi jentikan jari.
- Penyimpanan preferensi pengguna.
- Diagnostik performa.

## 4.3. Versi Selanjutnya

Fitur yang dapat dipertimbangkan setelah versi awal stabil:

- Efek partikel atau asap.
- Efek distorsi sebelum tubuh menghilang.
- Rekonstruksi background berbasis AI.
- Mode penghilangan sebagian tubuh.
- Efek teleportasi visual.
- Dukungan multi-monitor untuk pengaturan aplikasi.
- Dukungan Windows dan macOS.
- Integrasi dengan aplikasi streaming.
- Penggunaan akselerasi GPU yang lebih luas.
- Sistem plugin efek visual.

Fitur-fitur tersebut tidak boleh menghambat penyelesaian MVP.

---

# 5. User Experience dan User Journey

## 5.1. Alur Penggunaan Pertama

1. Pengguna menjalankan VanishCam.
2. Aplikasi menampilkan kamera yang tersedia.
3. Pengguna memilih kamera.
4. Aplikasi menampilkan preview.
5. Pengguna mengatur posisi kamera dan background.
6. Pengguna mengambil gambar background referensi ketika area yang ingin ditampilkan sedang tidak tertutup tubuh.
7. Aplikasi memeriksa apakah gambar referensi cukup baik.
8. Pengguna mengaktifkan preview efek menghilang.
9. Pengguna memeriksa hasilnya.
10. Pengguna mengaktifkan kamera virtual.
11. Pengguna memilih kamera virtual VanishCam di aplikasi rapat.

## 5.2. Alur Menghilang

Kondisi awal:
- Kamera aktif.
- Pengguna terlihat normal.
- Background referensi tersedia.
- Efek berada dalam kondisi nonaktif.

Ketika pengguna menjentikkan jari:

1. Sistem mendeteksi suara yang memenuhi kriteria jentikan.
2. Sistem memvalidasi pemicu agar suara lain tidak mudah dianggap sebagai jentikan.
3. Sistem mengubah status efek menjadi `DISAPPEARING`.
4. Opasitas tubuh dikurangi secara bertahap.
5. Background referensi menggantikan area tubuh.
6. Efek mencapai status `INVISIBLE`.

Ketika pengguna menjentikkan jari kembali:

1. Sistem mendeteksi pemicu baru.
2. Status berubah menjadi `APPEARING`.
3. Tubuh muncul secara bertahap.
4. Sistem kembali ke status `VISIBLE`.

Durasi transisi harus dapat diatur dan tidak boleh dianggap sebagai angka final sebelum diuji pada perangkat target.

## 5.3. Alur Alternatif

Jika suara jentikan tidak terdeteksi, pengguna tetap dapat mengaktifkan efek melalui tombol.

Jika background referensi tidak tersedia, aplikasi harus meminta pengguna mengambil gambar referensi terlebih dahulu atau menggunakan mode demonstrasi yang tidak mengklaim dapat mempertahankan background asli.

Jika kamera terputus, sistem harus menghentikan pemrosesan dengan aman dan memberikan pesan kesalahan.

---

# 6. Functional Requirements

Setiap kebutuhan diberi ID agar dapat dilacak dalam pengembangan dan pengujian.

Prioritas:
- **P0:** wajib untuk MVP.
- **P1:** penting untuk versi awal setelah MVP.
- **P2:** peningkatan lanjutan.

## FR-001 — Camera Input

**Prioritas:** P0

Sistem harus dapat:
- Menemukan kamera yang tersedia.
- Meminta akses kamera.
- Membuka kamera yang dipilih.
- Menampilkan preview.
- Menutup kamera ketika aplikasi dihentikan.
- Menangani kegagalan akses kamera.

Kriteria penerimaan:
- Kamera dapat digunakan setelah pengguna memberikan izin.
- Kegagalan kamera menghasilkan pesan yang dapat dipahami.
- Kamera tidak dibiarkan terbuka setelah aplikasi berhenti secara normal.

## FR-002 — Background Reference Capture

**Prioritas:** P0

Sistem harus memungkinkan pengguna mengambil gambar background referensi.

Kriteria penerimaan:
- Pengguna dapat mengambil dan melihat gambar referensi.
- Pengguna dapat mengambil ulang gambar.
- Sistem menyimpan referensi secara lokal.
- Sistem memberikan peringatan jika background berubah secara signifikan.

Persyaratan kualitas:
- Kamera sebaiknya tidak bergerak setelah pengambilan referensi.
- Pencahayaan sebaiknya stabil.
- Objek di background sebaiknya tidak berpindah selama penggunaan.

## FR-003 — Person Segmentation

**Prioritas:** P0

Sistem harus mengidentifikasi piksel yang termasuk dalam area manusia.

Input:
- Frame kamera.

Output:
- Mask segmentasi manusia.
- Informasi kualitas atau keyakinan mask jika tersedia.

Kriteria penerimaan:
- Mask dapat digunakan untuk memisahkan manusia dan background.
- Mask diproses tanpa harus mengirim video ke server eksternal.
- Sistem dapat menangani frame yang gagal diproses.
- Kualitas segmentasi diuji pada berbagai kondisi pencahayaan dan pakaian.

## FR-004 — Background Reconstruction

**Prioritas:** P0

Sistem harus mengganti area tubuh yang dihilangkan dengan background referensi.

Metode MVP:
- Menggunakan gambar background referensi.
- Menyelaraskan ukuran gambar dengan frame kamera.
- Menggunakan mask segmentasi untuk menentukan area penggantian.
- Menggunakan feathering atau pemulusan tepi untuk mengurangi garis potongan yang kasar.

Kriteria penerimaan:
- Area tubuh yang terdeteksi diganti dengan background.
- Tidak muncul lubang transparan yang disengaja.
- Ketidaksesuaian background ditangani melalui peringatan.
- Hasil dinilai pada beberapa posisi tubuh dan kondisi pencahayaan.

Catatan: metode ini tidak menjamin rekonstruksi sempurna jika kamera bergerak atau background berubah.

## FR-005 — Invisible Toggle

**Prioritas:** P0

Sistem harus menyediakan kontrol untuk mengaktifkan dan menonaktifkan efek.

Kriteria penerimaan:
- Tombol menampilkan status efek saat ini.
- Pengguna dapat kembali ke tampilan normal.
- Perubahan status tidak menyebabkan aplikasi berhenti.
- Tombol tetap berfungsi ketika deteksi suara dinonaktifkan.

## FR-006 — Smooth Transition

**Prioritas:** P0

Sistem harus menyediakan transisi antara tampilan normal dan tampilan menghilang.

Kriteria penerimaan:
- Transisi menggunakan fungsi interpolasi yang terukur.
- Durasi transisi dapat dikonfigurasi.
- Frame keluaran tidak sengaja berubah menjadi hitam selama pergantian status.
- Status efek tetap konsisten meskipun terjadi frame yang terlambat.

## FR-007 — Finger Snap Detection

**Prioritas:** P1

Sistem harus menyediakan pendeteksian suara jentikan jari.

Input:
- Audio dari mikrofon yang dipilih pengguna.

Proses:
- Menghitung karakteristik sinyal audio.
- Mendeteksi lonjakan energi suara yang memenuhi kriteria.
- Menerapkan ambang batas dan mekanisme penolakan pemicu berulang.
- Mengaktifkan atau menonaktifkan efek sesuai konfigurasi.

Kriteria penerimaan:
- Sensitivitas dapat diatur.
- Pengguna dapat mengaktifkan atau menonaktifkan fitur.
- Suara percakapan biasa tidak selalu memicu efek.
- Terdapat mekanisme cooldown untuk mencegah satu jentikan dihitung berkali-kali.

Deteksi awal dapat menggunakan pemrosesan sinyal audio, bukan model AI besar. Model yang lebih kompleks baru dipertimbangkan jika metode sederhana tidak memenuhi kebutuhan.

## FR-008 — Virtual Camera Output

**Prioritas:** P0

Sistem harus mengirimkan frame hasil pemrosesan ke perangkat kamera virtual.

Kriteria penerimaan:
- Perangkat virtual dapat ditemukan oleh aplikasi yang kompatibel.
- Resolusi dan frame rate keluaran dikonfigurasi dengan jelas.
- Kegagalan perangkat menghasilkan pesan diagnostik.
- Pengguna dapat menghentikan keluaran dengan aman.

## FR-009 — Application Compatibility

**Prioritas:** P0

Sistem harus diuji dengan:
- Zoom desktop di Ubuntu.
- Google Meet melalui browser yang didukung.

Kriteria penerimaan:
- Aplikasi rapat dapat memilih kamera virtual.
- Video hasil pemrosesan terlihat pada preview aplikasi rapat.
- Efek menghilang dapat diaktifkan saat rapat berlangsung.
- Mikrofon dan audio rapat tetap dapat digunakan secara independen.

## FR-010 — Configuration Management

**Prioritas:** P1

Pengaturan yang perlu disimpan meliputi:
- Kamera pilihan.
- Resolusi.
- Frame rate target.
- Durasi transisi.
- Sensitivitas deteksi suara.
- Status fitur jentikan.
- Preferensi preview.

Kriteria penerimaan:
- Konfigurasi memiliki nilai default.
- Konfigurasi yang rusak dapat dipulihkan.
- Pengaturan tidak memuat data sensitif yang tidak diperlukan.

## FR-011 — Diagnostics

**Prioritas:** P1

Aplikasi harus memberikan informasi dasar mengenai:
- Status kamera.
- Status model AI.
- Status kamera virtual.
- Frame rate aktual.
- Waktu pemrosesan.
- Kesalahan yang terjadi.

Logging harus menghindari penyimpanan gambar dan audio mentah secara default.

## FR-012 — Graceful Shutdown

**Prioritas:** P0

Ketika aplikasi dihentikan:
- Kamera ditutup.
- Pemrosesan audio dihentikan.
- Worker AI dihentikan.
- Sumber daya video dilepaskan.
- Perangkat virtual ditangani sesuai mekanisme yang digunakan.

---

# 7. Non-Functional Requirements

## NFR-001 — Performance

Target awal untuk pengujian:
- Target pemrosesan: 30 FPS pada perangkat yang memenuhi spesifikasi pengujian.
- Latensi tambahan harus diukur secara end-to-end.
- Penurunan frame harus dicatat.
- Pemrosesan AI tidak boleh memblokir antarmuka secara terus-menerus.

Target tersebut merupakan sasaran rekayasa awal, bukan jaminan bahwa setiap komputer mampu mencapainya.

## NFR-002 — Quality

Kualitas harus dinilai melalui:
- Ketepatan segmentasi.
- Kehalusan tepi tubuh.
- Konsistensi background.
- Kualitas transisi.
- Stabilitas frame rate.
- Tingkat kesalahan deteksi jentikan.

## NFR-003 — Maintainability

Kode harus:
- Menggunakan modul dengan tanggung jawab yang jelas.
- Memisahkan logika bisnis dari antarmuka.
- Memisahkan pemrosesan video dari integrasi kamera virtual.
- Memiliki pengujian otomatis untuk komponen penting.
- Memiliki dokumentasi arsitektur.
- Menggunakan konfigurasi terpusat.
- Menghindari ketergantungan langsung antarmodul yang tidak diperlukan.

## NFR-004 — Privacy

- Pemrosesan video dan audio dilakukan secara lokal sebagai default.
- Tidak ada pengunggahan frame kamera secara otomatis.
- Penggunaan mikrofon harus mendapat izin pengguna.
- Pengguna dapat mematikan deteksi jentikan.
- Log tidak boleh menyimpan isi audio atau video secara default.
- Background referensi disimpan secara lokal.
- Penghapusan data lokal harus tersedia atau terdokumentasi dengan jelas.

## NFR-005 — Reliability

- Kegagalan model AI tidak boleh membuat aplikasi crash tanpa penanganan.
- Kamera terputus harus ditangani.
- Perangkat virtual tidak tersedia harus menghasilkan instruksi perbaikan.
- Kesalahan konfigurasi harus dapat dipulihkan.
- Sistem harus memiliki jalur kembali ke tampilan normal.

## NFR-006 — Portability

Arsitektur harus menghindari ketergantungan yang tidak perlu pada Ubuntu.

Namun, setiap sistem operasi memerlukan implementasi dan pengujian khusus untuk perangkat kamera virtual. Portabilitas arsitektur tidak berarti semua komponen native dapat langsung digunakan tanpa perubahan.

---

# 8. Research and Technology Selection

## 8.1. Bahasa Pemrograman

### JavaScript dan TypeScript

Kelebihan:
- Cocok untuk pengembangan antarmuka.
- Mendukung pemrosesan gambar di browser.
- Dapat menggunakan MediaPipe melalui paket JavaScript.
- Ekosistem pengembangan antarmuka cukup luas.

Kekurangan:
- Tidak otomatis menyediakan akses ke seluruh fasilitas kamera virtual sistem operasi.
- Pemrosesan video yang berat membutuhkan optimasi.
- Penggunaan API browser dan API native memiliki batasan yang berbeda.

Rekomendasi:
Gunakan TypeScript untuk antarmuka aplikasi desktop dan komponen yang memang sesuai dijalankan di lingkungan web.

### Python

Kelebihan:
- Cocok untuk eksperimen computer vision.
- Mudah digunakan untuk menguji model AI.
- Ekosistem OpenCV dan pemrosesan audio mendukung pembuatan prototipe.
- Memudahkan pengujian algoritma rekonstruksi background.

Kekurangan:
- Performa dan distribusi aplikasi harus diuji.
- Ketergantungan native dapat mempersulit packaging.
- Implementasi kamera virtual tetap memerlukan integrasi sistem operasi.

Rekomendasi:
Gunakan Python untuk membuktikan kelayakan efek menghilang pada MVP.

### Rust

Kelebihan:
- Cocok untuk komponen native.
- Mendukung pengelolaan memori yang ketat.
- Berguna untuk aplikasi desktop dan pemrosesan sistem.
- Dapat digunakan sebagai backend Tauri.

Kekurangan:
- Kurva belajar lebih tinggi.
- Integrasi library AI dan multimedia dapat membutuhkan pekerjaan tambahan.
- Mengembangkan seluruh pemrosesan AI dari awal dengan Rust tidak diperlukan untuk MVP.

Rekomendasi:
Pertimbangkan Rust ketika aplikasi memerlukan komponen native yang lebih matang atau ketika kebutuhan performa dan packaging telah terukur.

### C++ 

C++ merupakan alternatif untuk komponen multimedia dan computer vision yang membutuhkan kontrol native lebih luas.

Namun, menulis seluruh sistem dalam C++ sejak awal akan meningkatkan kompleksitas. Bahasa ini sebaiknya digunakan jika ada kebutuhan teknis yang terbukti dan tidak dapat dipenuhi dengan pendekatan yang lebih sederhana.

## 8.2. Kesimpulan Pemilihan Bahasa

Strategi yang disarankan:

- **Python:** prototipe dan validasi algoritma.
- **TypeScript:** antarmuka desktop.
- **Rust:** komponen native aplikasi ketika diperlukan.
- **C++:** opsi khusus untuk optimasi atau integrasi multimedia jika dibutuhkan.

Kita tidak perlu menggunakan semua bahasa tersebut pada MVP.

---

# 9. Technology Stack yang Direkomendasikan

## 9.1. MVP Stack

| Komponen | Teknologi | Alasan |
|---|---|---|
| Bahasa prototipe | Python | Memudahkan eksperimen dan pengujian |
| Pemrosesan gambar | OpenCV | Operasi frame, mask, blending, dan transformasi |
| Segmentasi manusia | MediaPipe | Menyediakan model segmentasi manusia |
| Audio trigger | Python audio processing | Memungkinkan deteksi jentikan berbasis sinyal |
| Kamera virtual | OBS Virtual Camera atau pipeline `v4l2loopback` | Jalur integrasi video pada Ubuntu |
| Pengujian | pytest | Pengujian otomatis komponen Python |
| Manajemen dependensi | `pyproject.toml` dan lockfile | Menjaga dependensi tetap terkontrol |
| Version control | Git | Melacak perubahan kode |

Catatan penting: kompatibilitas antara versi MediaPipe, Python, OpenCV, dan perangkat keras harus dibuktikan melalui prototipe. Pemilihan library tidak menjamin seluruh kombinasi versi kompatibel.

## 9.2. Production Stack

| Komponen | Kandidat | Peran |
|---|---|---|
| Desktop UI | Tauri | Kerangka aplikasi desktop |
| UI language | TypeScript | Antarmuka dan pengaturan |
| UI framework | React atau framework ringan | Mengelola komponen antarmuka |
| Native backend | Rust | Integrasi sistem dan pengelolaan proses |
| Video processing | Komponen native atau service khusus | Menangani frame dan pipeline video |
| AI segmentation | MediaPipe atau model pengganti | Segmentasi manusia |
| Virtual camera | Adapter khusus sistem operasi | Mengirimkan video ke aplikasi lain |
| Configuration | JSON atau format terstruktur | Menyimpan preferensi |
| Testing | pytest, Vitest, integration tests | Pengujian lintas komponen |
| CI | GitHub Actions atau alternatif setara | Otomasi pemeriksaan kode |

Production stack tidak harus diimplementasikan sekaligus. Migrasi dari prototipe dilakukan setelah kebutuhan performa dan integrasi dipahami.

---

# 10. Arsitektur Sistem

## 10.1. Gambaran Umum

Arsitektur konseptual:

```text
                 ┌──────────────────────┐
                 │      Webcam          │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │   Camera Input       │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Frame Preprocessing  │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Person Segmentation  │
                 │      (AI Model)      │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Mask Postprocessing  │
                 └──────────┬───────────┘
                            │
             ┌──────────────┴─────────────┐
             │                            │
             ▼                            ▼
  ┌────────────────────┐     ┌─────────────────────┐
  │ Background         │     │ Effect State        │
  │ Reference          │     │ Visible / Invisible │
  └──────────┬─────────┘     └──────────┬──────────┘
             │                          │
             └────────────┬─────────────┘
                          ▼
                 ┌──────────────────────┐
                 │ Frame Compositor     │
                 │ Blend / Reconstruction│
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Output Frame Queue   │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Virtual Camera       │
                 └──────────┬───────────┘
                            │
                 ┌──────────┴───────────┐
                 ▼                      ▼
           ┌───────────┐          ┌────────────┐
           │   Zoom    │          │ Google Meet│
           └───────────┘          └────────────┘
```

Audio trigger merupakan jalur terpisah:

```text
Microphone
    │
    ▼
Audio Capture
    │
    ▼
Snap Detection
    │
    ▼
Trigger Validation
    │
    ▼
Effect State Controller
```

Antarmuka aplikasi berkomunikasi dengan controller untuk mengubah konfigurasi dan status efek.

## 10.2. Prinsip Arsitektur

### Separation of Concerns

Setiap modul hanya bertanggung jawab atas fungsi tertentu.

Contohnya, modul segmentasi tidak boleh mengatur tampilan tombol atau mengelola koneksi rapat.

### Dependency Inversion

Komponen inti sebaiknya berinteraksi melalui antarmuka yang stabil, bukan bergantung pada implementasi konkret.

Sebagai contoh, `VideoOutput` tidak harus mengetahui apakah implementasinya menggunakan kamera virtual Linux atau adapter platform lain.

### Platform Adapters

Implementasi platform harus ditempatkan dalam modul terpisah.

```text
Core
 ├── CameraInput
 ├── SegmentationEngine
 ├── BackgroundEngine
 ├── EffectController
 └── VideoFrame

Adapters
 ├── LinuxCameraAdapter
 ├── LinuxVirtualCameraAdapter
 ├── ZoomUsageGuide
 └── BrowserUsageGuide
```

`ZoomUsageGuide` dan `BrowserUsageGuide` merupakan contoh modul dokumentasi atau konfigurasi, bukan API khusus yang menjamin integrasi langsung dengan kedua platform.

---

# 11. Background Reconstruction Strategy

Ini adalah bagian paling penting dari VanishCam.

## 11.1. Masalah Dasar

Misalnya, kamera menangkap gambar dengan tubuh pengguna menutupi dinding.

Ketika segmentasi menandai tubuh sebagai area yang harus dihapus, gambar kamera tidak memiliki informasi mengenai dinding yang tertutup tubuh tersebut.

Karena itu, aplikasi tidak bisa mendapatkan background asli secara sempurna hanya dengan menghapus piksel tubuh.

## 11.2. Metode MVP: Static Background Reference

Prosedur:
1. Kamera diarahkan pada posisi tetap.
2. Pengguna mengambil gambar background tanpa tubuh menutupi area utama.
3. Gambar disimpan sebagai referensi.
4. Saat efek aktif, area manusia diganti menggunakan gambar referensi.
5. Mask diperhalus agar peralihan tepi lebih alami.

Kelebihan:
- Relatif sederhana.
- Tidak memerlukan model generatif besar.
- Hasil dapat diprediksi dalam lingkungan yang stabil.

Kekurangan:
- Perubahan posisi kamera dapat menyebabkan ketidaksesuaian.
- Perubahan pencahayaan dapat membuat area pengganti terlihat berbeda.
- Objek bergerak di background tidak otomatis dipertahankan.
- Gerakan tangan atau tubuh yang tidak terdeteksi dengan baik dapat meninggalkan artefak.

## 11.3. Metode Lanjutan: AI Inpainting

AI inpainting dapat digunakan untuk memperkirakan area gambar yang tertutup.

Namun, metode ini mempunyai risiko:
- Detail yang direkonstruksi mungkin tidak sama dengan background sebenarnya.
- Pemrosesan dapat meningkatkan latensi.
- Model mungkin membutuhkan sumber daya tambahan.
- Hasil antarfame dapat berubah-ubah.

Karena itu, AI inpainting ditempatkan sebagai eksperimen lanjutan, bukan persyaratan MVP.

## 11.4. Metode Hybrid

Strategi jangka panjang yang dapat dievaluasi adalah menggabungkan:
- Background referensi.
- Mask segmentasi.
- Pelacakan perubahan kamera.
- Pemulusan temporal.
- Inpainting hanya pada area yang memerlukan rekonstruksi tambahan.

Keputusan implementasi dilakukan berdasarkan hasil pengujian, bukan asumsi bahwa satu metode selalu paling baik.

---

# 12. Effect State Machine

Untuk menghindari bug ketika pengguna mengaktifkan efek secara cepat, status efek harus dikelola secara eksplisit.

Status utama:

```text
INITIALIZING
    │
    ▼
VISIBLE
    │
    ▼
DISAPPEARING
    │
    ▼
INVISIBLE
    │
    ▼
APPEARING
    │
    └──────────────► VISIBLE
```

Status tambahan:

- `PAUSED`
- `ERROR`
- `SHUTTING_DOWN`

## 12.1. Aturan Transisi

- `VISIBLE` dapat berpindah ke `DISAPPEARING`.
- `DISAPPEARING` berpindah ke `INVISIBLE` setelah transisi selesai.
- `INVISIBLE` dapat berpindah ke `APPEARING`.
- `APPEARING` kembali ke `VISIBLE`.
- Kesalahan fatal menghentikan transisi dan mengaktifkan penanganan error.
- Penutupan aplikasi selalu mengarah ke `SHUTTING_DOWN`.

Jika pengguna memicu efek ketika transisi masih berjalan, sistem harus memiliki kebijakan yang konsisten. Untuk MVP, transisi dapat diselesaikan terlebih dahulu sebelum menerima pemicu berikutnya.

## 12.2. Separation of State

Status aplikasi, status kamera, dan status efek tidak boleh digabung menjadi satu variabel global.

Contoh:

```text
ApplicationState
CameraState
SegmentationState
EffectState
AudioTriggerState
VirtualCameraState
```

Pemisahan ini membantu debugging dan pengujian.

---

# 13. Finger Snap Detection

## 13.1. Tujuan

Memungkinkan pengguna mengendalikan efek melalui suara jentikan jari tanpa harus mengklik antarmuka aplikasi.

## 13.2. Pipeline

```text
Microphone
    │
    ▼
Audio Buffer
    │
    ▼
Noise Filtering
    │
    ▼
Transient Detection
    │
    ▼
Threshold Validation
    │
    ▼
Cooldown / Debounce
    │
    ▼
Effect Toggle Event
```

## 13.3. Strategi MVP

Mulai dengan deteksi berbasis karakteristik sinyal audio.

Karakteristik yang dapat diuji:
- Perubahan energi dalam waktu singkat.
- Amplitudo relatif terhadap noise sekitar.
- Durasi suara.
- Pola transien.
- Jeda minimum antar-pemicu.

Nilai ambang batas harus dikalibrasi melalui eksperimen menggunakan suara jentikan dan suara lain yang menyerupainya.

## 13.4. Pencegahan False Positive

Sistem harus berusaha menghindari aktivasi akibat:
- Tepukan tangan.
- Bunyi keyboard.
- Klik mouse.
- Suara benda jatuh.
- Percakapan dengan konsonan keras.

Deteksi berbasis aturan mungkin belum cukup akurat di semua lingkungan. Jika pengujian menunjukkan hasil yang buruk, model klasifikasi suara ringan dapat dipertimbangkan.

## 13.5. Kontrol Pengguna

Pengguna harus dapat:
- Menonaktifkan deteksi suara.
- Mengatur sensitivitas.
- Menguji mikrofon.
- Melihat indikator bahwa suara terdeteksi.
- Menggunakan tombol sebagai alternatif.

Pemrosesan audio tidak boleh mengubah status mikrofon rapat secara otomatis.

---

# 14. User Interface Requirements

Antarmuka awal harus sederhana dan fokus pada alur penggunaan utama.

## 14.1. Halaman Utama

Komponen:
- Preview kamera.
- Status kamera.
- Tombol `Capture Background`.
- Tombol `Enable Invisible Mode`.
- Tombol `Disable Effect`.
- Status kamera virtual.
- Tombol pengaturan.

## 14.2. Pengaturan

Kategori pengaturan:

**Camera**
- Pilih perangkat.
- Resolusi.
- Frame rate.

**Background**
- Ambil gambar referensi.
- Perbarui gambar referensi.
- Tampilkan status kualitas referensi.

**Effects**
- Aktifkan atau nonaktifkan efek.
- Durasi transisi.
- Pilihan efek visual.

**Audio**
- Aktifkan deteksi jentikan.
- Pilih mikrofon.
- Sensitivitas.

**Performance**
- Statistik frame rate.
- Waktu pemrosesan.
- Mode kualitas.

## 14.3. Status dan Error

Pesan harus jelas dan dapat ditindaklanjuti.

Contoh:
- Kamera belum dipilih.
- Background referensi belum tersedia.
- Model segmentasi gagal dimuat.
- Kamera virtual tidak ditemukan.
- Perangkat kamera sedang digunakan aplikasi lain.
- Frame rate turun di bawah target.

Aplikasi sebaiknya tidak menampilkan stack trace kepada pengguna biasa. Detail teknis dapat disediakan melalui log diagnostik.

---

# 15. Security and Privacy

VanishCam memproses video dan audio pribadi, sehingga privasi harus menjadi persyaratan desain.

## 15.1. Data Processing

Secara default:
- Video diproses secara lokal.
- Audio untuk jentikan diproses secara lokal.
- Tidak ada akun pengguna yang wajib dibuat.
- Tidak ada pengunggahan otomatis ke server.
- Tidak ada rekaman rapat otomatis.

## 15.2. Permissions

Aplikasi harus menjelaskan mengapa kamera dan mikrofon diperlukan.

Akses mikrofon hanya diperlukan jika fitur deteksi jentikan digunakan.

## 15.3. Local Storage

File konfigurasi dan background referensi disimpan di lokasi data aplikasi yang sesuai.

Data harus dapat dihapus melalui mekanisme yang jelas.

## 15.4. Logging

Log dapat menyimpan:
- Waktu terjadinya error.
- Jenis error.
- Waktu pemrosesan.
- Statistik performa.
- Status komponen.

Log tidak boleh menyimpan frame video atau audio mentah secara default.

## 15.5. Failure Safety

Ketika aplikasi gagal:
- Pemrosesan dihentikan secara terkendali.
- Kamera dilepaskan jika memungkinkan.
- Pengguna menerima informasi mengenai kondisi video keluaran.
- Aplikasi tidak boleh diam-diam menyatakan efek aktif ketika pipeline sebenarnya berhenti.

---

# 16. Testing Strategy

Pengujian harus dilakukan pada setiap komponen dan pada sistem yang telah terintegrasi.

## 16.1. Unit Tests

Komponen yang perlu diuji:
- Pengelolaan status efek.
- Fungsi blending.
- Pengubahan ukuran frame.
- Validasi konfigurasi.
- Pengolahan mask.
- Logika cooldown pemicu audio.
- Penanganan error.

## 16.2. Integration Tests

Pengujian meliputi:
- Kamera ke pipeline pemrosesan.
- Segmentasi ke compositor.
- Compositor ke kamera virtual.
- Audio detector ke effect controller.
- Antarmuka ke konfigurasi.
- Penutupan aplikasi dan pelepasan sumber daya.

## 16.3. Visual Tests

Skenario:
1. Pengguna duduk di tengah frame.
2. Pengguna bergerak perlahan.
3. Pengguna menggerakkan tangan.
4. Pengguna memakai pakaian dengan warna mirip background.
5. Pencahayaan berubah.
6. Background memiliki pola kompleks.
7. Pengguna berpindah posisi.
8. Pengguna keluar dan masuk kembali ke frame.

Setiap skenario perlu diperiksa untuk menemukan:
- Bagian tubuh yang tertinggal.
- Bagian tubuh yang salah terhapus.
- Tepi yang bergetar.
- Perbedaan warna background.
- Artefak akibat keterlambatan segmentasi.

## 16.4. Performance Tests

Metrik:
- FPS input.
- FPS output.
- Waktu segmentasi.
- Waktu compositing.
- Total waktu pemrosesan.
- Penggunaan CPU.
- Penggunaan RAM.
- Penggunaan GPU jika tersedia.

Pengukuran dilakukan pada perangkat target dan dicatat agar perubahan versi dapat dibandingkan.

## 16.5. Platform Tests

Uji penggunaan pada:
- Zoom desktop di Ubuntu.
- Google Meet pada browser yang didukung.

Perlu diuji juga:
- Pemilihan kamera virtual.
- Pergantian perangkat kamera.
- Kamera sedang digunakan aplikasi lain.
- Penutupan aplikasi saat rapat berlangsung.

## 16.6. Acceptance Tests

MVP dinyatakan berhasil jika:
- Pengguna dapat melihat preview kamera.
- Background referensi dapat diambil.
- Tubuh dapat dihilangkan dalam kondisi pengujian terkendali.
- Background tetap terlihat.
- Tombol dapat mengaktifkan dan menonaktifkan efek.
- Video hasil pemrosesan dapat digunakan pada setidaknya satu platform target yang telah diuji.
- Kesalahan kamera ditangani dengan benar.
- Aplikasi dapat dihentikan tanpa meninggalkan proses pemrosesan yang tidak diperlukan.

Dukungan untuk platform target lainnya harus diuji secara terpisah sebelum dinyatakan selesai.

---

# 17. Performance Acceptance Criteria

Angka berikut merupakan target awal yang akan dikaji kembali setelah prototipe tersedia.

| Metrik | Target awal |
|---|---|
| Target frame rate | 30 FPS |
| Durasi transisi | Dapat dikonfigurasi |
| Respons tombol | Tidak terasa lambat |
| Deteksi jentikan | Tidak sering salah memicu |
| Stabilitas aplikasi | Tidak crash dalam pengujian normal |
| Pemrosesan data | Lokal secara default |
| Kamera virtual | Dapat dipilih oleh aplikasi target yang kompatibel |

Target waktu pemrosesan harus ditetapkan setelah pengujian pada resolusi dan perangkat keras yang telah ditentukan.

Kita tidak boleh mengklaim latensi tertentu sebelum melakukan pengukuran.

---

# 18. Development Roadmap

## Phase 0 — Technical Discovery

Tujuan:
Memastikan teknologi inti dapat bekerja pada perangkat target.

Aktivitas:
- Memeriksa versi Ubuntu.
- Memeriksa kamera dan spesifikasi perangkat.
- Menguji model segmentasi.
- Menguji pengambilan background referensi.
- Menguji kamera virtual.
- Menentukan batasan kompatibilitas.

Output:
- Catatan kelayakan teknis.
- Keputusan teknologi MVP.
- Daftar risiko yang sudah teridentifikasi.

## Phase 1 — Core Prototype

Tujuan:
Membuktikan efek menghilang.

Aktivitas:
- Membuka kamera.
- Menampilkan preview.
- Menjalankan segmentasi manusia.
- Mengambil background referensi.
- Menggabungkan mask dan background.
- Menghasilkan video keluaran.

Output:
Prototipe lokal yang memperlihatkan efek menghilang.

## Phase 2 — Real-Time Integration

Tujuan:
Menghubungkan pemrosesan video ke kamera virtual.

Aktivitas:
- Menyiapkan perangkat virtual.
- Menghubungkan pipeline pemrosesan.
- Menguji resolusi dan frame rate.
- Menangani kegagalan perangkat.

Output:
Video hasil pemrosesan tersedia sebagai kamera virtual.

## Phase 3 — Application UI

Tujuan:
Membuat aplikasi yang mudah digunakan.

Aktivitas:
- Membuat halaman utama.
- Menambahkan kontrol kamera.
- Menambahkan pengambilan background.
- Menambahkan tombol efek.
- Menambahkan status dan pesan error.

Output:
Aplikasi prototipe yang dapat digunakan tanpa mengandalkan perintah terminal untuk setiap tindakan.

## Phase 4 — Finger Snap Trigger

Tujuan:
Menambahkan kontrol berbasis suara.

Aktivitas:
- Membaca audio mikrofon.
- Mengembangkan deteksi transien.
- Menguji false positive.
- Menambahkan cooldown.
- Menghubungkan hasil deteksi dengan effect controller.

Output:
Efek dapat dikendalikan melalui jentikan yang terdeteksi.

## Phase 5 — Visual Quality

Tujuan:
Meningkatkan kualitas hasil.

Aktivitas:
- Memperbaiki mask.
- Mengurangi tepi bergerigi.
- Mengurangi flicker.
- Memperhalus transisi.
- Mengevaluasi rekonstruksi background.

Output:
Efek menghilang yang lebih alami.

## Phase 6 — Platform Validation

Tujuan:
Memastikan kompatibilitas aplikasi rapat.

Aktivitas:
- Pengujian Zoom.
- Pengujian Google Meet.
- Pengujian pergantian kamera.
- Pengujian penggunaan mikrofon.
- Dokumentasi konfigurasi.

Output:
Daftar platform dan konfigurasi yang telah diverifikasi.

## Phase 7 — Production Hardening

Tujuan:
Mempersiapkan aplikasi untuk penggunaan yang lebih luas.

Aktivitas:
- Memperbaiki arsitektur berdasarkan hasil prototipe.
- Menambahkan pengujian otomatis.
- Mengoptimalkan performa.
- Menyusun sistem packaging.
- Menyiapkan dokumentasi pengguna dan developer.

Output:
Versi stabil dengan prosedur pengujian dan distribusi yang terdokumentasi.

---

# 19. Project Structure

Struktur berikut merupakan usulan untuk prototipe Python yang tetap mempertimbangkan pengembangan jangka panjang.

```text
vanishcam/
├── README.md
├── pyproject.toml
├── uv.lock
├── .gitignore
├── .env.example
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   ├── TESTING.md
│   └── ADR/
│       ├── 0001-language-selection.md
│       ├── 0002-segmentation-engine.md
│       └── 0003-virtual-camera-output.md
│
├── config/
│   └── default.json
│
├── assets/
│   └── models/
│
├── src/
│   └── vanishcam/
│       ├── __init__.py
│       ├── main.py
│       │
│       ├── application/
│       │   ├── controller.py
│       │   └── state_machine.py
│       │
│       ├── camera/
│       │   ├── input.py
│       │   └── output.py
│       │
│       ├── segmentation/
│       │   ├── interface.py
│       │   ├── mediapipe_engine.py
│       │   └── mask_processor.py
│       │
│       ├── background/
│       │   ├── capture.py
│       │   ├── reference.py
│       │   └── reconstruction.py
│       │
│       ├── effects/
│       │   ├── compositor.py
│       │   ├── transition.py
│       │   └── effect_config.py
│       │
│       ├── audio/
│       │   ├── capture.py
│       │   ├── snap_detector.py
│       │   └── trigger_controller.py
│       │
│       ├── config/
│       │   ├── loader.py
│       │   └── schema.py
│       │
│       ├── diagnostics/
│       │   ├── logging_config.py
│       │   └── metrics.py
│       │
│       └── ui/
│           └── README.md
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
└── scripts/
    ├── check_environment.py
    └── run_prototype.py
```

Struktur ini merupakan titik awal, bukan kewajiban untuk membuat semua file sejak hari pertama.

Direktori `ui` nantinya dapat dikembangkan menjadi aplikasi desktop tersendiri. Apabila kita beralih ke Tauri, antarmuka dan komponen native dapat ditempatkan pada proyek frontend dan backend masing-masing tanpa mengubah konsep modul pemrosesan inti.

---

# 20. Coding Standards and Maintainability

## 20.1. Aturan Umum

- Gunakan nama variabel yang menjelaskan maksud.
- Hindari fungsi yang memiliki terlalu banyak tanggung jawab.
- Hindari logika aplikasi di dalam kode antarmuka.
- Hindari ketergantungan global yang tidak diperlukan.
- Gunakan type hints untuk fungsi Python.
- Gunakan formatter dan linter.
- Dokumentasikan fungsi yang memiliki perilaku tidak langsung terlihat.
- Pisahkan konfigurasi dari implementasi.
- Tambahkan pengujian untuk setiap perilaku penting.

## 20.2. Quality Tools

Kandidat:
- Ruff untuk linting dan formatting Python.
- pytest untuk pengujian.
- mypy atau pemeriksaan tipe lain jika diperlukan.
- Git untuk version control.
- GitHub Actions untuk pemeriksaan otomatis.

Tools tersebut dapat dipilih secara bertahap. Kita tidak harus mengadopsi seluruhnya sebelum prototipe berjalan.

## 20.3. Dependency Management

- Versi dependensi harus dicatat.
- Lockfile harus disimpan.
- Model AI harus memiliki informasi sumber dan lisensi.
- Pembaruan dependensi perlu diuji.
- Dependensi yang tidak lagi digunakan harus dihapus.

## 20.4. Architecture Decision Records

Keputusan penting harus dicatat dalam dokumen ADR.

Contoh:
- Mengapa Python dipilih untuk prototipe.
- Mengapa MediaPipe digunakan.
- Mengapa background statis menjadi metode awal.
- Mengapa kamera virtual dipilih sebagai jalur integrasi.
- Kapan perlu berpindah ke komponen native.

Dengan cara ini, keputusan arsitektur tidak hanya bergantung pada ingatan pengembang.

---

# 21. Risks and Mitigation

## Risk 1 — Background Tidak Cocok

**Penyebab:** kamera atau objek background bergerak.

**Dampak:** bagian gambar yang menggantikan tubuh terlihat tidak alami.

**Mitigasi:**
- Gunakan panduan pengambilan background.
- Deteksi perubahan visual yang signifikan.
- Minta pengguna mengambil ulang referensi jika diperlukan.
- Evaluasi metode rekonstruksi yang lebih adaptif.

## Risk 2 — Segmentasi Tidak Akurat

**Penyebab:** pencahayaan, gerakan cepat, pakaian, atau bentuk tubuh.

**Dampak:** sebagian tubuh tertinggal atau bagian background ikut terhapus.

**Mitigasi:**
- Uji beberapa model.
- Perbaiki pemrosesan mask.
- Gunakan temporal smoothing.
- Evaluasi model pada kondisi penggunaan nyata.

## Risk 3 — Performa Rendah

**Penyebab:** kemampuan CPU atau GPU terbatas.

**Dampak:** frame rate turun dan video terlihat tersendat.

**Mitigasi:**
- Uji resolusi lebih rendah.
- Optimalkan pipeline.
- Hindari pemrosesan frame yang tidak diperlukan.
- Pertimbangkan akselerasi yang tersedia.
- Ukur waktu setiap tahap sebelum melakukan optimasi.

## Risk 4 — Kamera Virtual Tidak Tersedia

**Penyebab:** modul kernel, izin, konfigurasi, atau perangkat virtual tidak sesuai.

**Dampak:** aplikasi rapat tidak menemukan kamera keluaran.

**Mitigasi:**
- Periksa lingkungan saat startup.
- Berikan panduan instalasi.
- Pisahkan error pemrosesan dan error perangkat virtual.
- Uji distribusi Ubuntu yang menjadi target.

## Risk 5 — Jentikan Salah Terdeteksi

**Penyebab:** noise atau suara yang menyerupai jentikan.

**Dampak:** efek berubah tanpa disengaja.

**Mitigasi:**
- Tambahkan ambang batas yang dapat dikonfigurasi.
- Tambahkan cooldown.
- Sediakan kontrol sensitivitas.
- Pertahankan tombol manual sebagai alternatif.

## Risk 6 — Ketergantungan Library

**Penyebab:** perubahan API atau ketidakcocokan versi.

**Dampak:** aplikasi tidak dapat dijalankan setelah pembaruan.

**Mitigasi:**
- Kunci versi dependensi.
- Tambahkan pengujian integrasi.
- Dokumentasikan versi yang diketahui bekerja.
- Pisahkan interface dari implementasi library.

## Risk 7 — Perbedaan Platform

**Penyebab:** cara kerja perangkat kamera virtual berbeda pada setiap sistem operasi.

**Dampak:** aplikasi bekerja pada Ubuntu tetapi tidak otomatis bekerja di Windows atau macOS.

**Mitigasi:**
- Pisahkan adapter platform.
- Hindari ketergantungan platform di dalam algoritma inti.
- Buat pengujian khusus untuk setiap target.
- Jangan menjanjikan kompatibilitas sebelum diuji.

---

# 22. Success Metrics

Keberhasilan proyek harus diukur dengan indikator yang dapat diamati.

## Product Metrics

- Pengguna berhasil menjalankan preview kamera.
- Pengguna berhasil mengambil background referensi.
- Efek dapat diaktifkan dan dinonaktifkan.
- Video keluaran dapat digunakan pada aplikasi target yang telah diuji.
- Pengguna dapat memahami pesan kesalahan.

## Technical Metrics

- Frame rate aktual.
- Waktu pemrosesan setiap frame.
- Persentase frame yang terlewat.
- Konsistensi mask.
- Jumlah false positive pada deteksi jentikan.
- Penggunaan CPU dan RAM.
- Tingkat keberhasilan pengujian otomatis.

## Maintainability Metrics

- Modul penting memiliki pengujian.
- Perubahan implementasi tidak memerlukan modifikasi di banyak komponen yang tidak terkait.
- Keputusan arsitektur terdokumentasi.
- Proses instalasi dan pengujian dapat diulang.
- Versi dependensi diketahui.

---

# 23. Definition of Done

Sebuah fitur dianggap selesai jika:

1. Persyaratan fungsionalnya terpenuhi.
2. Kode mengikuti struktur dan standar proyek.
3. Pengujian yang relevan berhasil.
4. Penanganan error telah dipertimbangkan.
5. Dokumentasi diperbarui.
6. Tidak ada dependensi yang tidak terdokumentasi.
7. Hasilnya telah diuji pada lingkungan target yang sesuai.
8. Tidak ada klaim kompatibilitas yang belum diverifikasi.

Untuk fitur yang berhubungan dengan video real-time, Definition of Done juga harus mencakup pemeriksaan kualitas visual dan performa.

---

# 24. Assumptions and Open Questions

Beberapa hal masih perlu dipastikan sebelum implementasi.

## Environment

- Versi Ubuntu yang digunakan.
- Model CPU dan GPU.
- Jumlah RAM.
- Resolusi kamera.
- Jenis sesi desktop, seperti Wayland atau X11.
- Browser yang digunakan untuk Google Meet.
- Versi aplikasi Zoom.

## Product Behavior

- Apakah efek harus diaktifkan hanya dengan jentikan atau juga dengan tombol?
- Apakah background akan selalu statis?
- Apakah pengguna ingin efek asap atau partikel?
- Berapa durasi transisi yang terasa alami?
- Apakah suara jentikan harus berasal dari mikrofon yang sama dengan mikrofon rapat?

## Distribution

- Apakah aplikasi akan digunakan sendiri terlebih dahulu?
- Apakah nantinya ingin dibagikan kepada pengguna lain?
- Apakah target distribusi awal berupa paket Ubuntu, AppImage, atau format lain?

Pertanyaan tersebut tidak harus semuanya dijawab sekarang. Namun, spesifikasi perangkat keras dan lingkungan kamera virtual perlu diketahui sebelum target performa ditetapkan.

---

# 25. Final Technical Recommendation

Rekomendasi awal untuk VanishCam adalah:

**Tahap pertama:**
- Python.
- OpenCV.
- MediaPipe.
- Background reference capture.
- Compositing dan transition engine.
- Kamera virtual berbasis ekosistem Linux.

**Tahap kedua:**
- Deteksi jentikan.
- Antarmuka pengguna.
- Pengelolaan konfigurasi.
- Diagnostik dan pengujian integrasi.

**Tahap ketiga:**
- Evaluasi performa.
- Penyempurnaan rekonstruksi background.
- Packaging aplikasi.
- Validasi Zoom dan Google Meet.

**Tahap keempat:**
- Evaluasi migrasi atau integrasi dengan Tauri dan Rust.
- Implementasi adapter untuk platform tambahan.
- Pengembangan efek visual lanjutan.

Keputusan berpindah teknologi harus berdasarkan pengukuran dan kebutuhan nyata. Kita tidak perlu membangun sistem yang terlalu kompleks sebelum mengetahui apakah efek utama dapat bekerja dengan baik.

---

# 26. Penutup

VanishCam bukan sekadar extension untuk menyembunyikan video. Produk ini merupakan sistem pemrosesan video real-time yang harus menggabungkan computer vision, rekonstruksi background, manajemen transisi, pemicu audio, dan integrasi kamera virtual.

Karena itu, strategi pengembangan yang paling aman adalah membuktikan kelayakan efek utama terlebih dahulu, kemudian membangun antarmuka dan integrasi platform di atas fondasi tersebut.

**Prioritas pertama proyek adalah menghasilkan video yang benar-benar memperlihatkan background tanpa tubuh pengguna.**

Setelah kemampuan tersebut terbukti, fitur jentikan jari, animasi, dukungan berbagai aplikasi, dan distribusi lintas platform dapat dikembangkan secara bertahap.

PRD ini menjadi dokumen dasar yang dapat diperbarui berdasarkan hasil eksperimen, pengujian, dan keputusan arsitektur selama proyek berlangsung.