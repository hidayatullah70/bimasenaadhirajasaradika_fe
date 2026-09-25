/**
 * GlobalSearch — modal overlay search.
 * Trigger: Ctrl+K or topbar button.
 * Results: category + identifier + status (PRD §24).
 * Source of Truth: PRD §24 / API-SPEC §12.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import searchAdapter from '@/services/adapters/searchAdapter';
import Badge from '@/components/ui/Badge';

const TYPE_ICONS = {
  employee: '👤',
  client: '🏢',
  invoice: '🧾',
  cod_case: '💰',
  legal_case: '⚖️',
  it_ticket: '🖥️',
  lead: '🎯',
  contract: '📄',
  location: '📍',
};

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [typeLabels, setTypeLabels] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const { data } = await searchAdapter.search(query);
      if (data) {
        setResults(data.results || []);
        setTypeLabels(data.typeLabels || {});
        setActiveIdx(0);
      }
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = useCallback(
    (item) => {
      navigate(item.route);
      onClose();
      setQuery('');
    },
    [navigate, onClose]
  );

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIdx]) {
      handleSelect(results[activeIdx]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Group results by type
  const grouped = results.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian global"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Search panel */}
      <div className="relative w-full max-w-2xl bg-surface rounded-xl shadow-modal border border-border overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          {loading ? (
            <Loader2 className="h-5 w-5 text-muted animate-spin flex-none" aria-hidden />
          ) : (
            <Search className="h-5 w-5 text-muted flex-none" aria-hidden />
          )}
          <input
            ref={inputRef}
            id="global-search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cari karyawan, client, invoice, kasus..."
            className="flex-1 bg-transparent text-ink placeholder:text-muted outline-none text-sm"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-activedescendant={results[activeIdx] ? `result-${results[activeIdx].id}` : undefined}
          />
          <button
            onClick={onClose}
            className="text-muted hover:text-ink transition-colors"
            aria-label="Tutup pencarian"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Results */}
        <div
          id="search-results"
          role="listbox"
          aria-label="Hasil pencarian"
          className="max-h-[60vh] overflow-y-auto"
        >
          {query.trim().length < 2 && (
            <div className="px-4 py-8 text-center text-sm text-muted">
              Ketik minimal 2 karakter untuk mencari...
            </div>
          )}

          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted">
              Tidak ditemukan hasil untuk "<strong>{query}</strong>"
            </div>
          )}

          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <div className="px-4 py-1.5 text-xs font-semibold text-muted uppercase tracking-wide bg-canvas border-b border-border">
                {typeLabels[type] || type}
              </div>
              {items.map((item) => {
                const globalIdx = results.indexOf(item);

                const isActive = globalIdx === activeIdx;
                return (
                  <button
                    key={item.id}
                    id={`result-${item.id}`}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIdx(globalIdx)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/50 last:border-0',
                      isActive ? 'bg-primary-red/5' : 'hover:bg-canvas'
                    )}
                  >
                    <span className="text-lg flex-none" aria-hidden>{TYPE_ICONS[type] || '🔍'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{item.label}</p>
                      <p className="text-xs text-muted truncate">{item.id} · {item.meta}</p>
                    </div>
                    <Badge status={item.status} className="flex-none" />
                    {isActive && <ArrowRight className="h-4 w-4 text-muted flex-none" aria-hidden />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-border bg-canvas flex items-center gap-4 text-xs text-muted">
          <span>↑↓ navigasi</span>
          <span>↵ pilih</span>
          <span>Esc tutup</span>
        </div>
      </div>
    </div>
  );
}
