import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Akses Ditolak</h1>
        <p className="text-muted-foreground mb-6">
          Anda tidak memiliki izin untuk mengakses halaman ini. 
          Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
        </p>
        <Button onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Button>
      </div>
    </div>
  );
}
