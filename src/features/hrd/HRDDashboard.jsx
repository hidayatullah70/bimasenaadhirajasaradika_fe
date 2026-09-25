/**
 * HRD Dashboard — PT. BARAK IOMS
 * Source of Truth: PRD Section 11 & IMPLEMENTATION-PLAN Phase 3.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Users, FileSpreadsheet, Calculator, FileCheck2, ArrowRight } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MOCK_EMPLOYEES } from '@/services/mock/mockMasterData';
import { INITIAL_ATTENDANCE_SHEETS } from '@/services/mock/mockAttendanceData';

const KPIS = [
  {
    title: 'Total Karyawan Aktif',
    value: MOCK_EMPLOYEES.length,
    icon: <Users className="h-5 w-5 text-primary-red" />,
    iconBg: 'bg-primary-red/10',
    subtitle: `${MOCK_EMPLOYEES.filter((e) => e.status_kerja === 'TETAP').length} Tetap, ${MOCK_EMPLOYEES.filter((e) => e.status_kerja === 'KONTRAK').length} Kontrak`,
  },
  {
    title: 'Lembar Absensi Aktif',
    value: INITIAL_ATTENDANCE_SHEETS.filter((s) => s.status === 'OPEN').length,
    icon: <FileSpreadsheet className="h-5 w-5 text-info" />,
    iconBg: 'bg-info/10',
    subtitle: 'Periode September 2026',
  },
  {
    title: 'Kontrak Segera Berakhir',
    value: 1,
    icon: <FileCheck2 className="h-5 w-5 text-warning" />,
    iconBg: 'bg-warning/10',
    subtitle: 'kurang dari 30 hari',
  },
  {
    title: 'Kesiapan Payroll',
    value: '88%',
    icon: <Calculator className="h-5 w-5 text-success" />,
    iconBg: 'bg-success/10',
    subtitle: 'rekap kehadiran terverifikasi',
  },
];

export default function HRDDashboard() {
  return (
    <DashboardShell
      kpis={KPIS}
      description="Pusat kendali personalia, spreadsheet absensi dinamis, dan verifikasi input penggajian."
      widgets={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Quick Access Card */}
          <Card>
            <CardHeader>
              <CardTitle>Modul Kerja HRD</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  {
                    title: 'Attendance Spreadsheet',
                    desc: 'Input check-in/out harian & validasi roster',
                    path: '/ops/hrd/attendance',
                    icon: FileSpreadsheet,
                    color: 'text-primary-red',
                  },
                  {
                    title: 'Rekap Input Payroll',
                    desc: 'Ringkasan kehadiran bulanan untuk Finance',
                    path: '/ops/hrd/payroll-summary',
                    icon: Calculator,
                    color: 'text-info',
                  },
                  {
                    title: 'Master Karyawan',
                    desc: 'Profil lengkap 40 personel & data sensitif',
                    path: '/ops/master/employees',
                    icon: Users,
                    color: 'text-success',
                  },
                  {
                    title: 'Kontrak & Dokumen',
                    desc: 'Peringatan PKWT/PKWTT & kelengkapan berkas',
                    path: '/ops/hrd/contracts',
                    icon: FileCheck2,
                    color: 'text-warning',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="p-3.5 rounded-xl border border-border bg-white hover:border-primary-red/40 hover:shadow-xs transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className={`h-4 w-4 ${item.color}`} />
                          <h4 className="font-bold text-ink group-hover:text-primary-red transition-colors">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-muted leading-relaxed">{item.desc}</p>
                      </div>
                      <div className="mt-3 flex items-center text-[11px] font-semibold text-primary-red">
                        <span>Buka Halaman</span>
                        <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Roster & Expiry Alerts Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Lembar Absensi Terkini</CardTitle>
              <Link to="/ops/hrd/attendance" className="text-xs text-primary-red hover:underline font-medium">
                Lihat Semua
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border text-xs">
                {INITIAL_ATTENDANCE_SHEETS.slice(0, 3).map((s) => (
                  <Link
                    key={s.id}
                    to="/ops/hrd/attendance"
                    className="flex items-center justify-between p-4 hover:bg-canvas transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-ink">{s.clientName}</p>
                      <p className="text-muted text-[11px]">{s.locationName} • {s.periodName}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'FINALIZED' ? 'bg-slate/10 text-muted' : 'bg-success/10 text-success'
                    }`}>
                      {s.status}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
