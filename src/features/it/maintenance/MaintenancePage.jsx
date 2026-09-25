/**
 * IT Preventive Maintenance Schedule Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 16 (IT Support: Maintenance Schedule & Inspection)
 */

import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, MapPin, User, CheckCircle2, Clock, CheckSquare } from 'lucide-react';
import { StateLoading } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';
import { itAdapter } from '@/services/adapters/itAdapter';

export default function MaintenancePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await itAdapter.getMaintenanceSchedules();
      if (res.data) setSchedules(res.data);
    } catch {
      toast.error('Gagal memuat jadwal pemeliharaan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkComplete = (id) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'COMPLETED' } : s))
    );
    toast.success('Jadwal pemeliharaan preventif ditandai selesai!');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <Wrench className="w-5 h-5 text-info shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-ink">
              Pemeliharaan Preventif Perangkat Keras Posko & Infrastruktur IT
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Jadwal inspeksi berkala untuk memastikan perangkat barrier gate, kamera CCTV outdoor, mesin absensi biometrik, UPS server, dan jaringan posko di lokasi mitra klien tetap beroperasi dengan tingkat ketersediaan (availability) optimal tanpa kendala mendadak.
            </p>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      {loading ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateLoading message="Memuat jadwal inspeksi preventif berkala..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-border p-5 shadow-xs hover:border-info/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-border">
                  <div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {item.id} · {item.frequency}
                    </span>
                    <h4 className="text-sm font-bold text-ink mt-1.5 leading-snug">
                      {item.taskTitle}
                    </h4>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      item.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'PENDING_APPROVAL'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    <span>{item.status}</span>
                  </span>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-3 text-xs border-b border-border text-muted">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary-red shrink-0" />
                    <span className="text-ink font-medium">{item.locationName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-info shrink-0" />
                    <span>Target: <span className="text-ink font-semibold">{item.targetDate}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:col-span-2">
                    <User className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span>Teknisi Pelaksana: <span className="text-ink font-medium">{item.assignedTechnician}</span></span>
                  </div>
                </div>

                {/* Checklist */}
                <div className="pt-3">
                  <h5 className="text-xs font-semibold text-ink mb-2 flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-muted" />
                    <span>Daftar Cek Fisik & Pengujian:</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {item.checklist.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-info font-bold mt-0.5">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 mt-4 border-t border-border flex justify-end">
                {item.status !== 'COMPLETED' ? (
                  <button
                    type="button"
                    onClick={() => handleMarkComplete(item.id)}
                    className="text-xs font-semibold text-accent-green hover:text-emerald-700 inline-flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tandai Selesai Dilaksanakan</span>
                  </button>
                ) : (
                  <span className="text-xs text-accent-green font-semibold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pemeliharaan Selesai Diinspeksi</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
