import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, Clock, Users } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jadwalPraktikData, dokterData, getDokterById } from "@/lib/mockData";

const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function JadwalList() {
  const [filterDokter, setFilterDokter] = useState<string>("all");

  const filteredJadwal = jadwalPraktikData.filter((jadwal) => 
    filterDokter === "all" || jadwal.dokterId === filterDokter
  );

  // Group by day
  const jadwalByHari = hariList.reduce((acc, hari) => {
    acc[hari] = filteredJadwal.filter(j => j.hari === hari);
    return acc;
  }, {} as Record<string, typeof jadwalPraktikData>);

  return (
    <MainLayout title="Jadwal Praktik">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Jadwal Praktik Dokter</h1>
            <p className="page-subtitle">Kelola jadwal praktik dokter di klinik</p>
          </div>
          <Button asChild className="gradient-primary border-0">
            <Link to="/jadwal/tambah">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Jadwal
            </Link>
          </Button>
        </div>

        {/* Filter */}
        <div className="flex gap-4">
          <Select value={filterDokter} onValueChange={setFilterDokter}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter dokter" />
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

        {/* Schedule Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {hariList.map((hari) => {
            const jadwalHari = jadwalByHari[hari];
            const isToday = new Date().toLocaleDateString('id-ID', { weekday: 'long' }) === hari;
            
            return (
              <div 
                key={hari} 
                className={`stat-card ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="font-heading font-semibold text-foreground">{hari}</h3>
                  </div>
                  {isToday && (
                    <span className="status-inprogress text-xs">Hari Ini</span>
                  )}
                </div>

                {jadwalHari.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Tidak ada jadwal
                  </p>
                ) : (
                  <div className="space-y-3">
                    {jadwalHari.map((jadwal) => {
                      const dokter = getDokterById(jadwal.dokterId);
                      return (
                        <div 
                          key={jadwal.id}
                          className="rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                        >
                          <p className="font-medium text-foreground text-sm">
                            {dokter?.namaDokter}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {dokter?.spesialisasi}
                          </p>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {jadwal.jamMulai} - {jadwal.jamSelesai}
                            </div>
                            {jadwal.kuotaPasien && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {jadwal.kuotaPasien}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
