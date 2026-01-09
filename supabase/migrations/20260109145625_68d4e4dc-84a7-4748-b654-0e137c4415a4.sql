-- Add 'pasien' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'pasien';

-- Create pasien table
CREATE TABLE public.pasien (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no_rm TEXT UNIQUE NOT NULL,
  nik TEXT UNIQUE NOT NULL,
  nama_lengkap TEXT NOT NULL,
  jenis_kelamin TEXT NOT NULL CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
  tanggal_lahir DATE NOT NULL,
  alamat TEXT,
  no_hp TEXT,
  status_bpjs BOOLEAN DEFAULT false,
  kontak_darurat TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create dokter table
CREATE TABLE public.dokter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  sip TEXT UNIQUE NOT NULL,
  spesialisasi TEXT NOT NULL,
  no_hp TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create jadwal_praktik table
CREATE TABLE public.jadwal_praktik (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dokter_id UUID NOT NULL REFERENCES public.dokter(id) ON DELETE CASCADE,
  hari TEXT NOT NULL CHECK (hari IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')),
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  kuota INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create kunjungan table
CREATE TABLE public.kunjungan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pasien_id UUID NOT NULL REFERENCES public.pasien(id) ON DELETE CASCADE,
  dokter_id UUID NOT NULL REFERENCES public.dokter(id) ON DELETE CASCADE,
  jadwal_id UUID REFERENCES public.jadwal_praktik(id) ON DELETE SET NULL,
  tanggal DATE NOT NULL,
  waktu TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'diperiksa', 'selesai', 'batal')),
  nomor_antrian INTEGER,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create rekam_medis table
CREATE TABLE public.rekam_medis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kunjungan_id UUID UNIQUE NOT NULL REFERENCES public.kunjungan(id) ON DELETE CASCADE,
  keluhan TEXT,
  anamnesis TEXT,
  diagnosa TEXT,
  tindakan TEXT,
  resep TEXT,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.pasien ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jadwal_praktik ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kunjungan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rekam_medis ENABLE ROW LEVEL SECURITY;

-- Function to generate nomor rekam medis
CREATE OR REPLACE FUNCTION public.generate_no_rm()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_no_rm TEXT;
  year_part TEXT;
  seq_num INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(no_rm FROM 6) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.pasien
  WHERE no_rm LIKE 'RM-' || year_part || '%';
  
  new_no_rm := 'RM-' || year_part || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN new_no_rm;
END;
$$;

-- Function to check if user is pasien owner
CREATE OR REPLACE FUNCTION public.is_pasien_owner(_user_id uuid, _pasien_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.pasien
    WHERE id = _pasien_id
      AND user_id = _user_id
  )
$$;

-- Function to get pasien_id from user_id
CREATE OR REPLACE FUNCTION public.get_pasien_id_by_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.pasien
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Update triggers for updated_at
CREATE TRIGGER update_pasien_updated_at
  BEFORE UPDATE ON public.pasien
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dokter_updated_at
  BEFORE UPDATE ON public.dokter
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jadwal_praktik_updated_at
  BEFORE UPDATE ON public.jadwal_praktik
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kunjungan_updated_at
  BEFORE UPDATE ON public.kunjungan
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rekam_medis_updated_at
  BEFORE UPDATE ON public.rekam_medis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ===== RLS POLICIES =====

-- PASIEN TABLE POLICIES
CREATE POLICY "Admin can manage all pasien" ON public.pasien
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Dokter can view all pasien" ON public.pasien
FOR SELECT USING (has_role(auth.uid(), 'dokter'));

CREATE POLICY "Manajemen can view all pasien" ON public.pasien
FOR SELECT USING (has_role(auth.uid(), 'manajemen'));

CREATE POLICY "Pasien can view own data" ON public.pasien
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Pasien can update own data" ON public.pasien
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "New users can insert pasien" ON public.pasien
FOR INSERT WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- DOKTER TABLE POLICIES
CREATE POLICY "Admin can manage all dokter" ON public.dokter
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view dokter" ON public.dokter
FOR SELECT USING (true);

-- JADWAL PRAKTIK POLICIES
CREATE POLICY "Admin can manage jadwal" ON public.jadwal_praktik
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Dokter can manage own jadwal" ON public.jadwal_praktik
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.dokter 
    WHERE dokter.id = jadwal_praktik.dokter_id 
    AND dokter.user_id = auth.uid()
  )
);

CREATE POLICY "Everyone can view jadwal" ON public.jadwal_praktik
FOR SELECT USING (true);

-- KUNJUNGAN POLICIES
CREATE POLICY "Admin can manage all kunjungan" ON public.kunjungan
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Dokter can view and update kunjungan" ON public.kunjungan
FOR SELECT USING (has_role(auth.uid(), 'dokter'));

CREATE POLICY "Dokter can update kunjungan" ON public.kunjungan
FOR UPDATE USING (has_role(auth.uid(), 'dokter'));

CREATE POLICY "Pasien can view own kunjungan" ON public.kunjungan
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.pasien
    WHERE pasien.id = kunjungan.pasien_id
    AND pasien.user_id = auth.uid()
  )
);

CREATE POLICY "Pasien can insert own kunjungan" ON public.kunjungan
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pasien
    WHERE pasien.id = kunjungan.pasien_id
    AND pasien.user_id = auth.uid()
  )
);

CREATE POLICY "Pasien can cancel own kunjungan" ON public.kunjungan
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.pasien
    WHERE pasien.id = kunjungan.pasien_id
    AND pasien.user_id = auth.uid()
  )
  AND status = 'menunggu'
);

-- REKAM MEDIS POLICIES
CREATE POLICY "Admin can manage all rekam medis" ON public.rekam_medis
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Dokter can manage rekam medis" ON public.rekam_medis
FOR ALL USING (has_role(auth.uid(), 'dokter'));

CREATE POLICY "Pasien can view own rekam medis" ON public.rekam_medis
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.kunjungan k
    JOIN public.pasien p ON k.pasien_id = p.id
    WHERE k.id = rekam_medis.kunjungan_id
    AND p.user_id = auth.uid()
  )
);

-- Allow unauthenticated users to insert user_roles during signup
CREATE POLICY "Users can insert their own role" ON public.user_roles
FOR INSERT WITH CHECK (auth.uid() = user_id);