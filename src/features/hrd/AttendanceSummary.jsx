import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { useToast } from '../../app/context/ToastContext';
import { api } from '../../services/api/apiClient';
import { Clock, Plus, CheckCircle, XCircle, Calendar, UserCheck } from 'lucide-react';

export function AttendanceSummary() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'leave'
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Leave approval state
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 'leave-1',
      employee_id: 1,
      employee_name: 'Budi Santoso',
      site_name: 'PT Astra International - Head Office',
      type: 'cuti_tahunan',
      type_label: 'Cuti Tahunan (3 Hari)',
      start_date: '2026-09-22',
      end_date: '2026-09-24',
      reason: 'Keperluan keluarga di luar kota',
      status: 'pending_approval'
    },
    {
      id: 'leave-2',
      employee_id: 2,
      employee_name: 'Ahmad Fauzi',
      site_name: 'BCA Tower Sudirman',
      type: 'izin_sakit',
      type_label: 'Izin Sakit (Surat Dokter Terlampir)',
      start_date: '2026-09-20',
      end_date: '2026-09-21',
      reason: 'Rawat jalan dokter spesialis THT',
      status: 'pending_approval'
    }
  ]);

  const [recordForm, setRecordForm] = useState({
    employee_id: '1',
    placement_id: '1',
    attendance_date: new Date().toISOString().split('T')[0],
    status: 'present',
    check_in: '07:55',
    check_out: '16:05',
    notes: 'Bertugas on-time pos utama'
  });

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const [attRes, empRes, plcRes] = await Promise.all([
        api.getAttendance({ search, status: statusFilter }),
        api.getEmployees({ limit: 100 }).catch(() => ({ success: false })),
        api.getPlacements().catch(() => ({ success: false }))
      ]);

      if (attRes?.success && Array.isArray(attRes.data)) {
        setAttendance(attRes.data);
      } else {
        setAttendance([]);
      }
      if (empRes?.success && Array.isArray(empRes.data)) {
        setEmployees(empRes.data);
      }
      if (plcRes?.success && Array.isArray(plcRes.data)) {
        setPlacements(plcRes.data);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [search, statusFilter]);

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        employee_id: parseInt(recordForm.employee_id, 10),
        placement_id: parseInt(recordForm.placement_id, 10),
        attendance_date: recordForm.attendance_date,
        status: recordForm.status,
        check_in: `${recordForm.attendance_date} ${recordForm.check_in}:00`,
        check_out: recordForm.check_out ? `${recordForm.attendance_date} ${recordForm.check_out}:00` : null,
        notes: recordForm.notes
      };

      const res = await api.recordAttendance(payload);
      if (res?.success) {
        addToast('Presensi harian berhasil dicatat ke backend!', 'success');
        setIsRecordModalOpen(false);
        fetchAttendance();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menyimpan data presensi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveLeave = (id, approved = true) => {
    setLeaveRequests(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: approved ? 'approved' : 'rejected' } : item
      )
    );
    addToast(
      approved
        ? 'Pengajuan cuti/izin berhasil disetujui & kuota cuti diperbarui.'
        : 'Pengajuan cuti/izin telah ditolak.',
      approved ? 'success' : 'warning'
    );
  };

  const attendanceColumns = [
    {
      header: 'Nama Personel & Lokasi Site',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark">{row.employee_name || row.employeeName || `Karyawan #${row.employee_id}`}</p>
          <p className="text-xs text-slate-400">{row.site_name || row.siteName || 'Site Gedung Utama'}</p>
        </div>
      )
    },
    {
      header: 'Tanggal & Shift',
      render: (row) => (
        <div>
          <p className="font-semibold text-brand-dark font-mono text-xs">{row.attendance_date || row.date || 'Hari Ini'}</p>
          <p className="text-xs text-slate-500 capitalize">{row.shift || 'Pagi / Reguler'}</p>
        </div>
      )
    },
    {
      header: 'Jam Masuk / Pulang',
      render: (row) => (
        <div className="flex items-center gap-1 text-xs font-mono text-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.clock_in || row.checkIn || row.check_in || '07:55'} — {row.clock_out || row.checkOut || row.check_out || 'On Duty'}</span>
        </div>
      )
    },
    {
      header: 'Status Presensi',
      render: (row) => <StatusBadge status={row.status} type="attendance" />
    },
    {
      header: 'Catatan Supervisi Lapangan',
      render: (row) => (
        <span className="text-xs text-slate-600 italic">{row.notes || '-'}</span>
      )
    }
  ];

  const leaveColumns = [
    {
      header: 'Karyawan Pemohon',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark">{row.employee_name}</p>
          <p className="text-xs text-slate-400">{row.site_name}</p>
        </div>
      )
    },
    {
      header: 'Jenis & Periode Pengajuan',
      render: (row) => (
        <div>
          <p className="font-semibold text-brand-blue text-xs">{row.type_label}</p>
          <p className="text-xs text-slate-500 font-mono">{row.start_date} s/d {row.end_date}</p>
        </div>
      )
    },
    {
      header: 'Alasan / Catatan',
      render: (row) => (
        <p className="text-xs text-slate-600 max-w-xs">{row.reason}</p>
      )
    },
    {
      header: 'Status Pengajuan',
      render: (row) => (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
          row.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
          row.status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-amber-100 text-amber-800'
        }`}>
          {row.status === 'approved' ? 'Disetujui' : row.status === 'rejected' ? 'Ditolak' : 'Menunggu Approval HRD'}
        </span>
      )
    },
    {
      header: 'Aksi Otoritas HRD',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        row.status === 'pending_approval' ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="xs"
              className="!text-emerald-700 !border-emerald-300 hover:!bg-emerald-50"
              icon={CheckCircle}
              onClick={() => handleApproveLeave(row.id, true)}
            >
              Setujui
            </Button>
            <Button
              variant="outline"
              size="xs"
              className="!text-red-700 !border-red-300 hover:!bg-red-50"
              icon={XCircle}
              onClick={() => handleApproveLeave(row.id, false)}
            >
              Tolak
            </Button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Selesai Diproses</span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Rekapitulasi Absensi & Manajemen Cuti / Izin"
        subtitle="Pemantauan kehadiran harian, waktu check-in personil, dan persetujuan pengajuan cuti resmi."
        breadcrumb={['Dashboard', 'HRD', 'Attendance']}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsRecordModalOpen(true)}
          >
            Catat Presensi Harian
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'border-brand-dark text-brand-dark bg-slate-50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Log Presensi Personel Lapangan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('leave')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'leave'
              ? 'border-brand-dark text-brand-dark bg-slate-50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Persetujuan Cuti & Izin
          {leaveRequests.filter(l => l.status === 'pending_approval').length > 0 && (
            <span className="bg-brand-red text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
              {leaveRequests.filter(l => l.status === 'pending_approval').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'attendance' ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Semua Status Presensi' },
                  { value: 'present', label: 'Hadir (Present)' },
                  { value: 'late', label: 'Terlambat (Late)' },
                  { value: 'permit', label: 'Izin / Sakit (Permit)' },
                  { value: 'absent', label: 'Alpha (Absent)' }
                ]}
              />
            </div>
          </div>

          <DataTable
            columns={attendanceColumns}
            data={attendance}
            loading={loading}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari nama personel atau lokasi site..."
          />
        </>
      ) : (
        <DataTable
          columns={leaveColumns}
          data={leaveRequests}
          loading={false}
          searchPlaceholder="Cari nama pemohon atau jenis cuti..."
        />
      )}

      {/* Modal Record Attendance */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Catat Presensi Harian Personel"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Pilih Personel Karyawan"
              value={recordForm.employee_id}
              onChange={(e) => setRecordForm({ ...recordForm, employee_id: e.target.value })}
              options={
                employees.length > 0
                  ? employees.map(emp => ({ value: String(emp.id), label: emp.name }))
                  : [{ value: '1', label: 'Budi Santoso' }]
              }
              required
            />
            <Select
              label="Status Kehadiran"
              value={recordForm.status}
              onChange={(e) => setRecordForm({ ...recordForm, status: e.target.value })}
              options={[
                { value: 'present', label: 'Hadir Tepat Waktu (Present)' },
                { value: 'late', label: 'Terlambat (Late)' },
                { value: 'sick', label: 'Sakit (Sick)' },
                { value: 'leave', label: 'Cuti Resmi (Leave)' },
                { value: 'absent', label: 'Tanpa Keterangan (Alpha)' }
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Tanggal"
              type="date"
              value={recordForm.attendance_date}
              onChange={(e) => setRecordForm({ ...recordForm, attendance_date: e.target.value })}
              required
            />
            <Input
              label="Jam Masuk"
              type="time"
              value={recordForm.check_in}
              onChange={(e) => setRecordForm({ ...recordForm, check_in: e.target.value })}
            />
            <Input
              label="Jam Pulang"
              type="time"
              value={recordForm.check_out}
              onChange={(e) => setRecordForm({ ...recordForm, check_out: e.target.value })}
            />
          </div>

          <Textarea
            label="Catatan Supervisi Lapangan"
            value={recordForm.notes}
            onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
            placeholder="Kondisi personel, pos penugasan, dll..."
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsRecordModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              Simpan Presensi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
