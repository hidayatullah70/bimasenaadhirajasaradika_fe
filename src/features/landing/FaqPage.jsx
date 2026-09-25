/**
 * Public FAQ Page — PT. BARAK
 * Source of Truth: PRD Section 2.1 (Public Site: FAQ) & Section 17 (CMS: FAQ).
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import { cmsAdapter } from '@/services/adapters/cmsAdapter';
import { StateLoading } from '@/components/ui/StateViews';

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(0);
  const [selectedCat, setSelectedCat] = useState('');

  useEffect(() => {
    async function loadFaqs() {
      try {
        const res = await cmsAdapter.getFaqs();
        if (res.data) setFaqs(res.data);
      } finally {
        setLoading(false);
      }
    }
    loadFaqs();
  }, []);

  const categories = ['', ...new Set(faqs.map((f) => f.categoryLabel || f.category))];
  const filteredFaqs = selectedCat
    ? faqs.filter((f) => (f.categoryLabel || f.category) === selectedCat)
    : faqs;

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="bg-ink py-20">
          <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent-green/20 text-accent-green border border-accent-green/30 mb-3">
              Pusat Informasi & Jawaban
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-sm sm:text-base">
              Temukan jawaban transparan mengenai legalitas perizinan BUJP Mabes Polri, standar upah ketenagakerjaan, sistem penggantian darurat, dan alur kerjasama outsourcing dengan PT. BARAK.
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16 bg-canvas">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedCat(cat);
                    setOpenIndex(0);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCat === cat
                      ? 'bg-primary-red text-white shadow-xs'
                      : 'bg-white text-muted hover:text-ink border border-border'
                  }`}
                >
                  {cat || 'Semua Topik'}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-12">
                <StateLoading message="Memuat basis data FAQ..." />
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-8 text-center text-muted">
                Tidak ada pertanyaan pada kategori ini.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openIndex === index;
                  return (
                    <div
                      key={faq.id || index}
                      className="bg-white rounded-xl border border-border shadow-xs overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="w-full px-6 py-4 text-left flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <HelpCircle className="w-5 h-5 text-primary-red shrink-0 mt-0.5" />
                          <span className="font-semibold text-sm sm:text-base text-ink leading-snug">
                            {faq.question || faq.q}
                          </span>
                        </div>
                        <div className="shrink-0 p-1 text-muted">
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-border/60 bg-slate-50/40">
                          <p className="p-3.5 bg-white rounded-lg border border-border">
                            {faq.answer || faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* CTA Box */}
            <div className="mt-12 bg-surface rounded-2xl border border-border p-8 text-center">
              <h3 className="text-base sm:text-lg font-bold text-ink mb-2">
                Masih memiliki pertanyaan spesifik seputar bisnis Anda?
              </h3>
              <p className="text-xs sm:text-sm text-muted mb-6 max-w-lg mx-auto">
                Tim spesialis operasional dan legal PT. BARAK siap memberikan konsultasi dan survei titik rawan tanpa dipungut biaya.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-red hover:bg-red-800 text-white font-semibold text-sm rounded-lg transition-colors shadow-xs"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Konsultasi Kebutuhan Bisnis</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
