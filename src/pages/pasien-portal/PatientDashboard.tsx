import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarPlus, 
  FileText, 
  Clock, 
  User,
  Calendar,
  Stethoscope
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import PatientLayout from '@/components/layout/PatientLayout';

interface PasienData {
  id: string;
  no_rm: string;
  nama_lengkap: string;
  nik: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  alamat: string | null;
  no_hp: string | null;
  status_bpjs: boolean;
}

interface KunjunganData {
  id: string;
  tanggal: string;
  waktu: string;
  status: string;
  dokter: {
    nama: string;
    spesialisasi: string;
  };
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pasienData, setPasienData] = useState<PasienData | null>(null);
  const [upcomingVisits, setUpcomingVisits] = useState<KunjunganData[]>([]);
  const [recentVisits, setRecentVisits] = useState<KunjunganData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPatientData();
    }
  }, [user]);

  const fetchPatientData = async () => {
    try {
      // Fetch patient data
      const { data: patient, error: patientError } = await supabase
        .from('pasien')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (patientError) throw patientError;
      setPasienData(patient);

      if (patient) {
        // Fetch upcoming visits
        const today = format(new Date(), 'yyyy-MM-dd');
        const { data: upcoming } = await supabase
          .from('kunjungan')
          .select(`
            id,
            tanggal,
            waktu,
            status,
            dokter:dokter_id (nama, spesialisasi)
          `)
          .eq('pasien_id', patient.id)
          .gte('tanggal', today)
          .in('status', ['menunggu', 'diperiksa'])
          .order('tanggal', { ascending: true })
          .limit(3);

        // Fetch recent visits
        const { data: recent } = await supabase
          .from('kunjungan')
          .select(`
            id,
            tanggal,
            waktu,
            status,
            dokter:dokter_id (nama, spesialisasi)
          `)
          .eq('pasien_id', patient.id)
          .eq('status', 'selesai')
          .order('tanggal', { ascending: false })
          .limit(5);

        setUpcomingVisits(upcoming?.map(v => ({
          ...v,
          dokter: Array.isArray(v.dokter) ? v.dokter[0] : v.dokter
        })) || []);
        setRecentVisits(recent?.map(v => ({
          ...v,
          dokter: Array.isArray(v.dokter) ? v.dokter[0] : v.dokter
        })) || []);
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      menunggu: { label: 'Menunggu', variant: 'secondary' },
      diperiksa: { label: 'Diperiksa', variant: 'default' },
      selesai: { label: 'Selesai', variant: 'outline' },
      batal: { label: 'Batal', variant: 'destructive' },
    };
    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <PatientLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout title="Dashboard Pasien">
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Selamat Datang, {pasienData?.nama_lengkap}</h2>
                <p className="text-muted-foreground">No. Rekam Medis: {pasienData?.no_rm}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/pasien-portal/booking')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <CalendarPlus className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Booking Kunjungan</h3>
                  <p className="text-sm text-muted-foreground">Daftar kunjungan baru</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/pasien-portal/rekam-medis')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Rekam Medis</h3>
                  <p className="text-sm text-muted-foreground">Lihat riwayat medis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/pasien-portal/profil')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Profil Saya</h3>
                  <p className="text-sm text-muted-foreground">Update data pribadi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Visits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Kunjungan Mendatang
            </CardTitle>
            <CardDescription>Jadwal kunjungan yang akan datang</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingVisits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Tidak ada kunjungan terjadwal</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/pasien-portal/booking')}
                >
                  Booking Kunjungan Baru
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingVisits.map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{visit.dokter?.nama}</p>
                        <p className="text-sm text-muted-foreground">{visit.dokter?.spesialisasi}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {format(new Date(visit.tanggal), 'dd MMM yyyy', { locale: id })}
                      </p>
                      <p className="text-sm text-muted-foreground">{visit.waktu}</p>
                    </div>
                    {getStatusBadge(visit.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Visits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Riwayat Kunjungan Terakhir
            </CardTitle>
            <CardDescription>5 kunjungan terakhir yang selesai</CardDescription>
          </CardHeader>
          <CardContent>
            {recentVisits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Belum ada riwayat kunjungan</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentVisits.map((visit) => (
                  <div 
                    key={visit.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/pasien-portal/rekam-medis/${visit.id}`)}
                  >
                    <div>
                      <p className="font-medium">{visit.dokter?.nama}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(visit.tanggal), 'dd MMMM yyyy', { locale: id })}
                      </p>
                    </div>
                    {getStatusBadge(visit.status)}
                  </div>
                ))}
              </div>
            )}
            {recentVisits.length > 0 && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/pasien-portal/kunjungan')}
              >
                Lihat Semua Riwayat
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
}
