/**
 * Invoice Print Modal — PT. BARAK IOMS
 * Modal pratinjau dan pencetakan faktur penagihan resmi (Invoice) untuk klien.
 * Dilengkapi kop surat korporat, rincian PPN 11%, terbilang bahasa Indonesia,
 * instruksi rekening bank BCA, stempel pengesahan, dan print stylesheet A4 siap cetak / simpan PDF.
 */

import React, { useRef } from 'react';
import { Printer, X, Download, Building2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
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

  const subtotal = invoice.subtotal || Math.round(invoice.totalAmount / 1.11);
  const taxAmount = invoice.taxAmount || (invoice.totalAmount - subtotal);
  const remaining = invoice.remainingAmount !== undefined ? invoice.remainingAmount : (invoice.totalAmount - (invoice.paidAmount || 0));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Stylesheet khusus untuk print agar hanya faktur yang tercetak dengan rasio A4 */}
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
            padding: 20mm !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-border overflow-hidden max-h-[95vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="p-4 sm:px-6 border-b border-border bg-slate-50 flex items-center justify-between flex-none print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary-red/10 text-primary-red">
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
              className="gap-1.5 shadow-sm"
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

        {/* Printable Invoice Container */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-slate-100/50 print:bg-white print:p-0">
          <div
            id="barak-printable-invoice"
            ref={printAreaRef}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 sm:p-12 space-y-6 max-w-3xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none text-ink text-xs leading-relaxed"
          >
            {/* 1. Official Corporate Header */}
            <div className="border-b-2 border-ink pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-primary-red flex items-center justify-center text-white font-black text-2xl shadow-sm flex-none">
                    B
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-black tracking-tight text-ink uppercase">
                      PT. BIMASENA ADHIRAJA SARADIKA
                    </h1>
                    <p className="text-2xs font-bold text-primary-red tracking-wider uppercase">
                      Integrated Outsourcing Management System (BARAK IOMS)
                    </p>
                    <p className="text-[11px] text-muted mt-1 leading-snug">
                      Kantor Operasional: Jl. Melati I RT. 002/RW. 005 Kel. Tanah Tinggi, Kec. Tangerang, Kota Tangerang, Banten 15119
                      <br />
                      Telp / WhatsApp: +62 821-2374-2722 • Email: finance@barak.co.id • Web: www.barak.co.id
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right flex-none">
                  <div className="inline-block px-3 py-1 rounded bg-slate-100 font-mono text-[10px] text-slate-700 font-semibold border border-slate-200">
                    ABUJPI: 04986/08-10-2024
                  </div>
                  <p className="text-[10px] text-muted mt-1">NIB: 0410240003185</p>
                  <p className="text-[10px] text-muted">NPWP: 20.394.882.1-416.000</p>
                </div>
              </div>
            </div>

            {/* 2. Invoice Document Title & Header Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <span className="text-[11px] font-bold text-primary-red uppercase tracking-widest block">
                  Official Billing Statement
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-ink uppercase tracking-tight">
                  FAKTUR PENAGIHAN / INVOICE
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted">Status:</span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    invoice.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : invoice.status === 'PARTIALLY_PAID'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : invoice.status === 'OVERDUE'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}
                >
                  {invoice.status === 'PAID' ? 'LUNAS (PAID)' : invoice.status === 'PARTIALLY_PAID' ? 'TERBAYAR SEBAGIAN' : invoice.status === 'OVERDUE' ? 'JATUH TEMPO' : 'TERBIT / DIKIRIM'}
                </span>
              </div>
            </div>

            {/* 3. Billed To & Invoice Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                  Tagihan Ditujukan Kepada (Billed To):
                </span>
                <h4 className="text-sm font-bold text-ink">
                  {invoice.clientName}
                </h4>
                {client && (
                  <div className="mt-1 space-y-0.5 text-xs text-muted">
                    {client.contactPerson && (
                      <p className="text-ink font-medium">U.P. : {client.contactPerson}</p>
                    )}
                    {client.address && <p>{client.address}</p>}
                    <p>{client.city || 'Jabodetabek'}, Indonesia</p>
                    {client.phone && <p>Telp: {client.phone}</p>}
                    {client.email && <p>Email: {client.email}</p>}
                  </div>
                )}
                {!client && (
                  <p className="text-xs text-muted mt-1">
                    Mitra Korporasi Rekanan PT. Bimasena Adhirajasa Radhika
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Nomor Faktur:</span>
                  <span className="font-mono font-bold text-ink">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Tanggal Penerbitan:</span>
                  <span className="font-medium text-ink">{formattedDate(invoice.issueDate)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Jatuh Tempo (Due Date):</span>
                  <span className="font-bold text-primary-red">{formattedDate(invoice.dueDate)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Periode Layanan:</span>
                  <span className="font-medium text-ink">{invoice.billingPeriod}</span>
                </div>
              </div>
            </div>

            {/* 4. Table of Billed Services */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-ink uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3 border-r border-slate-200 w-10 text-center">No</th>
                    <th className="py-2.5 px-4 border-r border-slate-200">Deskripsi Rincian Layanan Outsourcing</th>
                    <th className="py-2.5 px-4 border-r border-slate-200 w-32 text-center">Periode</th>
                    <th className="py-2.5 px-4 text-right w-40">Jumlah (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  <tr>
                    <td className="py-3 px-3 border-r border-slate-200 text-center font-medium">1</td>
                    <td className="py-3 px-4 border-r border-slate-200">
                      <p className="font-bold text-ink">{invoice.serviceDescription}</p>
                      {invoice.notes && (
                        <p className="text-[11px] text-muted mt-0.5">{invoice.notes}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 border-r border-slate-200 text-center text-muted">
                      {invoice.billingPeriod}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-ink">
                      Rp {subtotal.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 5. Subtotal, Tax and Total Breakdown */}
            <div className="flex flex-col sm:flex-row justify-between gap-6 items-start">
              {/* Terbilang Box */}
              <div className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                  Jumlah Terbilang:
                </span>
                <p className="text-xs font-semibold text-ink italic leading-snug">
                  # {angkaKeTerbilang(invoice.totalAmount)} #
                </p>
              </div>

              {/* Numerical Calculation Summary */}
              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Subtotal Biaya Jasa:</span>
                  <span className="font-semibold text-ink">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>PPN 11% (Pajak Pertambahan Nilai):</span>
                  <span className="font-semibold text-ink">Rp {taxAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t-2 border-slate-200 pt-2 flex justify-between text-sm font-bold text-ink">
                  <span>Total Tagihan:</span>
                  <span className="text-primary-red">Rp {invoice.totalAmount.toLocaleString('id-ID')}</span>
                </div>

                {invoice.paidAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                    <span>Sudah Dibayar:</span>
                    <span>- Rp {invoice.paidAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="border-t border-dashed border-slate-300 pt-2 flex justify-between font-bold text-xs">
                  <span>Sisa Tagihan (Balance Due):</span>
                  <span className={remaining > 0 ? 'text-primary-red' : 'text-emerald-700'}>
                    Rp {remaining.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Payment Instructions Box */}
            <div className="p-4 bg-primary-red/5 border border-primary-red/20 rounded-xl space-y-1.5">
              <h5 className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-primary-red" />
                <span>Instruksi Pembayaran Rekening Resmi:</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div>
                  <span className="text-muted block text-[10px]">Bank Tujuan:</span>
                  <strong className="text-ink">Bank Central Asia (BCA)</strong>
                </div>
                <div>
                  <span className="text-muted block text-[10px]">Nomor Rekening:</span>
                  <strong className="text-primary-red font-mono text-sm tracking-wide">883-129-9000</strong>
                </div>
                <div>
                  <span className="text-muted block text-[10px]">Atas Nama Rekening:</span>
                  <strong className="text-ink">PT. BIMASENA ADHIRAJA SARADIKA</strong>
                </div>
              </div>
              <p className="text-[10px] text-muted italic pt-1 border-t border-primary-red/10 mt-2">
                * Mohon mencantumkan nomor faktur ({invoice.invoiceNumber}) pada berita transfer dan mengirimkan bukti pembayaran via WhatsApp (+62 821-2374-2722) atau email finance@barak.co.id.
              </p>
            </div>

            {/* 7. Signature & Authorization Seal */}
            <div className="pt-4 flex justify-between items-end">
              <div className="text-[10px] text-muted max-w-xs space-y-1">
                <div className="flex items-center gap-1 text-slate-700 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent-green" />
                  <span>Dokumen Sah & Terverifikasi Sistem</span>
                </div>
                <p>
                  Faktur penagihan ini dihasilkan secara elektronik dan sah sesuai ketentuan tata kelola operasional PT. Bimasena Adhirajasa Radhika.
                </p>
                <p className="font-mono text-[9px] text-slate-400">
                  REF-UUID: {invoice.id} • Cetak: {printDate}
                </p>
              </div>

              <div className="text-center w-56 space-y-1">
                <p className="text-xs text-muted">
                  Tangerang, {formattedDate(invoice.issueDate)}
                </p>
                <p className="text-xs font-bold text-ink uppercase">
                  PT. Bimasena Adhirajasa Radhika
                </p>

                {/* Stempel & Signature Visual Placeholder */}
                <div className="h-16 flex items-center justify-center relative">
                  <div className="w-20 h-20 rounded-full border-2 border-primary-red/40 border-dashed flex flex-col items-center justify-center text-primary-red/50 text-[9px] font-bold uppercase rotate-12 pointer-events-none">
                    <span>PT. BARAK</span>
                    <span className="text-[7px]">FINANCE</span>
                    <span className="text-[6px]">TANGERANG</span>
                  </div>
                </div>

                <div className="border-t border-ink pt-1">
                  <p className="font-bold text-ink text-xs">Divisi Keuangan & Penagihan</p>
                  <p className="text-[10px] text-muted">Finance & Accounting Dept.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden on Print) */}
        <div className="p-4 border-t border-border bg-slate-50 flex items-center justify-end gap-2.5 flex-none print:hidden">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Tutup
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Faktur (Print / PDF)</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
