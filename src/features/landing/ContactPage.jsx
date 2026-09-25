import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import { cmsAdapter } from '@/services/adapters/cmsAdapter';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Hubungi Kami - PT. Bhimasena Adhirajasa Radhika';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Silakan isi Nama Lengkap Anda.');
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      toast.error('Harap masukkan nomor Telepon atau Email yang dapat dihubungi.');
      return;
    }

    setIsSubmitting(true);

    try {
      await cmsAdapter.submitPublicInquiry({
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        service: form.service || 'Umum',
        serviceLabel: form.service || 'Umum / Konsultasi',
        message: form.message,
      });

      setIsSuccess(true);
      toast.success('Pesan Anda berhasil dikirim! Tim PT. BARAK akan segera menghubungi Anda.', {
        duration: 5000,
      });

      setForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        service: '',
        message: '',
      });
    } catch {
      toast.error('Terjadi kendala saat mengirim pesan. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Header Section Matching Uploaded Image */}
        <section className="text-center px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Hubungi <span className="text-red-600">Kami</span>
            </h1>
            <div className="w-12 h-1 bg-accent-green rounded-full mx-auto mt-2.5 mb-3" />
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl mx-auto">
              Siap membantu kebutuhan Anda dengan solusi dan layanan profesional. Hubungi tim kami untuk konsultasi dan penawaran.
            </p>
          </div>
        </section>

        {/* 2-Column Content Container */}
        <section className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* ─────────────────────────────────────────────────────────────
                LEFT COLUMN: FORM INQUIRY / KIRIM PESAN
            ────────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                  Kirim Pesan
                </h2>
              </div>

              {isSuccess ? (
                <div className="py-8 text-center bg-emerald-50/70 border border-emerald-200 rounded-xl p-6">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Terima Kasih, Pesan Terkirim!
                  </h3>
                  <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                    Data permohonan konsultasi Anda telah diterima oleh divisi layanan PT. BARAK. Kami akan segera menghubungi nomor telepon atau email Anda.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-red hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Kirim Pesan Lainnya
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Row 1: Nama Lengkap & Perusahaan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                        Nama Lengkap
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Masukkan nama lengkap"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-company" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                        Perusahaan
                      </label>
                      <input
                        id="contact-company"
                        type="text"
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Nama perusahaan (opsional)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email & Telepon */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-email" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                        Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="email@contoh.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-phone" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                        Telepon
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        name="phone"
                        required
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="0812-3456-7890"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 3: Jenis Layanan */}
                  <div>
                    <label htmlFor="contact-service" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                      Jenis Layanan
                    </label>
                    <select
                      id="contact-service"
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
                    >
                      <option value="">Pilih layanan yang dibutuhkan</option>
                      <option value="Jasa Pengamanan / Security">Jasa Pengamanan / Security</option>
                      <option value="Ekspedisi Kurir">Ekspedisi Kurir</option>
                      <option value="Parkir">Parkir</option>
                      <option value="Cleaning Service">Cleaning Service</option>
                      <option value="Man Power">Man Power</option>
                      <option value="Loss Prevention">Loss Prevention</option>
                      <option value="Konsultasi & Layanan Lainnya">Konsultasi & Layanan Lainnya</option>
                    </select>
                  </div>

                  {/* Row 4: Pesan */}
                  <div>
                    <label htmlFor="contact-message" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                      Pesan
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Jelaskan proyek atau kebutuhan Anda..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button: RED button with white text as requested */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white bg-primary-red hover:bg-red-700 transition-all shadow-md active:scale-98 disabled:opacity-60 cursor-pointer text-sm sm:text-base"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Mengirim Pesan...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Kirim Pesan</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ─────────────────────────────────────────────────────────────
                RIGHT COLUMN: INFORMASI KONTAK, SOSMED & PETA LOKASI
            ────────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-5 space-y-6">

              {/* Google Maps Preview & Red CTA Button */}
              <div className="pt-2">
                <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs bg-slate-100 relative group">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.691039183711!2d106.65025361056865!3d-6.172105893789439!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f971d739eae9%3A0x145c3a84a4e07ee1!2sPT.%20Bimasena%20Adhirajasa%20Radhika!5e0!3m2!1sen!2sid!4v1790265707103!5m2!1sen!2sid"
                    width="100%"
                    height="220"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    title="Lokasi Kantor PT. Bimasena Adhirajasa Radhika"
                    className="w-full h-48 sm:h-56 block"
                  />
                </div>
              </div>

              {/* Header Title */}
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-1.5">
                  PT. Bhimasena Adhirajasa Radhika
                </h2>
              </div>

              {/* 4 Contact Details Cards */}
              <div className="space-y-4">

                {/* 1. Alamat Kantor */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center flex-none mt-0.5 border border-accent-green/20">
                    <MapPin className="w-5 h-5 text-accent-green" />
                  </div>
                  <div>
                    <a
                      href="https://www.google.com/maps/place/PT.+Bimasena+Adhirajasa+Radhika/@-6.1721059,106.6502536,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f971d739eae9:0x145c3a84a4e07ee1!8m2!3d-6.1721059!4d106.6502536"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-0.5 hover:text-primary-red transition-colors block"
                      title="Buka di Google Maps"
                    >
                      <p>Jl. Melati I RT. 002/RW.005 Kel. Tanah Tinggi Kec. Tangerang</p>
                      <p>Kota Tangerang, Banten 15119</p>
                    </a>
                  </div>
                </div>

                {/* 2. Telepon & WhatsApp */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-primary-red flex items-center justify-center flex-none mt-0.5 border border-red-100">
                    <Phone className="w-5 h-5 text-primary-red" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
                      <a
                        href="https://wa.me/6285124799305"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary-red transition-colors inline-block"
                      >
                        0851 2479 9305{' '}
                        <span className="text-xs text-slate-500 font-normal">
                          (WhatsApp Konsultasi)
                        </span>
                      </a>
                    </p>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
                      <a
                        href="https://wa.me/6285174334336"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary-red transition-colors inline-block"
                      >
                        0851 7433 4336{' '}
                        <span className="text-xs text-slate-500 font-normal">
                          (WhatsApp Lowongan Kerja)
                        </span>
                      </a>
                    </p>
                  </div>
                </div>

                {/* 3. Email */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-none mt-0.5 border border-emerald-100">
                    <Mail className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
                      <a
                        href="mailto:ptbimasenaadhirajasaradika@gmail.com"
                        className="hover:text-primary-red transition-colors"
                      >
                        ptbimasenaadhirajasaradika@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                {/* 4. Jam Operasional */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-none mt-0.5 border border-slate-200">
                    <Clock className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                      Senin - Jumat: 08:00 - 17:00 WIB
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Sabtu: 08:00 - 12:00 WIB
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
