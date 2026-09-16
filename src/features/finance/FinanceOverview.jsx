import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { KpiCard } from '../../components/shared/KpiCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api/apiClient';
import { Receipt, CreditCard, AlertCircle, CheckCircle2, Plus, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';

export function FinanceOverview({ onNavigate }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const res = await api.getInvoices();
      if (res.success) {
        setInvoices(res.data);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data keuangan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ringkasan Finansial & Billing" subtitle="Memuat data keuangan..." />
        <LoadingSkeleton type="cards" count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ringkasan Finansial & Billing" />
        <ErrorState message={error} onRetry={fetchFinanceData} />
      </div>
    );
  }

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Ringkasan Finansial & Billing Klien"
        subtitle="Manajemen penagihan invoice jasa outsourcing, pemantauan piutang jatuh tempo, dan rekapitulasi penerimaan."
        breadcrumb={['Dashboard', 'Finance', 'Overview']}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => onNavigate('finance-invoices')}
          >
            Penerbitan Invoice Baru
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Tagihan Bulan Ini"
          value="Rp 1.466 Jt"
          subtitle="5 Klien penagihan reguler"
          icon={Receipt}
          color="dark"
          trend="+12% MoM"
          trendDirection="up"
        />
        <KpiCard
          title="Tagihan Terbayar (Lunas)"
          value="Rp 649.35 Jt"
          subtitle="Dana masuk kas giro"
          icon={CheckCircle2}
          color="green"
          trend="44.3% Realisasi"
          trendDirection="up"
        />
        <KpiCard
          title="Piutang Berjalan (Pending)"
          value="Rp 505.05 Jt"
          subtitle="Menunggu jatuh tempo"
          icon={CreditCard}
          color="yellow"
        />
        <KpiCard
          title="Piutang Jatuh Tempo (Overdue)"
          value="Rp 316.35 Jt"
          subtitle="1 Invoice butuh follow-up"
          icon={AlertCircle}
          color="red"
          trend="Perlu Penagihan"
          trendDirection="down"
        />
      </div>

      {/* Recent Invoices Table */}
      <Card>
        <CardHeader
          title="Daftar Invoice Terkini"
          subtitle="Faktur tagihan jasa alih daya aktif"
          action={
            <Button
              variant="outline"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => onNavigate('finance-invoices')}
            >
              Kelola Seluruh Invoice
            </Button>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-2.5 px-3">No. Invoice & Klien</th>
                <th className="py-2.5 px-3">Layanan Dibebankan</th>
                <th className="py-2.5 px-3">Jatuh Tempo</th>
                <th className="py-2.5 px-3">Total Tagihan (Inc. PPN)</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3">
                    <p className="font-bold text-brand-dark font-mono">{inv.invoiceNumber}</p>
                    <p className="text-slate-500 font-sans">{inv.clientName}</p>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{inv.serviceType}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{inv.dueDate}</td>
                  <td className="py-2.5 px-3 font-bold text-brand-dark">{formatRupiah(inv.total)}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={inv.status} type="invoice" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
