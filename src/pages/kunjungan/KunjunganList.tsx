import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Eye, FileText, Calendar, Filter } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { kunjunganData, getPasienById, getDokterById, dokterData } from "@/lib/mockData";

const statusConfig = {
  menunggu: { label: "Menunggu", className: "status-waiting" },
  sedang_diperiksa: { label: "Sedang Diperiksa", className: "status-inprogress" },
  selesai: { label: "Selesai", className: "status-completed" },
};

export default function KunjunganList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDokter, setFilterDokter] = useState<string>("all");

  const filteredKunjungan = kunjunganData.filter((kunjungan) => {
    const pasien = getPasienById(kunjungan.pasienId);
    const matchesSearch = pasien?.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pasien?.noRm.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || kunjungan.statusKunjungan === filterStatus;
    const matchesDokter = filterDokter === "all" || kunjungan.dokterId === filterDokter;
    return matchesSearch && matchesStatus && matchesDokter;
  }).sort((a, b) => new Date(b.tanggalWaktu).getTime() - new Date(a.tanggalWaktu).getTime());

  return (
    <MainLayout title="Kunjungan">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Daftar Kunjungan</h1>
            <p className="page-subtitle">Kelola kunjungan pasien ke klinik</p>
          </div>
          <Button asChild className="gradient-primary border-0">
            <Link to="/kunjungan/tambah">
              <Plus className="mr-2 h-4 w-4" />
              Buat Kunjungan
            </Link>
          </Button>
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
          <Select value={filterDokter} onValueChange={setFilterDokter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Dokter" />
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
              {filteredKunjungan.map((kunjungan) => {
                const pasien = getPasienById(kunjungan.pasienId);
                const dokter = getDokterById(kunjungan.dokterId);
                const status = statusConfig[kunjungan.statusKunjungan];
                
                return (
                  <TableRow key={kunjungan.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                        {kunjungan.nomorAntrian}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {kunjungan.tanggalWaktu}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {pasien?.namaLengkap}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {pasien?.noRm}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {dokter?.namaDokter}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {dokter?.spesialisasi}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={status.className}>{status.label}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button asChild variant="ghost" size="icon">
                          <Link to={`/pasien/${kunjungan.pasienId}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {kunjungan.statusKunjungan !== "selesai" && (
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
              })}
            </TableBody>
          </Table>
        </div>

        {/* Empty State */}
        {filteredKunjungan.length === 0 && (
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
