/**
 * Website Inquiries & Leads Capture Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 17 (Website Leads), Section 18 (Cross-department workflow: Website -> Marketing).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Inbox, ArrowUpRight, Phone, Mail, Building2, Calendar, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';
import { cmsAdapter } from '@/services/adapters/cmsAdapter';

export default function InquiryListPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cmsAdapter.getInquiries({ search, page, pageSize: 10 });
      if (res.data) {
        setInquiries(res.data);
        setMeta(res.meta);
      }
    } catch {
      toast.error('Gagal memuat pesan inquiry masuk.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <Inbox className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-ink">
              Penerusan Formulir Konsultasi Publik ke Basis Data Prospek Marketing
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Setiap kali calon klien mengirimkan permohonan konsultasi melalui halaman publik www.barak.co.id/contact, sistem secara otomatis mencatat inquiry ke dalam repositori ini dan meneruskannya sebagai Prospek Baru (Lead Source: Website) pada modul Marketing tanpa duplikasi data.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div className="relative min-w-[240px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Cari nama, perusahaan, telepon, pesan..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
          />
        </div>
        <div className="text-xs text-muted">
          Total: <span className="font-semibold text-ink">{meta.total}</span> pesan masuk
        </div>
      </div>

      {/* Inquiries Table */}
      {loading ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateLoading message="Memuat arsip formulir konsultasi masuk..." />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateEmpty
            title="Tidak ada pesan inquiry"
            description="Belum ada pesan inquiry atau permohonan konsultasi yang masuk dari website publik."
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border text-muted font-medium">
                  <th className="py-3 px-4">No. Inquiry & Waktu</th>
                  <th className="py-3 px-4">Calon Klien & Perusahaan</th>
                  <th className="py-3 px-4">Kontak (Telp / Email)</th>
                  <th className="py-3 px-4">Layanan yang Diminati</th>
                  <th className="py-3 px-4">Isi Pesan Kebutuhan</th>
                  <th className="py-3 px-4">Status Integrasi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-semibold text-ink">{inq.id}</div>
                      <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(inq.submittedAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-ink">{inq.name}</div>
                      <div className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-primary-red shrink-0" />
                        <span>{inq.company}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs text-ink font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted shrink-0" />
                        <span>{inq.phone}</span>
                      </div>
                      <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-muted shrink-0" />
                        <span>{inq.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {inq.serviceLabel || inq.service}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-[260px]">
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                        "{inq.message || 'Tidak ada pesan tertulis.'}"
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Terkoneksi ke Lead</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/ops/marketing/leads"
                        className="text-xs text-primary-red hover:text-red-700 font-medium inline-flex items-center gap-1"
                      >
                        <span>Lihat di Leads</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted">
            <div>
              Total: <span className="font-semibold text-ink">{meta.total}</span> inquiry masuk (Halaman {meta.page} dari {meta.totalPages || 1})
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
