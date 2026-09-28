/**
 * Incident List Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 13 (Operations Module), Section 18 (Cross-department workflow: Incident Escalation).
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/StateViews';
import incidentAdapter from '@/services/adapters/incidentAdapter';
import clientAdapter from '@/services/adapters/clientAdapter';
import locationAdapter from '@/services/adapters/locationAdapter';
import { MOCK_INCIDENTS } from '@/services/mock/mockOperationsData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import IncidentFormModal from './IncidentFormModal';
import IncidentEscalateModal from './IncidentEscalateModal';
import { STATUS } from '@/constants/status';

export default function IncidentListPage() {
  // Authoritative persistent state with MOCK_INCIDENTS as initial fallback
  const [incidents, setIncidents] = useLocalStorage('barak_incidents', MOCK_INCIDENTS);
  const [clients, setClients] = useState([]);
  const [locations, setLocations] = useState([]);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedClient, setSelectedClient] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [escalatingIncident, setEscalatingIncident] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Quick Resolve prompt state
  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionText, setResolutionText] = useState('');

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [clientRes, locRes] = await Promise.all([
          clientAdapter.getClients({ pageSize: 50 }),
          locationAdapter.getLocations({ pageSize: 50 }),
        ]);
        if (clientRes.data) setClients(clientRes.data);
        if (locRes.data) setLocations(locRes.data);
      } catch (err) {
        console.error('Failed to load dropdown data:', err);
      }
    };
    loadDropdownData();
  }, []);

  const filteredIncidents = useMemo(() => {
    let result = Array.isArray(incidents) ? incidents : [];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (inc) =>
          inc.title?.toLowerCase().includes(q) ||
          inc.incidentNumber?.toLowerCase().includes(q) ||
          inc.locationName?.toLowerCase().includes(q) ||
          inc.clientName?.toLowerCase().includes(q) ||
          inc.reportedBy?.toLowerCase().includes(q) ||
          inc.description?.toLowerCase().includes(q)
      );
    }
    if (selectedSeverity) {
      result = result.filter((inc) => inc.severity === selectedSeverity);
    }
    if (selectedStatus) {
      result = result.filter((inc) => inc.status === selectedStatus);
    }
    if (selectedClient) {
      result = result.filter((inc) => inc.clientId === selectedClient);
    }
    return result;
  }, [incidents, search, selectedSeverity, selectedStatus, selectedClient]);

  const handleCreateIncident = async (payload) => {
    try {
      const res = await incidentAdapter.createIncident(payload);
      const newInc = res?.data || {
        ...payload,
        id: `INC-${Date.now()}`,
        incidentNumber: `INC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${((incidents?.length || 0) + 1).toString().padStart(3, '0')}`,
        status: STATUS.OPEN,
        createdAt: new Date().toISOString(),
      };
      setIncidents((prev) => [newInc, ...(Array.isArray(prev) ? prev : [])]);
      toast.success('Laporan insiden berhasil dicatat.');
    } catch (err) {
      toast.error(err.message || 'Gagal membuat laporan insiden.');
    }
  };

  const handleEscalateIncident = async (id, { targetDept, reason }) => {
    try {
      await incidentAdapter.escalateIncident(id, { targetDept, reason });
      setIncidents((prev) =>
        Array.isArray(prev)
          ? prev.map((inc) =>
              inc.id === id
                ? {
                    ...inc,
                    escalatedTo: targetDept,
                    status: STATUS.ESCALATED,
                    escalationReason: reason,
                    escalatedAt: new Date().toISOString(),
                  }
                : inc
            )
          : []
      );
      toast.success(`Insiden berhasil dieskalasi ke divisi ${targetDept}.`);
    } catch (err) {
      toast.error(err.message || 'Gagal eskalasi insiden.');
    }
  };

  const handleResolveIncident = async (id) => {
    if (!resolutionText.trim()) {
      toast.error('Catatan penyelesaian wajib diisi.');
      return;
    }
    try {
      await incidentAdapter.resolveIncident(id, { resolutionNotes: resolutionText });
      setIncidents((prev) =>
        Array.isArray(prev)
          ? prev.map((inc) =>
              inc.id === id
                ? {
                    ...inc,
                    status: STATUS.RESOLVED,
                    resolutionNotes: resolutionText,
                    resolvedAt: new Date().toISOString(),
                  }
                : inc
            )
          : []
      );
      toast.success('Insiden dinyatakan selesai (Resolved).');
      setResolvingId(null);
      setResolutionText('');
    } catch (err) {
      toast.error(err.message || 'Gagal menyelesaikan insiden.');
    }
  };

  // Severity styling helper
  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-xs font-bold bg-primary-red text-white rounded">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-white rounded">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded">MEDIUM</span>;
      case 'LOW':
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary-red" />
            <span>Manajemen Insiden & Anomali Lapangan</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Pencatatan pelanggaran, temuan keamanan perimeter, komplain klien, dan eskalasi terintegrasi.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsFormOpen(true)}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Catat Insiden Baru</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Cari nomor, judul, pelapor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              />
            </div>

            <div>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Semua Tingkat Keparahan</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Semua Status</option>
                <option value={STATUS.OPEN}>OPEN (Belum Ditangani)</option>
                <option value={STATUS.IN_PROGRESS}>IN_PROGRESS (Dalam Penanganan)</option>
                <option value={STATUS.ESCALATED}>ESCALATED (Dieskalasi)</option>
                <option value={STATUS.RESOLVED}>RESOLVED (Selesai)</option>
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

      {/* Incidents Table */}
      {filteredIncidents.length === 0 ? (
        <EmptyState
          title="Tidak Ada Laporan Insiden"
          description="Tidak ditemukan insiden dengan filter pencarian yang diterapkan saat ini."
        />
      ) : (
        <div className="bg-white border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-muted uppercase font-semibold tracking-wider">
                  <th className="py-3 px-4">No. Insiden / Tanggal</th>
                  <th className="py-3 px-4">Judul & Kategori</th>
                  <th className="py-3 px-4">Klien & Lokasi Pos</th>
                  <th className="py-3 px-4">Pelapor</th>
                  <th className="py-3 px-4">Keparahan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredIncidents.map((inc) => {
                  const isExpanded = expandedId === inc.id;
                  const isResolving = resolvingId === inc.id;

                  return (
                    <React.Fragment key={inc.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-ink block">{inc.incidentNumber}</span>
                          <span className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {inc.incidentDate || inc.createdAt?.slice(0, 10)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-ink line-clamp-1">{inc.title}</p>
                          <span className="text-[11px] text-muted">{inc.typeLabel || inc.type}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-ink block">{inc.clientName}</span>
                          <span className="text-[11px] text-muted block line-clamp-1">{inc.locationName}</span>
                        </td>
                        <td className="py-3 px-4 text-ink font-medium">
                          {inc.reportedBy || '-'}
                        </td>
                        <td className="py-3 px-4">
                          {getSeverityBadge(inc.severity)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge status={inc.status} size="sm" />
                          {inc.status === STATUS.ESCALATED && inc.escalatedTo && (
                            <span className="text-[10px] text-primary-red font-semibold block mt-0.5">
                              → Ke: {inc.escalatedTo}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : inc.id)}
                              className="p-1.5 text-muted hover:text-ink hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1"
                              title="Lihat Detail Kronologi"
                            >
                              <span>Kronologi</span>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>

                            {inc.status !== STATUS.RESOLVED && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setEscalatingIncident(inc)}
                                  className="p-1.5 text-primary-red hover:bg-primary-red/10 rounded-lg font-medium text-xs flex items-center gap-1"
                                  title="Eskalasi ke Legal/HRD/Direksi"
                                >
                                  <ShieldAlert className="h-3.5 w-3.5" />
                                  <span>Eskalasi</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setResolvingId(isResolving ? null : inc.id)}
                                  className="p-1.5 text-accent-green hover:bg-accent-green/10 rounded-lg font-medium text-xs flex items-center gap-1"
                                  title="Selesaikan Insiden"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Selesai</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Detail Panel */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={7} className="p-4 border-b border-border">
                            <div className="bg-white p-4 rounded-xl border border-border shadow-2xs space-y-3">
                              <div>
                                <h5 className="text-xs font-bold text-ink uppercase tracking-wider mb-1">
                                  Kronologi Kejadian
                                </h5>
                                <p className="text-xs text-ink whitespace-pre-line bg-surface p-2.5 rounded-lg border border-border">
                                  {inc.description}
                                </p>
                              </div>

                              {inc.actionTaken && (
                                <div>
                                  <h5 className="text-xs font-bold text-ink uppercase tracking-wider mb-1">
                                    Tindakan Awal Lapangan
                                  </h5>
                                  <p className="text-xs text-muted whitespace-pre-line bg-surface p-2.5 rounded-lg border border-border">
                                    {inc.actionTaken}
                                  </p>
                                </div>
                              )}

                              {inc.escalatedReason && (
                                <div className="p-2.5 bg-primary-red/5 rounded-lg border border-primary-red/20 text-xs">
                                  <span className="font-bold text-primary-red">Catatan Eskalasi ke {inc.escalatedTo}:</span>{' '}
                                  <span className="text-ink">{inc.escalatedReason}</span>
                                </div>
                              )}

                              {inc.resolutionNotes && (
                                <div className="p-2.5 bg-accent-green/10 rounded-lg border border-accent-green/20 text-xs">
                                  <span className="font-bold text-accent-green">Hasil Penyelesaian (Resolved):</span>{' '}
                                  <span className="text-ink">{inc.resolutionNotes}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Quick Resolve Inline Box */}
                      {isResolving && (
                        <tr className="bg-accent-green/5">
                          <td colSpan={7} className="p-4 border-b border-accent-green/20">
                            <div className="bg-white p-4 rounded-xl border border-accent-green/30 shadow-2xs space-y-3 max-w-xl ml-auto">
                              <h5 className="text-xs font-bold text-ink flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-accent-green" />
                                <span>Konfirmasi Penyelesaian Insiden #{inc.incidentNumber}</span>
                              </h5>
                              <textarea
                                rows={2}
                                value={resolutionText}
                                onChange={(e) => setResolutionText(e.target.value)}
                                placeholder="Tuliskan catatan penyelesaian (misal: penggantian kerugian, perbaikan gerbang selesai, pelaku diamankan)..."
                                className="w-full text-xs border border-border rounded-lg p-2.5 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-green/20"
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => {
                                    setResolvingId(null);
                                    setResolutionText('');
                                  }}
                                >
                                  Batal
                                </Button>
                                <Button
                                  size="xs"
                                  variant="primary"
                                  onClick={() => handleResolveIncident(inc.id)}
                                >
                                  Tandai Selesai (Resolve)
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <IncidentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        clients={clients}
        locations={locations}
        onSubmit={handleCreateIncident}
      />

      <IncidentEscalateModal
        isOpen={!!escalatingIncident}
        onClose={() => setEscalatingIncident(null)}
        incident={escalatingIncident}
        onEscalate={handleEscalateIncident}
      />
    </div>
  );
}
