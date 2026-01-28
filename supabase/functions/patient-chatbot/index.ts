import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fungsi untuk mendapatkan nama hari dalam Bahasa Indonesia
function getHariIndonesia(date: Date): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[date.getDay()];
}

// Format tanggal Indonesia
function formatTanggal(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const hariIni = getHariIndonesia(today);

    // Fetch jadwal praktik hari ini
    const { data: jadwalHariIni } = await supabase
      .from("jadwal_praktik")
      .select(`
        id,
        hari,
        jam_mulai,
        jam_selesai,
        kuota,
        dokter:dokter_id (
          id,
          nama,
          spesialisasi
        )
      `)
      .eq("hari", hariIni);

    // Fetch semua jadwal praktik
    const { data: semuaJadwal } = await supabase
      .from("jadwal_praktik")
      .select(`
        id,
        hari,
        jam_mulai,
        jam_selesai,
        kuota,
        dokter:dokter_id (
          id,
          nama,
          spesialisasi
        )
      `)
      .order("hari");

    // Fetch antrian hari ini (kunjungan dengan status menunggu)
    const { data: antrianHariIni } = await supabase
      .from("kunjungan")
      .select(`
        id,
        nomor_antrian,
        status,
        waktu,
        dokter:dokter_id (
          id,
          nama,
          spesialisasi
        ),
        pasien:pasien_id (
          id,
          nama_lengkap
        )
      `)
      .eq("tanggal", todayStr)
      .in("status", ["menunggu", "diperiksa"])
      .order("nomor_antrian");

    // Jika user authenticated, fetch data kunjungan pasien
    let dataKunjunganPasien = null;
    if (userId) {
      // Get pasien_id from user_id
      const { data: pasienData } = await supabase
        .from("pasien")
        .select("id, nama_lengkap")
        .eq("user_id", userId)
        .single();

      if (pasienData) {
        // Fetch kunjungan pasien hari ini
        const { data: kunjunganPasien } = await supabase
          .from("kunjungan")
          .select(`
            id,
            nomor_antrian,
            status,
            waktu,
            tanggal,
            dokter:dokter_id (
              nama,
              spesialisasi
            )
          `)
          .eq("pasien_id", pasienData.id)
          .eq("tanggal", todayStr)
          .order("waktu");

        dataKunjunganPasien = {
          nama: pasienData.nama_lengkap,
          kunjungan: kunjunganPasien || [],
        };
      }
    }

    // Hitung statistik antrian per dokter
    const antrianPerDokter: Record<string, { menunggu: number; sedangDilayani: number; dokterNama: string }> = {};
    if (antrianHariIni) {
      for (const antrian of antrianHariIni) {
        const dokterId = (antrian.dokter as any)?.id;
        const dokterNama = (antrian.dokter as any)?.nama || "Unknown";
        if (dokterId) {
          if (!antrianPerDokter[dokterId]) {
            antrianPerDokter[dokterId] = { menunggu: 0, sedangDilayani: 0, dokterNama };
          }
          if (antrian.status === "menunggu") {
            antrianPerDokter[dokterId].menunggu++;
          } else if (antrian.status === "diperiksa") {
            antrianPerDokter[dokterId].sedangDilayani++;
          }
        }
      }
    }

    // Build context for AI
    let contextData = `
TANGGAL HARI INI: ${formatTanggal(today)}

=== JADWAL PRAKTIK HARI INI (${hariIni}) ===
`;

    if (jadwalHariIni && jadwalHariIni.length > 0) {
      for (const jadwal of jadwalHariIni) {
        const dokter = jadwal.dokter as any;
        const stats = antrianPerDokter[dokter?.id] || { menunggu: 0, sedangDilayani: 0 };
        contextData += `
- Dr. ${dokter?.nama || "Unknown"} (${dokter?.spesialisasi || "Umum"})
  Jam: ${jadwal.jam_mulai} - ${jadwal.jam_selesai}
  Kuota: ${jadwal.kuota} pasien
  Antrian menunggu: ${stats.menunggu} orang
  ${stats.sedangDilayani > 0 ? `Sedang melayani: 1 pasien` : ""}
`;
      }
    } else {
      contextData += "Tidak ada jadwal praktik hari ini.\n";
    }

    contextData += `
=== JADWAL PRAKTIK MINGGUAN ===
`;
    const jadwalPerHari: Record<string, typeof semuaJadwal> = {};
    if (semuaJadwal) {
      for (const jadwal of semuaJadwal) {
        if (!jadwalPerHari[jadwal.hari]) {
          jadwalPerHari[jadwal.hari] = [];
        }
        jadwalPerHari[jadwal.hari]!.push(jadwal);
      }

      const urutanHari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
      for (const hari of urutanHari) {
        const jadwalHari = jadwalPerHari[hari];
        if (jadwalHari && jadwalHari.length > 0) {
          contextData += `\n${hari}:\n`;
          for (const jadwal of jadwalHari) {
            const dokter = jadwal.dokter as any;
            contextData += `  - Dr. ${dokter?.nama} (${dokter?.spesialisasi}): ${jadwal.jam_mulai} - ${jadwal.jam_selesai}, Kuota: ${jadwal.kuota}\n`;
          }
        }
      }
    }

    // Info kunjungan pasien jika authenticated
    if (dataKunjunganPasien) {
      contextData += `
=== DATA KUNJUNGAN PASIEN (${dataKunjunganPasien.nama}) ===
`;
      if (dataKunjunganPasien.kunjungan.length > 0) {
        for (const kunjungan of dataKunjunganPasien.kunjungan) {
          const dokter = kunjungan.dokter as any;
          contextData += `
- Nomor Antrian: ${kunjungan.nomor_antrian}
  Dokter: Dr. ${dokter?.nama} (${dokter?.spesialisasi})
  Waktu: ${kunjungan.waktu}
  Status: ${kunjungan.status}
`;
          // Estimasi waktu tunggu
          if (kunjungan.status === "menunggu" && kunjungan.nomor_antrian) {
            const dokterId = Object.keys(antrianPerDokter).find(
              (id) => antrianPerDokter[id].dokterNama === dokter?.nama
            );
            if (dokterId) {
              const antrianSebelum = antrianHariIni?.filter(
                (a) =>
                  (a.dokter as any)?.nama === dokter?.nama &&
                  a.status === "menunggu" &&
                  (a.nomor_antrian || 0) < kunjungan.nomor_antrian!
              ).length || 0;
              const estimasiMenit = antrianSebelum * 15; // 15 menit per pasien
              contextData += `  Estimasi waktu tunggu: ${estimasiMenit} menit (${antrianSebelum} pasien sebelum Anda)\n`;
            }
          }
        }
      } else {
        contextData += "Tidak ada kunjungan terdaftar untuk hari ini.\n";
      }
    }

    const systemPrompt = `Kamu adalah asisten virtual Klinik Pratama yang ramah dan membantu. Tugasmu adalah membantu pasien dengan informasi tentang:

1. **Informasi Antrian**: Nomor antrian pasien, jumlah pasien dalam antrian, status antrian
2. **Jadwal Dokter**: Jadwal praktik dokter, spesialisasi, jam praktik
3. **Estimasi Waktu Tunggu**: Berdasarkan posisi antrian (asumsi 15 menit per pasien)
4. **Panduan Alur Layanan**: Cara booking, dokumen yang diperlukan, alur pelayanan

${contextData}

=== PANDUAN ALUR LAYANAN KLINIK ===

**Cara Booking Kunjungan:**
1. Login ke portal pasien
2. Pilih menu "Booking Kunjungan"
3. Pilih dokter dan jadwal yang tersedia
4. Konfirmasi booking
5. Catat nomor antrian Anda

**Dokumen yang Diperlukan:**
- Kartu identitas (KTP/SIM)
- Kartu BPJS (jika menggunakan BPJS)
- Kartu berobat klinik (untuk pasien lama)

**Alur Pelayanan:**
1. Datang 15 menit sebelum jadwal
2. Registrasi di loket pendaftaran
3. Tunggu di ruang tunggu sesuai nomor antrian
4. Pemeriksaan oleh dokter
5. Pengambilan obat di apotek (jika ada resep)
6. Pembayaran di kasir

**Jam Operasional Klinik:**
Senin - Sabtu: 08:00 - 20:00
Minggu: 09:00 - 15:00

INSTRUKSI PENTING:
- Jawab dengan ramah, singkat, dan jelas dalam Bahasa Indonesia
- Gunakan emoji untuk membuat percakapan lebih friendly 😊
- Jika pasien bertanya tentang hal di luar konteks klinik, arahkan kembali ke layanan klinik
- Jika data tidak tersedia, sampaikan dengan sopan dan sarankan untuk menghubungi CS
- Untuk estimasi waktu tunggu, gunakan rumus: posisi_antrian x 15 menit
- Selalu tawarkan bantuan lebih lanjut di akhir jawaban`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("patient-chatbot error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
