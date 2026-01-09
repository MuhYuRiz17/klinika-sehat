import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getPasienById } from "@/lib/mockData";

export default function PasienForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);
  const existingPasien = id ? getPasienById(id) : null;

  const [formData, setFormData] = useState({
    nik: existingPasien?.nik || "",
    namaLengkap: existingPasien?.namaLengkap || "",
    jenisKelamin: existingPasien?.jenisKelamin || "",
    tanggalLahir: existingPasien?.tanggalLahir || "",
    alamat: existingPasien?.alamat || "",
    noHp: existingPasien?.noHp || "",
    statusBpjs: existingPasien?.statusBpjs || false,
    kontakDarurat: existingPasien?.kontakDarurat || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nik || !formData.namaLengkap || !formData.jenisKelamin || !formData.tanggalLahir) {
      toast({
        title: "Validasi Gagal",
        description: "Harap lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    if (formData.nik.length !== 16) {
      toast({
        title: "Validasi Gagal",
        description: "NIK harus terdiri dari 16 digit",
        variant: "destructive",
      });
      return;
    }

    // Simulate save
    toast({
      title: isEdit ? "Data Berhasil Diperbarui" : "Pasien Berhasil Ditambahkan",
      description: `Data pasien ${formData.namaLengkap} telah disimpan`,
    });
    
    navigate("/pasien");
  };

  return (
    <MainLayout title={isEdit ? "Edit Pasien" : "Tambah Pasien"}>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link to="/pasien">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="page-title">
              {isEdit ? "Edit Data Pasien" : "Pendaftaran Pasien Baru"}
            </h1>
            <p className="page-subtitle">
              {isEdit ? "Perbarui informasi pasien" : "Isi formulir untuk mendaftarkan pasien baru"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="stat-card space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nik">NIK <span className="text-destructive">*</span></Label>
              <Input
                id="nik"
                placeholder="Masukkan 16 digit NIK"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                maxLength={16}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noRm">No. Rekam Medis</Label>
              <Input
                id="noRm"
                placeholder="Otomatis"
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="namaLengkap">Nama Lengkap <span className="text-destructive">*</span></Label>
            <Input
              id="namaLengkap"
              placeholder="Masukkan nama lengkap pasien"
              value={formData.namaLengkap}
              onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jenisKelamin">Jenis Kelamin <span className="text-destructive">*</span></Label>
              <Select
                value={formData.jenisKelamin}
                onValueChange={(value) => setFormData({ ...formData, jenisKelamin: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggalLahir">Tanggal Lahir <span className="text-destructive">*</span></Label>
              <Input
                id="tanggalLahir"
                type="date"
                value={formData.tanggalLahir}
                onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea
              id="alamat"
              placeholder="Masukkan alamat lengkap"
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="noHp">No. HP</Label>
              <Input
                id="noHp"
                placeholder="08xxxxxxxxxx"
                value={formData.noHp}
                onChange={(e) => setFormData({ ...formData, noHp: e.target.value.replace(/\D/g, '') })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kontakDarurat">Kontak Darurat</Label>
              <Input
                id="kontakDarurat"
                placeholder="08xxxxxxxxxx"
                value={formData.kontakDarurat}
                onChange={(e) => setFormData({ ...formData, kontakDarurat: e.target.value.replace(/\D/g, '') })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="statusBpjs" className="font-medium">
                Peserta BPJS
              </Label>
              <p className="text-sm text-muted-foreground">
                Pasien memiliki jaminan BPJS Kesehatan
              </p>
            </div>
            <Switch
              id="statusBpjs"
              checked={formData.statusBpjs}
              onCheckedChange={(checked) => setFormData({ ...formData, statusBpjs: checked })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button asChild variant="outline">
              <Link to="/pasien">Batal</Link>
            </Button>
            <Button type="submit" className="gradient-primary border-0">
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? "Simpan Perubahan" : "Daftarkan Pasien"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
