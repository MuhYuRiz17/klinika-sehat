import { useState, useEffect } from "react";
import { Users, UserCheck, ClipboardList, Stethoscope } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentVisits } from "@/components/dashboard/RecentVisits";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPasien: 0,
    kunjunganHariIni: 0,
    pasienMenunggu: 0,
    totalDokter: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch all stats in parallel
      const [
        { count: totalPasien },
        { count: totalDokter },
        { count: kunjunganHariIni },
        { count: pasienMenunggu },
      ] = await Promise.all([
        supabase.from('pasien').select('*', { count: 'exact', head: true }),
        supabase.from('dokter').select('*', { count: 'exact', head: true }),
        supabase.from('kunjungan').select('*', { count: 'exact', head: true }).eq('tanggal', today),
        supabase.from('kunjungan').select('*', { count: 'exact', head: true }).eq('status', 'menunggu'),
      ]);

      setStats({
        totalPasien: totalPasien || 0,
        kunjunganHariIni: kunjunganHariIni || 0,
        pasienMenunggu: pasienMenunggu || 0,
        totalDokter: totalDokter || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="rounded-xl gradient-hero p-6 text-white animate-fade-in">
          <h2 className="font-heading text-2xl font-bold">
            Selamat Datang di Klinik Pratama
          </h2>
          <p className="mt-1 text-white/80">
            Sistem Informasi Manajemen Pasien & Rekam Medis
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Pasien"
            value={loading ? "-" : stats.totalPasien}
            subtitle="Pasien terdaftar"
            icon={Users}
          />
          <StatCard
            title="Kunjungan Hari Ini"
            value={loading ? "-" : stats.kunjunganHariIni}
            subtitle="Pasien berkunjung"
            icon={ClipboardList}
            variant="primary"
          />
          <StatCard
            title="Pasien Menunggu"
            value={loading ? "-" : stats.pasienMenunggu}
            subtitle="Dalam antrian"
            icon={UserCheck}
          />
          <StatCard
            title="Dokter Aktif"
            value={loading ? "-" : stats.totalDokter}
            subtitle="Dokter praktik"
            icon={Stethoscope}
            variant="secondary"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentVisits />
          <TodaySchedule />
        </div>
      </div>
    </MainLayout>
  );
}
