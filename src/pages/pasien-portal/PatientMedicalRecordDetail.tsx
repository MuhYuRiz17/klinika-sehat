import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Calendar, Stethoscope, Pill, Clipboard } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import PatientLayout from '@/components/layout/PatientLayout';

interface RekamMedisDetail {
  id: string;
  keluhan: string | null;
  anamnesis: string | null;
  diagnosa: string | null;
  tindakan: string | null;
  resep: string | null;
  catatan: string | null;
  created_at: string;
}

interface KunjunganDetail {
  id: string;
  tanggal: string;
  waktu: string;
  nomor_antrian: number | null;
  dokter: {
    nama: string;
    spesialisasi: string;
  };
  pasien: {
    nama_lengkap: string;
    no_rm: string;
  };
}

export default function PatientMedicalRecordDetail() {
  const { id: kunjunganId } = useParams();
  const navigate = useNavigate();
  const [rekamMedis, setRekamMedis] = useState<RekamMedisDetail | null>(null);
  const [kunjungan, setKunjungan] = useState<KunjunganDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [kunjunganId]);

  const fetchDetail = async () => {
    try {
      // Fetch kunjungan
      const { data: kunjunganData } = await supabase
        .from('kunjungan')
        .select(`
          id,
          tanggal,
          waktu,
          nomor_antrian,
          dokter:dokter_id (nama, spesialisasi),
          pasien:pasien_id (nama_lengkap, no_rm)
        `)
        .eq('id', kunjunganId)
        .single();

      if (kunjunganData) {
        setKunjungan({
          ...kunjunganData,
          dokter: Array.isArray(kunjunganData.dokter) ? kunjunganData.dokter[0] : kunjunganData.dokter,
          pasien: Array.isArray(kunjunganData.pasien) ? kunjunganData.pasien[0] : kunjunganData.pasien
        });
      }

      // Fetch rekam medis
      const { data: rekamData } = await supabase
        .from('rekam_medis')
        .select('*')
        .eq('kunjungan_id', kunjunganId)
        .single();

      setRekamMedis(rekamData);
    } catch (error) {
      console.error('Error fetching detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PatientLayout title="Detail Rekam Medis">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PatientLayout>
    );
  }

  if (!kunjungan) {
    return (
      <PatientLayout title="Detail Rekam Medis">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Data tidak ditemukan</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            Kembali
          </Button>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout title="Detail Rekam Medis">
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>

        {/* Kunjungan Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informasi Kunjungan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Kunjungan</p>
                  <p className="font-medium">
                    {format(new Date(kunjungan.tanggal), 'EEEE, dd MMMM yyyy', { locale: id })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Waktu</p>
                  <p className="font-medium">{kunjungan.waktu}</p>
                </div>
                {kunjungan.nomor_antrian && (
                  <div>
                    <p className="text-sm text-muted-foreground">Nomor Antrian</p>
                    <p className="font-medium">#{kunjungan.nomor_antrian}</p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Dokter</p>
                  <p className="font-medium">{kunjungan.dokter?.nama}</p>
                  <p className="text-sm text-muted-foreground">{kunjungan.dokter?.spesialisasi}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pasien</p>
                  <p className="font-medium">{kunjungan.pasien?.nama_lengkap}</p>
                  <p className="text-sm text-muted-foreground">No. RM: {kunjungan.pasien?.no_rm}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rekam Medis */}
        {rekamMedis ? (
          <div className="space-y-4">
            {/* Keluhan */}
            {rekamMedis.keluhan && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clipboard className="h-4 w-4" />
                    Keluhan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{rekamMedis.keluhan}</p>
                </CardContent>
              </Card>
            )}

            {/* Anamnesis */}
            {rekamMedis.anamnesis && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Anamnesis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{rekamMedis.anamnesis}</p>
                </CardContent>
              </Card>
            )}

            {/* Diagnosa */}
            {rekamMedis.diagnosa && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Diagnosa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{rekamMedis.diagnosa}</p>
                </CardContent>
              </Card>
            )}

            {/* Tindakan */}
            {rekamMedis.tindakan && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Tindakan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{rekamMedis.tindakan}</p>
                </CardContent>
              </Card>
            )}

            {/* Resep */}
            {rekamMedis.resep && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    Resep Obat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{rekamMedis.resep}</p>
                </CardContent>
              </Card>
            )}

            {/* Catatan */}
            {rekamMedis.catatan && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Catatan Tambahan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{rekamMedis.catatan}</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Rekam medis belum tersedia untuk kunjungan ini</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PatientLayout>
  );
}
