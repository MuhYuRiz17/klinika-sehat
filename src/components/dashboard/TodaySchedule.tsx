import { Calendar, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface JadwalWithDokter {
  id: string;
  jam_mulai: string;
  jam_selesai: string;
  kuota: number;
  dokter: {
    nama: string;
    spesialisasi: string;
  };
}

export function TodaySchedule() {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const today = days[new Date().getDay()];

  const { data: todaySchedules = [], isLoading } = useQuery({
    queryKey: ['today-schedule', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jadwal_praktik')
        .select(`
          id,
          jam_mulai,
          jam_selesai,
          kuota,
          dokter:dokter_id (
            nama,
            spesialisasi
          )
        `)
        .eq('hari', today)
        .order('jam_mulai');
      
      if (error) throw error;
      return data as unknown as JadwalWithDokter[];
    },
  });

  return (
    <div className="stat-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Jadwal Hari Ini
        </h3>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : todaySchedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="mb-2 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Tidak ada jadwal praktik hari ini
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {todaySchedules.map((jadwal) => (
            <div 
              key={jadwal.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
                <User className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {jadwal.dokter?.nama || "Unknown"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {jadwal.dokter?.spesialisasi}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">
                  {jadwal.jam_mulai} - {jadwal.jam_selesai}
                </p>
                <p className="text-sm text-muted-foreground">
                  Kuota: {jadwal.kuota} pasien
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
