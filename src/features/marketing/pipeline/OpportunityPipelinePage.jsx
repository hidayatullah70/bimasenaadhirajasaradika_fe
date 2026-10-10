/**
 * Opportunity CRM Pipeline Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 15 (Opportunities Pipeline), Section 18 (Cross-department workflow).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Kanban,
  Table as TableIcon,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';
import { marketingAdapter } from '@/services/adapters/marketingAdapter';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/constants/permissions';
import OpportunityWonModal from './OpportunityWonModal';
import OpportunityLostModal from './OpportunityLostModal';

const STAGES = [
  {
    key: 'PROSPECTING',
    label: 'Penjajakan Awal',
    prob: 25,
    color: 'border-blue-400 bg-blue-50/40 text-blue-700',
    accentColor: 'border-t-blue-500',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    tagColor: 'text-blue-700 bg-blue-50/80',
  },
  {
    key: 'SURVEY_LOCATION',
    label: 'Survei Lokasi',
    prob: 40,
    color: 'border-amber-400 bg-amber-50/40 text-amber-700',
    accentColor: 'border-t-amber-500',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    tagColor: 'text-amber-700 bg-amber-50/80',
  },
  {
    key: 'PROPOSAL_SENT',
    label: 'Proposal & Penawaran',
    prob: 60,
    color: 'border-purple-400 bg-purple-50/40 text-purple-700',
    accentColor: 'border-t-purple-500',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    tagColor: 'text-purple-700 bg-purple-50/80',
  },
  {
    key: 'NEGOTIATION',
    label: 'Negosiasi Komersial',
    prob: 80,
    color: 'border-orange-400 bg-orange-50/40 text-orange-700',
    accentColor: 'border-t-orange-500',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    tagColor: 'text-orange-700 bg-orange-50/80',
  },
  {
    key: 'WON',
    label: 'Deal Menang (WON)',
    prob: 100,
    color: 'border-emerald-500 bg-emerald-50/40 text-emerald-700',
    accentColor: 'border-t-emerald-500',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    tagColor: 'text-emerald-700 bg-emerald-50/80',
  },
  {
    key: 'LOST',
    label: 'Dibatalkan (LOST)',
    prob: 0,
    color: 'border-rose-400 bg-rose-50/40 text-rose-700',
    accentColor: 'border-t-rose-500',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    tagColor: 'text-rose-700 bg-rose-50/80',
  },
];

export default function OpportunityPipelinePage() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission(PERMISSIONS.OPPORTUNITY_EDIT);
  const canWin = hasPermission(PERMISSIONS.OPPORTUNITY_WIN);
  const canLose = hasPermission(PERMISSIONS.OPPORTUNITY_LOSS);

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  // Modals
  const [wonOpportunity, setWonOpportunity] = useState(null);
  const [lostOpportunity, setLostOpportunity] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketingAdapter.getOpportunities({
        search,
        stage: stageFilter,
        pageSize: 50,
      });
      if (res.data) {
        setOpportunities(res.data);
      }
    } catch {
      toast.error('Gagal memuat pipeline peluang bisnis.');
    } finally {
      setLoading(false);
    }
  }, [search, stageFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStageChange = async (oppId, newStage) => {
    const opp = opportunities.find((o) => o.id === oppId);
    if (!opp) return;

    if (newStage === 'WON') {
      setWonOpportunity(opp);
      return;
    }

    if (newStage === 'LOST') {
      setLostOpportunity(opp);
      return;
    }

    try {
      const targetStage = STAGES.find((s) => s.key === newStage);
      const res = await marketingAdapter.updateOpportunityStage(
        oppId,
        newStage,
        targetStage ? targetStage.label : newStage,
        targetStage ? targetStage.prob : null
      );
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Tahapan dipindahkan ke: ${targetStage ? targetStage.label : newStage}`);
      loadData();
    } catch {
      toast.error('Gagal memperbarui tahapan deal.');
    }
  };

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Grouping for Kanban
  const groupedOpportunities = STAGES.reduce((acc, stage) => {
    acc[stage.key] = opportunities.filter((o) => o.stage === stage.key);
    return acc;
  }, {});

  // Metrics calculation
  const totalPipelineVal = opportunities
    .filter((o) => o.stage !== 'WON' && o.stage !== 'LOST')
    .reduce((sum, curr) => sum + (curr.monthlyValue || 0), 0);
  const totalWonVal = opportunities
    .filter((o) => o.stage === 'WON')
    .reduce((sum, curr) => sum + (curr.monthlyValue || 0), 0);

  return (
    <div className="space-y-5">
      {/* Top Banner & KPI metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs">
          <p className="text-xs font-medium text-muted">Total Nilai Pipeline Aktif</p>
          <p className="text-lg font-bold text-ink mt-1">{formatRupiah(totalPipelineVal)} <span className="text-xs text-muted font-normal">/ bln</span></p>
          <p className="text-[11px] text-muted mt-0.5">
            Tahap Penjajakan hingga Negosiasi ({opportunities.filter((o) => o.stage !== 'WON' && o.stage !== 'LOST').length} deal aktif)
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs">
          <p className="text-xs font-medium text-muted">Total Deal WON Terkonfirmasi</p>
          <p className="text-lg font-bold text-accent-green mt-1">{formatRupiah(totalWonVal)} <span className="text-xs text-muted font-normal">/ bln</span></p>
          <p className="text-[11px] text-muted mt-0.5">
            {opportunities.filter((o) => o.stage === 'WON').length} Klien Resmi Diserahterimakan
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs">
          <p className="text-xs font-medium text-muted">Nilai Tahunan Terproyeksi (ARR)</p>
          <p className="text-lg font-bold text-primary-red mt-1">{formatRupiah(totalPipelineVal * 12)}</p>
          <p className="text-[11px] text-muted mt-0.5">Estimasi kontrak per tahun dari prospek aktif</p>
        </div>
      </div>

      {/* Control Bar: Search & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Cari peluang deal, perusahaan, sales..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-border rounded-lg bg-white text-ink focus:outline-none focus:border-primary-red"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-xs sm:text-sm border border-border rounded-lg px-2.5 py-2 bg-white text-ink focus:outline-none focus:border-primary-red"
          >
            <option value="">Semua Tahapan Pipeline</option>
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'kanban' ? 'bg-white text-ink shadow-xs' : 'text-muted hover:text-ink'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'table' ? 'bg-white text-ink shadow-xs' : 'text-muted hover:text-ink'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Tabel List</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateLoading message="Memuat CRM pipeline peluang komersial PT. BARAK..." />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateEmpty
            title="Tidak ada peluang dalam pipeline"
            description="Belum ada peluang bisnis yang sesuai dengan kata kunci pencarian Anda."
          />
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth min-w-full">
          {STAGES.map((stage) => {
            const opps = groupedOpportunities[stage.key] || [];
            const colTotalVal = opps.reduce((acc, c) => acc + (c.monthlyValue || 0), 0);

            return (
              <div
                key={stage.key}
                className={`flex flex-col w-[85vw] sm:w-[310px] md:w-[315px] lg:w-[320px] shrink-0 snap-start bg-slate-50/90 rounded-xl border border-border border-t-4 ${stage.accentColor} p-3.5 h-[calc(100vh-320px)] min-h-[520px] shadow-2xs`}
              >
                {/* Stage Header */}
                <div className="pb-3 border-b border-border/80 mb-3 shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ink truncate" title={stage.label}>
                      {stage.label}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${stage.badgeColor}`}>
                      {opps.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200/60 text-xs">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border border-transparent ${stage.tagColor} shrink-0`}>
                      Prob: {stage.prob}%
                    </span>
                    <div className="text-right min-w-0">
                      <span className="font-bold text-ink text-xs font-mono tracking-tight whitespace-nowrap block" title={formatRupiah(colTotalVal)}>
                        {formatRupiah(colTotalVal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-0">
                  {opps.map((opp) => (
                    <div
                      key={opp.id}
                      className="bg-white rounded-lg border border-border p-3.5 shadow-2xs hover:shadow-xs hover:border-primary-red/40 transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2.5">
                        {/* Title & Code */}
                        <div>
                          <div className="flex items-start gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-primary-red shrink-0 mt-0.5" />
                            <h4 className="text-xs font-bold text-ink leading-snug line-clamp-2" title={opp.companyName}>
                              {opp.companyName}
                            </h4>
                          </div>
                          <p className="text-[10px] text-muted font-mono mt-1 pl-5">{opp.opportunityNumber}</p>
                        </div>

                        {/* Service & Manpower */}
                        <div className="text-[11px] text-slate-700 bg-slate-50/80 border border-slate-100 p-2 rounded-md">
                          <div className="font-semibold text-ink line-clamp-1" title={opp.serviceInterest}>
                            {opp.serviceInterest}
                          </div>
                          <div className="text-muted text-[10px] mt-0.5 flex items-center gap-1.5">
                            <span>{opp.estimatedManpower} Personel</span>
                            <span>•</span>
                            <span className="truncate">{opp.location || 'Jabodetabek'}</span>
                          </div>
                        </div>

                        {/* Nilai Kontrak (Nominal) */}
                        <div className="p-2 rounded-md bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-muted font-medium shrink-0">Nilai Kontrak:</span>
                          <span className="text-xs font-bold text-ink font-mono whitespace-nowrap tracking-tight">
                            {formatRupiah(opp.monthlyValue)}
                            <span className="text-[10px] text-muted font-normal font-sans ml-1">/bln</span>
                          </span>
                        </div>

                        {/* Sales Owner & Expected Close Date */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px] text-muted">
                          <span className="flex items-center gap-1.5 min-w-0" title={`Sales: ${opp.salesOwner || '-'}`}>
                            <User className="w-3.5 h-3.5 text-muted shrink-0" />
                            <span className="truncate font-medium text-slate-600">{opp.salesOwner || '-'}</span>
                          </span>
                          <span className="flex items-center gap-1 shrink-0 font-medium" title="Target Closing">
                            <Calendar className="w-3.5 h-3.5 text-muted shrink-0" />
                            <span>{opp.expectedCloseDate}</span>
                          </span>
                        </div>

                        {/* Lost Reason or Handover note if present */}
                        {opp.stage === 'LOST' && opp.lostReason && (
                          <div className="p-2 rounded-md bg-rose-50 border border-rose-200/80 text-[10px] text-rose-700 leading-relaxed">
                            <strong className="font-semibold">Alasan:</strong> {opp.lostReason}
                          </div>
                        )}
                        {opp.stage === 'WON' && opp.handoverNotes && (
                          <div className="p-2 rounded-md bg-emerald-50 border border-emerald-200/80 text-[10px] text-emerald-800 leading-relaxed">
                            <strong className="font-semibold">Handover:</strong> {opp.handoverNotes}
                          </div>
                        )}
                      </div>

                      {/* Card Actions */}
                      {canEdit && opp.stage !== 'WON' && opp.stage !== 'LOST' && (
                        <div className="pt-2 border-t border-border flex items-center justify-between gap-1.5 shrink-0">
                          <select
                            value={opp.stage}
                            onChange={(e) => handleStageChange(opp.id, e.target.value)}
                            className="text-[11px] border border-border rounded-md px-2 py-1 bg-white text-ink focus:outline-none focus:border-primary-red flex-1 cursor-pointer hover:border-slate-400 transition-colors"
                          >
                            <option value="PROSPECTING">Tahap: Penjajakan (25%)</option>
                            <option value="SURVEY_LOCATION">Tahap: Survei (40%)</option>
                            <option value="PROPOSAL_SENT">Tahap: Proposal (60%)</option>
                            <option value="NEGOTIATION">Tahap: Negosiasi (80%)</option>
                          </select>

                          {canWin && (
                            <button
                              type="button"
                              onClick={() => setWonOpportunity(opp)}
                              title="Tandai WON & Serah Terima"
                              className="p-1.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors shrink-0 flex items-center justify-center"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canLose && (
                            <button
                              type="button"
                              onClick={() => setLostOpportunity(opp)}
                              title="Tandai LOST"
                              className="p-1.5 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors shrink-0 flex items-center justify-center"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {opps.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 rounded-lg border border-dashed border-border/80 text-center p-3 text-xs text-muted bg-white/40">
                      <span>Tidak ada deal di tahap ini</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border text-muted font-medium">
                  <th className="py-3 px-4">No. Peluang & Perusahaan</th>
                  <th className="py-3 px-4">Layanan & Manpower</th>
                  <th className="py-3 px-4">Nilai Bulanan / ARR</th>
                  <th className="py-3 px-4">Tahapan & Probabilitas</th>
                  <th className="py-3 px-4">Target Closing</th>
                  <th className="py-3 px-4">Sales Owner</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-ink flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-primary-red shrink-0" />
                        <span>{opp.companyName}</span>
                      </div>
                      <div className="text-xs text-muted font-mono mt-0.5">{opp.opportunityNumber}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-ink">{opp.serviceInterest}</div>
                      <div className="text-xs text-muted">Kuota: {opp.estimatedManpower} Personel</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-ink">{formatRupiah(opp.monthlyValue)} <span className="text-[10px] text-muted font-normal">/bln</span></div>
                      <div className="text-[11px] text-muted">ARR: {formatRupiah(opp.annualValue || opp.monthlyValue * 12)}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        opp.stage === 'WON'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : opp.stage === 'LOST'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {opp.stageLabel || opp.stage} ({opp.probability}%)
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-muted font-medium">
                      {opp.expectedCloseDate}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-ink">
                      {opp.salesOwner}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {opp.stage === 'WON' ? (
                        <span className="text-xs font-semibold text-accent-green">✓ Deal WON</span>
                      ) : opp.stage === 'LOST' ? (
                        <span className="text-xs font-semibold text-primary-red">✗ Deal LOST</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {canWin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setWonOpportunity(opp)}
                              className="text-xs text-accent-green border-accent-green/30 hover:bg-emerald-50 gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>WON</span>
                            </Button>
                          )}
                          {canLose && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLostOpportunity(opp)}
                              className="text-xs text-primary-red border-primary-red/30 hover:bg-rose-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {wonOpportunity && (
        <OpportunityWonModal
          isOpen={Boolean(wonOpportunity)}
          opportunity={wonOpportunity}
          onClose={() => setWonOpportunity(null)}
          onSuccess={loadData}
        />
      )}

      {lostOpportunity && (
        <OpportunityLostModal
          isOpen={Boolean(lostOpportunity)}
          opportunity={lostOpportunity}
          onClose={() => setLostOpportunity(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
