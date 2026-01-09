import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit, User, Phone, MapPin, Calendar, FileText, ClipboardList } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  getPasienById, 
  getKunjunganByPasienId, 
  getRekamMedisByPasienId,
  getDokterById,
  hitungUmur,
  formatTanggal
} from "@/lib/mockData";

const statusConfig = {
  menunggu: { label: "Menunggu", className: "status-waiting" },
  sedang_diperiksa: { label: "Sedang Diperiksa", className: "status-inprogress" },
  selesai: { label: "Selesai", className: "status-completed" },
};

export default function PasienDetail() {
  const { id } = useParams<{ id: string }>();
  const pasien = getPasienById(id || "");
  const kunjunganList = getKunjunganByPasienId(id || "");
  const rekamMedisList = getRekamMedisByPasienId(id || "");

  if (!pasien) {
    return (
      <MainLayout title="Detail Pasien">
        <div className="flex flex-col items-center justify-center py-12">
          <User className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="font-heading text-lg font-semibold">Pasien tidak ditemukan</h3>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/pasien">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Detail Pasien">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link to="/pasien">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="page-title">{pasien.namaLengkap}</h1>
            <p className="page-subtitle">Detail informasi pasien</p>
          </div>
          <Button asChild variant="outline">
            <Link to={`/pasien/${pasien.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>

        {/* Patient Info Card */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="stat-card lg:col-span-1">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <User className="h-10 w-10 text-primary" />
              </div>
              <h2 className="mt-4 font-heading text-xl font-semibold text-foreground">
                {pasien.namaLengkap}
              </h2>
              <Badge variant="outline" className="mt-2 font-mono">
                {pasien.noRm}
              </Badge>
              <div className="mt-4 flex gap-2">
                {pasien.statusBpjs ? (
                  <span className="status-completed">BPJS</span>
                ) : (
                  <span className="status-waiting">Umum</span>
                )}
                <span className="status-inprogress">
                  {pasien.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card lg:col-span-2">
            <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
              Informasi Lengkap
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NIK</p>
                  <p className="font-mono font-medium text-foreground">{pasien.nik}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Lahir</p>
                  <p className="font-medium text-foreground">
                    {formatTanggal(pasien.tanggalLahir)} ({hitungUmur(pasien.tanggalLahir)} tahun)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">No. HP</p>
                  <p className="font-medium text-foreground">{pasien.noHp}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kontak Darurat</p>
                  <p className="font-medium text-foreground">{pasien.kontakDarurat}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:col-span-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alamat</p>
                  <p className="font-medium text-foreground">{pasien.alamat}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for History */}
        <Tabs defaultValue="kunjungan" className="animate-fade-in">
          <TabsList>
            <TabsTrigger value="kunjungan" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Riwayat Kunjungan
            </TabsTrigger>
            <TabsTrigger value="rekam-medis" className="gap-2">
              <FileText className="h-4 w-4" />
              Rekam Medis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kunjungan" className="mt-4">
            <div className="table-container">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>No. Antrian</TableHead>
                    <TableHead>Tanggal & Waktu</TableHead>
                    <TableHead>Dokter</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kunjunganList.map((kunjungan) => {
                    const dokter = getDokterById(kunjungan.dokterId);
                    const status = statusConfig[kunjungan.statusKunjungan];
                    return (
                      <TableRow key={kunjungan.id}>
                        <TableCell>
                          <Badge variant="outline">{kunjungan.nomorAntrian}</Badge>
                        </TableCell>
                        <TableCell>{kunjungan.tanggalWaktu}</TableCell>
                        <TableCell>{dokter?.namaDokter}</TableCell>
                        <TableCell>
                          <span className={status.className}>{status.label}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="rekam-medis" className="mt-4">
            <div className="space-y-4">
              {rekamMedisList.map((rm) => {
                const dokter = getDokterById(rm.dokterId);
                return (
                  <div key={rm.id} className="stat-card">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="font-heading text-lg font-semibold text-foreground">
                          {formatTanggal(rm.tanggal)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {dokter?.namaDokter}
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/rekam-medis/${rm.id}`}>
                          Lihat Detail
                        </Link>
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Keluhan</p>
                        <p className="mt-1 text-foreground">{rm.keluhan}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Diagnosa</p>
                        <p className="mt-1 text-foreground">{rm.diagnosa}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
