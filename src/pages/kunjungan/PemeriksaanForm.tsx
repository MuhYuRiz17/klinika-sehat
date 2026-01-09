import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, Clock, Stethoscope, Save, Play } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KunjunganDetail {
  id: string;
  tanggal: string;
  waktu: string;
  nomor_antrian: number | null;
  status: string;
  catatan: string | null;
  dokter: {
    id: string;
    nama: string;
    spesialisasi: string;
  } | null;
  pasien: {
    id: string;
    nama_lengkap: string;
    no_rm: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    no_hp: string | null;
  } | null;
}

interface RekamMedis {
  id?: string;
  keluhan: string;
  anamnesis: string;
  diagnosa: string;
  tindakan: string;
  resep: string;
  catatan: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  menunggu: { label: "Menunggu", className: "status-waiting" },
  diperiksa: { label: "Sedang Diperiksa", className: "status-inprogress" },
  selesai: { label: "Selesai", className: "status-completed" },
  batal: { label: "Batal", className: "bg-destructive/10 text-destructive" },
};

export default function PemeriksaanForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kunjungan, setKunjungan] = useState<KunjunganDetail | null>(null);
  const [rekamMedis, setRekamMedis] = useState<RekamMedis>({
    keluhan: "",
    anamnesis: "",
    diagnosa: "",
    tindakan: "",
    resep: "",
    catatan: "",
  });

  useEffect(() => {
    if (id) {
      fetchKunjungan();
    }
  }, [id]);

  const fetchKunjungan = async () => {
    setLoading(true);
    try {
      // Fetch kunjungan with related data
      const { data: kunjunganData, error: kunjunganError } = await supabase
        .from('kunjungan')
        .select(`
          id,
          tanggal,
          waktu,
          nomor_antrian,
          status,
          catatan,
          dokter:dokter_id (id, nama, spesialisasi),
          pasien:pasien_id (id, nama_lengkap, no_rm, tanggal_lahir, jenis_kelamin, no_hp)
        `)
        .eq('id', id)
        .single();

      if (kunjunganError) {
        console.error('Error fetching kunjungan:', kunjunganError);
        toast({
          title: "Error",
          description: "Gagal memuat data kunjungan",
          variant: "destructive",
        });
        return;
      }

      setKunjungan(kunjunganData as unknown as KunjunganDetail);

      // Check if rekam medis already exists for this kunjungan
      const { data: rekamMedisData } = await supabase
        .from('rekam_medis')
        .select('*')
        .eq('kunjungan_id', id)
        .single();

      if (rekamMedisData) {
        setRekamMedis({
          id: rekamMedisData.id,
          keluhan: rekamMedisData.keluhan || "",
          anamnesis: rekamMedisData.anamnesis || "",
          diagnosa: rekamMedisData.diagnosa || "",
          tindakan: rekamMedisData.tindakan || "",
          resep: rekamMedisData.resep || "",
          catatan: rekamMedisData.catatan || "",
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExamination = async () => {
    if (!id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('kunjungan')
        .update({ status: 'diperiksa' })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setKunjungan(prev => prev ? { ...prev, status: 'diperiksa' } : null);
      toast({
        title: "Berhasil",
        description: "Pemeriksaan dimulai",
      });
    } catch (error) {
      console.error('Error starting examination:', error);
      toast({
        title: "Error",
        description: "Gagal memulai pemeriksaan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndComplete = async () => {
    if (!id || !kunjungan) return;

    setSaving(true);
    try {
      // Save or update rekam medis
      if (rekamMedis.id) {
        // Update existing
        const { error: rekamError } = await supabase
          .from('rekam_medis')
          .update({
            keluhan: rekamMedis.keluhan,
            anamnesis: rekamMedis.anamnesis,
            diagnosa: rekamMedis.diagnosa,
            tindakan: rekamMedis.tindakan,
            resep: rekamMedis.resep,
            catatan: rekamMedis.catatan,
          })
          .eq('id', rekamMedis.id);

        if (rekamError) throw rekamError;
      } else {
        // Create new
        const { error: rekamError } = await supabase
          .from('rekam_medis')
          .insert({
            kunjungan_id: id,
            keluhan: rekamMedis.keluhan,
            anamnesis: rekamMedis.anamnesis,
            diagnosa: rekamMedis.diagnosa,
            tindakan: rekamMedis.tindakan,
            resep: rekamMedis.resep,
            catatan: rekamMedis.catatan,
          });

        if (rekamError) throw rekamError;
      }

      // Update kunjungan status to selesai
      const { error: kunjunganError } = await supabase
        .from('kunjungan')
        .update({ status: 'selesai' })
        .eq('id', id);

      if (kunjunganError) throw kunjunganError;

      toast({
        title: "Berhasil",
        description: "Rekam medis tersimpan dan pemeriksaan selesai",
      });
      navigate('/kunjungan');
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan rekam medis",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

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

  if (loading) {
    return (
      <MainLayout title="Pemeriksaan">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </MainLayout>
    );
  }

  if (!kunjungan) {
    return (
      <MainLayout title="Pemeriksaan">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Kunjungan tidak ditemukan</p>
          <Button variant="outline" onClick={() => navigate('/kunjungan')} className="mt-4">
            Kembali
          </Button>
        </div>
      </MainLayout>
    );
  }

  const status = statusConfig[kunjungan.status] || statusConfig.menunggu;
  const isReadOnly = kunjungan.status === 'selesai';

  return (
    <MainLayout title="Pemeriksaan Pasien">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/kunjungan')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="page-title">Pemeriksaan Pasien</h1>
            <p className="page-subtitle">
              {kunjungan.pasien?.nama_lengkap} - {kunjungan.pasien?.no_rm}
            </p>
          </div>
          <Badge className={status.className}>{status.label}</Badge>
        </div>

        {/* Info Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Patient Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Informasi Pasien
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama</span>
                <span className="font-medium">{kunjungan.pasien?.nama_lengkap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. RM</span>
                <span className="font-mono">{kunjungan.pasien?.no_rm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Umur</span>
                <span>{kunjungan.pasien?.tanggal_lahir ? hitungUmur(kunjungan.pasien.tanggal_lahir) + ' tahun' : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jenis Kelamin</span>
                <span>{kunjungan.pasien?.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. HP</span>
                <span>{kunjungan.pasien?.no_hp || '-'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Visit Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Informasi Kunjungan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal</span>
                <span className="font-medium">{formatTanggal(kunjungan.tanggal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Waktu</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {kunjungan.waktu.slice(0, 5)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Antrian</span>
                <span className="font-medium">{kunjungan.nomor_antrian || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dokter</span>
                <span>{kunjungan.dokter?.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spesialisasi</span>
                <span>{kunjungan.dokter?.spesialisasi}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Button - Start Examination */}
        {kunjungan.status === 'menunggu' && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">Pasien menunggu untuk diperiksa</p>
                <p className="text-sm text-muted-foreground">Klik tombol untuk memulai pemeriksaan</p>
              </div>
              <Button onClick={handleStartExamination} disabled={saving} className="gradient-primary border-0">
                <Play className="mr-2 h-4 w-4" />
                Mulai Pemeriksaan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Medical Record Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Rekam Medis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="keluhan">Keluhan</Label>
                <Textarea
                  id="keluhan"
                  placeholder="Keluhan utama pasien..."
                  value={rekamMedis.keluhan}
                  onChange={(e) => setRekamMedis({ ...rekamMedis, keluhan: e.target.value })}
                  disabled={isReadOnly}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anamnesis">Anamnesis</Label>
                <Textarea
                  id="anamnesis"
                  placeholder="Riwayat penyakit dan pemeriksaan..."
                  value={rekamMedis.anamnesis}
                  onChange={(e) => setRekamMedis({ ...rekamMedis, anamnesis: e.target.value })}
                  disabled={isReadOnly}
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="diagnosa">Diagnosa</Label>
                <Textarea
                  id="diagnosa"
                  placeholder="Diagnosa penyakit..."
                  value={rekamMedis.diagnosa}
                  onChange={(e) => setRekamMedis({ ...rekamMedis, diagnosa: e.target.value })}
                  disabled={isReadOnly}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tindakan">Tindakan</Label>
                <Textarea
                  id="tindakan"
                  placeholder="Tindakan yang dilakukan..."
                  value={rekamMedis.tindakan}
                  onChange={(e) => setRekamMedis({ ...rekamMedis, tindakan: e.target.value })}
                  disabled={isReadOnly}
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="resep">Resep Obat</Label>
                <Textarea
                  id="resep"
                  placeholder="Resep obat yang diberikan..."
                  value={rekamMedis.resep}
                  onChange={(e) => setRekamMedis({ ...rekamMedis, resep: e.target.value })}
                  disabled={isReadOnly}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan Tambahan</Label>
                <Textarea
                  id="catatan"
                  placeholder="Catatan tambahan..."
                  value={rekamMedis.catatan}
                  onChange={(e) => setRekamMedis({ ...rekamMedis, catatan: e.target.value })}
                  disabled={isReadOnly}
                  rows={3}
                />
              </div>
            </div>

            {/* Save Button */}
            {kunjungan.status === 'diperiksa' && (
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSaveAndComplete} 
                  disabled={saving}
                  className="gradient-primary border-0"
                  size="lg"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Selesai & Simpan Rekam Medis
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
