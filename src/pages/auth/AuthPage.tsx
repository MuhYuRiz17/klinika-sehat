import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Heart, Stethoscope } from 'lucide-react';

type AppRole = 'admin' | 'dokter' | 'manajemen';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupRole, setSignupRole] = useState<AppRole>('admin');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: error.message === 'Invalid login credentials' 
          ? 'Email atau password salah' 
          : error.message,
      });
    } else {
      toast({
        title: 'Login Berhasil',
        description: 'Selamat datang kembali!',
      });
      navigate('/');
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!signupName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Registrasi Gagal',
        description: 'Nama lengkap harus diisi',
      });
      setIsLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Registrasi Gagal',
        description: 'Password minimal 6 karakter',
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(signupEmail, signupPassword, signupName, signupRole);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Registrasi Gagal',
        description: error.message === 'User already registered'
          ? 'Email sudah terdaftar'
          : error.message,
      });
    } else {
      toast({
        title: 'Registrasi Berhasil',
        description: 'Akun berhasil dibuat. Silakan login.',
      });
      navigate('/');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Klinik Pratama</h1>
          <p className="text-muted-foreground mt-1">Sistem Informasi Rekam Medis</p>
        </div>

        {/* Patient Portal Link */}
        <Card className="mb-4 border-pink-200 bg-pink-50/50">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-center text-muted-foreground mb-2">Untuk pasien:</p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/auth/pasien')}>
              Daftar / Login Portal Pasien
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Daftar</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle className="text-lg">Masuk ke Akun</CardTitle>
                  <CardDescription>
                    Masukkan email dan password Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="email@klinik.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Memproses...' : 'Masuk'}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardHeader>
                  <CardTitle className="text-lg">Buat Akun Baru</CardTitle>
                  <CardDescription>
                    Daftarkan akun untuk mengakses sistem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nama Lengkap</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Dr. John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="email@klinik.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Role</Label>
                    <Select value={signupRole} onValueChange={(v) => setSignupRole(v as AppRole)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin / Staff Pendaftaran</SelectItem>
                        <SelectItem value="dokter">Dokter</SelectItem>
                        <SelectItem value="manajemen">Manajemen / Kepala Klinik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Memproses...' : 'Daftar'}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Stethoscope className="inline h-4 w-4 mr-1" />
          Sistem Informasi Klinik Pratama v1.0
        </p>
      </div>
    </div>
  );
}
