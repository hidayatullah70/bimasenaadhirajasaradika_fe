/**
 * SearchPage — full-page search results at /ops/search
 * Source of Truth: PRD §24 / API-SPEC §12.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Badge from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/StateViews';
import searchAdapter from '@/services/adapters/searchAdapter';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [typeLabels, setTypeLabels] = useState({});
  const [loading, setLoading] = useState(false);

  const doSearch = React.useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    const { data } = await searchAdapter.search(q);
    if (data) { setResults(data.results || []); setTypeLabels(data.typeLabels || {}); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); doSearch(q); }
  }, [searchParams, doSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
    doSearch(query);
  };

  const grouped = results.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Pencarian Global" description="Cari karyawan, client, invoice, kasus, dan lebih banyak." />

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" aria-hidden />
          <input
            id="search-page-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari karyawan, client, invoice, kasus..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red transition-all"
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-primary-red text-white rounded-lg text-sm font-semibold hover:bg-red-800 transition-colors"
        >
          Cari
        </button>
      </form>

      {loading && (
        <div className="flex items-center gap-2 text-muted text-sm py-8 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span>Mencari...</span>
        </div>
      )}

      {!loading && query.trim().length >= 2 && results.length === 0 && (
        <EmptyState title="Tidak ada hasil" description={`Tidak ditemukan hasil untuk "${query}"`} />
      )}

      {!loading && Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="mb-6">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
            {typeLabels[type] || type} ({items.length})
          </h2>
          <div className="bg-surface rounded-xl border border-border divide-y divide-border overflow-hidden">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-canvas transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink text-sm truncate">{item.label}</p>
                  <p className="text-xs text-muted truncate">{item.id} · {item.meta}</p>
                </div>
                <Badge status={item.status} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
