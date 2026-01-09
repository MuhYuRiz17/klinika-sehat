import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Printer, User, Calendar, Stethoscope, Pill, FileText } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  rekamMedisData, 
  getPasienById, 
  getDokterById,
  formatTanggal,
  hitungUmur
} from "@/lib/mockData";

export default function RekamMedisDetail() {
  const { id } = useParams<{ id: string }>();
  const rekamMedis = rekamMedisData.find(rm => rm.id === id);
  const pasien = rekamMedis ? getPasienById(rekamMedis.pasienId) : null;
  const dokter = rekamMedis ? getDokterById(rekamMedis.dokterId) : null;

  if (!rekamMedis || !pasien || !dokter) {
    return (
      <MainLayout title="Detail Rekam Medis">
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="font-heading text-lg font-semibold">Rekam medis tidak ditemukan</h3>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/rekam-medis">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Detail Rekam Medis">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link to="/rekam-medis">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="page-title">Detail Rekam Medis</h1>
              <p className="page-subtitle">{formatTanggal(rekamMedis.tanggal)}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
        </div>

        {/* Print-friendly content */}
        <div className="stat-card print:shadow-none print:border-0">
          {/* Patient & Doctor Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pasien</p>
                <p className="font-heading text-lg font-semibold text-foreground">
                  {pasien.namaLengkap}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge variant="outline">{pasien.noRm}</Badge>
                  <Badge variant="secondary">
                    {pasien.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}, {hitungUmur(pasien.tanggalLahir)} tahun
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
                <Stethoscope className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dokter Pemeriksa</p>
                <p className="font-heading text-lg font-semibold text-foreground">
                  {dokter.namaDokter}
                </p>
                <Badge variant="secondary" className="mt-1">
                  {dokter.spesialisasi}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Medical Record Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <h3 className="font-heading font-semibold text-foreground">Keluhan</h3>
              </div>
              <p className="text-foreground pl-4">{rekamMedis.keluhan}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <h3 className="font-heading font-semibold text-foreground">Anamnesis</h3>
              </div>
              <p className="text-foreground pl-4">{rekamMedis.anamnesis}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-secondary" />
                <h3 className="font-heading font-semibold text-foreground">Diagnosa</h3>
              </div>
              <div className="pl-4">
                <span className="status-inprogress text-sm">
                  {rekamMedis.diagnosa}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-secondary" />
                <h3 className="font-heading font-semibold text-foreground">Tindakan</h3>
              </div>
              <p className="text-foreground pl-4">{rekamMedis.tindakan}</p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Pill className="h-5 w-5 text-primary" />
                <h3 className="font-heading font-semibold text-foreground">Resep / Obat</h3>
              </div>
              <p className="text-foreground whitespace-pre-line">{rekamMedis.resep}</p>
            </div>

            {rekamMedis.catatan && (
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-heading font-semibold text-foreground">Catatan Tambahan</h3>
                </div>
                <p className="text-muted-foreground">{rekamMedis.catatan}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
