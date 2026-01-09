import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Heart, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

type Step = 'check' | 'existing' | 'new' | 'account' | 'success';

interface PasienFormData {
  nik: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  alamat: string;
  no_hp: string;
  status_bpjs: boolean;
  kontak_darurat: string;
}

export default function PatientSignup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>('check');
  const [isLoading, setIsLoading] = useState(false);
  const [isExistingPatient, setIsExistingPatient] = useState<boolean | null>(null);
  
  // Verification fields
  const [verifyNik, setVerifyNik] = useState('');
  const [verifyDob, setVerifyDob] = useState('');
  const [verifiedPasienId, setVerifiedPasienId] = useState<string | null>(null);
  
  // New patient form
  const [formData, setFormData] = useState<PasienFormData>({
    nik: '',
    nama_lengkap: '',
    jenis_kelamin: '',
    tanggal_lahir: '',
    alamat: '',
    no_hp: '',
    status_bpjs: false,
    kontak_darurat: '',
  });
  
  // Account fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleVerifyExisting = async () => {
    if (verifyNik.length !== 16) {
      toast({ variant: 'destructive', title: 'Error', description: 'NIK harus 16 digit' });
      return;
    }
    if (!verifyDob) {
      toast({ variant: 'destructive', title: 'Error', description: 'Tanggal lahir harus diisi' });
      return;
    }

    setIsLoading(true);

    try {
      // Check if patient exists and isn't already linked
      const { data, error } = await supabase
        .from('pasien')
        .select('id, nama_lengkap, user_id')
        .eq('nik', verifyNik)
        .eq('tanggal_lahir', verifyDob)
        .single();

      if (error || !data) {
        toast({
          variant: 'destructive',
          title: 'Data Tidak Ditemukan',
          description: 'Kombinasi NIK dan tanggal lahir tidak ditemukan. Silakan daftar sebagai pasien baru.',
        });
        return;
      }

      if (data.user_id) {
        toast({
          variant: 'destructive',
          title: 'Sudah Terdaftar',
          description: 'Data pasien ini sudah terhubung dengan akun lain. Silakan login atau hubungi bagian pendaftaran.',
        });
        return;
      }

      setVerifiedPasienId(data.id);
      setFormData(prev => ({ ...prev, nama_lengkap: data.nama_lengkap }));
      toast({
        title: 'Verifikasi Berhasil',
        description: `Selamat datang kembali, ${data.nama_lengkap}!`,
      });
      setStep('account');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPatientNext = () => {
    // Validation
    if (!formData.nik || formData.nik.length !== 16) {
      toast({ variant: 'destructive', title: 'Error', description: 'NIK harus 16 digit' });
      return;
    }
    if (!formData.nama_lengkap.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Nama lengkap harus diisi' });
      return;
    }
    if (!formData.jenis_kelamin) {
      toast({ variant: 'destructive', title: 'Error', description: 'Jenis kelamin harus dipilih' });
      return;
    }
    if (!formData.tanggal_lahir) {
      toast({ variant: 'destructive', title: 'Error', description: 'Tanggal lahir harus diisi' });
      return;
    }

    setStep('account');
  };

  const handleCreateAccount = async () => {
    // Validate account fields
    if (!email.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Email harus diisi' });
      return;
    }
    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password minimal 6 karakter' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password tidak cocok' });
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/pasien-portal/dashboard`;

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.nama_lengkap || verifiedPasienId ? formData.nama_lengkap : formData.nama_lengkap,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Gagal membuat akun');
      }

      // Assign pasien role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'pasien',
        });

      if (roleError) throw roleError;

      if (verifiedPasienId) {
        // Link existing patient
        const { error: linkError } = await supabase
          .from('pasien')
          .update({ user_id: authData.user.id })
          .eq('id', verifiedPasienId);

        if (linkError) throw linkError;
      } else {
        // Create new patient record
        // Generate no_rm
        const { data: noRm } = await supabase.rpc('generate_no_rm');

        const { error: pasienError } = await supabase
          .from('pasien')
          .insert({
            no_rm: noRm || `RM-${Date.now()}`,
            nik: formData.nik,
            nama_lengkap: formData.nama_lengkap,
            jenis_kelamin: formData.jenis_kelamin,
            tanggal_lahir: formData.tanggal_lahir,
            alamat: formData.alamat || null,
            no_hp: formData.no_hp || null,
            status_bpjs: formData.status_bpjs,
            kontak_darurat: formData.kontak_darurat || null,
            user_id: authData.user.id,
          });

        if (pasienError) throw pasienError;
      }

      setStep('success');
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Akun',
        description: error.message === 'User already registered' 
          ? 'Email sudah terdaftar. Silakan login.'
          : error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-background to-primary/10 p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-4">
            <Heart className="h-8 w-8 text-pink-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Portal Pasien</h1>
          <p className="text-muted-foreground mt-1">Klinik Pratama</p>
        </div>

        {/* Step: Check */}
        {step === 'check' && (
          <Card>
            <CardHeader>
              <CardTitle>Daftar Akun Pasien</CardTitle>
              <CardDescription>
                Apakah Anda sudah pernah berkunjung ke Klinik Pratama sebelumnya?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full h-auto py-4 justify-start"
                onClick={() => { setIsExistingPatient(true); setStep('existing'); }}
              >
                <div className="text-left">
                  <p className="font-medium">Ya, saya sudah pernah berkunjung</p>
                  <p className="text-sm text-muted-foreground">Hubungkan data pasien yang sudah ada</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-auto py-4 justify-start"
                onClick={() => { setIsExistingPatient(false); setStep('new'); }}
              >
                <div className="text-left">
                  <p className="font-medium">Tidak, saya pasien baru</p>
                  <p className="text-sm text-muted-foreground">Daftar sebagai pasien baru</p>
                </div>
              </Button>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full" onClick={() => navigate('/auth')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Login
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step: Existing Patient Verification */}
        {step === 'existing' && (
          <Card>
            <CardHeader>
              <CardTitle>Verifikasi Data Pasien</CardTitle>
              <CardDescription>
                Masukkan NIK dan tanggal lahir untuk memverifikasi identitas Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verify-nik">NIK (16 digit)</Label>
                <Input
                  id="verify-nik"
                  type="text"
                  maxLength={16}
                  value={verifyNik}
                  onChange={(e) => setVerifyNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="Masukkan NIK"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verify-dob">Tanggal Lahir</Label>
                <Input
                  id="verify-dob"
                  type="date"
                  value={verifyDob}
                  onChange={(e) => setVerifyDob(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('check')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <Button className="flex-1" onClick={handleVerifyExisting} disabled={isLoading}>
                {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step: New Patient Form */}
        {step === 'new' && (
          <Card>
            <CardHeader>
              <CardTitle>Data Pasien Baru</CardTitle>
              <CardDescription>
                Lengkapi data diri Anda untuk mendaftar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nik">NIK (16 digit) *</Label>
                <Input
                  id="nik"
                  type="text"
                  maxLength={16}
                  value={formData.nik}
                  onChange={(e) => setFormData(prev => ({ ...prev, nik: e.target.value.replace(/\D/g, '') }))}
                  placeholder="Masukkan NIK"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap *</Label>
                <Input
                  id="nama"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama_lengkap: e.target.value }))}
                  placeholder="Sesuai KTP"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Jenis Kelamin *</Label>
                  <Select 
                    value={formData.jenis_kelamin} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, jenis_kelamin: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Tanggal Lahir *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={(e) => setFormData(prev => ({ ...prev, tanggal_lahir: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea
                  id="alamat"
                  value={formData.alamat}
                  onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
                  placeholder="Alamat lengkap"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. HP</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.no_hp}
                  onChange={(e) => setFormData(prev => ({ ...prev, no_hp: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="bpjs">Peserta BPJS</Label>
                <Switch
                  id="bpjs"
                  checked={formData.status_bpjs}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, status_bpjs: v }))}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('check')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <Button className="flex-1" onClick={handleNewPatientNext}>
                Lanjut
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step: Create Account */}
        {step === 'account' && (
          <Card>
            <CardHeader>
              <CardTitle>Buat Akun Login</CardTitle>
              <CardDescription>
                {verifiedPasienId 
                  ? `Buat akun untuk ${formData.nama_lengkap}`
                  : 'Buat email dan password untuk login ke portal pasien'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep(verifiedPasienId ? 'existing' : 'new')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <Button className="flex-1" onClick={handleCreateAccount} disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Buat Akun'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Pendaftaran Berhasil!</h2>
              <p className="text-muted-foreground mb-6">
                Akun Anda telah dibuat. Silakan login untuk mengakses portal pasien.
              </p>
              <Button onClick={() => navigate('/auth')} className="w-full">
                Login Sekarang
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
