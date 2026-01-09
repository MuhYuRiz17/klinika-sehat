import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, CheckCircle } from 'lucide-react';
import { format, addDays, getDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import PatientLayout from '@/components/layout/PatientLayout';

interface Dokter {
  id: string;
  nama: string;
  spesialisasi: string;
}

interface JadwalPraktik {
  id: string;
  dokter_id: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  kuota: number;
}

const hariMapping: Record<number, string> = {
  0: 'Minggu',
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
};

export default function PatientBooking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [pasienId, setPasienId] = useState<string | null>(null);
  const [dokterList, setDokterList] = useState<Dokter[]>([]);
  const [selectedDokter, setSelectedDokter] = useState<string>('');
  const [jadwalList, setJadwalList] = useState<JadwalPraktik[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedJadwal, setSelectedJadwal] = useState<JadwalPraktik | null>(null);
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (selectedDokter) {
      fetchJadwal(selectedDokter);
      setSelectedDate(undefined);
      setSelectedJadwal(null);
    }
  }, [selectedDokter]);

  useEffect(() => {
    if (selectedDate && jadwalList.length > 0) {
      const dayOfWeek = getDay(selectedDate);
      const hari = hariMapping[dayOfWeek];
      const jadwal = jadwalList.find(j => j.hari === hari);
      setSelectedJadwal(jadwal || null);
    }
  }, [selectedDate, jadwalList]);

  const fetchInitialData = async () => {
    try {
      // Get patient ID
      const { data: patient } = await supabase
        .from('pasien')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (patient) {
        setPasienId(patient.id);
      }

      // Get all doctors
      const { data: dokters } = await supabase
        .from('dokter')
        .select('id, nama, spesialisasi')
        .order('nama');

      setDokterList(dokters || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJadwal = async (dokterId: string) => {
    const { data } = await supabase
      .from('jadwal_praktik')
      .select('*')
      .eq('dokter_id', dokterId);
    
    setJadwalList(data || []);
  };

  const getAvailableDays = (): number[] => {
    return jadwalList.map(j => {
      const entries = Object.entries(hariMapping);
      const found = entries.find(([_, name]) => name === j.hari);
      return found ? parseInt(found[0]) : -1;
    }).filter(d => d !== -1);
  };

  const handleSubmit = async () => {
    if (!pasienId || !selectedDokter || !selectedDate || !selectedJadwal) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Mohon lengkapi semua data booking',
      });
      return;
    }

    if (!catatan.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Mohon isi keluhan atau catatan untuk dokter',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Get current queue number for that date
      const { count } = await supabase
        .from('kunjungan')
        .select('*', { count: 'exact', head: true })
        .eq('dokter_id', selectedDokter)
        .eq('tanggal', format(selectedDate, 'yyyy-MM-dd'));

      const nomorAntrian = (count || 0) + 1;

      // Check quota
      if (nomorAntrian > selectedJadwal.kuota) {
        toast({
          variant: 'destructive',
          title: 'Kuota Penuh',
          description: 'Maaf, kuota untuk jadwal ini sudah penuh. Silakan pilih tanggal lain.',
        });
        setSubmitting(false);
        return;
      }

      // Insert kunjungan
      const { error } = await supabase
        .from('kunjungan')
        .insert({
          pasien_id: pasienId,
          dokter_id: selectedDokter,
          jadwal_id: selectedJadwal.id,
          tanggal: format(selectedDate, 'yyyy-MM-dd'),
          waktu: selectedJadwal.jam_mulai,
          status: 'menunggu',
          nomor_antrian: nomorAntrian,
          catatan: catatan || null,
        });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: 'Booking Berhasil',
        description: `Nomor antrian Anda: ${nomorAntrian}`,
      });
    } catch (error: any) {
      console.error('Error booking:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Booking',
        description: error.message || 'Terjadi kesalahan saat booking',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PatientLayout title="Booking Kunjungan">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PatientLayout>
    );
  }

  if (success) {
    return (
      <PatientLayout title="Booking Berhasil">
        <Card className="max-w-md mx-auto mt-8">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Booking Berhasil!</h2>
            <p className="text-muted-foreground mb-6">
              Kunjungan Anda telah terdaftar. Silakan datang sesuai jadwal.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/pasien-portal/kunjungan')} className="w-full">
                Lihat Riwayat Kunjungan
              </Button>
              <Button variant="outline" onClick={() => setSuccess(false)} className="w-full">
                Booking Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout title="Booking Kunjungan">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Booking Kunjungan Baru</CardTitle>
            <CardDescription>
              Pilih dokter dan jadwal untuk membuat janji kunjungan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Select Doctor */}
            <div className="space-y-2">
              <Label>Pilih Dokter</Label>
              <Select value={selectedDokter} onValueChange={setSelectedDokter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dokter..." />
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

            {/* Select Date */}
            {selectedDokter && (
              <div className="space-y-2">
                <Label>Pilih Tanggal</Label>
                {jadwalList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Dokter ini belum memiliki jadwal praktik
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Jadwal tersedia: {jadwalList.map(j => j.hari).join(', ')}
                    </p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP", { locale: id }) : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => {
                            const dayOfWeek = getDay(date);
                            const availableDays = getAvailableDays();
                            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                            const isTooFar = date > addDays(new Date(), 30);
                            return isPast || isTooFar || !availableDays.includes(dayOfWeek);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </>
                )}
              </div>
            )}

            {/* Show Schedule Info */}
            {selectedJadwal && selectedDate && (
              <Card className="bg-accent/50">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Hari</p>
                      <p className="font-medium">{selectedJadwal.hari}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tanggal</p>
                      <p className="font-medium">{format(selectedDate, 'dd MMMM yyyy', { locale: id })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Jam Praktik</p>
                      <p className="font-medium">{selectedJadwal.jam_mulai} - {selectedJadwal.jam_selesai}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Kuota Tersedia</p>
                      <p className="font-medium">{selectedJadwal.kuota} pasien</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>Catatan / Keluhan <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Tuliskan keluhan atau catatan untuk dokter..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Submit */}
            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={!selectedDokter || !selectedDate || !selectedJadwal || !catatan.trim() || submitting}
            >
              {submitting ? 'Memproses...' : 'Konfirmasi Booking'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
}
