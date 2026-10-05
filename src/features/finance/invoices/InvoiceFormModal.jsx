/**
 * Invoice Form Modal — PT. BARAK IOMS
 * Create client billing invoice with dynamic multi-line service placement items,
 * reward/potongan adjustments, tentative management fee (n%), PPH 23 (2%), PPN 11% (0),
 * and exact Net Total calculation.
 * Source of Truth: PRD Section 14 (Finance Module).
 */

import React, { useState } from 'react';
import {
  FileText,
  X,
  Plus,
  Trash2,
  Gift,
  Scissors,
  Calculator,
  Percent,
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function InvoiceFormModal({ isOpen, onClose, clients, onSubmit }) {
  const [formData, setFormData] = useState({
    clientId: '',
    billingPeriod: 'September 2026',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: 'Rekening BCA PT Bimasena Adhirajasa Radhika 883-129-9000',
  });

  // 1. Dynamic Service Items (can be added indefinitely)
  const [serviceItems, setServiceItems] = useState([
    {
      id: 'srv-1',
      description: 'Jasa Pengamanan & Manpower Central Hub Rawa Bokor (6 Personel)',
      amount: '36000000',
    },
  ]);

  // 2. Dynamic Reward / Potongan Items (can be added indefinitely)
  const [adjustments, setAdjustments] = useState([]);

  // 3. Manajemen Fee n% (tentatif)
  const [managementFeeRate, setManagementFeeRate] = useState(0);

  // 4. PPN 11% Toggle (ON/OFF)
  const [isPpnActive, setIsPpnActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // --- Calculations ---
  // Sub Total Nilai Jasa = Sum of all service items amounts
  const subtotalServices = serviceItems.reduce((acc, item) => {
    const val = Number(item.amount) || 0;
    return acc + val;
  }, 0);

  // Sub Total Reward (+)
  const subtotalReward = adjustments.reduce((acc, item) => {
    if (item.type === 'REWARD') {
      return acc + (Number(item.amount) || 0);
    }
    return acc;
  }, 0);

  // Sub Total Potongan (-)
  const subtotalPotongan = adjustments.reduce((acc, item) => {
    if (item.type === 'POTONGAN') {
      return acc + (Number(item.amount) || 0);
    }
    return acc;
  }, 0);

  // Manajemen Fee = Sub Total Nilai Jasa * n%
  const feeRateNum = Number(managementFeeRate) || 0;
  const managementFeeAmount = Math.round(subtotalServices * (feeRateNum / 100));

  // PPH 23 = Nilai Manajemen Fee (n%) * 2%
  const pph23Amount = Math.round(managementFeeAmount * 0.02);

  // PPN 11% (Toggle ON/OFF)
  // Jika status ON: Manajemen Fee * 11%, jika OFF: 0
  const ppnAmount = isPpnActive ? Math.round(managementFeeAmount * 0.11) : 0;

  // Total Tagihan Bersih = (Sub Total Nilai Jasa + sub total reward + Manajemen Fee + PPN 11%) - Sub Total Potongan - PPH 23
  const totalNet = Math.max(
    0,
    (subtotalServices + subtotalReward + managementFeeAmount + ppnAmount) - subtotalPotongan - pph23Amount
  );

  // --- Handlers: Form Data ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Handlers: Service Items ---
  const handleAddServiceItem = () => {
    setServiceItems((prev) => [
      ...prev,
      {
        id: `srv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        description: '',
        amount: '',
      },
    ]);
  };

  const handleRemoveServiceItem = (id) => {
    if (serviceItems.length <= 1) {
      setError('Minimal harus ada 1 rincian penempatan jasa.');
      return;
    }
    setError('');
    setServiceItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleServiceItemChange = (id, field, value) => {
    setServiceItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // --- Handlers: Adjustments (Reward / Potongan) ---
  const handleAddAdjustment = (type = 'REWARD') => {
    setAdjustments((prev) => [
      ...prev,
      {
        id: `adj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type, // 'REWARD' | 'POTONGAN'
        description: '',
        amount: '',
      },
    ]);
  };

  const handleRemoveAdjustment = (id) => {
    setAdjustments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAdjustmentChange = (id, field, value) => {
    setAdjustments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // --- Handlers: Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.clientId) {
      setError('Klien tertagih wajib dipilih.');
      return;
    }

    const hasEmptyService = serviceItems.some(
      (item) => !item.description.trim() || !(Number(item.amount) > 0)
    );
    if (hasEmptyService) {
      setError('Setiap rincian jasa wajib memiliki keterangan dan nominal > 0.');
      return;
    }

    const hasEmptyAdj = adjustments.some(
      (item) => !item.description.trim() || !(Number(item.amount) > 0)
    );
    if (hasEmptyAdj) {
      setError('Setiap rincian reward/potongan yang ditambahkan wajib memiliki keterangan dan nominal > 0.');
      return;
    }

    if (subtotalServices <= 0) {
      setError('Sub Total Nilai Jasa harus lebih dari 0.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const client = clients.find((c) => c.id === formData.clientId);
      const combinedServiceDesc = serviceItems
        .map((item) => item.description.trim())
        .filter(Boolean)
        .join('; ');

      await onSubmit({
        ...formData,
        clientName: client ? client.name : 'Klien Korporasi',
        serviceDescription: combinedServiceDesc,
        serviceItems,
        adjustments,
        subtotal: subtotalServices,
        subtotalServices,
        subtotalReward,
        subtotalPotongan,
        managementFeeRate: feeRateNum,
        managementFeeAmount,
        pph23Amount,
        isPpnActive,
        taxRate: isPpnActive ? 0.11 : 0,
        taxAmount: ppnAmount,
        totalAmount: totalNet,
        remainingAmount: totalNet,
      });

      onClose();
    } catch (err) {
      setError(err?.message || 'Gagal menerbitkan faktur tagihan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-border overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-primary-red/5 flex-none">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-red/10 text-primary-red">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Terbitkan Tagihan (Invoice) Baru</h3>
              <p className="text-xs text-muted">Faktur resmi penagihan jasa outsourcing kepada klien</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-primary-red/10 text-primary-red rounded-xl border border-primary-red/20 font-medium">
              {error}
            </div>
          )}

          {/* Section: Client & Billing Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-ink mb-1">
                Klien Tertagih <span className="text-primary-red">*</span>
              </label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm border border-border rounded-xl px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                required
              >
                <option value="">Pilih Klien</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type || 'Korporasi'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">
                Periode Tagihan <span className="text-primary-red">*</span>
              </label>
              <input
                type="text"
                name="billingPeriod"
                value={formData.billingPeriod}
                onChange={handleChange}
                placeholder="Contoh: September 2026"
                className="w-full text-xs sm:text-sm border border-border rounded-xl px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                required
              />
            </div>
          </div>

          {/* Section: Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-ink mb-1">
                Tanggal Terbit Faktur
              </label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm border border-border rounded-xl px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">
                Tanggal Jatuh Tempo Pembayaran
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm border border-border rounded-xl px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              />
            </div>
          </div>

          {/* 1. SECTION: Deskripsi / Rincian Penempatan Jasa (Multiple, infinite) */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <label className="block font-bold text-ink text-sm">
                  Deskripsi / Rincian Penempatan Jasa <span className="text-primary-red">*</span>
                </label>
                <p className="text-[11px] text-muted">
                  Tambahkan rincian penempatan jasa dan nominal (Rp) yang membentuk Sub Total Nilai Jasa.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddServiceItem}
                className="gap-1 text-xs py-1.5 px-2.5 text-primary-red border-primary-red/30 hover:bg-primary-red/5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Jasa</span>
              </Button>
            </div>

            <div className="space-y-2.5">
              {serviceItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-border bg-slate-50/70 hover:border-slate-300 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Rincian Layanan #{idx + 1}
                    </span>
                    {serviceItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveServiceItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Hapus baris layanan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => handleServiceItemChange(item.id, 'description', e.target.value)}
                      placeholder="Keterangan teks rincian penempatan jasa (contoh: Jasa Pengamanan & Manpower Central Hub Rawa Bokor - 6 Personel)"
                      className="w-full text-xs border border-border rounded-lg p-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                      required
                    />

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted">Nominal (Rp):</span>
                      <input
                        type="number"
                        min="0"
                        value={item.amount}
                        onChange={(e) => handleServiceItemChange(item.id, 'amount', e.target.value)}
                        placeholder="Contoh: 36000000"
                        className="flex-1 text-xs font-semibold border border-border rounded-lg px-2.5 py-1.5 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                        required
                      />
                      <span className="text-xs font-bold text-ink min-w-[120px] text-right">
                        Rp {(Number(item.amount) || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sub Total Nilai Jasa Box */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200">
              <span className="font-bold text-ink">Sub Total Nilai Jasa:</span>
              <span className="text-sm font-black text-ink">
                Rp {subtotalServices.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* 2. SECTION: Rincian Reward / Potongan (diantara Sub Total & PPN 11%) */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <label className="block font-bold text-ink text-sm">
                  Rincian Reward / Potongan
                </label>
                <p className="text-[11px] text-muted">
                  Reward bernilai positif (penambah), Potongan bernilai negatif (pengurang) Sub Total Nilai Jasa.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddAdjustment('REWARD')}
                  className="gap-1 text-xs py-1.5 px-2 text-accent-green border-accent-green/30 hover:bg-accent-green/5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Reward</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddAdjustment('POTONGAN')}
                  className="gap-1 text-xs py-1.5 px-2 text-amber-600 border-amber-600/30 hover:bg-amber-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Potongan</span>
                </Button>
              </div>
            </div>

            {adjustments.length === 0 ? (
              <div className="p-3 rounded-xl border border-dashed border-slate-300 text-center text-muted text-xs bg-slate-50/50">
                Belum ada penambahan reward atau potongan (opsional).
              </div>
            ) : (
              <div className="space-y-2.5">
                {adjustments.map((adj, idx) => (
                  <div
                    key={adj.id}
                    className={`p-3 rounded-xl border transition-all space-y-2 ${
                      adj.type === 'REWARD'
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-amber-200 bg-amber-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <select
                          value={adj.type}
                          onChange={(e) => handleAdjustmentChange(adj.id, 'type', e.target.value)}
                          className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                            adj.type === 'REWARD'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="REWARD">Reward (+ Penambah)</option>
                          <option value="POTONGAN">Potongan (- Pengurang)</option>
                        </select>
                        <span className="text-[11px] text-muted">#{idx + 1}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAdjustment(adj.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Hapus baris penyesuaian"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={adj.description}
                        onChange={(e) => handleAdjustmentChange(adj.id, 'description', e.target.value)}
                        placeholder={
                          adj.type === 'REWARD'
                            ? 'Keterangan teks reward (contoh: Reward Kinerja K3 & Kehadiran Sempurna)'
                            : 'Keterangan teks potongan (contoh: Potongan Denda Keterlambatan / Seragam)'
                        }
                        className="w-full text-xs border border-border rounded-lg p-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                        required
                      />

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted">Nominal (Rp):</span>
                        <input
                          type="number"
                          min="0"
                          value={adj.amount}
                          onChange={(e) => handleAdjustmentChange(adj.id, 'amount', e.target.value)}
                          placeholder="Contoh: 1500000"
                          className="flex-1 text-xs font-semibold border border-border rounded-lg px-2.5 py-1.5 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                          required
                        />
                        <span
                          className={`text-xs font-bold min-w-[120px] text-right ${
                            adj.type === 'REWARD' ? 'text-accent-green' : 'text-red-600'
                          }`}
                        >
                          {adj.type === 'REWARD' ? '+' : '-'} Rp {(Number(adj.amount) || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3 & 4 & 5. SECTION: Manajemen Fee, PPH 23, PPN 11% */}
          <div className="space-y-3 pt-2 border-t border-border">
            <h4 className="font-bold text-ink text-sm flex items-center gap-1.5">
              <Calculator className="h-4 w-4 text-primary-red" />
              <span>Komponen Potongan & Pajak</span>
            </h4>

            {/* Manajemen Fee (n%) */}
            <div className="p-3 bg-surface rounded-xl border border-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Percent className="h-3.5 w-3.5 text-accent-green" />
                  <label className="font-semibold text-ink">
                    Manajemen Fee ({feeRateNum}%)
                  </label>
                  <span className="text-[10px] text-accent-green font-bold bg-accent-green/10 px-1.5 py-0.5 rounded">
                    + Penambah
                  </span>
                  <span className="text-[10px] text-muted">(Tentatif / Manual)</span>
                </div>
                <span className="font-bold text-accent-green">
                  + Rp {managementFeeAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted">Persentase ({feeRateNum}%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={managementFeeRate}
                  onChange={(e) => setManagementFeeRate(e.target.value)}
                  placeholder="0"
                  className="w-24 text-xs font-bold border border-border rounded-lg px-2.5 py-1 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                />
                <span className="text-muted font-medium">%</span>
                <span className="text-[11px] text-muted italic ml-auto">
                  Rumus: Nilai Jasa Sub Total × {feeRateNum}%
                </span>
              </div>
            </div>

            {/* PPH 23 (2%) */}
            <div className="p-3 bg-surface rounded-xl border border-border flex items-center justify-between">
              <div>
                <span className="font-semibold text-ink block">PPH 23 (2%)</span>
                <span className="text-[11px] text-muted">
                  Rumus: Nilai Manajemen Fee ({feeRateNum}%) × 2%
                </span>
              </div>
              <span className="font-bold text-ink">
                - Rp {pph23Amount.toLocaleString('id-ID')}
              </span>
            </div>

            {/* PPN 11% (Toggle ON/OFF) */}
            <div className="p-3 bg-surface rounded-xl border border-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-ink">PPN 11%</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isPpnActive}
                    onClick={() => setIsPpnActive((prev) => !prev)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isPpnActive ? 'bg-primary-red' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isPpnActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isPpnActive
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {isPpnActive ? 'STATUS: ON' : 'STATUS: OFF'}
                  </span>
                </div>
                <span className={`font-bold ${isPpnActive ? 'text-accent-green' : 'text-muted'}`}>
                  {isPpnActive ? `+ Rp ${ppnAmount.toLocaleString('id-ID')}` : 'Rp 0 (Hide)'}
                </span>
              </div>

              <div className="text-[11px] text-muted flex items-center justify-between pt-1 border-t border-slate-100">
                <span>
                  {isPpnActive
                    ? `Rumus: Manajemen Fee (${feeRateNum}%) × 11%`
                    : 'Status OFF: Tidak dikenakan PPN dan disembunyikan dari faktur cetak.'}
                </span>
                {isPpnActive && (
                  <span className="text-[10px] text-accent-green font-bold bg-accent-green/10 px-1.5 py-0.5 rounded">
                    + Penambah (11%)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 6. Summary Calculation Box: Total Tagihan Bersih */}
          <div className="p-4 bg-primary-red/5 rounded-2xl border border-primary-red/20 space-y-2">
            <span className="text-[11px] font-bold text-primary-red uppercase tracking-wider block">
              Ringkasan Rekapitulasi Tagihan
            </span>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted">
                <span>Sub Total Nilai Jasa:</span>
                <span className="font-semibold text-ink">Rp {subtotalServices.toLocaleString('id-ID')}</span>
              </div>

              {subtotalReward > 0 && (
                <div className="flex justify-between text-accent-green">
                  <span>Sub Total Reward (+):</span>
                  <span className="font-bold">+ Rp {subtotalReward.toLocaleString('id-ID')}</span>
                </div>
              )}

              {subtotalPotongan > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Sub Total Potongan (-):</span>
                  <span className="font-bold">- Rp {subtotalPotongan.toLocaleString('id-ID')}</span>
                </div>
              )}

              {managementFeeAmount > 0 && (
                <div className="flex justify-between text-accent-green">
                  <span>Manajemen Fee ({feeRateNum}%):</span>
                  <span className="font-bold">+ Rp {managementFeeAmount.toLocaleString('id-ID')}</span>
                </div>
              )}

              {pph23Amount > 0 && (
                <div className="flex justify-between text-muted">
                  <span>PPH 23 (2%):</span>
                  <span className="font-semibold text-ink">- Rp {pph23Amount.toLocaleString('id-ID')}</span>
                </div>
              )}

              {isPpnActive && (
                <div className="flex justify-between text-accent-green">
                  <span>PPN 11% (Manajemen Fee × 11%):</span>
                  <span className="font-bold">+ Rp {ppnAmount.toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-black text-ink pt-2.5 border-t border-primary-red/20">
                <div>
                  <span className="block">Total Tagihan Bersih:</span>
                  <span className="text-[10px] font-normal text-muted block">
                    (Sub Total + Reward + Manajemen Fee{isPpnActive ? ' + PPN 11%' : ''}) - Potongan - PPH 23
                  </span>
                </div>
                <span className="text-base font-black text-primary-red">
                  Rp {totalNet.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Notes */}
          <div>
            <label className="block font-semibold text-ink mb-1">
              Catatan Rekening / Instruksi Transfer
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Rekening BCA PT Bimasena Adhirajasa Radhika..."
              className="w-full text-xs sm:text-sm border border-border rounded-xl px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading} className="gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              <span>Terbitkan Faktur</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
