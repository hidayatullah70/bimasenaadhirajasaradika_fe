import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white"><PublicNavbar />
      <main className="pt-16 flex items-center justify-center min-h-[70vh] px-4">
        <div className="text-center">
          <p className="text-8xl font-bold text-primary-red/20 mb-4">404</p>
          <h1 className="text-2xl font-bold text-ink mb-3">Halaman Tidak Ditemukan</h1>
          <p className="text-muted mb-8">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-red text-white font-semibold rounded-xl hover:bg-red-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red">
            <Home className="h-4 w-4" aria-hidden />Kembali ke Beranda
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
