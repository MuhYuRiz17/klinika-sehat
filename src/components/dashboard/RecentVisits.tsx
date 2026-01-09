import { Clock } from "lucide-react";
import { kunjunganData, getPasienById, getDokterById, formatTanggal } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  menunggu: { label: "Menunggu", className: "status-waiting" },
  sedang_diperiksa: { label: "Sedang Diperiksa", className: "status-inprogress" },
  selesai: { label: "Selesai", className: "status-completed" },
};

export function RecentVisits() {
  const recentVisits = [...kunjunganData]
    .sort((a, b) => new Date(b.tanggalWaktu).getTime() - new Date(a.tanggalWaktu).getTime())
    .slice(0, 5);

  return (
    <div className="stat-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Kunjungan Terbaru
        </h3>
        <Clock className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <div className="space-y-4">
        {recentVisits.map((kunjungan) => {
          const pasien = getPasienById(kunjungan.pasienId);
          const dokter = getDokterById(kunjungan.dokterId);
          const status = statusConfig[kunjungan.statusKunjungan];
          
          return (
            <div 
              key={kunjungan.id}
              className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {kunjungan.nomorAntrian}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {pasien?.namaLengkap || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dokter?.namaDokter || "Unknown"} • {kunjungan.tanggalWaktu.split(' ')[1]}
                  </p>
                </div>
              </div>
              <span className={status.className}>
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
