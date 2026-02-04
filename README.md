
# AETERNA - AI Trading Robot v11.8

Platform Robot Trading Cerdas dengan visual 3D elegan yang terkoneksi langsung ke Binance API.

## 🚀 Fitur Utama
- **Neural Core**: Analisis pasar menggunakan Gemini 3 Pro & DeepSeek R1.
- **Quantum Handshake**: Koneksi otomatis ke Binance berdasarkan Signature Perangkat.
- **Creative Lab**: Pembuatan gambar, video (Veo), dan podcast berita pasar secara otomatis.
- **Master Node Security**: Penguncian API Key otomatis hanya pada perangkat terdaftar.

## 🛠️ Cara Install (Lokal)
1. Clone repositori ini.
2. Jalankan `npm install`.
3. Buat file `.env` dan masukkan `API_KEY=kunci_gemini_anda`.
4. Jalankan `npm run dev`.

## 🌍 Cara Deploy ke Hugging Face Spaces
1. Buat **New Space** di Hugging Face.
2. Pilih SDK: **Docker**.
3. Pilih **Blank** atau template Docker lainnya.
4. Pergi ke tab **Settings** di Space Anda, cari **Variables and secrets**, tambahkan:
   - Key: `API_KEY`
   - Value: (Kunci API Gemini Anda)
5. Unggah semua file project ini (termasuk `Dockerfile` yang baru dibuat).
6. Hugging Face akan otomatis melakukan "Building" dan "Running". 
7. Website akan terbuka di link `https://huggingface.co/spaces/USERNAME/NAMA_SPACE`.

## 🌍 Cara Deploy ke Vercel
1. Upload ke GitHub (Private).
2. Hubungkan ke Vercel dan tambahkan `API_KEY` di Environment Variables.
3. Klik Deploy.

## ⚠️ Keamanan Perangkat
Saat pertama kali dijalankan, masuk ke menu **Settings**. Gunakan Lisensi Admin `dasopano21` untuk mengunci perangkat sebagai Master Node.

---
Created by Hamli | Aeterna Project 2026
