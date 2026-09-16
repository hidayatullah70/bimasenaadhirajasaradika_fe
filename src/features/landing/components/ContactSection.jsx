import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Shield, Clock, ArrowUpRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { api } from '../../../services/api/apiClient';
import { useToast } from '../../../app/context/ToastContext';
import { COMPANY_INFO, INITIAL_SERVICES } from '../../../services/mock/mockData';

export function ContactSection({ selectedService }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    service: selectedService || 'Pengamanan / Security',
    headcount: '10',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState(null);

  // If prop selectedService changes, sync state
  React.useEffect(() => {
    if (selectedService) {
      setFormData(prev => ({ ...prev, service: selectedService }));
    }
  }, [selectedService]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      addToast('Mohon lengkapi nama, kontak telepon, dan email Anda.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitContactInquiry(formData);
      if (res.success) {
        setSubmitted(true);
        setTicketId(res.data?.ticketId || 'BAR-REQ-001');
        addToast('Permintaan konsultasi Anda telah berhasil dikirim!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Gagal mengirimkan permintaan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      company: '',
      phone: '',
      email: '',
      service: 'Pengamanan / Security',
      headcount: '10',
      message: ''
    });
    setSubmitted(false);
    setTicketId(null);
  };

  const serviceOptions = INITIAL_SERVICES.map(s => ({
    value: s.title,
    label: `${s.title} (${s.code})`
  }));

  const headcountOptions = [
    { value: '5-15', label: '5 – 15 Personel (Kebutuhan Ringan)' },
    { value: '16-30', label: '16 – 30 Personel (Kebutuhan Sedang)' },
    { value: '31-50', label: '31 – 50 Personel (Kebutuhan Komprehensif)' },
    { value: '50+', label: 'Lebih dari 50 Personel (Skala Korporasi / Pabrik)' }
  ];

  return (
    <section id="kontak" className="py-24 bg-gradient-to-b from-brand-neutral to-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-red bg-red-50 px-3 py-1 rounded-full border border-red-200">
                Hubungi Kami
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-dark tracking-tight mt-3">
                Konsultasikan Kebutuhan Tenaga Kerja Anda
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Diskusikan analisis risiko, estimasi anggaran, dan jadwal penempatan langsung dengan konsultan alih daya kami tanpa dipungut biaya.
              </p>
            </div>

            {/* Quick Contact Box with Interactive Links */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-sm">
              {/* Telepon / WhatsApp */}
              <a
                href="https://wa.me/6285124799305?text=Halo%20PT.%20BARAK%2C%20saya%20tertarik%20dengan%20layanan%20Anda"
                target="_blank"
                rel="noopener noreferrer"
                title="Chat WhatsApp Konsultasi PT. BARAK"
                className="group flex items-start justify-between p-3.5 rounded-xl border border-slate-100 hover:border-brand-red/30 hover:bg-red-50/40 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-brand-red group-hover:bg-brand-red group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-2xs">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telepon & WhatsApp</h4>
                    <p className="text-sm font-bold text-brand-dark group-hover:text-brand-red transition-colors">
                      {COMPANY_INFO.phone}
                    </p>
                    <div className="space-y-0.5 mt-0.5 text-xs">
                      <span className="text-brand-green font-semibold block">
                        WhatsApp Konsultasi: 0851 2479 9305
                      </span>
                      <span className="text-slate-500 text-[11px] block">
                        WhatsApp Rekrutmen: 0851 7433 4336
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all text-xs font-semibold flex-shrink-0 mt-1">
                  <span className="hidden sm:inline text-[11px]">Chat WA</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </a>

              {/* Email Resmi (Direct Gmail Compose) */}
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${COMPANY_INFO.email}&su=Konsultasi%20Layanan%20PT.%20Bhimasena%20Adhirajasa%20Radhika`}
                target="_blank"
                rel="noopener noreferrer"
                title="Kirim Email via Gmail ke PT. BARAK"
                className="group flex items-start justify-between p-3.5 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/40 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 text-amber-600 group-hover:bg-brand-yellow-dark group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-2xs">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Resmi Bisnis</h4>
                    <p className="text-sm font-bold text-brand-dark group-hover:text-brand-red transition-colors break-all">
                      {COMPANY_INFO.email}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Buka langsung di Gmail untuk penawaran & tender</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all text-xs font-semibold flex-shrink-0 mt-1">
                  <span className="hidden sm:inline text-[11px]">Buka Gmail</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </a>

              {/* Alamat Kantor Pusat (Direct link to Google Maps) */}
              <a
                href="https://maps.app.goo.gl/BsRT6XkbrJW8oRsB6"
                target="_blank"
                rel="noopener noreferrer"
                title="Buka lokasi kantor PT. BARAK di Google Maps"
                className="group flex items-start justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-brand-dark group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-2xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Alamat Kantor Pusat</span>
                      <span className="text-[10px] font-semibold text-brand-red bg-red-50 px-1.5 py-0.5 rounded">Google Maps</span>
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed group-hover:text-brand-dark transition-colors mt-0.5">
                      {COMPANY_INFO.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-brand-dark group-hover:translate-x-0.5 transition-all text-xs font-semibold flex-shrink-0 mt-1">
                  <span className="hidden sm:inline text-[11px]">Buka Maps</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </a>

              {/* Jam Operasional */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500 px-3">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Jam Operasional: <strong>{COMPANY_INFO.operationalHours}</strong></span>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form or Success Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-lg">
              {submitted ? (
                <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-brand-green flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-brand-dark">
                    Permintaan Konsultasi Berhasil Terkirim!
                  </h3>
                  <div className="inline-block bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
                    No. Tiket Registrasi: <span className="font-bold text-brand-red">{ticketId}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Terima kasih atas kepercayaan Anda kepada PT. Bhimasena Adhirajasa Radhika. Konsultan kami telah menerima perincian kebutuhan Anda dan akan segera menghubungi nomor telepon atau email yang terdaftar dalam 1x24 jam kerja.
                  </p>
                  <div className="pt-4">
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      Kirim Formulir Lainnya
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="pb-3 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-brand-dark">Formulir Pengajuan Kebutuhan Manpower</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Isi data di bawah ini untuk mendapatkan simulasi penawaran dan jadwal konsultasi.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nama Lengkap Penanggung Jawab"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Contoh: Budi Santoso"
                      required
                    />
                    <Input
                      label="Nama Perusahaan / Instansi"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Contoh: PT Graha Sentosa"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nomor Telepon / WhatsApp"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Contoh: 081234567890"
                      required
                    />
                    <Input
                      label="Alamat Email Perusahaan"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="budi@perusahaan.com"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Pilihan 6 Layanan Utama"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      options={serviceOptions}
                    />
                    <Select
                      label="Estimasi Kebutuhan Personel"
                      name="headcount"
                      value={formData.headcount}
                      onChange={handleChange}
                      options={headcountOptions}
                    />
                  </div>

                  <Textarea
                    label="Catatan / Spesifikasi Tambahan"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tuliskan detail lokasi site, kriteria khusus sertifikasi, atau target tanggal penempatan..."
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full shadow-md shadow-red-900/10"
                      loading={loading}
                      icon={Send}
                      iconPosition="right"
                    >
                      Kirimkan Permintaan Konsultasi
                    </Button>
                    <p className="text-[11px] text-slate-400 text-center mt-2">
                      Informasi Anda dijamin kerahasiaannya dan hanya digunakan untuk keperluan penawaran resmi PT. Bhimasena.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
