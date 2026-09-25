/**
 * FAQ CMS Management Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 17 (CMS: FAQ Management), Section 2.1.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';
import { cmsAdapter } from '@/services/adapters/cmsAdapter';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/constants/permissions';
import FaqFormModal from './FaqFormModal';

const CATEGORIES = [
  { value: '', label: 'Semua Kategori' },
  { value: 'LEGALITAS', label: 'Perizinan & Legalitas BUJP' },
  { value: 'LAYANAN', label: 'Layanan Outsourcing' },
  { value: 'KOMERSIAL', label: 'Kontrak & Pembayaran' },
  { value: 'KESEJAHTERAAN', label: 'Gaji & BPJS Tenaga Kerja' },
  { value: 'OPERASIONAL', label: 'Operasional & Penggantian' },
  { value: 'TEKNOLOGI', label: 'Barrier Gate & CCTV' },
  { value: 'LOGISTIK', label: 'Kurir Ekspedisi & COD' },
  { value: 'KEMITRAAN', label: 'Alur Kerjasama Mitra' },
];

export default function FaqListPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission(PERMISSIONS.CMS_EDIT);

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [openId, setOpenId] = useState(null);

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cmsAdapter.getFaqs({ search, category });
      if (res.data) {
        setFaqs(res.data);
      }
    } catch {
      toast.error('Gagal memuat daftar FAQ.');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleOpen = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Cari pertanyaan atau kata kunci..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs sm:text-sm border border-border rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-primary-red"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Create Button */}
        {canManage && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsFormOpen(true)}
            className="gap-1.5 self-start md:self-auto shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah FAQ Baru</span>
          </Button>
        )}
      </div>

      {/* FAQs List */}
      {loading ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateLoading message="Memuat basis tanya jawab umum portal..." />
        </div>
      ) : faqs.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateEmpty
            title="Tidak ada FAQ yang ditemukan"
            description="Belum ada butir pertanyaan yang cocok dengan filter pencarian Anda."
            actionLabel={canManage ? 'Tambah FAQ Baru' : undefined}
            onAction={canManage ? () => setIsFormOpen(true) : undefined}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-border overflow-hidden shadow-2xs hover:border-primary-red/30 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleOpen(faq.id)}
                  className="w-full p-4 text-left flex items-start justify-between gap-3 focus:outline-none"
                >
                  <div className="flex items-start gap-3">
                    <span className="p-1 rounded bg-slate-100 text-slate-700 font-mono text-xs mt-0.5 shrink-0">
                      {faq.id}
                    </span>
                    <div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {faq.categoryLabel || faq.category}
                      </span>
                      <h4 className="text-sm font-bold text-ink mt-1 leading-snug">
                        {faq.question}
                      </h4>
                    </div>
                  </div>

                  <div className="shrink-0 p-1 text-muted">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-2 border-t border-border/60 bg-slate-50/50 text-xs text-slate-700 leading-relaxed">
                    <p className="p-3 bg-white rounded-lg border border-border">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isFormOpen && (
        <FaqFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
