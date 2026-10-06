/**
 * Invoice Print Modal — PT. BARAK IOMS
 * Modal pratinjau dan pencetakan faktur penagihan resmi (Invoice) untuk klien.
 * Didesain efisien, ringkas, dan proporsional untuk kertas A4 Portrait (Single Page).
 * Kolom 'Periode' dan badge 'Reward(+)' / 'Potongan(-)' dihapus agar simpel dan bersih sesuai standar faktur.
 */

import React, { useRef } from 'react';
import { Printer, X, Building2, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * Utilitas konversi nominal angka ke kalimat terbilang rupiah
 */
function angkaKeTerbilang(angka) {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];
  const num = Math.floor(Math.abs(Number(angka) || 0));
  if (num === 0) return 'Nol Rupiah';

  function sebut(x) {
    if (x < 12) return bilangan[x];
    if (x < 20) return sebut(x - 10) + ' Belas';
    if (x < 100) return sebut(Math.floor(x / 10)) + ' Puluh ' + sebut(x % 10);
    if (x < 200) return 'Seratus ' + sebut(x - 100);
    if (x < 1000) return sebut(Math.floor(x / 100)) + ' Ratus ' + sebut(x % 100);
    if (x < 2000) return 'Seribu ' + sebut(x - 1000);
    if (x < 1000000) return sebut(Math.floor(x / 1000)) + ' Ribu ' + sebut(x % 1000);
    if (x < 1000000000) return sebut(Math.floor(x / 1000000)) + ' Juta ' + sebut(x % 1000000);
    if (x < 1000000000000) return sebut(Math.floor(x / 1000000000)) + ' Miliar ' + sebut(x % 1000000000);
    return sebut(Math.floor(x / 1000000000000)) + ' Triliun ' + sebut(x % 1000000000000);
  }

  return (sebut(num).replace(/\s+/g, ' ').trim()) + ' Rupiah';
}

