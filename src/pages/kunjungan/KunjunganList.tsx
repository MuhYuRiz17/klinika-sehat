import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Eye, FileText, Calendar } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  catatan: string | null;
  dokter: {
    id: string;
    nama: string;
    spesialisasi: string;
    user_id: string | null;
  } | null;
  pasien: {
    id: string;
    nama_lengkap: string;
    no_rm: string;
  } | null;
}

interface Dokter {
  id: string;
  nama: string;
  user_id: string | null;
}

export default function KunjunganList() {
  const { user, role } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDokter, setFilterDokter] = useState<string>("all");
  const [kunjunganList, setKunjunganList] = useState<Kunjungan[]>([]);
  const [dokterList, setDokterList] = useState<Dokter[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDokterId, setCurrentDokterId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user, role]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch dokter list for filter dropdown
      const { data: dokterData } = await supabase
        .from('dokter')
        .select('id, nama, user_id')
        .order('nama');
      
      if (dokterData) {
        setDokterList(dokterData);
        
        // Find current dokter if user is a dokter
        if (role === 'dokter' && user) {
          const myDokter = dokterData.find(d => d.user_id === user.id);
          if (myDokter) {
            setCurrentDokterId(myDokter.id);
          }
        }
      }

      // Build kunjungan query
      let query = supabase
        .from('kunjungan')
        .select(`
          id,
          tanggal,
          waktu,
          nomor_antrian,
          status,
          catatan,
          dokter:dokter_id (id, nama, spesialisasi, user_id),
          pasien:pasien_id (id, nama_lengkap, no_rm)
        `)
        .order('tanggal', { ascending: false })
        .order('waktu', { ascending: false });

      const { data: kunjunganData, error } = await query;

      if (error) {
        console.error('Error fetching kunjungan:', error);
      } else if (kunjunganData) {
        // Filter for dokter role - only show their own patients
        let filtered = kunjunganData as unknown as Kunjungan[];
        if (role === 'dokter' && user) {
          const myDokter = dokterData?.find(d => d.user_id === user.id);
          if (myDokter) {
            filtered = filtered.filter(k => k.dokter?.id === myDokter.id);
          }
        }
        setKunjunganList(filtered);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredKunjungan = kunjunganList.filter((kunjungan) => {
    const matchesSearch = 
      kunjungan.pasien?.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kunjungan.pasien?.no_rm.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || kunjungan.status === filterStatus;
    const matchesDokter = filterDokter === "all" || kunjungan.dokter?.id === filterDokter;
    return matchesSearch && matchesStatus && matchesDokter;
  });

  const formatTanggalWaktu = (tanggal: string, waktu: string) => {
    const date = new Date(tanggal);
    const formatted = date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    return `${formatted} ${waktu.slice(0, 5)}`;
  };

  return (
    <MainLayout title="Kunjungan">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Daftar Kunjungan</h1>
            <p className="page-subtitle">Kelola kunjungan pasien ke klinik</p>
          </div>
          {role === 'admin' && (
            <Button asChild className="gradient-primary border-0">
              <Link to="/kunjungan/tambah">
                <Plus className="mr-2 h-4 w-4" />
                Buat Kunjungan
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari pasien atau No. RM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="menunggu">Menunggu</SelectItem>
              <SelectItem value="sedang_diperiksa">Sedang Diperiksa</SelectItem>
              <SelectItem value="selesai">Selesai</SelectItem>
            </SelectContent>
          </Select>
          {role === 'admin' && (
            <Select value={filterDokter} onValueChange={setFilterDokter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Dokter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Dokter</SelectItem>
                {dokterList.map((dokter) => (
                  <SelectItem key={dokter.id} value={dokter.id}>
                    {dokter.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Table */}
        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>No. Antrian</TableHead>
                <TableHead>Tanggal & Waktu</TableHead>
                <TableHead>Pasien</TableHead>
                <TableHead>Dokter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredKunjungan.map((kunjungan) => {
                  const status = statusConfig[kunjungan.status] || { 
                    label: kunjungan.status, 
                    className: "status-waiting" 
                  };
                  
                  return (
                    <TableRow key={kunjungan.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                          {kunjungan.nomor_antrian || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatTanggalWaktu(kunjungan.tanggal, kunjungan.waktu)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {kunjungan.pasien?.nama_lengkap || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {kunjungan.pasien?.no_rm || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {kunjungan.dokter?.nama || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {kunjungan.dokter?.spesialisasi || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={status.className}>{status.label}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button asChild variant="ghost" size="icon">
                            <Link to={`/pasien/${kunjungan.pasien?.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {kunjungan.status !== "selesai" && (
                            <Button asChild variant="ghost" size="icon">
                              <Link to={`/kunjungan/${kunjungan.id}/pemeriksaan`}>
                                <FileText className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Empty State */}
        {!loading && filteredKunjungan.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Tidak ada kunjungan
            </h3>
            <p className="mt-1 text-muted-foreground">
              Tidak ada kunjungan yang sesuai dengan filter
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
