import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig: Record<string, { label: string; className: string }> = {
  menunggu: { label: "Menunggu", className: "status-waiting" },
  sedang_diperiksa: { label: "Sedang Diperiksa", className: "status-inprogress" },
  selesai: { label: "Selesai", className: "status-completed" },
};

interface Kunjungan {
  id: string;
  tanggal: string;
  waktu: string;
  nomor_antrian: number | null;
  status: string;
  dokter: {
    id: string;
    nama: string;
    user_id: string | null;
  } | null;
  pasien: {
    id: string;
    nama_lengkap: string;
  } | null;
}

export function RecentVisits() {
  const { user, role } = useAuth();
  const [visits, setVisits] = useState<Kunjungan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentVisits();
  }, [user, role]);

  const fetchRecentVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('kunjungan')
        .select(`
          id,
          tanggal,
          waktu,
          nomor_antrian,
          status,
          dokter:dokter_id (id, nama, user_id),
          pasien:pasien_id (id, nama_lengkap)
        `)
        .order('tanggal', { ascending: false })
        .order('waktu', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching visits:', error);
        return;
      }

      let filtered = data as unknown as Kunjungan[];

      // For dokter role, filter only their patients
      if (role === 'dokter' && user) {
        filtered = filtered.filter(k => k.dokter?.user_id === user.id);
      }

      setVisits(filtered.slice(0, 5));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stat-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Kunjungan Terbaru
        </h3>
        <Clock className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))
        ) : visits.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Belum ada kunjungan
          </div>
        ) : (
          visits.map((kunjungan) => {
            const status = statusConfig[kunjungan.status] || { 
              label: kunjungan.status, 
              className: "status-waiting" 
            };
            
            return (
              <div 
                key={kunjungan.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {kunjungan.nomor_antrian || "-"}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {kunjungan.pasien?.nama_lengkap || "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {kunjungan.dokter?.nama || "Unknown"} • {kunjungan.waktu?.slice(0, 5)}
                    </p>
                  </div>
                </div>
                <span className={status.className}>
                  {status.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
