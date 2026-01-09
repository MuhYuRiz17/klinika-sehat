import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Eye, Edit, MoreHorizontal, User } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface Pasien {
  id: string;
  nama_lengkap: string;
  nik: string;
  no_rm: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  no_hp: string | null;
  status_bpjs: boolean | null;
}

const hitungUmur = (tanggalLahir: string) => {
  const today = new Date();
  const birthDate = new Date(tanggalLahir);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function PasienList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pasienList, setPasienList] = useState<Pasien[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPasien();
  }, []);

  const fetchPasien = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pasien')
        .select('id, nama_lengkap, nik, no_rm, tanggal_lahir, jenis_kelamin, no_hp, status_bpjs')
        .order('nama_lengkap');

      if (error) {
        console.error('Error fetching pasien:', error);
      } else {
        setPasienList(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPasien = pasienList.filter(
    (pasien) =>
      pasien.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pasien.nik.includes(searchQuery) ||
      pasien.no_rm.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout title="Data Pasien">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Daftar Pasien</h1>
            <p className="page-subtitle">Kelola data pasien klinik</p>
          </div>
          <Button asChild className="gradient-primary border-0">
            <Link to="/pasien/tambah">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pasien
            </Link>
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama, NIK, atau No. RM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Pasien</TableHead>
                <TableHead>NIK</TableHead>
                <TableHead>No. RM</TableHead>
                <TableHead>Jenis Kelamin</TableHead>
                <TableHead>Umur</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredPasien.map((pasien) => (
                  <TableRow key={pasien.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {pasien.nama_lengkap}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {pasien.no_hp || '-'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {pasien.nik}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {pasien.no_rm}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pasien.jenis_kelamin || '-'}
                    </TableCell>
                    <TableCell>{hitungUmur(pasien.tanggal_lahir)} tahun</TableCell>
                    <TableCell>
                      {pasien.status_bpjs ? (
                        <span className="status-completed">BPJS</span>
                      ) : (
                        <span className="status-waiting">Umum</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/pasien/${pasien.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Detail
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/pasien/${pasien.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Empty State */}
        {!loading && filteredPasien.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Pasien tidak ditemukan
            </h3>
            <p className="mt-1 text-muted-foreground">
              Coba ubah kata kunci pencarian Anda
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
