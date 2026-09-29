/**
 * Development Environment Indicator Modal — PT. BARAK IOMS
 * Source of Truth: PRD Section 8 / Requirements 2 & 3.
 */

import React, { useState } from 'react';
import { X, ShieldCheck, Database, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { resetDemoData, getDataStatusSummary } from '@/utils/demoDataReset';
import toast from 'react-hot-toast';

export default function DevIndicatorModal({ isOpen, onClose, onResetSuccess }) {
  const [isResetting, setIsResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const status = getDataStatusSummary();

  if (!isOpen) return null;

  const handleExecuteReset = () => {
    setIsResetting(true);
    try {
      const result = resetDemoData();
      toast.success(
        `Data demo berhasil di-reset. Data ${result.preservedClientsCount} klien riil tetap terjaga utuh.`
      );
      setConfirmReset(false);
      if (onResetSuccess) {
        onResetSuccess();
      } else {
        setTimeout(() => {
          window.location.reload();
        }, 600);
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Gagal mereset data demo.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-scale-up border border-border">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas/40">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Status Lingkungan Pengembangan</h2>
              <p className="text-xs text-muted">Development Mode & Data Classification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Classification Status Table */}
          <div className="rounded-xl border border-border overflow-hidden bg-white shadow-xs">
            <div className="p-3 bg-canvas border-b border-border flex items-center justify-between">
              <span className="font-semibold text-ink">Klasifikasi Sumber Data</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent-green/20 text-accent-green font-medium">
                STORAGE ENGINE AKTIF
              </span>
            </div>
            <div className="divide-y divide-border">
              {/* Client Data */}
              <div className="p-3.5 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-accent-green" />
                    <span className="font-bold text-ink">Data Klien (Client Data)</span>
                  </div>
                  <p className="text-muted text-[11px] pl-5.5">
                    {status.clientData.count} Klien Resmi PT. BARAK. Dilindungi secara permanen dari operasi reset demo.
                  </p>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-accent-green/10 text-accent-green border border-accent-green/30">
                  REAL
                </span>
              </div>

              {/* Employee Data */}
              <div className="p-3.5 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-warning" />
                    <span className="font-bold text-ink">Data Karyawan (Employee Data)</span>
                  </div>
                  <p className="text-muted text-[11px] pl-5.5">
                    {status.employeeData.count} Personel simulasi (internal & outsourcing). Perubahan tersimpan lokal.
                  </p>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-warning/10 text-warning border border-warning/30">
                  DEMO
                </span>
              </div>

              {/* Operational Data */}
              <div className="p-3.5 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-warning" />
                    <span className="font-bold text-ink">Data Operasional (Operational Data)</span>
                  </div>
                  <p className="text-muted text-[11px] pl-5.5">
                    {status.operationalData.count} Data penugasan, absensi, payroll, faktur, tiket. Perubahan tersimpan lokal.
                  </p>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-warning/10 text-warning border border-warning/30">
                  DEMO
                </span>
              </div>
            </div>
          </div>

          {/* Reset Action Section */}
          <div className="p-4 rounded-xl bg-canvas border border-border space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-warning flex-none mt-0.5" />
              <div>
                <p className="font-semibold text-ink">Pemeliharaan Data Demo</p>
                <p className="text-muted text-[11px] mt-0.5">
                  Anda dapat mereset data karyawan dan operasional ke seed awal jika diperlukan untuk pengujian.
                  <strong> Data 18 klien resmi TIDAK akan terpengaruh.</strong>
                </p>
              </div>
            </div>

            {confirmReset ? (
              <div className="p-3 rounded-lg bg-primary-red/5 border border-primary-red/20 space-y-2">
                <p className="text-primary-red font-medium text-xs">
                  Konfirmasi: Reset semua data karyawan dan operasional simulasi sekarang?
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    loading={isResetting}
                    onClick={handleExecuteReset}
                    className="text-xs"
                  >
                    Ya, Reset Data Demo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmReset(false)}
                    className="text-xs"
                  >
                    Batal
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmReset(true)}
                className="gap-1.5 text-xs border-slate/30"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate" />
                <span>Reset Data Demo Saja</span>
              </Button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-canvas/30 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
