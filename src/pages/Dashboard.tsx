import { Users, UserCheck, ClipboardList, Stethoscope } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentVisits } from "@/components/dashboard/RecentVisits";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { pasienData, kunjunganData, dokterData } from "@/lib/mockData";

export default function Dashboard() {
  const totalPasien = pasienData.length;
  const kunjunganHariIni = kunjunganData.filter(k => 
    k.tanggalWaktu.startsWith('2025-01-09')
  ).length;
  const pasienMenunggu = kunjunganData.filter(k => 
    k.statusKunjungan === 'menunggu'
  ).length;
  const totalDokter = dokterData.length;

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
            value={totalPasien}
            subtitle="Pasien terdaftar"
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Kunjungan Hari Ini"
            value={kunjunganHariIni}
            subtitle="Pasien berkunjung"
            icon={ClipboardList}
            variant="primary"
          />
          <StatCard
            title="Pasien Menunggu"
            value={pasienMenunggu}
            subtitle="Dalam antrian"
            icon={UserCheck}
          />
          <StatCard
            title="Dokter Aktif"
            value={totalDokter}
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
