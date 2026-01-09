import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Calendar, Stethoscope, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import PatientLayout from '@/components/layout/PatientLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface Kunjungan {
  id: string;
  tanggal: string;
  waktu: string;
  status: string;
  nomor_antrian: number | null;
  catatan: string | null;
  dokter: {
    nama: string;
    spesialisasi: string;
  };
}

export default function PatientVisitHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [kunjunganList, setKunjunganList] = useState<Kunjungan[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedKunjungan, setSelectedKunjungan] = useState<string | null>(null);

  useEffect(() => {
    fetchKunjungan();
  }, [user]);

  const fetchKunjungan = async () => {
    try {
      const { data: patient } = await supabase
        .from('pasien')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (patient) {
        const { data } = await supabase
          .from('kunjungan')
          .select(`
            id,
            tanggal,
            waktu,
            status,
            nomor_antrian,
            catatan,
            dokter:dokter_id (nama, spesialisasi)
          `)
          .eq('pasien_id', patient.id)
          .order('tanggal', { ascending: false });

        setKunjunganList(data?.map(k => ({
          ...k,
          dokter: Array.isArray(k.dokter) ? k.dokter[0] : k.dokter
        })) || []);
      }
    } catch (error) {
      console.error('Error fetching kunjungan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelVisit = async () => {
    if (!selectedKunjungan) return;

    try {
      const { error } = await supabase
        .from('kunjungan')
        .update({ status: 'batal' })
        .eq('id', selectedKunjungan);

      if (error) throw error;

      toast({
        title: 'Kunjungan Dibatalkan',
        description: 'Kunjungan Anda telah dibatalkan.',
      });

      fetchKunjungan();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Membatalkan',
        description: error.message,
      });
    } finally {
      setCancelDialogOpen(false);
      setSelectedKunjungan(null);
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

  const isPast = (tanggal: string) => {
    return new Date(tanggal) < new Date(new Date().setHours(0, 0, 0, 0));
  };

  if (loading) {
    return (
      <PatientLayout title="Riwayat Kunjungan">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout title="Riwayat Kunjungan">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Riwayat Kunjungan
            </CardTitle>
            <CardDescription>Semua kunjungan Anda di Klinik Pratama</CardDescription>
          </CardHeader>
          <CardContent>
            {kunjunganList.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Belum ada riwayat kunjungan</p>
                <p className="mb-4">Mulai dengan membuat booking kunjungan pertama Anda</p>
                <Button onClick={() => navigate('/pasien-portal/booking')}>
                  Booking Kunjungan
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {kunjunganList.map((kunjungan) => (
                  <Card key={kunjungan.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Stethoscope className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{kunjungan.dokter?.nama}</p>
                          <p className="text-sm text-muted-foreground">{kunjungan.dokter?.spesialisasi}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(kunjungan.tanggal), 'dd MMM yyyy', { locale: id })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {kunjungan.waktu}
                            </span>
                          </div>
                          {kunjungan.nomor_antrian && (
                            <p className="text-sm mt-1">Antrian: #{kunjungan.nomor_antrian}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(kunjungan.status)}
                        
                        {kunjungan.status === 'selesai' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/pasien-portal/rekam-medis/${kunjungan.id}`)}
                          >
                            Lihat Rekam Medis
                          </Button>
                        )}

                        {kunjungan.status === 'menunggu' && !isPast(kunjungan.tanggal) && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              setSelectedKunjungan(kunjungan.id);
                              setCancelDialogOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Batalkan
                          </Button>
                        )}
                      </div>
                    </div>
                    {kunjungan.catatan && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-muted-foreground bg-accent/50 p-2 rounded">
                          <strong>Catatan:</strong> {kunjungan.catatan}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Kunjungan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membatalkan kunjungan ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tidak</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelVisit} className="bg-destructive text-destructive-foreground">
              Ya, Batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PatientLayout>
  );
}