export default function InvoicePrintModal({ isOpen, onClose, invoice, client }) {
  const printAreaRef = useRef(null);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const printDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const subtotal = invoice.subtotalServices || invoice.subtotal || Math.round(invoice.totalAmount / 1.11);
  const taxAmount = invoice.taxAmount !== undefined ? invoice.taxAmount : (invoice.isPpnActive ? Math.round((invoice.managementFeeAmount || 0) * 0.11) : 0);
  const remaining = invoice.remainingAmount !== undefined ? invoice.remainingAmount : (invoice.totalAmount - (invoice.paidAmount || 0));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Stylesheet khusus untuk print agar pas di A4 portrait */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #barak-printable-invoice, #barak-printable-invoice * {
            visibility: visible !important;
          }
          #barak-printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 8mm 12mm !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            font-size: 10.5px !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-border overflow-hidden max-h-[96vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="p-3.5 sm:px-6 border-b border-border bg-slate-50 flex items-center justify-between flex-none print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary-red/10 text-primary-red">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-ink">
                Pratinjau & Cetak Faktur Penagihan
              </h3>
              <p className="text-xs text-muted">
                No. Faktur: <span className="font-semibold text-ink">{invoice.invoiceNumber}</span> • {invoice.clientName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 shadow-sm text-xs py-1.5 px-3"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak / Simpan PDF</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:text-ink p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              title="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container — Designed for A4 single page */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100/50 print:bg-white print:p-0">
          <div
            id="barak-printable-invoice"
            ref={printAreaRef}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4 max-w-3xl mx-auto print:border-none print:shadow-none print:p-0 print:space-y-3.5 print:max-w-none text-ink text-xs leading-normal"
          >
            {/* 1. Official Corporate Header */}
            <div className="border-b-2 border-ink pb-2.5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/img/logo/logoAja.png"
                    alt="Logo PT. Bimasena Adhirajasa Saradika"
                    className="w-12 h-12 object-contain flex-none"
                  />
                  <div>
                    <h1 className="text-base sm:text-lg font-black tracking-tight text-ink uppercase leading-none">
                      PT. BIMASENA ADHIRAJASA RADIKA
                    </h1>
                    <p className="text-[10px] font-bold text-primary-red tracking-wider uppercase mt-0.5">
                      Integrated Outsourcing Management System (BARAK IOMS)
                    </p>
                    <p className="text-[10px] text-muted mt-0.5 leading-snug">
                      Kantor Operasional: Jl. Melati I RT. 002/RW. 005 Kel. Tanah Tinggi, Kec. Tangerang, Banten 15119
                      <br />
                      Telp / WhatsApp: +6281380768088 • Email: arifin.smart99@gmail.com • Website: www.bimasenaadhirajasaradika.com
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. Invoice Document Title & Status */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div>
                <span className="text-[10px] font-bold text-primary-red uppercase tracking-widest block">
                  Official Billing Statement
                </span>
                <h2 className="text-base sm:text-lg font-black text-ink uppercase tracking-tight leading-none mt-0.5">
                  FAKTUR PENAGIHAN / INVOICE
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-muted">Status:</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${invoice.status === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : invoice.status === 'PARTIALLY_PAID'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : invoice.status === 'OVERDUE'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                >
                  {invoice.status === 'PAID' ? 'LUNAS' : invoice.status === 'PARTIALLY_PAID' ? 'SEBAGIAN' : invoice.status === 'OVERDUE' ? 'JATUH TEMPO' : 'TERBIT / DIKIRIM'}
                </span>
              </div>
            </div>

            {/* 3. Billed To & Invoice Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted block mb-0.5">
                  Tagihan Ditujukan Kepada (Billed To):
                </span>
                <h4 className="text-xs font-bold text-ink uppercase">
                  {invoice.clientName}
                </h4>
                <div className="mt-0.5 space-y-0.5 text-[11px] text-muted">
                  {(invoice.clientContact || client?.contactPerson || client?.picName) && (
                    <p className="text-ink font-medium">
                      U.P. : {invoice.clientContact || client?.contactPerson || client?.picName}
                    </p>
                  )}
                  <p className="text-slate-700 font-medium">
                    {invoice.clientAddress || client?.address || 'Alamat Operasional Jabodetabek'}
                  </p>
                  <p className="text-slate-600">
                    {invoice.clientCity || client?.city || 'Tangerang'}{invoice.clientProvince || client?.province ? `, ${invoice.clientProvince || client?.province}` : ''}, Indonesia
                  </p>
                </div>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Nomor Faktur:</span>
                  <span className="font-mono font-bold text-ink">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Tanggal Terbit:</span>
                  <span className="font-medium text-ink">{formattedDate(invoice.issueDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Jatuh Tempo:</span>
                  <span className="font-bold text-primary-red">{formattedDate(invoice.dueDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Periode Layanan:</span>
                  <span className="font-semibold text-ink">{invoice.billingPeriod}</span>
                </div>
              </div>
            </div>

            {/* 4. Table of Billed Services & Adjustments (Clean, Simpel, No Periode Column, No Badges) */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-ink uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                    <th className="py-2 px-2.5 border-r border-slate-200 w-10 text-center">No</th>
                    <th className="py-2 px-3 border-r border-slate-200">Deskripsi Rincian Layanan & Penyesuaian</th>
                    <th className="py-2 px-3 text-right w-44">Jumlah (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {/* Rincian Jasa Penempatan */}
                  {invoice.serviceItems && invoice.serviceItems.length > 0 ? (
                    invoice.serviceItems.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/50">
                        <td className="py-1.5 px-2.5 border-r border-slate-200 text-center font-medium text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-3 border-r border-slate-200">
                          <p className="font-semibold text-ink whitespace-pre-line leading-tight">{item.description}</p>
                        </td>
                        <td className="py-1.5 px-3 text-right font-semibold text-ink">
                          Rp {(Number(item.amount) || 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-2 px-2.5 border-r border-slate-200 text-center font-medium text-slate-500">1</td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        <p className="font-semibold text-ink leading-tight">{invoice.serviceDescription}</p>
                        {invoice.notes && (
                          <p className="text-[10px] text-muted mt-0.5">{invoice.notes}</p>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-ink">
                        Rp {subtotal.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  )}

                  {/* Rincian Penyesuaian (Reward & Potongan tanpa badge Reward/Potongan) */}
                  {invoice.adjustments && invoice.adjustments.map((adj, idx) => {
                    const rowNum = (invoice.serviceItems?.length || 1) + idx + 1;
                    const isPotongan = adj.type === 'POTONGAN';
                    const amountNum = Number(adj.amount) || 0;

                    return (
                      <tr key={adj.id || `adj-${idx}`} className={isPotongan ? 'bg-red-50/15' : 'bg-slate-50/30'}>
                        <td className="py-1.5 px-2.5 border-r border-slate-200 text-center font-medium text-slate-500">
                          {rowNum}
                        </td>
                        <td className="py-1.5 px-3 border-r border-slate-200">
                          <span className="font-medium text-ink leading-tight">
                            {adj.description}
                          </span>
                        </td>
                        <td
                          className={`py-1.5 px-3 text-right font-semibold ${isPotongan ? 'text-red-600' : 'text-slate-800'
                            }`}
                        >
                          {isPotongan ? '- ' : ''}Rp {amountNum.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 5. Subtotal, Tax and Total Breakdown */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start pt-1">
              {/* Terbilang Box */}
              <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted block">
                  Jumlah Terbilang:
                </span>
                <p className="text-xs font-semibold text-ink italic leading-snug">
                  # {angkaKeTerbilang(invoice.totalAmount)} #
                </p>
              </div>

              {/* Numerical Calculation Summary */}
              <div className="w-full sm:w-72 space-y-1 text-xs">
                <div className="flex justify-between text-muted text-[11px]">
                  <span>Subtotal Nilai Jasa:</span>
                  <span className="font-semibold text-ink">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>

                {invoice.subtotalReward > 0 && (
                  <div className="flex justify-between text-accent-green text-[11px]">
                    <span>Sub Total Reward (+):</span>
                    <span className="font-semibold">+ Rp {invoice.subtotalReward.toLocaleString('id-ID')}</span>
                  </div>
                )}

                {invoice.subtotalPotongan > 0 && (
                  <div className="flex justify-between text-red-600 text-[11px]">
                    <span>Sub Total Potongan (-):</span>
                    <span className="font-semibold">- Rp {invoice.subtotalPotongan.toLocaleString('id-ID')}</span>
                  </div>
                )}

                {(invoice.managementFeeAmount > 0 || (invoice.managementFeeRate !== undefined && invoice.managementFeeRate > 0)) && (
                  <div className="flex justify-between text-emerald-700 text-[11px]">
                    <span>Manajemen Fee ({invoice.managementFeeRate || 0}%):</span>
                    <span className="font-semibold">+ Rp {(invoice.managementFeeAmount || 0).toLocaleString('id-ID')}</span>
                  </div>
                )}

                {invoice.pph23Amount > 0 && (
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>PPH 23 (2%):</span>
                    <span className="font-semibold text-ink">- Rp {invoice.pph23Amount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                {(invoice.isPpnActive || taxAmount > 0) && (
                  <div className="flex justify-between text-emerald-700 text-[11px]">
                    <span>PPN 11% (Manajemen Fee × 11%):</span>
                    <span className="font-semibold">+ Rp {taxAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="border-t-2 border-slate-200 pt-1.5 flex justify-between text-sm font-bold text-ink">
                  <span>Total Tagihan Bersih:</span>
                  <span className="text-primary-red">Rp {invoice.totalAmount.toLocaleString('id-ID')}</span>
                </div>

                {invoice.paidAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold text-[11px] pt-0.5">
                    <span>Sudah Dibayar:</span>
                    <span>- Rp {invoice.paidAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="border-t border-dashed border-slate-300 pt-1 flex justify-between font-bold text-xs">
                  <span>Sisa Tagihan (Balance Due):</span>
                  <span className={remaining > 0 ? 'text-primary-red' : 'text-emerald-700'}>
                    Rp {remaining.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Payment Instructions Box */}
            <div className="p-3 bg-primary-red/5 border border-primary-red/20 rounded-lg space-y-1">
              <h5 className="text-[11px] font-bold text-ink flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary-red" />
                <span>Instruksi Pembayaran Rekening Resmi:</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-0.5">
                <div>
                  <span className="text-muted block text-[9px]">Bank Tujuan:</span>
                  <strong className="text-ink text-[11px]">Bank Central Asia (BCA)</strong>
                </div>
                <div>
                  <span className="text-muted block text-[9px]">Nomor Rekening:</span>
                  <strong className="text-primary-red font-mono text-xs tracking-wide">8833951911</strong>
                </div>
                <div>
                  <span className="text-muted block text-[9px]">Atas Nama Rekening:</span>
                  <strong className="text-ink text-[11px]">BIMASENA ADHIRAJASA RADHIKA</strong>
                </div>
              </div>
              <p className="text-[9px] text-muted italic pt-0.5 border-t border-primary-red/10">
                * Mohon mencantumkan nomor faktur ({invoice.invoiceNumber}) pada berita transfer dan mengirimkan konfirmasi via WhatsApp (+62 0813-8076-8088) atau email : arifin.smart99@gmail.com
              </p>
            </div>

            {/* 7. Signature & Authorization Seal */}
            <div className="pt-2 flex justify-between items-end">
              <div className="text-[9px] text-muted max-w-xs space-y-0.5">
                <div className="flex items-center gap-1 text-slate-700 font-semibold">
                  <ShieldCheck className="h-3 w-3 text-accent-green" />
                  <span>Dokumen Sah & Terverifikasi Sistem</span>
                </div>
                <p>
                  Faktur penagihan ini dihasilkan secara elektronik dan sah sesuai tata kelola PT. Bimasena Adhirajasa Radhika.
                </p>
                <p className="font-mono text-[8px] text-slate-400">
                  REF-UUID: {invoice.id} • Cetak: {printDate}
                </p>
              </div>

              <div className="text-center w-48 space-y-0.5">
                <p className="text-[10px] text-muted">
                  Tangerang, {formattedDate(invoice.issueDate)}
                </p>
                <p className="text-[11px] font-bold text-ink uppercase">
                  PT. Bimasena Adhirajasa Radhika
                </p>

                {/* Stempel & Signature Visual Placeholder */}
                <div className="h-10 flex items-center justify-center relative">
                  <div className="w-16 h-16 rounded-full border border-primary-red/40 border-dashed flex flex-col items-center justify-center text-primary-red/50 text-[7px] font-bold uppercase rotate-12 pointer-events-none">
                    <span>PT. BARAK</span>
                    <span className="text-[5px]">TANGERANG</span>
                  </div>
                </div>
                <p className="font-bold text-ink text-[11px]">Juli Priyanto</p>
                <div className="border-t border-ink pt-0.5">
                  <p className="text-[9px] text-muted">Direktur Utama</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden on Print) */}
        <div className="p-3.5 border-t border-border bg-slate-50 flex items-center justify-end gap-2.5 flex-none print:hidden">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs py-1.5 px-3"
          >
            Tutup
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 shadow-sm text-xs py-1.5 px-3"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Faktur (Print / PDF)</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
