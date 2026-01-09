import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import PatientLayout from '@/components/layout/PatientLayout';

interface RekamMedis {
  id: string;
  keluhan: string | null;
  diagnosa: string | null;
  created_at: string;
  kunjungan: {
    id: string;
    tanggal: string;
    dokter: {
      nama: string;
      spesialisasi: string;
    };
  };
}

export default function PatientMedicalRecords() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rekamMedisList, setRekamMedisList] = useState<RekamMedis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRekamMedis();
  }, [user]);

  const fetchRekamMedis = async () => {
    try {
      const { data: patient } = await supabase
        .from('pasien')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (patient) {
        const { data } = await supabase
          .from('rekam_medis')
          .select(`
            id,
            keluhan,
            diagnosa,
            created_at,
            kunjungan:kunjungan_id (
              id,
              tanggal,
              dokter:dokter_id (nama, spesialisasi)
            )
          `)
          .eq('kunjungan.pasien_id', patient.id)
          .order('created_at', { ascending: false });

        // Filter out null kunjungan (from the join)
        const filtered = data?.filter(r => r.kunjungan !== null).map(r => ({
          ...r,
          kunjungan: {
            ...r.kunjungan,
            dokter: Array.isArray(r.kunjungan.dokter) ? r.kunjungan.dokter[0] : r.kunjungan.dokter
          }
        })) || [];

        setRekamMedisList(filtered);
      }
    } catch (error) {
      console.error('Error fetching rekam medis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PatientLayout title="Rekam Medis">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout title="Rekam Medis">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rekam Medis Saya
            </CardTitle>
            <CardDescription>Riwayat rekam medis dari setiap kunjungan</CardDescription>
          </CardHeader>
          <CardContent>
            {rekamMedisList.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Belum ada rekam medis</p>
                <p>Rekam medis akan tersedia setelah kunjungan Anda selesai</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rekamMedisList.map((rekam) => (
                  <Card 
                    key={rekam.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/pasien-portal/rekam-medis/${rekam.kunjungan.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Stethoscope className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{rekam.kunjungan.dokter?.nama}</p>
                            <p className="text-sm text-muted-foreground">{rekam.kunjungan.dokter?.spesialisasi}</p>
                            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(rekam.kunjungan.tanggal), 'dd MMMM yyyy', { locale: id })}
                            </div>
                          </div>
                        </div>
                        <div className="md:text-right">
                          {rekam.keluhan && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Keluhan: </span>
                              {rekam.keluhan.substring(0, 50)}{rekam.keluhan.length > 50 ? '...' : ''}
                            </p>
                          )}
                          {rekam.diagnosa && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Diagnosa: </span>
                              {rekam.diagnosa.substring(0, 50)}{rekam.diagnosa.length > 50 ? '...' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
}
