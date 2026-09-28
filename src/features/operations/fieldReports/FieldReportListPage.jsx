/**
 * Field Patrol Report List Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 13 (Field Reports & Patrol Journal).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/StateViews';
import fieldReportAdapter from '@/services/adapters/fieldReportAdapter';
import clientAdapter from '@/services/adapters/clientAdapter';
import locationAdapter from '@/services/adapters/locationAdapter';
import FieldReportFormModal from './FieldReportFormModal';

export default function FieldReportListPage() {
  const [reports, setReports] = useState([]);
  const [clients, setClients] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [repRes, clientRes, locRes] = await Promise.all([
        fieldReportAdapter.getFieldReports({
          search,
          clientId: selectedClient,
          locationId: selectedLocation,
          pageSize: 50,
        }),
        clientAdapter.getClients({ pageSize: 50 }),
        locationAdapter.getLocations({ pageSize: 50 }),
      ]);

      if (repRes.data) setReports(repRes.data);
      if (clientRes.data) setClients(clientRes.data);
      if (locRes.data) setLocations(locRes.data);
    } catch (err) {
      console.error('Failed to load patrol reports:', err);
      toast.error('Gagal memuat jurnal patroli lapangan.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedClient, selectedLocation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateReport = async (payload) => {
    const res = await fieldReportAdapter.createFieldReport(payload);
    if (res.error) throw res.error;
    toast.success('Jurnal patroli pos berhasil dicatat.');
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary-red" />
            <span>Jurnal Patroli Pos & Keamanan Lapangan</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Log berkala hasil inspeksi pos jaga, kesiapan fasilitas keselamatan APAR/CCTV, dan pemantauan perimeter.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsFormOpen(true)}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Catat Jurnal Patroli</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Cari kode jurnal, observasi, tim..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              />
            </div>

            <div>
              <select
                value={selectedClient}
                onChange={(e) => {
                  setSelectedClient(e.target.value);
                  setSelectedLocation('');
                }}
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

            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Semua Titik Pos</option>
                {locations
                  .filter((l) => !selectedClient || l.clientId === selectedClient)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      {loading ? (
        <LoadingState message="Memuat jurnal patroli pos..." />
      ) : reports.length === 0 ? (
        <EmptyState
          title="Tidak Ada Jurnal Patroli"
          description="Belum ada catatan log patroli pos lapangan yang cocok dengan filter yang dipilih."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((rep) => {
            const checklistItems = [
              { label: 'APAR Siaga', status: rep.checklist?.aparReady },
              { label: 'CCTV Aktif', status: rep.checklist?.cctvActive },
              { label: 'Gerbang Aman', status: rep.checklist?.gateLocked },
              { label: 'Buku Mutasi', status: rep.checklist?.logBookFilled },
              { label: 'Lampu Normal', status: rep.checklist?.lightsOperational },
            ];

            return (
              <Card key={rep.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-red/10 text-primary-red">
                        {rep.reportCode}
                      </span>
                      <h4 className="text-sm font-bold text-ink mt-2 line-clamp-1">{rep.clientName}</h4>
                      <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 flex-none" />
                        <span className="truncate">{rep.locationName}</span>
                      </p>
                    </div>
                    <span className="text-[11px] text-muted flex-none bg-surface px-2 py-1 rounded border border-border">
                      {rep.shift?.split(' ')[0] || 'Shift'}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-muted" />
                      <span className="text-ink font-medium truncate max-w-[170px]">{rep.patrolTeam}</span>
                    </span>
                    <span className="flex items-center gap-1 flex-none">
                      <Clock className="h-3.5 w-3.5 text-muted" />
                      <span>{rep.loggedAt?.slice(11, 16) || '07:00'} WIB</span>
                    </span>
                  </div>

                  {/* Checklist indicators */}
                  <div className="border-t border-border pt-2.5">
                    <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Kesiapan Pos Jaga
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {checklistItems.map((chk, i) => (
                        <span
                          key={i}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                            chk.status
                              ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                              : 'bg-primary-red/10 text-primary-red border border-primary-red/20'
                          }`}
                        >
                          {chk.status ? (
                            <CheckCircle2 className="h-3 w-3 flex-none" />
                          ) : (
                            <XCircle className="h-3 w-3 flex-none" />
                          )}
                          <span>{chk.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Observations */}
                  <div className="border-t border-border pt-2.5">
                    <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Catatan Observasi Lapangan
                    </p>
                    <p className="text-xs text-ink bg-surface p-2.5 rounded-lg border border-border line-clamp-3">
                      {rep.observations}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <FieldReportFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        clients={clients}
        locations={locations}
        onSubmit={handleCreateReport}
      />
    </div>
  );
}
