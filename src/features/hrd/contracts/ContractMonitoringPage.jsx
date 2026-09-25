/**
 * Contract Monitoring Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.1 & 12.1 (Employee Contracts & Expiry Alerts).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCheck2, Search, AlertTriangle, CheckCircle2,
  Calendar, ChevronLeft, ChevronRight, Clock, ShieldCheck
} from 'lucide-react';
import contractAdapter from '@/services/adapters/contractAdapter';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';

export default function ContractMonitoringPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contractAdapter.getContracts({ search, type, status, page, pageSize: 12 });
      if (res.data) {
        setContracts(res.data);
        setMeta(res.meta);
      }
    } catch {
      toast.error('Gagal memuat data kontrak karyawan.');
    } finally {
      setLoading(false);
    }
  }, [search, type, status, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExtend = async (contract) => {
    const newDate = prompt(`Masukkan tanggal berakhir kontrak baru untuk ${contract.employeeName} (YYYY-MM-DD):`, '2027-12-31');
    if (!newDate) return;

    try {
      await contractAdapter.extendContract(contract.id, {
        newEndDate: newDate,
        notes: 'Perpanjangan kontrak kerja tahunan',
      });
      toast.success(`Kontrak ${contract.employeeName} berhasil diperpanjang hingga ${newDate}.`);
      loadData();
    } catch {
      toast.error('Gagal memperpanjang kontrak.');
    }
  };

  const expiringCount = contracts.filter((c) => c.status === 'EXPIRING_SOON').length;

  return (
    <div className="space-y-4">
      {/* Alert Banner if any expiring soon */}
      {expiringCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-warning flex-none" />
            <div>
              <p className="font-bold">Peringatan Masa Berlaku Kontrak Karyawan</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Terdapat <strong>{expiringCount} karyawan</strong> yang masa kontrak kerjanya akan habis dalam waktu kurang dari 30 hari. Segera lakukan peninjauan perpanjangan atau evaluasi.
              </p>
            </div>
          </div>
          <Badge variant="warning">Mendesak</Badge>
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama karyawan, nomor kontrak, atau NIK..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-canvas/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-border rounded-lg bg-white text-ink"
          >
            <option value="">Semua Jenis Ikatan</option>
            <option value="PKWT">PKWT (Kontrak)</option>
            <option value="PKWTT">PKWTT (Tetap)</option>
            <option value="PROBATION">Probation</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-border rounded-lg bg-white text-ink"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="EXPIRING_SOON">Akan Habis (&lt;30 Hari)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <StateLoading message="Memuat pemantauan kontrak & berkas karyawan..." />
        ) : contracts.length === 0 ? (
          <StateEmpty title="Tidak ada kontrak ditemukan" description="Tidak ada data yang cocok dengan kriteria pencarian." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas/50 border-b border-border text-muted uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Karyawan</th>
                  <th className="px-4 py-3.5">Nomor Kontrak</th>
                  <th className="px-4 py-3.5">Jenis Ikatan</th>
                  <th className="px-4 py-3.5">Masa Berlaku</th>
                  <th className="px-4 py-3.5">Sisa Waktu</th>
                  <th className="px-4 py-3.5">Kelengkapan Dokumen</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contracts.map((c) => {
                  const isExpiring = c.status === 'EXPIRING_SOON';
                  return (
                    <tr key={c.id} className="hover:bg-primary-red/5 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{c.employeeName}</p>
                        <p className="text-[11px] font-mono text-muted">{c.employeeId} • {c.position}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-muted">
                        {c.contractNumber}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={c.contractType === 'PKWTT' ? 'success' : c.contractType === 'PROBATION' ? 'warning' : 'info'}>
                          {c.contractType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted font-mono">
                        {c.startDate} s/d {c.endDate}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {c.contractType === 'PKWTT' ? (
                          <span className="text-success text-[11px]">Permanen</span>
                        ) : isExpiring ? (
                          <span className="text-error font-bold flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {c.daysRemaining} Hari Lagi
                          </span>
                        ) : (
                          <span className="text-muted">{c.daysRemaining} Hari</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className={`h-3.5 w-3.5 ${c.documentCompleteness === 100 ? 'text-success' : 'text-warning'}`} />
                          <span className="font-semibold text-ink">{c.documentCompleteness}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleExtend(c)}
                          className="px-2.5 py-1 text-xs rounded border border-border bg-white text-muted hover:text-primary-red font-medium transition-colors"
                        >
                          Perpanjang
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && contracts.length > 0 && (
          <div className="p-3.5 border-t border-border bg-canvas/30 flex items-center justify-between text-xs text-muted">
            <p>
              Menampilkan <span className="font-medium text-ink">{(page - 1) * 12 + 1}</span> -{' '}
              <span className="font-medium text-ink">{Math.min(page * 12, meta.total)}</span> dari{' '}
              <span className="font-medium text-ink">{meta.total}</span> data kontrak
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 font-medium text-ink">
                Hal {page} dari {meta.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
