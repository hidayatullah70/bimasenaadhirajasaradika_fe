/**
 * Legal Contract & PKS List Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 12.2 (Contract & Agreement).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Calendar,
  Building2,
  Users,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/StateViews';
import legalAdapter from '@/services/adapters/legalAdapter';
import clientAdapter from '@/services/adapters/clientAdapter';
import { STATUS } from '@/constants/status';

export default function LegalContractListPage() {
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedClient, setSelectedClient] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ctrRes, clientRes] = await Promise.all([
        legalAdapter.getContracts({ search, status: selectedStatus, clientId: selectedClient }),
        clientAdapter.getClients({ pageSize: 50 }),
      ]);

      if (ctrRes.data) setContracts(ctrRes.data);
      if (clientRes.data) setClients(clientRes.data);
    } catch (err) {
      console.error('Failed to load legal contracts:', err);
      toast.error('Gagal memuat data perjanjian kerjasama.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedStatus, selectedClient]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCount = contracts.filter((c) => c.status === STATUS.ACTIVE).length;
  const expiringCount = contracts.filter((c) => c.status === STATUS.EXPIRING).length;
  const totalValue = contracts.reduce((sum, c) => sum + (c.monthlyValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-red" />
            <span>Dokumen Kontrak & Perjanjian Kerjasama (PKS)</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Monitoring masa aktif perjanjian outsourcing, klausul SLA pelayanan, dan peringatan perpanjangan kontrak klien.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-accent-green">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Kontrak PKS Aktif</p>
              <h3 className="text-2xl font-bold text-ink mt-1">{activeCount} Perjanjian</h3>
              <p className="text-xs text-accent-green font-medium mt-1">Dalam masa berlaku efektif</p>
            </div>
            <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Perlu Perpanjangan Segera</p>
              <h3 className="text-2xl font-bold text-warning mt-1">{expiringCount} Kontrak</h3>
              <p className="text-xs text-muted mt-1">Berakhir dalam 60 hari ke depan</p>
            </div>
            <div className="p-3 rounded-xl bg-warning/10 text-warning">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Nilai Kontrak Bulanan Terikat</p>
              <h3 className="text-2xl font-bold text-ink mt-1">
                Rp {(totalValue / 1000000).toFixed(1)} Jt / Bln
              </h3>
              <p className="text-xs text-muted mt-1">Total komitmen pendapatan jasa</p>
            </div>
            <div className="p-3 rounded-xl bg-info/10 text-info">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Cari nomor PKS, nama klien, layanan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              />
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Semua Status Kontrak</option>
                <option value={STATUS.ACTIVE}>ACTIVE (Aktif)</option>
                <option value={STATUS.EXPIRING}>EXPIRING (Mendekati Berakhir)</option>
              </select>
            </div>

            <div>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Semua Klien</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      {loading ? (
        <LoadingState message="Memuat dokumen perjanjian kerjasama..." />
      ) : contracts.length === 0 ? (
        <EmptyState
          title="Tidak Ada Kontrak Ditemukan"
          description="Tidak ditemukan dokumen perjanjian kerjasama dengan filter yang dipilih."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {contracts.map((ctr) => (
            <Card key={ctr.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-red/10 text-primary-red">
                      {ctr.contractNumber}
                    </span>
                    <h4 className="text-sm font-bold text-ink mt-2 line-clamp-1">{ctr.title}</h4>
                    <p className="text-xs text-primary-red font-medium flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3 w-3 flex-none" />
                      <span>{ctr.clientName}</span>
                    </p>
                  </div>
                  <Badge status={ctr.status} size="sm" />
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted block">Layanan & Kuota:</span>
                    <span className="font-semibold text-ink flex items-center gap-1 mt-0.5">
                      <Users className="h-3.5 w-3.5 text-muted" />
                      {ctr.serviceType} ({ctr.manpowerQuota} Pos)
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block">Nilai Kontrak Bulanan:</span>
                    <span className="font-bold text-accent-green block mt-0.5">
                      Rp {ctr.monthlyValue?.toLocaleString('id-ID')} / bln
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted flex items-center gap-1.5 border-t border-border pt-2.5">
                  <Calendar className="h-3.5 w-3.5 flex-none text-muted" />
                  <span>
                    Masa Berlaku: <strong className="text-ink">{ctr.startDate}</strong> s/d{' '}
                    <strong className={ctr.status === STATUS.EXPIRING ? 'text-primary-red font-bold' : 'text-ink'}>
                      {ctr.endDate}
                    </strong>
                  </span>
                </div>

                {ctr.slaTerms && (
                  <div className="text-xs bg-surface p-2.5 rounded-lg border border-border">
                    <span className="font-semibold text-muted block mb-0.5">Klausul Standar SLA:</span>
                    <span className="text-ink">{ctr.slaTerms}</span>
                  </div>
                )}

                <div className="text-xs text-muted pt-1 flex items-center justify-between">
                  <span>PIC Legal Klien: <strong className="text-ink">{ctr.picLegalClient}</strong></span>
                  {ctr.status === STATUS.EXPIRING && (
                    <span className="text-[11px] text-warning font-semibold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Siapkan Adendum
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
