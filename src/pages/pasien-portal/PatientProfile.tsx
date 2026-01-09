import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { User, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import PatientLayout from '@/components/layout/PatientLayout';

interface PasienData {
  id: string;
  no_rm: string;
  nik: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  alamat: string | null;
  no_hp: string | null;
  status_bpjs: boolean;
  kontak_darurat: string | null;
}

export default function PatientProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [pasien, setPasien] = useState<PasienData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form fields that can be edited
  const [alamat, setAlamat] = useState('');
  const [noHp, setNoHp] = useState('');
  const [kontakDarurat, setKontakDarurat] = useState('');
  const [statusBpjs, setStatusBpjs] = useState(false);

  useEffect(() => {
    fetchPasienData();
  }, [user]);

  const fetchPasienData = async () => {
    try {
      const { data, error } = await supabase
        .from('pasien')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      setPasien(data);
      setAlamat(data.alamat || '');
      setNoHp(data.no_hp || '');
      setKontakDarurat(data.kontak_darurat || '');
      setStatusBpjs(data.status_bpjs || false);
    } catch (error) {
      console.error('Error fetching pasien:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!pasien) return;
    
    setSaving(true);

    try {
      const { error } = await supabase
        .from('pasien')
        .update({
          alamat: alamat || null,
          no_hp: noHp || null,
          kontak_darurat: kontakDarurat || null,
          status_bpjs: statusBpjs,
        })
        .eq('id', pasien.id);

      if (error) throw error;

      toast({
        title: 'Profil Diperbarui',
        description: 'Data profil Anda berhasil disimpan.',
      });

      fetchPasienData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PatientLayout title="Profil Saya">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PatientLayout>
    );
  }

  if (!pasien) {
    return (
      <PatientLayout title="Profil Saya">
        <div className="text-center py-12 text-muted-foreground">
          <p>Data profil tidak ditemukan</p>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout title="Profil Saya">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{pasien.nama_lengkap}</h2>
                <p className="text-muted-foreground">No. Rekam Medis: {pasien.no_rm}</p>
                <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Read-only Info */}
        <Card>
          <CardHeader>
            <CardTitle>Data Pribadi</CardTitle>
            <CardDescription>Informasi yang tidak dapat diubah secara mandiri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">NIK</Label>
                <p className="font-medium">{pasien.nik}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Nama Lengkap</Label>
                <p className="font-medium">{pasien.nama_lengkap}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Jenis Kelamin</Label>
                <p className="font-medium">{pasien.jenis_kelamin}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Tanggal Lahir</Label>
                <p className="font-medium">
                  {format(new Date(pasien.tanggal_lahir), 'dd MMMM yyyy')}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Untuk mengubah data di atas, silakan hubungi bagian pendaftaran klinik.
            </p>
          </CardContent>
        </Card>

        {/* Editable Info */}
        <Card>
          <CardHeader>
            <CardTitle>Data Kontak</CardTitle>
            <CardDescription>Informasi yang dapat Anda perbarui</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea
                id="alamat"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Masukkan alamat lengkap"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="no_hp">No. HP</Label>
              <Input
                id="no_hp"
                type="tel"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kontak_darurat">Kontak Darurat</Label>
              <Input
                id="kontak_darurat"
                value={kontakDarurat}
                onChange={(e) => setKontakDarurat(e.target.value)}
                placeholder="Nama dan nomor telepon"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="status_bpjs">Status BPJS</Label>
                <p className="text-sm text-muted-foreground">Apakah Anda peserta BPJS Kesehatan?</p>
              </div>
              <Switch
                id="status_bpjs"
                checked={statusBpjs}
                onCheckedChange={setStatusBpjs}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
}
