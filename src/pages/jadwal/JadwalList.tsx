import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, Clock, Users, Trash2, Pencil, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

interface JadwalWithDokter {
  id: string;
  dokter_id: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  kuota: number;
  dokter: {
    id: string;
    nama: string;
    spesialisasi: string;
  };
}

interface DokterOption {
  id: string;
  nama: string;
}

export default function JadwalList() {
  const [filterDokter, setFilterDokter] = useState<string>("all");
  const { toast } = useToast();
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  // Fetch jadwal with dokter info
  const { data: jadwalData = [], isLoading } = useQuery({
    queryKey: ['jadwal'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jadwal_praktik')
        .select(`
          id,
          dokter_id,
          hari,
          jam_mulai,
          jam_selesai,
          kuota,
          dokter:dokter_id (
            id,
            nama,
            spesialisasi
          )
        `)
        .order('hari');
      
      if (error) throw error;
      return data as unknown as JadwalWithDokter[];
    },
  });

  // Fetch dokter list for filter
  const { data: dokterList = [] } = useQuery({
    queryKey: ['dokter-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dokter')
        .select('id, nama')
        .order('nama');
      
      if (error) throw error;
      return data as DokterOption[];
    },
  });

  // Get current user's dokter_id if role is dokter
  const { data: currentDokter } = useQuery({
    queryKey: ['current-dokter', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('dokter')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: role === 'dokter' && !!user?.id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (jadwalId: string) => {
      const { error } = await supabase
        .from('jadwal_praktik')
        .delete()
        .eq('id', jadwalId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal'] });
      toast({
        title: "Berhasil",
        description: "Jadwal berhasil dihapus",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus jadwal",
        variant: "destructive",
      });
    },
  });

  // Filter jadwal based on role and selected filter
  const filteredJadwal = jadwalData.filter((jadwal) => {
    // If dokter role, only show own jadwal
    if (role === 'dokter' && currentDokter) {
      if (jadwal.dokter_id !== currentDokter.id) return false;
    }
    // Apply dokter filter
    return filterDokter === "all" || jadwal.dokter_id === filterDokter;
  });

  // Group by day
  const jadwalByHari = hariList.reduce((acc, hari) => {
    acc[hari] = filteredJadwal.filter(j => j.hari === hari);
    return acc;
  }, {} as Record<string, JadwalWithDokter[]>);

  // Check if user can manage this jadwal
  const canManage = (jadwal: JadwalWithDokter) => {
    if (role === 'admin') return true;
    if (role === 'dokter' && currentDokter && jadwal.dokter_id === currentDokter.id) return true;
    return false;
  };

  // Get today in Indonesian
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long' });

  if (isLoading) {
    return (
      <MainLayout title="Jadwal Praktik">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Jadwal Praktik">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Jadwal Praktik Dokter</h1>
            <p className="page-subtitle">
              {role === 'dokter' 
                ? "Kelola jadwal praktik Anda" 
                : "Kelola jadwal praktik dokter di klinik"}
            </p>
          </div>
          {(role === 'admin' || role === 'dokter') && (
            <Button asChild className="gradient-primary border-0">
              <Link to="/jadwal/tambah">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Jadwal
              </Link>
            </Button>
          )}
        </div>

        {/* Filter - Only show for admin */}
        {role === 'admin' && (
          <div className="flex gap-4">
            <Select value={filterDokter} onValueChange={setFilterDokter}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter dokter" />
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
          </div>
        )}

        {/* Empty state */}
        {filteredJadwal.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="font-semibold text-foreground">Belum ada jadwal</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {role === 'dokter' 
                ? "Tambahkan jadwal praktik Anda" 
                : "Tambahkan jadwal praktik untuk dokter"}
            </p>
          </div>
        )}

        {/* Schedule Grid */}
        {filteredJadwal.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {hariList.map((hari) => {
              const jadwalHari = jadwalByHari[hari];
              const isToday = today === hari;
              
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
                      {jadwalHari.map((jadwal) => (
                        <div 
                          key={jadwal.id}
                          className="rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {jadwal.dokter?.nama}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {jadwal.dokter?.spesialisasi}
                              </p>
                            </div>
                            {canManage(jadwal) && (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  asChild
                                >
                                  <Link to={`/jadwal/${jadwal.id}/edit`}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Link>
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Hapus Jadwal?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Jadwal praktik {jadwal.dokter?.nama} pada hari {jadwal.hari} ({jadwal.jam_mulai} - {jadwal.jam_selesai}) akan dihapus. Tindakan ini tidak dapat dibatalkan.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Batal</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteMutation.mutate(jadwal.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Hapus
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {jadwal.jam_mulai} - {jadwal.jam_selesai}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Users className="h-3 w-3" />
                              {jadwal.kuota}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
