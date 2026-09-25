/**
 * Lead Management List Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 15 (Marketing: Leads), Section 14 (Seed data), Section 18 (Cross-department workflow).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Filter, ArrowRightCircle, Phone, Building2, User, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';
import { marketingAdapter } from '@/services/adapters/marketingAdapter';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/constants/permissions';
import { STATUS } from '@/constants/status';
import LeadFormModal from './LeadFormModal';
import LeadConvertModal from './LeadConvertModal';

const SOURCE_OPTIONS = [
  { value: '', label: 'Semua Sumber' },
  { value: 'WEBSITE', label: 'Inquiry Website' },
  { value: 'REFERRAL', label: 'Rekomendasi Klien' },
  { value: 'OUTBOUND', label: 'Kanvasing Outbound' },
  { value: 'EVENT', label: 'Pameran / Expo' },
  { value: 'TENDER_RFP', label: 'Tender / RFP' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: STATUS.NEW, label: 'Baru (New)' },
  { value: STATUS.CONTACTED, label: 'Dihubungi (Contacted)' },
  { value: STATUS.QUALIFIED, label: 'Memenuhi Syarat (Qualified)' },
  { value: STATUS.CONVERTED, label: 'Dikonversi ke Pipeline' },
  { value: STATUS.UNQUALIFIED, label: 'Tidak Memenuhi Syarat' },
];

export default function LeadListPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(PERMISSIONS.LEAD_CREATE);
  const canEdit = hasPermission(PERMISSIONS.LEAD_EDIT);

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketingAdapter.getLeads({ search, source, status, page, pageSize: 10 });
      if (res.data) {
        setLeads(res.data);
        setMeta(res.meta);
      }
    } catch {
      toast.error('Gagal memuat data prospek leads.');
    } finally {
      setLoading(false);
    }
  }, [search, source, status, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const res = await marketingAdapter.updateLeadStatus(leadId, newStatus);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Status lead berhasil diperbarui menjadi ${newStatus}`);
      loadData();
    } catch {
      toast.error('Gagal memperbarui status lead.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Action Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Bar */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Cari prospek, PIC, telepon, lokasi..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          {/* Filter Source */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted hidden sm:inline" />
            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setPage(1);
              }}
              className="text-xs sm:text-sm border border-border rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-primary-red"
            >
              {SOURCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs sm:text-sm border border-border rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-primary-red"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Create Lead Button */}
        {canCreate && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 self-start md:self-auto shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Lead Baru</span>
          </Button>
        )}
      </div>

      {/* Leads Table / Cards */}
      {loading ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateLoading message="Memuat database prospek marketing PT. BARAK..." />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateEmpty
            title="Tidak ada data prospek"
            description="Belum ada data leads yang cocok dengan kriteria filter yang Anda pilih."
            actionLabel={canCreate ? 'Tambah Lead Baru' : undefined}
            onAction={canCreate ? () => setIsCreateOpen(true) : undefined}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border text-muted font-medium">
                  <th className="py-3 px-4">No. Lead & Perusahaan</th>
                  <th className="py-3 px-4">Kontak PIC</th>
                  <th className="py-3 px-4">Sumber & Wilayah</th>
                  <th className="py-3 px-4">Layanan & Manpower</th>
                  <th className="py-3 px-4">Status Prospek</th>
                  <th className="py-3 px-4">Sales Rep</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* No Lead & Company */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-ink flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-primary-red shrink-0" />
                        <span>{lead.companyName}</span>
                      </div>
                      <div className="text-xs text-muted font-mono mt-0.5">{lead.leadNumber}</div>
                    </td>

                    {/* PIC Contact */}
                    <td className="py-3.5 px-4">
                      <div className="text-ink font-medium flex items-center gap-1">
                        <User className="w-3 h-3 text-muted shrink-0" />
                        <span>{lead.picName}</span>
                      </div>
                      <div className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-muted shrink-0" />
                        <span>{lead.phone}</span>
                      </div>
                    </td>

                    {/* Source & Region */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {lead.sourceLabel || lead.source}
                      </span>
                      <div className="text-xs text-muted flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-muted shrink-0" />
                        <span>{lead.locationCity || '-'}</span>
                      </div>
                    </td>

                    {/* Service & Manpower */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-ink">{lead.serviceInterest}</div>
                      <div className="text-xs text-muted">
                        Kebutuhan: <span className="font-semibold text-ink">{lead.estimatedManpower} Personel</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge status={lead.status} />
                      {canEdit && lead.status !== STATUS.CONVERTED && (
                        <div className="mt-1">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className="text-[11px] border border-border rounded px-1.5 py-0.5 bg-white text-muted focus:outline-none focus:border-primary-red"
                          >
                            <option value={STATUS.NEW}>Set: Baru</option>
                            <option value={STATUS.CONTACTED}>Set: Dihubungi</option>
                            <option value={STATUS.QUALIFIED}>Set: Qualified</option>
                            <option value={STATUS.UNQUALIFIED}>Set: Unqualified</option>
                          </select>
                        </div>
                      )}
                    </td>

                    {/* Sales Rep */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-ink">{lead.assignedSales}</div>
                      <div className="text-[11px] text-muted">{new Date(lead.createdAt).toLocaleDateString('id-ID')}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {lead.status === STATUS.CONVERTED ? (
                        <span className="text-xs font-semibold text-accent-green inline-flex items-center gap-1">
                          ✓ Dikonversi
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConvertingLead(lead)}
                          className="text-xs gap-1 border-primary-red/30 text-primary-red hover:bg-primary-red/5"
                        >
                          <ArrowRightCircle className="w-3.5 h-3.5" />
                          <span>Konversi</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted">
            <div>
              Total: <span className="font-semibold text-ink">{meta.total}</span> data prospek (Halaman {meta.page} dari {meta.totalPages || 1})
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

      {/* Modals */}
      {isCreateOpen && (
        <LeadFormModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={loadData}
        />
      )}

      {convertingLead && (
        <LeadConvertModal
          isOpen={Boolean(convertingLead)}
          lead={convertingLead}
          onClose={() => setConvertingLead(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
