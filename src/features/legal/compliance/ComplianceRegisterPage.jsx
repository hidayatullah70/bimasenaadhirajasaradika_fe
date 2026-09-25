/**
 * Compliance Register Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 12.3 (Compliance & License Monitoring).
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Building,
  FileCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/StateViews';
import legalAdapter from '@/services/adapters/legalAdapter';

export default function ComplianceRegisterPage() {
  const [complianceItems, setComplianceItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompliance() {
      setLoading(true);
      try {
        const res = await legalAdapter.getComplianceRegister();
        if (res.data) setComplianceItems(res.data);
      } catch (err) {
        console.error('Failed to load compliance data:', err);
        toast.error('Gagal memuat data kepatuhan & perizinan.');
      } finally {
        setLoading(false);
      }
    }
    loadCompliance();
  }, []);

  const compliantCount = complianceItems.filter((i) => i.status === 'COMPLIANT').length;
  const attentionCount = complianceItems.filter((i) => i.status === 'ATTENTION_NEEDED').length;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary-red" />
            <span>Register Kepatuhan & Perizinan Operasional (SIO BUJP)</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Pengawasan keabsahan legalitas perizinan operasional Mabes Polri, Polda Metro Jaya, sertifikasi ISO, dan audit ketenagakerjaan.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-accent-green">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Izin & Lisensi Patuh (Compliant)</p>
              <h3 className="text-2xl font-bold text-ink mt-1">{compliantCount} Dokumen Sah</h3>
              <p className="text-xs text-accent-green font-medium mt-1">SIO Polri & Rekomendasi Polda berlaku</p>
            </div>
            <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Perlu Perpanjangan / Surveillance</p>
              <h3 className="text-2xl font-bold text-warning mt-1">{attentionCount} Perizinan</h3>
              <p className="text-xs text-muted mt-1">Audit surveillance ISO Oktober 2026</p>
            </div>
            <div className="p-3 rounded-xl bg-warning/10 text-warning">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Skor Kepatuhan Hukum</p>
              <h3 className="text-2xl font-bold text-ink mt-1">100% Legal</h3>
              <p className="text-xs text-muted mt-1">Sesuai Perpol No. 4 Tahun 2020</p>
            </div>
            <div className="p-3 rounded-xl bg-info/10 text-info">
              <Award className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Register List */}
      {loading ? (
        <LoadingState message="Memuat dokumen perizinan operasional..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {complianceItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface border border-border text-muted">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-bold text-ink mt-2 line-clamp-2">{item.licenseName}</h4>
                    <p className="text-xs text-primary-red font-medium mt-1">
                      {item.issuingAuthority}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex-none ${
                      item.status === 'COMPLIANT'
                        ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                        : 'bg-warning/10 text-warning border border-warning/20'
                    }`}
                  >
                    {item.status === 'COMPLIANT' ? 'PATUH' : 'SURVEILLANCE'}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="text-xs space-y-1">
                  <span className="text-muted block">Nomor Surat / Sertifikat:</span>
                  <span className="font-semibold text-ink font-mono bg-surface p-1.5 rounded border border-border block truncate">
                    {item.licenseNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-2.5">
                  <div>
                    <span className="text-muted block">Berlaku Sejak:</span>
                    <span className="font-medium text-ink">{item.validFrom}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Masa Berlaku:</span>
                    <span className="font-bold text-ink">{item.validUntil}</span>
                  </div>
                </div>

                <div className="text-xs border-t border-border pt-2.5 space-y-1">
                  <div className="flex items-center justify-between text-muted">
                    <span>Audit Terakhir:</span>
                    <span className="font-medium text-ink">{item.lastAuditDate}</span>
                  </div>
                  <p className="text-[11px] text-muted italic bg-surface p-2 rounded-lg border border-border">
                    {item.remarks}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
