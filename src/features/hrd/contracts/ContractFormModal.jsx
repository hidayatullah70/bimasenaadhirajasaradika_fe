/**
 * Contract Form Modal — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.1 & 12.1 (Employee Contracts & Documents).
 *
 * Supports:
 * - Create ("Buat Kontrak & Dokumen Baru")
 * - Edit ("Edit Kontrak & Dokumen")
 * - Employee auto-fill from master data or manual entry
 * - Interactive document checklist with live completeness calculation
 */

import React, { useState, useEffect } from 'react';
import {
  X, FileText, CheckCircle2, AlertCircle, Calendar,
  User, Building2, Briefcase, FileCheck2, Paperclip, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import contractAdapter from '@/services/adapters/contractAdapter';
import employeeAdapter from '@/services/adapters/employeeAdapter';
import { useAuth } from '@/app/providers/AuthProvider';
import toast from 'react-hot-toast';

const DEFAULT_DOCUMENTS = [
  { type: 'KTP (e-KTP Asli)', status: 'VERIFIED', uploadedAt: new Date().toISOString().slice(0, 10) },
  { type: 'Kartu Keluarga (KK)', status: 'VERIFIED', uploadedAt: new Date().toISOString().slice(0, 10) },
  { type: 'SKCK Aktif Kepolisian', status: 'VERIFIED', uploadedAt: new Date().toISOString().slice(0, 10) },
  { type: 'Ijazah Terakhir & Transkrip', status: 'VERIFIED', uploadedAt: new Date().toISOString().slice(0, 10) },
  { type: 'Sertifikat Keahlian / Gada Pratama', status: 'VERIFIED', uploadedAt: new Date().toISOString().slice(0, 10) },
  { type: 'Surat Keterangan Sehat & Bebas Narkoba', status: 'PENDING', uploadedAt: null },
  { type: 'Pakta Integritas & Pernyataan Kepatuhan', status: 'VERIFIED', uploadedAt: new Date().toISOString().slice(0, 10) },
  { type: 'Buku Tabungan / Rekening BCA', status: 'VERIFIED', uploadedAt: new Date().toISOString().slice(0, 10) },
];

export default function ContractFormModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const { currentUser } = useAuth();
  const isEdit = Boolean(initialData);

  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeNik, setEmployeeNik] = useState('');
  const [department, setDepartment] = useState('Operasional');
  const [position, setPosition] = useState('Staff');
  const [clientName, setClientName] = useState('');

  const [contractNumber, setContractNumber] = useState('');
  const [contractType, setContractType] = useState('PKWT');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [status, setStatus] = useState('ACTIVE');
  const [documents, setDocuments] = useState(DEFAULT_DOCUMENTS);
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);

  // Load master employees list for dropdown
  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await employeeAdapter.getEmployees({ pageSize: 150 });
        if (res.data) setEmployees(res.data);
      } catch {
        // Fallback silently
      }
    }
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  // Initialize form state
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setSelectedEmpId(initialData.employeeId || '');
      setEmployeeName(initialData.employeeName || '');
      setEmployeeNik(initialData.employeeNik || '');
      setDepartment(initialData.department || 'Operasional');
      setPosition(initialData.position || 'Staff');
      setClientName(initialData.clientName || '');
      setContractNumber(initialData.contractNumber || '');
      setContractType(initialData.contractType || 'PKWT');
      setStartDate(initialData.startDate || '');
      setEndDate(initialData.endDate || '');
      setIsPermanent(initialData.contractType === 'PKWTT');
      setStatus(initialData.status || 'ACTIVE');
      setDocuments(initialData.documents && initialData.documents.length > 0 ? initialData.documents : DEFAULT_DOCUMENTS);
      setNotes(initialData.notes || '');
      setFileName(initialData.fileName || '');
    } else {
      const year = new Date().getFullYear();
      const randNum = Math.floor(100 + Math.random() * 900);
      setSelectedEmpId('');
      setEmployeeName('');
      setEmployeeNik('');
      setDepartment('Operasional');
      setPosition('Staff Operasional');
      setClientName('');
      setContractNumber(`PKWT/BARAK/${year}/${randNum}`);
      setContractType('PKWT');
      const today = new Date().toISOString().slice(0, 10);
      setStartDate(today);
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setEndDate(nextYear.toISOString().slice(0, 10));
      setIsPermanent(false);
      setStatus('ACTIVE');
      setDocuments(DEFAULT_DOCUMENTS);
      setNotes('');
      setFileName('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // Handle employee dropdown change
  const handleSelectEmployee = (empId) => {
    setSelectedEmpId(empId);
    if (!empId) return;

    const emp = employees.find((e) => (e.id === empId || e.id_karyawan === empId));
    if (emp) {
      setEmployeeName(emp.nama_lengkap_sesuai_KTP || emp.name || '');
      setEmployeeNik(emp.NIK || emp.nik || '');
      setDepartment(emp.departemen || 'Operasional');
      setPosition(emp.jabatan || emp.jenis_pekerjaan || 'Staff');
      setClientName(emp.clientName || emp.klien || 'Head Office');
    }
  };

  // Handle contract type change
  const handleContractTypeChange = (newType) => {
    setContractType(newType);
    if (newType === 'PKWTT') {
      setIsPermanent(true);
      setEndDate('2030-12-31');
    } else if (newType === 'PROBATION') {
      setIsPermanent(false);
      const probEnd = new Date(startDate || new Date());
      probEnd.setMonth(probEnd.getMonth() + 3);
      setEndDate(probEnd.toISOString().slice(0, 10));
    } else {
      setIsPermanent(false);
      const yrEnd = new Date(startDate || new Date());
      yrEnd.setFullYear(yrEnd.getFullYear() + 1);
      setEndDate(yrEnd.toISOString().slice(0, 10));
    }
  };

  // Handle document status toggle
  const handleDocStatusChange = (index, newStatus) => {
    setDocuments((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        status: newStatus,
        uploadedAt: newStatus === 'VERIFIED' ? new Date().toISOString().slice(0, 10) : updated[index].uploadedAt,
      };
      return updated;
    });
  };

  // Live calculation of document completeness
  const verifiedCount = documents.filter((d) => d.status === 'VERIFIED').length;
  const completeness = documents.length > 0 ? Math.round((verifiedCount / documents.length) * 100) : 100;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeName.trim()) {
      toast.error('Mohon pilih atau masukkan nama karyawan.');
      return;
    }
    if (!contractNumber.trim()) {
      toast.error('Nomor kontrak kerja wajib diisi.');
      return;
    }
    if (!startDate) {
      toast.error('Tanggal mulai kontrak wajib diisi.');
      return;
    }
    if (!endDate && !isPermanent) {
      toast.error('Tanggal berakhir kontrak wajib diisi.');
      return;
    }

    setLoading(true);
    const actorName = `${currentUser?.name || 'Siti Rahmawati'} (${currentUser?.role || 'HRD'})`;

    const payload = {
      employeeId: selectedEmpId || initialData?.employeeId || `BRK-EMP-${Date.now().toString().slice(-4)}`,
      employeeName: employeeName.trim(),
      employeeNik: employeeNik.trim(),
      department: department.trim(),
      position: position.trim(),
      clientName: clientName.trim() || 'Internal PT. BARAK',
      contractNumber: contractNumber.trim(),
      contractType,
      startDate,
      endDate: isPermanent ? '2030-12-31' : endDate,
      status,
      documents,
      documentCompleteness: completeness,
      notes: notes.trim(),
      fileName: fileName || null,
    };

    try {
      if (isEdit) {
        await contractAdapter.updateContract(initialData.id, payload, actorName);
        toast.success(`Kontrak kerja & dokumen ${employeeName} berhasil diperbarui.`);
      } else {
        await contractAdapter.createContract(payload, actorName);
        toast.success(`Kontrak & Dokumen baru ${employeeName} berhasil diterbitkan.`);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat menyimpan data kontrak.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-scale-up border border-border">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-red/10 text-primary-red flex items-center justify-center flex-none">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">
                {isEdit ? 'Perbarui Kontrak & Dokumen Karyawan' : 'Buat Kontrak & Dokumen Baru'}
              </h2>
              <p className="text-xs text-muted">
                Divisi HRD & Personalia • PT. Bimasena Adhirajasa Radika
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 text-xs overflow-y-auto max-h-[75vh]">
          {/* Section 1: Profil Karyawan & Penempatan */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-ink font-bold text-xs border-b border-border pb-1.5">
              <User className="h-3.5 w-3.5 text-primary-red" />
              <span>1. Data Personel Karyawan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted font-medium mb-1">
                  Pilih Karyawan Terdaftar (Master Data)
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-primary-red"
                >
                  <option value="">-- Pilih dari Master Karyawan --</option>
                  {employees.map((emp) => (
                    <option key={emp.id || emp.id_karyawan} value={emp.id || emp.id_karyawan}>
                      {emp.nama_lengkap_sesuai_KTP || emp.name} ({emp.id_karyawan || emp.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">
                  Nama Lengkap Sesuai KTP <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Contoh: Budi Prasetyo"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-primary-red"
                  required
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">NIK (Nomor Induk Kependudukan)</label>
                <input
                  type="text"
                  value={employeeNik}
                  onChange={(e) => setEmployeeNik(e.target.value)}
                  placeholder="16 Digit NIK KTP..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-mono focus:outline-none focus:ring-1 focus:ring-primary-red"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Jabatan / Posisi</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Contoh: Danru Security, Staff Kurir..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-primary-red"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Departemen</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-primary-red"
                >
                  <option value="Operasional">Operasional</option>
                  <option value="HRD & Personalia">HRD & Personalia</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                  <option value="Marketing & Sales">Marketing & Sales</option>
                  <option value="Legal & Compliance">Legal & Compliance</option>
                  <option value="IT Support">IT Support</option>
                </select>
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Klien Penempatan (Site Project)</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Contoh: PT. Mayora Indah Tbk, Shopee Pakojan..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-primary-red"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Ketentuan Kontrak Kerja */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-ink font-bold text-xs border-b border-border pb-1.5">
              <FileText className="h-3.5 w-3.5 text-primary-red" />
              <span>2. Ketentuan Perjanjian Kontrak Kerja</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted font-medium mb-1">
                  Nomor Kontrak Kerja <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  placeholder="PKWT/BARAK/2026/001"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-mono font-medium focus:outline-none focus:ring-1 focus:ring-primary-red"
                  required
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Jenis Ikatan Kerja</label>
                <select
                  value={contractType}
                  onChange={(e) => handleContractTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-medium focus:outline-none focus:ring-1 focus:ring-primary-red"
                >
                  <option value="PKWT">PKWT (Perjanjian Kerja Waktu Tertentu)</option>
                  <option value="PKWTT">PKWTT (Karyawan Tetap)</option>
                  <option value="PROBATION">Probation (Masa Percobaan 3 Bulan)</option>
                  <option value="MITRA">Mitra Kerja (Freelance / Jasa)</option>
                  <option value="MAGANG">Magang / Praktik Industri</option>
                </select>
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">
                  Tanggal Mulai Kontrak <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-primary-red"
                  required
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">
                  Tanggal Berakhir Kontrak {!isPermanent && <span className="text-danger">*</span>}
                </label>
                <input
                  type="date"
                  value={endDate}
                  disabled={isPermanent}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink disabled:bg-canvas disabled:text-muted focus:outline-none focus:ring-1 focus:ring-primary-red"
                />
                {isPermanent && (
                  <p className="text-[10px] text-success mt-0.5 font-medium">
                    ✓ Status Permanen (PKWTT) tanpa batas akhir kontrak.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Checklist Dokumen Kelengkapan Berkas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <div className="flex items-center gap-1.5 text-ink font-bold text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary-red" />
                <span>3. Kelengkapan Berkas & Dokumen Legalitas Karyawan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted font-medium">Tingkat Kelengkapan:</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  completeness === 100 ? 'bg-success/10 text-success' : completeness >= 75 ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'
                }`}>
                  {completeness}%
                </span>
              </div>
            </div>

            {/* Checklist List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-canvas/50 p-3 rounded-xl border border-border">
              {documents.map((doc, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-white border border-border flex items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck2 className={`h-4 w-4 flex-none ${doc.status === 'VERIFIED' ? 'text-success' : 'text-muted'}`} />
                    <span className="text-ink font-medium text-[11px] truncate">{doc.type}</span>
                  </div>
                  <select
                    value={doc.status}
                    onChange={(e) => handleDocStatusChange(idx, e.target.value)}
                    className={`text-[10px] font-semibold px-2 py-1 rounded border ${
                      doc.status === 'VERIFIED'
                        ? 'bg-success/10 border-success/30 text-success'
                        : doc.status === 'RENEWAL_NEEDED'
                        ? 'bg-error/10 border-error/30 text-error'
                        : 'bg-muted/10 border-muted/30 text-muted'
                    }`}
                  >
                    <option value="VERIFIED">Terverifikasi</option>
                    <option value="PENDING">Belum Lengkap</option>
                    <option value="RENEWAL_NEEDED">Perlu Diperbarui</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Unggah Berkas & Catatan */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-ink font-bold text-xs border-b border-border pb-1.5">
              <Paperclip className="h-3.5 w-3.5 text-primary-red" />
              <span>4. Lampiran Berkas Kontrak & Catatan Khusus</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted font-medium mb-1">Unggah Salinan Dokumen Kontrak (PDF/Foto)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="contract-file-upload"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFileName(e.target.files[0].name);
                        toast.success(`Berkas "${e.target.files[0].name}" siap dilampirkan.`);
                      }
                    }}
                  />
                  <label
                    htmlFor="contract-file-upload"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg bg-white text-muted hover:text-primary-red hover:border-primary-red cursor-pointer transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-[11px] font-medium truncate">
                      {fileName || 'Pilih Berkas Lampiran...'}
                    </span>
                  </label>
                  {fileName && (
                    <button
                      type="button"
                      onClick={() => setFileName('')}
                      className="p-2 text-danger hover:bg-danger/10 rounded-lg"
                      title="Hapus lampiran"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Status Operasional Dokumen</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-primary-red"
                >
                  <option value="ACTIVE">Aktif & Berlaku</option>
                  <option value="EXPIRING_SOON">Akan Segera Berakhir</option>
                  <option value="DRAFT">Draft / Peninjauan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Catatan Khusus / Klausul Tambahan</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Tambahkan klausul khusus, tunjangan penempatan, atau informasi penting lainnya..."
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-primary-red"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="text-xs bg-primary-red hover:bg-primary-red/90 text-white font-semibold gap-1.5"
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isEdit ? 'Simpan Perubahan' : 'Terbitkan Kontrak & Dokumen'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
