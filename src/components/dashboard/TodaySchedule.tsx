import { Calendar, User } from "lucide-react";
import { dokterData, jadwalPraktikData } from "@/lib/mockData";

export function TodaySchedule() {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const today = days[new Date().getDay()];
  
  const todaySchedules = jadwalPraktikData.filter(j => j.hari === today);

  return (
    <div className="stat-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Jadwal Hari Ini
        </h3>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </div>

      {todaySchedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="mb-2 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Tidak ada jadwal praktik hari ini
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {todaySchedules.map((jadwal) => {
            const dokter = dokterData.find(d => d.id === jadwal.dokterId);
            return (
              <div 
                key={jadwal.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
                  <User className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {dokter?.namaDokter || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dokter?.spesialisasi}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {jadwal.jamMulai} - {jadwal.jamSelesai}
                  </p>
                  {jadwal.kuotaPasien && (
                    <p className="text-sm text-muted-foreground">
                      Kuota: {jadwal.kuotaPasien} pasien
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
