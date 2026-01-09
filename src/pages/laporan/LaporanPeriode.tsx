import { useState } from "react";
import { Download, Filter, Calendar, FileText, BarChart3 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  kunjunganData, 
  rekamMedisData, 
  getPasienById, 
  getDokterById,
  dokterData,
  formatTanggal 
} from "@/lib/mockData";

const statusConfig = {
  menunggu: { label: "Menunggu", className: "status-waiting" },
  sedang_diperiksa: { label: "Sedang Diperiksa", className: "status-inprogress" },
  selesai: { label: "Selesai", className: "status-completed" },
};

export default function LaporanPeriode() {
  const [tanggalAwal, setTanggalAwal] = useState("2024-01-01");
  const [tanggalAkhir, setTanggalAkhir] = useState("2025-01-31");
  const [filterDokter, setFilterDokter] = useState<string>("all");

  // Filter kunjungan berdasarkan periode dan dokter
  const filteredKunjungan = kunjunganData.filter((kunjungan) => {
    const tanggal = new Date(kunjungan.tanggalWaktu.split(' ')[0]);
    const awal = new Date(tanggalAwal);
    const akhir = new Date(tanggalAkhir);
    const matchesPeriode = tanggal >= awal && tanggal <= akhir;
    const matchesDokter = filterDokter === "all" || kunjungan.dokterId === filterDokter;
    return matchesPeriode && matchesDokter;
  }).sort((a, b) => new Date(a.tanggalWaktu).getTime() - new Date(b.tanggalWaktu).getTime());

  // Get rekam medis for each kunjungan
  const laporanData = filteredKunjungan.map((kunjungan) => {
    const pasien = getPasienById(kunjungan.pasienId);
    const dokter = getDokterById(kunjungan.dokterId);
    const rekamMedis = rekamMedisData.find(rm => rm.kunjunganId === kunjungan.id);
    
    return {
      ...kunjungan,
      pasien,
      dokter,
      rekamMedis,
    };
  });

  // Statistics
  const totalKunjungan = laporanData.length;
  const kunjunganSelesai = laporanData.filter(l => l.statusKunjungan === 'selesai').length;
  const uniquePasien = new Set(laporanData.map(l => l.pasienId)).size;

  const handleExport = () => {
    // Simple CSV export
    const headers = ['Tanggal', 'Pasien', 'No RM', 'Dokter', 'Diagnosa', 'Tindakan', 'Status'];
    const rows = laporanData.map(l => [
      l.tanggalWaktu,
      l.pasien?.namaLengkap || '-',
      l.pasien?.noRm || '-',
      l.dokter?.namaDokter || '-',
      l.rekamMedis?.diagnosa || '-',
      l.rekamMedis?.tindakan || '-',
      statusConfig[l.statusKunjungan].label,
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${tanggalAwal}-${tanggalAkhir}.csv`;
    a.click();
  };

  return (
    <MainLayout title="Laporan">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Laporan Rekam Medis Per Periode</h1>
            <p className="page-subtitle">Generate laporan kunjungan dan pemeriksaan</p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold text-foreground">Filter Laporan</h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="tanggalAwal">Tanggal Awal</Label>
              <Input
                id="tanggalAwal"
                type="date"
                value={tanggalAwal}
                onChange={(e) => setTanggalAwal(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggalAkhir">Tanggal Akhir</Label>
              <Input
                id="tanggalAkhir"
                type="date"
                value={tanggalAkhir}
                onChange={(e) => setTanggalAkhir(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Dokter</Label>
              <Select value={filterDokter} onValueChange={setFilterDokter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua dokter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Dokter</SelectItem>
                  {dokterData.map((dokter) => (
                    <SelectItem key={dokter.id} value={dokter.id}>
                      {dokter.namaDokter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="stat-card flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Kunjungan</p>
              <p className="font-heading text-2xl font-bold text-foreground">{totalKunjungan}</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20">
              <FileText className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pemeriksaan Selesai</p>
              <p className="font-heading text-2xl font-bold text-foreground">{kunjunganSelesai}</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pasien Unik</p>
              <p className="font-heading text-2xl font-bold text-foreground">{uniquePasien}</p>
            </div>
          </div>
        </div>

        {/* Report Table */}
        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Tanggal</TableHead>
                <TableHead>Pasien</TableHead>
                <TableHead>Dokter</TableHead>
                <TableHead>Diagnosa</TableHead>
                <TableHead>Tindakan</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laporanData.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {item.tanggalWaktu}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {item.pasien?.namaLengkap}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.pasien?.noRm}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {item.dokter?.namaDokter}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.dokter?.spesialisasi}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.rekamMedis ? (
                      <span className="status-inprogress">
                        {item.rekamMedis.diagnosa}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[150px] truncate text-foreground">
                      {item.rekamMedis?.tindakan || '-'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className={statusConfig[item.statusKunjungan].className}>
                      {statusConfig[item.statusKunjungan].label}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Empty State */}
        {laporanData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Tidak ada data
            </h3>
            <p className="mt-1 text-muted-foreground">
              Tidak ada kunjungan dalam periode yang dipilih
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
