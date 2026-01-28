
# Rencana Implementasi Chatbot Portal Pasien

## Ringkasan
Menambahkan fitur chatbot AI pada portal pasien yang dapat memberikan informasi tentang:
- Informasi antrian pasien
- Jadwal layanan dan dokter  
- Estimasi waktu tunggu (sederhana)
- Panduan alur layanan klinik

Chatbot akan menggunakan Lovable AI (tidak memerlukan API key dari user) dengan streaming response untuk pengalaman yang responsif.

## Arsitektur

```text
+-------------------+     +----------------------+     +------------------+
|   PatientLayout   |     |   Edge Function      |     |   Lovable AI     |
|   + ChatWidget    | --> |   patient-chatbot    | --> |   Gateway        |
+-------------------+     +----------------------+     +------------------+
        |                          |
        v                          v
+-------------------+     +----------------------+
|   PatientChatbot  |     |   Supabase DB        |
|   Component       |     |   (jadwal, kunjungan,|
+-------------------+     |    dokter, pasien)   |
                          +----------------------+
```

## Komponen yang Akan Dibuat

### 1. Edge Function: `patient-chatbot`
**File:** `supabase/functions/patient-chatbot/index.ts`

Fungsi backend yang akan:
- Menerima pesan dari pasien
- Query database untuk mendapatkan data real-time (antrian, jadwal, dll)
- Mengirim prompt + context ke Lovable AI
- Streaming response ke frontend

**Context yang akan di-inject ke AI:**
- Jadwal praktik semua dokter
- Status antrian hari ini
- Data kunjungan pasien (jika authenticated)
- Panduan alur layanan klinik (hardcoded knowledge)

### 2. Chat Widget Component
**File:** `src/components/patient-portal/PatientChatWidget.tsx`

Floating chat button di pojok kanan bawah yang:
- Toggle chat window
- Menampilkan badge notifikasi

### 3. Chatbot Component  
**File:** `src/components/patient-portal/PatientChatbot.tsx`

Chat interface yang akan:
- Menampilkan history percakapan
- Input untuk mengirim pesan
- Quick reply buttons untuk pertanyaan umum
- Streaming AI response
- Render markdown untuk response

### 4. Update PatientLayout
Menambahkan ChatWidget ke layout pasien agar muncul di semua halaman portal pasien.

## Fitur Chatbot

### 1. Informasi Antrian Pasien
- Nomor antrian pasien hari ini
- Jumlah pasien dalam antrian per dokter
- Status antrian (sedang dilayani, menunggu)

### 2. Jadwal Layanan dan Dokter
- Jadwal praktik semua dokter
- Hari dan jam praktik
- Spesialisasi dokter
- Ketersediaan kuota

### 3. Estimasi Waktu Tunggu
- Kalkulasi sederhana berdasarkan:
  - Posisi antrian
  - Rata-rata waktu pelayanan per pasien (asumsi 15 menit)
  - Jam praktik dokter

### 4. Panduan Alur Layanan
- Cara booking kunjungan
- Dokumen yang diperlukan
- Alur dari pendaftaran sampai selesai
- FAQ umum

## Quick Reply Buttons
Tombol cepat untuk pertanyaan umum:
- "Lihat nomor antrian saya"
- "Jadwal dokter hari ini"
- "Cara booking kunjungan"
- "Estimasi waktu tunggu"

---

## Detail Teknis

### Edge Function Logic

```text
1. Terima request dengan { messages, userId? }
2. Fetch data dari database:
   - Jadwal praktik hari ini
   - Antrian menunggu hari ini
   - Kunjungan pasien (jika authenticated)
3. Buat system prompt dengan context:
   - Data jadwal dan antrian
   - Panduan layanan klinik
   - Instruksi untuk menjawab dalam Bahasa Indonesia
4. Kirim ke Lovable AI dengan streaming
5. Return stream response
```

### System Prompt Template

```text
Kamu adalah asisten virtual Klinik Pratama. Tugasmu membantu pasien dengan:
1. Informasi antrian dan jadwal
2. Estimasi waktu tunggu
3. Panduan alur layanan

DATA HARI INI:
[Inject jadwal dan antrian dari database]

PANDUAN LAYANAN:
[Inject alur layanan klinik]

Jawab dengan ramah, singkat, dan dalam Bahasa Indonesia.
```

### Frontend Streaming

```text
1. User ketik pesan -> POST ke edge function
2. Terima SSE stream
3. Parse tiap chunk dan append ke message
4. Render dengan react-markdown
```

## File yang Akan Dibuat/Diubah

| File | Aksi | Deskripsi |
|------|------|-----------|
| `supabase/functions/patient-chatbot/index.ts` | Buat | Edge function untuk AI chatbot |
| `src/components/patient-portal/PatientChatWidget.tsx` | Buat | Floating chat button |
| `src/components/patient-portal/PatientChatbot.tsx` | Buat | Chat interface component |
| `src/components/layout/PatientLayout.tsx` | Update | Tambah ChatWidget |
| `supabase/config.toml` | Update | Register edge function |

## Dependencies Baru
- `react-markdown` - untuk render markdown di chat response

## Estimasi Implementasi
1. Buat edge function dengan Lovable AI integration
2. Buat komponen ChatWidget (floating button)
3. Buat komponen PatientChatbot (chat interface)
4. Integrasikan ke PatientLayout
5. Testing end-to-end

