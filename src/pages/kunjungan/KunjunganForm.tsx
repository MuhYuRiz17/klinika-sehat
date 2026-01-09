import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Search, User } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { pasienData, dokterData, getJadwalByDokterId } from "@/lib/mockData";

export default function KunjunganForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchPasien, setSearchPasien] = useState("");
  const [selectedPasien, setSelectedPasien] = useState<string>("");
  const [selectedDokter, setSelectedDokter] = useState<string>("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [waktu, setWaktu] = useState("08:00");

  const filteredPasien = pasienData.filter(
    (p) =>
      p.namaLengkap.toLowerCase().includes(searchPasien.toLowerCase()) ||
      p.nik.includes(searchPasien) ||
      p.noRm.toLowerCase().includes(searchPasien.toLowerCase())
  );

  const selectedPasienData = pasienData.find(p => p.id === selectedPasien);
  const jadwalDokter = selectedDokter ? getJadwalByDokterId(selectedDokter) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPasien || !selectedDokter) {
      toast({
        title: "Validasi Gagal",
        description: "Pilih pasien dan dokter terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Kunjungan Berhasil Dibuat",
      description: "Pasien telah terdaftar dalam antrian",
    });

    navigate("/kunjungan");
  };

  return (
    <MainLayout title="Buat Kunjungan">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link to="/kunjungan">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="page-title">Pendaftaran Kunjungan</h1>
            <p className="page-subtitle">Daftarkan kunjungan pasien ke dokter</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cari Pasien */}
          <div className="stat-card">
            <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
              1. Pilih Pasien
            </h3>
            
            {!selectedPasien ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari berdasarkan nama, NIK, atau No. RM..."
                    value={searchPasien}
                    onChange={(e) => setSearchPasien(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {searchPasien && (
                  <div className="max-h-60 overflow-auto rounded-lg border border-border">
                    {filteredPasien.map((pasien) => (
                      <button
                        key={pasien.id}
                        type="button"
                        onClick={() => setSelectedPasien(pasien.id)}
                        className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{pasien.namaLengkap}</p>
                          <p className="text-sm text-muted-foreground">
                            {pasien.noRm} • {pasien.nik}
                          </p>
                        </div>
                      </button>
                    ))}
                    {filteredPasien.length === 0 && (
                      <div className="p-4 text-center text-muted-foreground">
                        Pasien tidak ditemukan.{" "}
                        <Link to="/pasien/tambah" className="text-primary hover:underline">
                          Daftarkan pasien baru
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{selectedPasienData?.namaLengkap}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedPasienData?.noRm} • {selectedPasienData?.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </p>
                  </div>
                </div>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedPasien("")}
                >
                  Ganti
                </Button>
              </div>
            )}
          </div>

          {/* Pilih Dokter */}
          <div className="stat-card">
            <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
              2. Pilih Dokter & Jadwal
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Dokter</Label>
                <Select value={selectedDokter} onValueChange={setSelectedDokter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih dokter" />
                  </SelectTrigger>
                  <SelectContent>
                    {dokterData.map((dokter) => (
                      <SelectItem key={dokter.id} value={dokter.id}>
                        <div>
                          <p>{dokter.namaDokter}</p>
                          <p className="text-xs text-muted-foreground">{dokter.spesialisasi}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tanggal Kunjungan</Label>
                <Input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {jadwalDokter.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Jadwal praktik dokter:</p>
                <div className="flex flex-wrap gap-2">
                  {jadwalDokter.map((jadwal) => (
                    <span key={jadwal.id} className="text-xs bg-muted px-2 py-1 rounded-md">
                      {jadwal.hari}: {jadwal.jamMulai} - {jadwal.jamSelesai}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button asChild variant="outline">
              <Link to="/kunjungan">Batal</Link>
            </Button>
            <Button type="submit" className="gradient-primary border-0">
              <Save className="mr-2 h-4 w-4" />
              Daftarkan Kunjungan
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
