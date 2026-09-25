import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS = {
  ops: null, // hidden
  director: 'Direktur',
  hrd: 'HRD',
  legal: 'Legal',
  operations: 'Operasional',
  finance: 'Finance',
  marketing: 'Marketing',
  it: 'IT Support',
  website: 'Admin Website',
  notifications: 'Notifikasi',
  search: 'Pencarian',
  audit: 'Audit Log',
  profile: 'Profil',
  employees: 'Karyawan',
  clients: 'Client',
  invoices: 'Invoice',
  payroll: 'Payroll',
  cod: 'COD',
  cases: 'Kasus',
  tickets: 'Tiket',
  leads: 'Lead',
  opportunities: 'Peluang',
  login: null, // hidden
};

export default function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  const crumbs = segments
    .map((seg, i) => {
      const label = ROUTE_LABELS[seg];
      if (label === null) return null; // explicitly hidden
      const path = '/' + segments.slice(0, i + 1).join('/');
      return {
        label: label || seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        path,
        isLast: i === segments.length - 1,
      };
    })
    .filter(Boolean);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted mb-4 flex-wrap">
      <Link
        to="/ops"
        className="flex items-center gap-1 text-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:underline"
        aria-label="Beranda internal"
      >
        <Home className="h-3.5 w-3.5" aria-hidden />
      </Link>
      {crumbs.map((crumb) => (
        <React.Fragment key={crumb.path}>
          <ChevronRight className="h-3.5 w-3.5 text-border flex-none" aria-hidden />
          {crumb.isLast ? (
            <span className="text-ink font-medium" aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className="text-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:underline"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
