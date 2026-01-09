import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Dashboard from "./pages/Dashboard";
import PasienList from "./pages/pasien/PasienList";
import PasienDetail from "./pages/pasien/PasienDetail";
import PasienForm from "./pages/pasien/PasienForm";
import DokterList from "./pages/dokter/DokterList";
import KunjunganList from "./pages/kunjungan/KunjunganList";
import KunjunganForm from "./pages/kunjungan/KunjunganForm";
import RekamMedisList from "./pages/rekam-medis/RekamMedisList";
import RekamMedisDetail from "./pages/rekam-medis/RekamMedisDetail";
import JadwalList from "./pages/jadwal/JadwalList";
import LaporanPeriode from "./pages/laporan/LaporanPeriode";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Pasien Routes */}
          <Route path="/pasien" element={<PasienList />} />
          <Route path="/pasien/tambah" element={<PasienForm />} />
          <Route path="/pasien/:id" element={<PasienDetail />} />
          <Route path="/pasien/:id/edit" element={<PasienForm />} />
          
          {/* Dokter Routes */}
          <Route path="/dokter" element={<DokterList />} />
          <Route path="/dokter/tambah" element={<PasienForm />} />
          <Route path="/dokter/:id/edit" element={<PasienForm />} />
          
          {/* Kunjungan Routes */}
          <Route path="/kunjungan" element={<KunjunganList />} />
          <Route path="/kunjungan/tambah" element={<KunjunganForm />} />
          
          {/* Rekam Medis Routes */}
          <Route path="/rekam-medis" element={<RekamMedisList />} />
          <Route path="/rekam-medis/:id" element={<RekamMedisDetail />} />
          
          {/* Jadwal Routes */}
          <Route path="/jadwal" element={<JadwalList />} />
          
          {/* Laporan Routes */}
          <Route path="/laporan" element={<LaporanPeriode />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
