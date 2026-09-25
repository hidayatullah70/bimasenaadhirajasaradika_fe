/**
 * Client Handover Archive Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 15 (Handover Client WON) & Section 18 (Cross-department workflow: Marketing -> Ops & Finance).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle2, Shield, DollarSign, FileText, ArrowUpRight, Building2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';
import { marketingAdapter } from '@/services/adapters/marketingAdapter';

export default function ClientHandoverPage() {
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketingAdapter.getHandovers({ search, pageSize: 50 });
      if (res.data) {
        setHandovers(res.data);
      }
    } catch {
      toast.error('Gagal memuat arsip serah terima klien.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-5">
      {/* Header Info Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <CheckCircle2 className="w-5 h-5 text-accent-green shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-ink">
              Protokol Serah Terima Klien WON (Cross-Department Handover)
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Setiap peluang penjualan (opportunity) yang dimenangkan (WON) secara otomatis menghasilkan berkas serah terima resmi ke divisi Operasional (pembukaan pos & penempatan alokasi personel satpam) serta divisi Finance (penerbitan termin tagihan & akun piutang usaha).
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div className="relative min-w-[240px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Cari arsip serah terima, nama klien, PKS, PIC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
          />
        </div>
        <div className="text-xs text-muted">
          Total Handover: <span className="font-semibold text-ink">{handovers.length}</span> klien
        </div>
      </div>

      {/* Handover Cards List */}
      {loading ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateLoading message="Memuat arsip serah terima klien WON..." />
        </div>
      ) : handovers.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateEmpty
            title="Tidak ada berkas serah terima"
            description="Belum ada catatan serah terima klien yang sesuai dengan kriteria pencarian Anda."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {handovers.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-border p-5 shadow-xs hover:border-accent-green/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
                  <div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.id}
                    </span>
                    <h4 className="text-sm font-bold text-ink mt-1.5 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-primary-red shrink-0" />
                      <span>{item.companyName}</span>
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.status || 'COMPLETED'}</span>
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 py-3 text-xs">
                  <div>
                    <span className="text-muted block text-[11px]">Layanan:</span>
                    <span className="font-semibold text-ink">{item.serviceType}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Kuota Manpower:</span>
                    <span className="font-semibold text-ink">{item.manpowerQuota} Personel</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Nilai Tagihan Bulanan:</span>
                    <span className="font-bold text-ink">{formatRupiah(item.monthlyBilling)}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Termin Penagihan:</span>
                    <span className="font-medium text-ink">{item.billingTerm}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted block text-[11px]">Nomor Kontrak PKS:</span>
                    <span className="font-mono font-medium text-ink bg-slate-50 px-2 py-0.5 rounded inline-block">
                      {item.signedContractNumber}
                    </span>
                  </div>
                </div>

                {/* Cross-department PICs */}
                <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-xs border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-info shrink-0" />
                    <div>
                      <span className="text-[11px] text-muted block">PIC Operasional (Manpower & Pos):</span>
                      <span className="font-medium text-ink">{item.operationsPic}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-accent-green shrink-0" />
                    <div>
                      <span className="text-[11px] text-muted block">PIC Finance (Billing & AR):</span>
                      <span className="font-medium text-ink">{item.financePic}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-red shrink-0" />
                    <div>
                      <span className="text-[11px] text-muted block">Tanggal Serah Terima:</span>
                      <span className="font-medium text-ink">{item.handoverDate}</span>
                    </div>
                  </div>
                </div>

                {/* Handover Notes */}
                {item.notes && (
                  <p className="text-xs text-muted italic mt-3 bg-white p-2 border border-border rounded">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {/* Action Links to Cross-module endpoints */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-border text-xs">
                <Link
                  to="/ops/manpower"
                  className="text-info hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Ke Pos Operasional</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>

                <Link
                  to="/ops/finance/invoices"
                  className="text-accent-green hover:text-emerald-700 font-medium inline-flex items-center gap-1"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Ke Billing Finance</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
