import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Edit, MoreHorizontal, Stethoscope, Phone, Calendar } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dokterData, getJadwalByDokterId } from "@/lib/mockData";

export default function DokterList() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDokter = dokterData.filter(
    (dokter) =>
      dokter.namaDokter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dokter.spesialisasi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout title="Data Dokter">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Daftar Dokter</h1>
            <p className="page-subtitle">Kelola data dokter dan jadwal praktik</p>
          </div>
          <Button asChild className="gradient-primary border-0">
            <Link to="/dokter/tambah">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Dokter
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari dokter atau spesialisasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Doctor Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDokter.map((dokter) => {
            const jadwalList = getJadwalByDokterId(dokter.id);
            return (
              <div key={dokter.id} className="stat-card animate-fade-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary">
                      <Stethoscope className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground">
                        {dokter.namaDokter}
                      </h3>
                      <Badge variant="secondary" className="mt-1">
                        {dokter.spesialisasi}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/dokter/${dokter.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {dokter.noHp}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {jadwalList.length} jadwal praktik
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Jadwal Praktik:</p>
                  <div className="flex flex-wrap gap-1">
                    {jadwalList.slice(0, 3).map((jadwal) => (
                      <span 
                        key={jadwal.id} 
                        className="text-xs bg-muted px-2 py-1 rounded-md"
                      >
                        {jadwal.hari.slice(0, 3)}
                      </span>
                    ))}
                    {jadwalList.length > 3 && (
                      <span className="text-xs bg-muted px-2 py-1 rounded-md">
                        +{jadwalList.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredDokter.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Stethoscope className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Dokter tidak ditemukan
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
