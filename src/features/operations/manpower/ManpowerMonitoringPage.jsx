/**
 * Manpower Monitoring Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 13 (Operations Module), Section 14 (Seed Policy), Section 21 (Single SOT).
 * Real-time calculation of active assignments per client & location, comparing to required headcount.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Building2,
  MapPin,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/StateViews';
import assignmentAdapter from '@/services/adapters/assignmentAdapter';
import clientAdapter from '@/services/adapters/clientAdapter';
import locationAdapter from '@/services/adapters/locationAdapter';

export default function ManpowerMonitoringPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [clients, setClients] = useState([]);
  const [locations, setLocations] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL | FULL | DEFICIT

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [assignRes, clientRes, locRes] = await Promise.all([
          assignmentAdapter.getAssignments({ pageSize: 100 }),
          clientAdapter.getClients({ pageSize: 50 }),
          locationAdapter.getLocations({ pageSize: 50 }),
        ]);

        if (assignRes.data) setAssignments(assignRes.data);
        if (clientRes.data) setClients(clientRes.data);
        if (locRes.data) setLocations(locRes.data);
      } catch (err) {
        console.error('Failed to load manpower data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute manpower summary per location
  const locationSummaries = useMemo(() => {
    return locations.map((loc) => {
      const locAssignments = assignments.filter(
        (a) => a.locationId === loc.id && a.status === 'ACTIVE'
      );
      const activeCount = locAssignments.length;
      // Target headcount (derived from quota or standard requirement 3-6 personnel per location)
      const targetHeadcount = loc.headcountTarget || (locAssignments.length > 0 ? Math.max(locAssignments.length, 3) : 2);
      const fillRate = Math.min(Math.round((activeCount / targetHeadcount) * 100), 100);
      const isDeficit = activeCount < targetHeadcount;

      const client = clients.find((c) => c.id === loc.clientId);

      return {
        ...loc,
        clientName: client ? client.name : loc.clientName || 'Klien Umum',
        activeCount,
        targetHeadcount,
        fillRate,
        isDeficit,
        assignedStaff: locAssignments.map((a) => ({
          employeeId: a.employeeId,
          employeeName: a.employeeName,
          role: a.roleName || a.serviceType || 'Security Guard',
          shift: a.shiftName,
        })),
      };
    });
  }, [locations, assignments, clients]);

  // Filtered summaries
  const filteredSummaries = useMemo(() => {
    let result = [...locationSummaries];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.clientName.toLowerCase().includes(q) ||
          item.city?.toLowerCase().includes(q)
      );
    }

    if (selectedClient) {
      result = result.filter((item) => item.clientId === selectedClient);
    }

    if (filterStatus === 'FULL') {
      result = result.filter((item) => !item.isDeficit);
    } else if (filterStatus === 'DEFICIT') {
      result = result.filter((item) => item.isDeficit);
    }

    return result;
  }, [locationSummaries, search, selectedClient, filterStatus]);

  // Overall KPIs
  const totalTarget = locationSummaries.reduce((sum, item) => sum + item.targetHeadcount, 0);
  const totalActive = locationSummaries.reduce((sum, item) => sum + item.activeCount, 0);
  const overallRate = totalTarget > 0 ? Math.round((totalActive / totalTarget) * 100) : 0;
  const totalDeficits = locationSummaries.filter((item) => item.isDeficit).length;

  if (loading) {
    return <LoadingState message="Memuat pemantauan kesiapan manpower lapangan..." />;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary-red">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Penempatan Aktif</p>
              <h3 className="text-2xl font-bold text-ink mt-1">{totalActive} Personel</h3>
              <p className="text-xs text-muted mt-1">Dari {assignments.length} penugasan master</p>
            </div>
            <div className="p-3 rounded-xl bg-primary-red/10 text-primary-red">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent-green">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Kesiapan Pos Jaga</p>
              <h3 className="text-2xl font-bold text-ink mt-1">{overallRate}%</h3>
              <p className="text-xs text-accent-green font-medium mt-1">Rasio kesiapan operasional</p>
            </div>
            <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Pos Kurang Personel</p>
              <h3 className="text-2xl font-bold text-warning mt-1">{totalDeficits} Lokasi</h3>
              <p className="text-xs text-muted mt-1">Butuh alokasi unit cadangan</p>
            </div>
            <div className="p-3 rounded-xl bg-warning/10 text-warning">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Titik Lokasi Terpantau</p>
              <h3 className="text-2xl font-bold text-ink mt-1">{locations.length} Titik Pos</h3>
              <p className="text-xs text-muted mt-1">{clients.length} Klien aktif terlindungi</p>
            </div>
            <div className="p-3 rounded-xl bg-info/10 text-info">
              <Building2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Cari lokasi, klien, atau kota..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
              <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
                <Filter className="h-3.5 w-3.5" />
                <span>Klien:</span>
              </div>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Semua Klien</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="flex rounded-lg border border-border overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    filterStatus === 'ALL'
                      ? 'bg-primary-red text-white'
                      : 'bg-white text-muted hover:text-ink'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('FULL')}
                  className={`px-3 py-1.5 font-medium border-l border-border transition-colors ${
                    filterStatus === 'FULL'
                      ? 'bg-primary-red text-white'
                      : 'bg-white text-muted hover:text-ink'
                  }`}
                >
                  Siaga Penuh
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('DEFICIT')}
                  className={`px-3 py-1.5 font-medium border-l border-border transition-colors ${
                    filterStatus === 'DEFICIT'
                      ? 'bg-primary-red text-white'
                      : 'bg-white text-muted hover:text-ink'
                  }`}
                >
                  Defisit
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/ops/operations/replacement')}
                className="ml-auto text-xs"
              >
                Ajukan Pergantian
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid of Location Manpower Cards */}
      {filteredSummaries.length === 0 ? (
        <EmptyState
          title="Tidak Ada Lokasi Ditemukan"
          description="Coba ubah kata kunci pencarian atau filter status kesiapan di atas."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredSummaries.map((loc) => (
            <Card key={loc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-border text-muted">
                      {loc.code || loc.id}
                    </span>
                    <h4 className="text-base font-bold text-ink mt-1.5 line-clamp-1">{loc.name}</h4>
                    <p className="text-xs text-primary-red font-medium flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3 w-3" />
                      <span className="truncate">{loc.clientName}</span>
                    </p>
                  </div>
                  <Badge
                    variant={loc.isDeficit ? 'warning' : 'success'}
                    size="sm"
                  >
                    {loc.isDeficit ? 'Kurang Personel' : 'Siaga Penuh'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-muted">Kesiapan Personel:</span>
                    <span className="text-ink font-bold">
                      {loc.activeCount} / {loc.targetHeadcount} Orang ({loc.fillRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        loc.fillRate >= 100
                          ? 'bg-accent-green'
                          : loc.fillRate >= 70
                          ? 'bg-primary-red'
                          : 'bg-warning'
                      }`}
                      style={{ width: `${Math.min(loc.fillRate, 100)}%` }}
                    />
                  </div>
                </div>

                {/* City and Address */}
                <div className="text-xs text-muted flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 flex-none text-muted" />
                  <span className="truncate">{loc.city || 'Jabodetabek'} • {loc.address || 'Alamat operasional terdaftar'}</span>
                </div>

                {/* Assigned Personnel List */}
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Personel Bertugas</span>
                    <span className="text-muted font-normal">({loc.assignedStaff.length})</span>
                  </p>

                  {loc.assignedStaff.length === 0 ? (
                    <p className="text-xs text-muted italic py-1">Belum ada penugasan aktif di lokasi ini.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {loc.assignedStaff.slice(0, 4).map((staff, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs bg-surface p-1.5 rounded border border-border"
                        >
                          <div className="truncate pr-2">
                            <span className="font-medium text-ink">{staff.employeeName}</span>
                            <span className="text-[10px] text-muted block">{staff.role}</span>
                          </div>
                          <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-border text-muted flex-none">
                            {staff.shift || 'Shift Jaga'}
                          </span>
                        </div>
                      ))}
                      {loc.assignedStaff.length > 4 && (
                        <p className="text-[11px] text-center text-muted pt-1">
                          +{loc.assignedStaff.length - 4} personel lainnya
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => navigate('/ops/master/assignments')}
                    className="text-xs text-primary-red hover:underline font-medium flex items-center gap-1"
                  >
                    <span>Kelola Penugasan</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>

                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => navigate('/ops/operations/replacement')}
                  >
                    Rotasi / Pengganti
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
