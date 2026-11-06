# Portofolio Profesional - Trista Hana Qonita Rahmawati

Portofolio digital modern, elegan, dan profesional yang dirancang khusus untuk melamar posisi magang (*internship*) dan operasional di perusahaan terkemuka.

Dibuat dengan standar desain ketat **Anti-Slop** ([github.com/miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop)), tipografi **Montserrat**, palet warna **Biru & Hitam**, serta dilengkapi **Sistem Pengaturan Backend (CMS)** untuk mengunggah foto, menambah tautan dokumentasi yang dapat diklik (*clickable links*), dan memperbarui keterangan portofolio secara dinamis.

---

## 🌟 Fitur Utama & Pembaruan

### 1. Tampilan Publik Murni Rekruter (Pure Recruiter Experience)
* **Bebas Tombol Backend Publik:** Tidak ada tombol "Pengaturan Backend" di navigasi, footer, maupun tombol mengapung. Rekruter hanya melihat portofolio profesional yang murni dan bersih.
* **Bebas Formulir Pertanyaan & Cetak PDF:** Tombol cetak PDF dihilangkan, dan formulir pengisian pesan digantikan oleh **Saluran Kontak Langsung** (Email resmi, WhatsApp langsung, LinkedIn, dan Instagram) dengan tombol aksi cepat 1-klik.
* **Animasi Gulir Halus Nyaman (Gaya Maya Career Coaching / Lovable):**
  * **Bilah Kemajuan Membaca (*Scroll Progress Bar*):** Garis indikator gradien biru tipis di puncak layar yang mengikuti progres membaca halaman (0% s.d. 100%).
  * **Efek Muncul Bertahap (*Scroll-Triggered Staggered Reveal*):** Kartu, metrik, dan teks muncul perlahan ke atas (*fade-up & scale*) dengan ritme jeda bertahap (*stagger timing*) sehingga sangat nyaman di mata.
  * **Tombol Kembali ke Atas (*Back to Top*):** Tombol elegan di sudut kanan bawah yang otomatis muncul saat halaman digulir melebihi 320px untuk kembali ke atas dengan halus.
  * **Navigasi Aktif Otomatis (*Scrollspy*):** Menu atas menandai bagian yang sedang dibaca secara otomatis.

---

### 2. Pusat Kendali Backend & CMS Lengkap (`/admin`)

Untuk menjaga kerahasiaan pengaturan dari rekruter, backend dapat dibuka melalui salah satu cara berikut:
1. Buka alamat langsung di browser: **`http://localhost:3000/admin`**
2. Atau saat membuka halaman web portofolio, tekan tombol kombinasi rahasia: **`Ctrl + Shift + A`** (atau klik 3 kali cepat pada logo **"TH"** di pojok kiri atas).

**Di dalam panel backend, Anda dapat mengubah SEGALA teks dan tata letak secara bebas:**
* **🔀 Tata Letak & Urutan Bagian (*Layout Manager*):**
  * Sembunyikan atau tampilkan bagian mana pun dengan mencentang kotak *checkbox*.
  * Pindahkan urutan tampilan bagian ke atas atau ke bawah (Naik ▲ / Turun ▼) sesuka hati!
* **👤 Cover & Identitas:** Ubah nama, judul, bio eksekutif, kata kunci HR, dan unggah foto profil formal.
* **💬 Intro & Sambutan:** Sesuaikan teks sambutan dan kutipan visi operasional.
* **🎓 Profil & Akademik:** Ubah IPK (3.88), SKS (84 SKS), universitas, jurusan, asal SMA, serta daftar keahlian, mata kuliah relevan, dan alat kerja.
* **📊 Bilah Metrik:** Tambah, edit, dan hapus angka metrik pencapaian (220+ Pelamar, 9/10 Kepuasan, dll.).
* **📑 Kelola Bab (*Chapters*):** Tambah bab baru, ubah nomor, judul, dan deskripsi kategori.
* **💼 Item Portofolio:** Tambah dan edit proyek, **unggah foto** (otomatis tersimpan ke folder `uploads/`), **tambah tautan dokumentasi Google Drive/Sheets/PPT yang bisa diklik**, serta buat alur **Stepping Stones** langkah demi langkah.
* **☕ Frontline Experience:** Sesuaikan pilar operasional dan riwayat penempatan kerja lapangan.
* **📬 Saluran Kontak:** Perbarui email, nomor WhatsApp, LinkedIn, dan Instagram.
* **💾 Cadangan Data:** Ekspor cadangan JSON dalam 1 klik atau pulihkan data kapan saja.

---

## 🚀 Cara Menjalankan Portofolio & Backend Server

### Cara 1: Menggunakan Server Backend Lokal (Sangat Direkomendasikan)
Server backend dibuat menggunakan native PowerShell HTTP socket server tanpa memerlukan instalasi Node.js atau Python tambahan:
1. Klik dua kali (*double click*) file **`start-portfolio.bat`**.
2. Browser Anda akan terbuka secara otomatis di alamat:
   ```text
   http://localhost:3000
   ```
3. Server lokal akan aktif dan melayani API penyimpanan permanen ke file `data/portfolio.json` serta penyimpanan foto ke folder `uploads/`.

### Cara 2: Membuka Langsung di Browser (Mode Standalone Offline)
1. Klik dua kali file **`index.html`** langsung dari File Explorer Windows.
2. Portofolio akan berjalan 100% menggunakan memori lokal browser (*LocalStorage*) sehingga tetap dapat digunakan, diedit, dan ditampilkan tanpa server aktif.

---

## 📁 Struktur Berkas Proyek

```text
PORTOFOLIO/
├── index.html            # Antarmuka web utama portofolio (SPA)
├── styles.css            # Styling profesional Montserrat, Biru & Hitam (Anti-Slop)
├── app.js                # Logika frontend, interaksi modal, dan sinkronisasi CMS
├── server.ps1            # Server backend REST API native PowerShell (Port 3000)
├── start-portfolio.bat   # Peluncur otomatis 1-klik Windows
├── README.md             # Dokumentasi petunjuk penggunaan
├── antislop-check.md     # Laporan audit kepatuhan aturan Anti-Slop (Delivery Gate)
├── data/
│   └── portfolio.json    # Basis data terstruktur portofolio Trista Hana
└── uploads/              # Folder penyimpanan file foto yang diunggah
```

---

## 🎨 Kepatuhan Desain Anti-Slop
* **Bebas Gradien Ungu Klise:** Menggunakan kombinasi warna hitam pekat (*obsidian black* `#070A10`), latar navy gelap (`#0E1626`), dan biru profesional (`#2563EB`, `#3B82F6`, `#60A5FA`).
* **Bebas Kata Klise AI:** Kalimat disusun secara lugas, berfokus pada metrik operasional riil (SOP, alur seleksi pelamar, OKR, SLA, kepatuhan administrasi).
* **Aturan R-02 Terpenuhi:** Bebas tanda hubung em dash (`—`). Semua pemisah menggunakan tanda koma, titik dua, atau kurung.
* **Tipografi Montserrat:** Menggunakan hirarki bobot tipografi Montserrat (300 s.d. 800) dengan keterbacaan tinggi.

