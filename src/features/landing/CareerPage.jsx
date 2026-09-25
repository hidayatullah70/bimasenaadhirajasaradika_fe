/**
 * Public Career Page — PT. BARAK
 * Source of Truth: PRD Section 2.1 (Public Site: Career) & Section 17 (CMS: Careers).
 */

import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Users, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import { cmsAdapter } from '@/services/adapters/cmsAdapter';
import { StateLoading } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';

export default function CareerPage() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCareers() {
      try {
        const res = await cmsAdapter.getCareers({ status: 'PUBLISHED' });
        if (res.data) setCareers(res.data);
      } finally {
        setLoading(false);
      }
    }
    loadCareers();
  }, []);

  const handleApply = (job) => {
    toast.success(`Silakan kirimkan berkas CV & KTA Anda ke email: hrd@barak.co.id dengan subjek: LAMARAN - ${job.title}`, {
      duration: 6000,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="bg-ink py-20">
          <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent-green/20 text-accent-green border border-accent-green/30 mb-3">
              Peluang Karir Terbuka
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Karir di PT. BARAK
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-sm sm:text-base">
              Bergabunglah dengan tim profesional PT. BARAK. Kami menawarkan kepastian upah standar UMK, perlindungan BPJS Ketenagakerjaan lengkap, dan jenjang karir yang terstruktur.
            </p>
          </div>
        </section>

        {/* Job Listings */}
        <section className="py-16 bg-canvas">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-ink">Lowongan Aktif Saat Ini</h2>
                <p className="text-xs text-muted mt-0.5">Penempatan di kawasan mitra Jabodetabek & Banten</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-border text-ink">
                {careers.length} Posisi Terbuka
              </span>
            </div>

            {loading ? (
              <div className="py-16">
                <StateLoading message="Memuat daftar lowongan karir..." />
              </div>
            ) : careers.length === 0 ? (
              <div className="bg-surface rounded-xl border border-border p-12 text-center">
                <Briefcase className="w-12 h-12 text-muted mx-auto mb-3" />
                <h3 className="text-base font-bold text-ink">Belum ada lowongan terbuka</h3>
                <p className="text-xs text-muted mt-1">Nantikan pembaruan informasi rekrutmen kami berikutnya.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {careers.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl border border-border p-6 shadow-xs hover:shadow-md hover:border-primary-red/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {job.employmentType}
                        </span>
                        <span className="text-xs font-semibold text-primary-red">
                          Kuota: {job.manpowerQuota} Personel
                        </span>
                      </div>

                      {/* Title & Dept */}
                      <h3 className="text-lg font-bold text-ink leading-snug">
                        {job.title}
                      </h3>
                      <p className="text-xs text-muted mt-1 font-medium">
                        {job.departmentLabel || job.department}
                      </p>

                      {/* Location & Salary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="flex items-center gap-2 text-slate-700">
                          <MapPin className="w-4 h-4 text-primary-red shrink-0" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 font-semibold">
                          <Users className="w-4 h-4 text-info shrink-0" />
                          <span>{job.salaryRange}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {job.description}
                      </p>

                      {/* Requirements Checklist */}
                      <div className="space-y-1.5 pt-3 border-t border-border">
                        <h4 className="text-xs font-semibold text-ink mb-1">Kualifikasi Persyaratan:</h4>
                        {job.requirements?.map((req, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent-green shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-5 mt-5 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-muted flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Batas: {job.deadline}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleApply(job)}
                        className="px-4 py-2 bg-primary-red hover:bg-red-800 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Kirim Lamaran</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
