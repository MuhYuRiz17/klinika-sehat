import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
import AuthPage from "./pages/auth/AuthPage";
import PatientSignup from "./pages/auth/PatientSignup";
import Unauthorized from "./pages/Unauthorized";

// Patient Portal Pages
import PatientDashboard from "./pages/pasien-portal/PatientDashboard";
import PatientBooking from "./pages/pasien-portal/PatientBooking";
import PatientVisitHistory from "./pages/pasien-portal/PatientVisitHistory";
import PatientMedicalRecords from "./pages/pasien-portal/PatientMedicalRecords";
import PatientMedicalRecordDetail from "./pages/pasien-portal/PatientMedicalRecordDetail";
import PatientProfile from "./pages/pasien-portal/PatientProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/pasien" element={<PatientSignup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Patient Portal Routes */}
            <Route path="/pasien-portal/dashboard" element={
              <ProtectedRoute allowedRoles={['pasien']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/pasien-portal/booking" element={
              <ProtectedRoute allowedRoles={['pasien']}>
                <PatientBooking />
              </ProtectedRoute>
            } />
            <Route path="/pasien-portal/kunjungan" element={
              <ProtectedRoute allowedRoles={['pasien']}>
                <PatientVisitHistory />
              </ProtectedRoute>
            } />
            <Route path="/pasien-portal/rekam-medis" element={
              <ProtectedRoute allowedRoles={['pasien']}>
                <PatientMedicalRecords />
              </ProtectedRoute>
            } />
            <Route path="/pasien-portal/rekam-medis/:id" element={
              <ProtectedRoute allowedRoles={['pasien']}>
                <PatientMedicalRecordDetail />
              </ProtectedRoute>
            } />
            <Route path="/pasien-portal/profil" element={
              <ProtectedRoute allowedRoles={['pasien']}>
                <PatientProfile />
              </ProtectedRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Pasien Routes - All roles can view, Admin can manage */}
            <Route path="/pasien" element={
              <ProtectedRoute>
                <PasienList />
              </ProtectedRoute>
            } />
            <Route path="/pasien/tambah" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PasienForm />
              </ProtectedRoute>
            } />
            <Route path="/pasien/:id" element={
              <ProtectedRoute>
                <PasienDetail />
              </ProtectedRoute>
            } />
            <Route path="/pasien/:id/edit" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PasienForm />
              </ProtectedRoute>
            } />
            
            {/* Dokter Routes - Admin & Manajemen only */}
            <Route path="/dokter" element={
              <ProtectedRoute allowedRoles={['admin', 'manajemen']}>
                <DokterList />
              </ProtectedRoute>
            } />
            <Route path="/dokter/tambah" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PasienForm />
              </ProtectedRoute>
            } />
            <Route path="/dokter/:id/edit" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PasienForm />
              </ProtectedRoute>
            } />
            
            {/* Kunjungan Routes - Admin & Dokter */}
            <Route path="/kunjungan" element={
              <ProtectedRoute allowedRoles={['admin', 'dokter']}>
                <KunjunganList />
              </ProtectedRoute>
            } />
            <Route path="/kunjungan/tambah" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <KunjunganForm />
              </ProtectedRoute>
            } />
            
            {/* Rekam Medis Routes - Admin & Dokter */}
            <Route path="/rekam-medis" element={
              <ProtectedRoute allowedRoles={['admin', 'dokter']}>
                <RekamMedisList />
              </ProtectedRoute>
            } />
            <Route path="/rekam-medis/:id" element={
              <ProtectedRoute allowedRoles={['admin', 'dokter']}>
                <RekamMedisDetail />
              </ProtectedRoute>
            } />
            
            {/* Jadwal Routes - All roles */}
            <Route path="/jadwal" element={
              <ProtectedRoute>
                <JadwalList />
              </ProtectedRoute>
            } />
            
            {/* Laporan Routes - Admin & Manajemen */}
            <Route path="/laporan" element={
              <ProtectedRoute allowedRoles={['admin', 'manajemen']}>
                <LaporanPeriode />
              </ProtectedRoute>
            } />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
