import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

interface DokterOption {
  id: string;
  nama: string;
  spesialisasi: string;
}

export default function JadwalForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    dokter_id: "",
    hari: "",
    jam_mulai: "",
    jam_selesai: "",
    kuota: 20,
  });

  // Fetch dokter list for dropdown (admin can see all, dokter only sees self)
  const { data: dokterList = [], isLoading: loadingDokter } = useQuery({
    queryKey: ['dokter-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dokter')
        .select('id, nama, spesialisasi')
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
        .select('id, nama, spesialisasi')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: role === 'dokter' && !!user?.id,
  });

  // Fetch existing jadwal for edit
  const { data: existingJadwal, isLoading: loadingJadwal } = useQuery({
    queryKey: ['jadwal', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('jadwal_praktik')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  // Set form data when editing or when dokter user loads
  useEffect(() => {
    if (existingJadwal) {
      setFormData({
        dokter_id: existingJadwal.dokter_id,
        hari: existingJadwal.hari,
        jam_mulai: existingJadwal.jam_mulai,
        jam_selesai: existingJadwal.jam_selesai,
        kuota: existingJadwal.kuota,
      });
    } else if (role === 'dokter' && currentDokter) {
      setFormData(prev => ({ ...prev, dokter_id: currentDokter.id }));
    }
  }, [existingJadwal, role, currentDokter]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (isEdit) {
        const { error } = await supabase
          .from('jadwal_praktik')
          .update({
            dokter_id: data.dokter_id,
            hari: data.hari,
            jam_mulai: data.jam_mulai,
            jam_selesai: data.jam_selesai,
            kuota: data.kuota,
          })
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('jadwal_praktik')
          .insert({
            dokter_id: data.dokter_id,
            hari: data.hari,
            jam_mulai: data.jam_mulai,
            jam_selesai: data.jam_selesai,
            kuota: data.kuota,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal'] });
      toast({
        title: "Berhasil",
        description: isEdit ? "Jadwal berhasil diperbarui" : "Jadwal berhasil ditambahkan",
      });
      navigate('/jadwal');
    },
    onError: (error: Error) => {
      console.error('Error saving jadwal:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan jadwal",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dokter_id || !formData.hari || !formData.jam_mulai || !formData.jam_selesai) {
      toast({
        title: "Validasi Error",
        description: "Mohon lengkapi semua field yang wajib",
        variant: "destructive",
      });
      return;
    }

    if (formData.jam_mulai >= formData.jam_selesai) {
      toast({
        title: "Validasi Error",
        description: "Jam selesai harus lebih besar dari jam mulai",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(formData);
  };

  const isLoading = loadingDokter || loadingJadwal;
  const isSubmitting = saveMutation.isPending;

  if (isLoading) {
    return (
      <MainLayout title={isEdit ? "Edit Jadwal" : "Tambah Jadwal"}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEdit ? "Edit Jadwal Praktik" : "Tambah Jadwal Praktik"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/jadwal')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="page-title">
              {isEdit ? "Edit Jadwal Praktik" : "Tambah Jadwal Praktik"}
            </h1>
            <p className="page-subtitle">
              {isEdit ? "Perbarui jadwal praktik dokter" : "Buat jadwal praktik baru untuk dokter"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
          {/* Dokter Selection - Only show for admin */}
          {role === 'admin' ? (
            <div className="space-y-2">
              <Label htmlFor="dokter">Dokter *</Label>
              <Select
                value={formData.dokter_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, dokter_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dokter" />
                </SelectTrigger>
                <SelectContent>
                  {dokterList.map((dokter) => (
                    <SelectItem key={dokter.id} value={dokter.id}>
                      {dokter.nama} - {dokter.spesialisasi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Dokter</Label>
              <div className="rounded-md border border-input bg-muted px-3 py-2">
                {currentDokter?.nama} - {currentDokter?.spesialisasi}
              </div>
            </div>
          )}

          {/* Hari */}
          <div className="space-y-2">
            <Label htmlFor="hari">Hari *</Label>
            <Select
              value={formData.hari}
              onValueChange={(value) => setFormData(prev => ({ ...prev, hari: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih hari" />
              </SelectTrigger>
              <SelectContent>
                {hariList.map((hari) => (
                  <SelectItem key={hari} value={hari}>
                    {hari}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Jam Mulai & Jam Selesai */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jam_mulai">Jam Mulai *</Label>
              <Input
                id="jam_mulai"
                type="time"
                value={formData.jam_mulai}
                onChange={(e) => setFormData(prev => ({ ...prev, jam_mulai: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jam_selesai">Jam Selesai *</Label>
              <Input
                id="jam_selesai"
                type="time"
                value={formData.jam_selesai}
                onChange={(e) => setFormData(prev => ({ ...prev, jam_selesai: e.target.value }))}
              />
            </div>
          </div>

          {/* Kuota */}
          <div className="space-y-2">
            <Label htmlFor="kuota">Kuota Pasien</Label>
            <Input
              id="kuota"
              type="number"
              min={1}
              value={formData.kuota}
              onChange={(e) => setFormData(prev => ({ ...prev, kuota: parseInt(e.target.value) || 20 }))}
            />
            <p className="text-xs text-muted-foreground">
              Jumlah maksimal pasien yang dapat dilayani dalam satu sesi
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/jadwal')}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="gradient-primary border-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
