import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, FileText, Calendar } from "lucide-react";
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
import { rekamMedisData, getPasienById, getDokterById, formatTanggal } from "@/lib/mockData";

export default function RekamMedisList() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRekamMedis = rekamMedisData.filter((rm) => {
    const pasien = getPasienById(rm.pasienId);
    return (
      pasien?.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rm.diagnosa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rm.keluhan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  return (
    <MainLayout title="Rekam Medis">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-title">Riwayat Rekam Medis</h1>
          <p className="page-subtitle">Lihat riwayat pemeriksaan pasien</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari pasien atau diagnosa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Tanggal</TableHead>
                <TableHead>Pasien</TableHead>
                <TableHead>Dokter</TableHead>
                <TableHead>Keluhan</TableHead>
                <TableHead>Diagnosa</TableHead>
                <TableHead className="w-[80px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRekamMedis.map((rm) => {
                const pasien = getPasienById(rm.pasienId);
                const dokter = getDokterById(rm.dokterId);
                
                return (
                  <TableRow key={rm.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatTanggal(rm.tanggal)}
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
                      <p className="font-medium text-foreground">
                        {dokter?.namaDokter}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[200px] truncate text-foreground">
                        {rm.keluhan}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="status-inprogress">
                        {rm.diagnosa}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon">
                        <Link to={`/rekam-medis/${rm.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Empty State */}
        {filteredRekamMedis.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Tidak ada rekam medis
            </h3>
            <p className="mt-1 text-muted-foreground">
              Tidak ada rekam medis yang sesuai dengan pencarian
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
