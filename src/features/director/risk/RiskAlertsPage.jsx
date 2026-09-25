/**
 * RiskAlertsPage — Executive Risk Matrix & Early Warning System
 * Source of Truth: PRD Section 6.1 (Direktur: Legal & Risk), Section 10 (Director Dashboard),
 * Section 18 (Cross-department workflow: COD & Incidents), IMPLEMENTATION-PLAN Phase 10.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ShieldAlert, DollarSign, Scale,
  MonitorSmartphone, Briefcase, RefreshCw, ArrowRight,
  Filter, CheckCircle, Info
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import directorAdapter from '@/services/adapters/directorAdapter';
import toast from 'react-hot-toast';

export default function RiskAlertsPage() {
  const navigate = useNavigate();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const loadRisks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await directorAdapter.getExecutiveRisks();
      if (res.data) {
        setRisks(res.data);
      }
    } catch (err) {
      console.error('Failed to load executive risks', err);
      toast.error('Gagal memuat matriks risiko eksekutif.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRisks();
  }, [loadRisks]);

  const filteredRisks = risks.filter((r) => {
    if (severityFilter && r.severity !== severityFilter) return false;
    if (categoryFilter && r.category !== categoryFilter) return false;
    return true;
  });

  const highCount = risks.filter((r) => r.severity === 'HIGH' || r.severity === 'CRITICAL').length;
  const mediumCount = risks.filter((r) => r.severity === 'MEDIUM').length;

  const categoryIcons = {
    FINANCE: DollarSign,
    OPERATIONS: Briefcase,
    LEGAL: Scale,
    IT_SUPPORT: MonitorSmartphone,
  };

  return (
    <div className="space-y-6">
      {/* Risk Summary Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs flex items-center gap-4">
          <span className="p-3 bg-red-50 rounded-xl text-red-600 flex-none">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-medium text-muted">Risiko Tingkat Tinggi (High Severity)</p>
            <p className="text-xl font-bold text-red-600 mt-0.5">{highCount} Indikator</p>
            <p className="text-2xs text-muted mt-0.5">Memerlukan intervensi manajemen segera</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex items-center gap-4">
          <span className="p-3 bg-amber-50 rounded-xl text-amber-600 flex-none">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-medium text-muted">Risiko Tingkat Sedang (Medium Severity)</p>
            <p className="text-xl font-bold text-amber-700 mt-0.5">{mediumCount} Indikator</p>
            <p className="text-2xs text-muted mt-0.5">Dalam pemantauan preventif berkala</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex items-center gap-4">
          <span className="p-3 bg-emerald-50 rounded-xl text-emerald-600 flex-none">
            <CheckCircle className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-medium text-muted">Kepatuhan Izin BUJP Polri</p>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">100% Sah</p>
            <p className="text-2xs text-emerald-600 mt-0.5">Izin SIO berlaku hingga Mei 2027</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink">Filter Indikator Risiko:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-border rounded-lg text-ink"
              >
                <option value="">Semua Tingkat Keparahan</option>
                <option value="HIGH">Tinggi / Kritis</option>
                <option value="MEDIUM">Sedang</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-border rounded-lg text-ink"
              >
                <option value="">Semua Kategori</option>
                <option value="FINANCE">Keuangan & Piutang</option>
                <option value="OPERATIONS">Operasional & COD</option>
                <option value="LEGAL">Legalitas & PKS</option>
                <option value="IT_SUPPORT">Teknologi & SLA</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadRisks}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Pindai Ulang Sistem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Risk Items List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-muted bg-white rounded-xl border border-border">
            <RefreshCw className="h-6 w-6 text-primary-red animate-spin mx-auto mb-2" />
            Melakukan pemindaian risiko lintas departemen...
          </div>
        ) : filteredRisks.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted bg-white rounded-xl border border-border">
            <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            Tidak ada anomali atau risiko signifikan yang terdeteksi saat ini.
          </div>
        ) : (
          filteredRisks.map((risk) => {
            const Icon = categoryIcons[risk.category] || AlertTriangle;
            const isHigh = risk.severity === 'HIGH' || risk.severity === 'CRITICAL';

            return (
              <Card
                key={risk.id}
                className={`shadow-xs border-l-4 ${
                  isHigh ? 'border-l-red-500' : 'border-l-amber-500'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <span
                        className={`p-2.5 rounded-xl flex-none mt-0.5 ${
                          isHigh ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-2xs font-bold rounded-full ${
                              isHigh ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {risk.severity === 'HIGH' ? 'TINGKAT TINGGI' : 'TINGKAT SEDANG'}
                          </span>
                          <span className="text-2xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                            {risk.categoryLabel}
                          </span>
                          <span className="text-2xs font-mono text-muted">{risk.id}</span>
                        </div>

                        <h3 className="text-sm font-bold text-ink">{risk.title}</h3>
                        <p className="text-xs text-muted leading-relaxed">{risk.description}</p>

                        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="font-semibold text-ink flex items-center gap-1">
                              <Info className="h-3.5 w-3.5 text-slate-500" />
                              Potensi Dampak Bisnis:
                            </span>
                            <p className="text-muted mt-0.5">{risk.impact}</p>
                          </div>
                          <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                            <span className="font-semibold text-emerald-900 flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                              Rekomendasi Mitigasi Direktur:
                            </span>
                            <p className="text-emerald-800 mt-0.5">{risk.mitigation}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-none flex lg:flex-col items-center justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <Button
                        size="sm"
                        onClick={() => navigate(risk.actionPath)}
                        className="bg-primary-red hover:bg-red-700 text-white w-full sm:w-auto"
                      >
                        {risk.actionLabel}
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
