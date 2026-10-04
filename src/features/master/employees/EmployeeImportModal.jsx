/**
 * Employee Import Modal — PT. BARAK IOMS
 * Import massal data karyawan via Excel (.xlsx / .xls / .csv)
 * Terhubung langsung secara otomatis dengan Klien dan Lokasi Penempatan.
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  X, Upload, Download, FileSpreadsheet, CheckCircle2,
  AlertCircle, Users, Building2, MapPin, RefreshCw, Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_CLIENTS, MOCK_LOCATIONS } from '@/services/mock/mockMasterData';
import employeeAdapter from '@/services/adapters/employeeAdapter';
import toast from 'react-hot-toast';

export default function EmployeeImportModal({
  isOpen,
  onClose,
  onSuccess,
  clients = [],
  locations = [],
  initialClientId = '',
  initialLocationId = '',
}) {
  const allClients = clients && clients.length > 0 ? clients : MOCK_CLIENTS;
  const allLocations = locations && locations.length > 0 ? locations : MOCK_LOCATIONS;

  const [selectedClientId, setSelectedClientId] = useState(initialClientId || allClients[0]?.id || '');
  const [selectedLocationId, setSelectedLocationId] = useState(initialLocationId || allLocations[0]?.id || '');

  // Filter lokasi penempatan yang sesuai dengan klien terpilih
  const filteredLocations = useMemo(() => {
    if (!selectedClientId) return allLocations;
    const matches = allLocations.filter((l) => l.clientId === selectedClientId);
    return matches.length > 0 ? matches : allLocations;
  }, [allLocations, selectedClientId]);

  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handler pergantian klien dropdown
  const handleClientChange = (newClientId) => {
    setSelectedClientId(newClientId);
    const matches = allLocations.filter((l) => l.clientId === newClientId);
    if (matches.length > 0) {
      setSelectedLocationId(matches[0].id);
    }
  };

  // Unduh template file Excel
  const handleDownloadTemplate = () => {
    const sampleClient = allClients.find((c) => c.id === selectedClientId) || allClients[0];
    const sampleLoc = allLocations.find((l) => l.id === selectedLocationId) || allLocations[0];

    const templateData = [
      {
        'No': 1,
        'Nama Lengkap (sesuai KTP)': 'Ahmad Fauzi',
        'NIK (16 Digit)': '3201012304950001',
        'Jenis Kelamin (L/P)': 'L',
        'Tempat Lahir': 'Jakarta',
        'Tanggal Lahir (YYYY-MM-DD)': '1995-04-23',
        'Nomor Telepon / WA': '081234567890',
        'Email': 'ahmad.fauzi@barak.co.id',
        'Alamat Lengkap (KTP)': 'Jl. Daan Mogot No. 12, Jakarta Barat',
        'Jabatan / Role': 'Staff',
        'Layanan Outsourcing': 'Jasa Pengamanan / Security',
        'Status Ikatan Kerja': 'TETAP',
        'Tanggal Bergabung (YYYY-MM-DD)': '2026-01-01',
        'Klien Penempatan': sampleClient?.name || 'JNT LOGISTIK',
        'Lokasi Penempatan': sampleLoc?.name || 'Drop Point Pakojan',
        'Nomor Rekening BCA': '5420192831',
        'Rekening Atas Nama': 'Ahmad Fauzi',
        'NPWP': '09.123.456.7-012.000',
        'Status Pajak PTKP': 'TK0',
        'BPJS Kesehatan': '0001234567891',
        'BPJS Ketenagakerjaan': '19012345678',
      },
      {
        'No': 2,
        'Nama Lengkap (sesuai KTP)': 'Siti Nurhaliza',
        'NIK (16 Digit)': '3201026508960002',
        'Jenis Kelamin (L/P)': 'P',
        'Tempat Lahir': 'Tangerang',
        'Tanggal Lahir (YYYY-MM-DD)': '1996-08-25',
        'Nomor Telepon / WA': '081398765432',
        'Email': 'siti.nur@barak.co.id',
        'Alamat Lengkap (KTP)': 'Jl. Sudirman No. 45, Tangerang',
        'Jabatan / Role': 'Danru (Komandan Regu)',
        'Layanan Outsourcing': 'Jasa Pengamanan / Security',
        'Status Ikatan Kerja': 'TETAP',
        'Tanggal Bergabung (YYYY-MM-DD)': '2026-02-01',
        'Klien Penempatan': sampleClient?.name || 'JNT LOGISTIK',
        'Lokasi Penempatan': sampleLoc?.name || 'Drop Point Pakojan',
        'Nomor Rekening BCA': '5420192832',
        'Rekening Atas Nama': 'Siti Nurhaliza',
        'NPWP': '09.123.456.7-012.001',
        'Status Pajak PTKP': 'TK0',
        'BPJS Kesehatan': '0001234567892',
        'BPJS Ketenagakerjaan': '19012345679',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 5 },  // No
      { wch: 28 }, // Nama
      { wch: 20 }, // NIK
      { wch: 18 }, // JK
      { wch: 15 }, // Tempat Lahir
      { wch: 18 }, // Tgl Lahir
      { wch: 18 }, // Telp
      { wch: 25 }, // Email
      { wch: 35 }, // Alamat
      { wch: 22 }, // Jabatan
      { wch: 25 }, // Layanan
      { wch: 18 }, // Status Kerja
      { wch: 20 }, // Tgl Bergabung
      { wch: 25 }, // Klien
      { wch: 25 }, // Lokasi
      { wch: 20 }, // No Rekening
      { wch: 22 }, // Atas Nama
      { wch: 22 }, // NPWP
      { wch: 16 }, // PTKP
      { wch: 20 }, // BPJS Kes
      { wch: 20 }, // BPJS TK
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Karyawan');
    XLSX.writeFile(wb, 'Template_Import_Karyawan_BARAK.xlsx');
    toast.success('Template Excel berhasil diunduh!');
  };

  // Helper untuk membaca nilai kolom dengan variasi penamaan header
  const getColValue = (row, patterns) => {
    const keys = Object.keys(row);
    for (const pat of patterns) {
      const foundKey = keys.find((k) => pat.test(k.trim()));
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
        return String(row[foundKey]).trim();
      }
    }
    return '';
  };

  // Parsing file Excel
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson = XLSX.utils.sheet_to_json(ws);

        if (!rawJson || rawJson.length === 0) {
          toast.error('File Excel kosong atau tidak terbaca.');
          return;
        }

        const normalized = [];

        rawJson.forEach((row, idx) => {
          const rawName = getColValue(row, [/nama/i]);
          if (!rawName) return; // Lewati baris tanpa nama

          const rawNik = getColValue(row, [/nik/i, /ktp/i]).replace(/\D/g, '').slice(0, 16);
          const rawJk = getColValue(row, [/jenis.*kelamin/i, /gender/i, /^jk$/i]).toUpperCase();
          const jk = rawJk.startsWith('P') || rawJk.startsWith('W') ? 'P' : 'L';
          const tempatLahir = getColValue(row, [/tempat.*lahir/i]) || 'Jakarta';
          const tglLahir = getColValue(row, [/tgl.*lahir/i, /tanggal.*lahir/i]) || '1995-05-15';
          const telp = getColValue(row, [/telp/i, /telepon/i, /hp/i, /wa/i]) || '081200000000';
          const email = getColValue(row, [/email/i]);
          const alamat = getColValue(row, [/alamat/i]) || 'Jakarta';
          const jabatan = getColValue(row, [/jabatan/i, /role/i, /posisi/i]) || 'Staff';
          const layanan = getColValue(row, [/layanan/i, /pekerjaan/i]) || 'Jasa Pengamanan / Security';
          const statusKerja = getColValue(row, [/status/i]).toUpperCase().includes('KONTRAK') ? 'KONTRAK' : 'TETAP';
          const tglMasuk = getColValue(row, [/masuk/i, /gabung/i, /bergabung/i]) || new Date().toISOString().split('T')[0];
          const noRek = getColValue(row, [/rekening/i, /rek/i]);
          const atasNama = getColValue(row, [/atas.*nama/i]) || rawName;
          const npwp = getColValue(row, [/npwp/i]);
          const ptkp = getColValue(row, [/ptkp/i, /pajak/i]) || 'TK0';
          const bpjsKes = getColValue(row, [/bpjs.*kes/i]);
          const bpjsTk = getColValue(row, [/bpjs.*tk/i, /bpjs.*ketenagakerjaan/i]);

          // Pencocokan Klien & Lokasi dari file atau fallback ke dropdown
          const fileClientName = getColValue(row, [/klien/i, /client/i]);
          const fileLocName = getColValue(row, [/lokasi/i, /site/i, /penempatan/i]);

          let rowClientId = selectedClientId;
          let rowClientName = allClients.find((c) => c.id === selectedClientId)?.name || '';
          if (fileClientName) {
            const matchedC = allClients.find((c) =>
              c.name.toLowerCase().includes(fileClientName.toLowerCase()) ||
              fileClientName.toLowerCase().includes(c.name.toLowerCase())
            );
            if (matchedC) {
              rowClientId = matchedC.id;
              rowClientName = matchedC.name;
            }
          }

          let rowLocId = selectedLocationId;
          let rowLocName = allLocations.find((l) => l.id === selectedLocationId)?.name || '';
          if (fileLocName) {
            const matchedL = allLocations.find((l) =>
              l.name.toLowerCase().includes(fileLocName.toLowerCase()) ||
              fileLocName.toLowerCase().includes(l.name.toLowerCase())
            );
            if (matchedL) {
              rowLocId = matchedL.id;
              rowLocName = matchedL.name;
            }
          }

          normalized.push({
            index: idx + 1,
            nama_lengkap_sesuai_KTP: rawName,
            NIK: rawNik || `3201${Date.now().toString().slice(-12)}`,
            jenis_kelamin: jk,
            tempat_lahir: tempatLahir,
            tanggal_lahir: tglLahir,
            nomor_telepon: telp,
            email: email || `${rawName.toLowerCase().replace(/[^a-z0-9]/g, '')}@barak.co.id`,
            alamat_sesuai_KTP: alamat,
            jabatan,
            jenis_pekerjaan: layanan,
            jenis_layanan: layanan.toLowerCase().includes('clean') ? 'cleaning' : layanan.toLowerCase().includes('driver') ? 'driver' : 'security',
            status_kerja: statusKerja,
            tanggal_masuk: tglMasuk,
            penugasan_klien: rowClientId,
            lokasi_penugasan: rowLocId,
            clientName: rowClientName,
            locationName: rowLocName,
            nama_bank: 'BCA',
            nomor_rekening_bank: noRek,
            rekening_atas_nama: atasNama,
            NPWP: npwp,
            status_pajak: ptkp,
            BPJS_kesehatan: bpjsKes,
            BPJS_ketenagakerjaan: bpjsTk,
            isValid: Boolean(rawName && (rawNik.length === 16 || rawNik.length === 0)),
          });
        });

        if (normalized.length === 0) {
          toast.error('Tidak ada data karyawan yang valid pada berkas Excel.');
          return;
        }

        setParsedRows(normalized);
        toast.success(`Berhasil membaca ${normalized.length} data karyawan dari Excel.`);
      } catch (err) {
        console.error('Error parsing Excel:', err);
        toast.error('Gagal membaca file Excel. Pastikan format file sesuai.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Submit and commit import
  const handleCommitImport = async () => {
    if (parsedRows.length === 0) {
      toast.error('Belum ada data karyawan yang dimuat.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await employeeAdapter.importEmployees(parsedRows, {
        defaultClientId: selectedClientId,
        defaultLocationId: selectedLocationId,
      });

      if (res.data?.success) {
        const clientObj = allClients.find((c) => c.id === selectedClientId);
        const locObj = allLocations.find((l) => l.id === selectedLocationId);
        toast.success(
          `Sukses! ${res.data.count} karyawan berhasil didaftarkan & ditugaskan di ${clientObj?.name || 'Klien'} (${locObj?.name || 'Lokasi'})!`
        );
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.error?.message || 'Gagal menyimpan data karyawan ke sistem.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memproses data karyawan.');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentClient = allClients.find((c) => c.id === selectedClientId);
  const currentLocation = allLocations.find((l) => l.id === selectedLocationId);

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up border border-border">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-canvas/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-red/10 text-primary-red rounded-xl border border-primary-red/20">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-ink text-base sm:text-lg">Import Data Karyawan via Excel</h3>
                <Badge variant="primary" className="text-[10px]">Auto-Sync Penempatan</Badge>
              </div>
              <p className="text-xs text-muted">
                Pendaftaran massal karyawan dan langsung tersinkronisasi ke Klien & Lokasi Penempatan operasional.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-canvas">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* Target Penempatan Panel */}
          <div className="p-4 bg-primary-red/5 border border-primary-red/20 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-ink flex items-center gap-1.5 text-xs sm:text-sm">
                <Building2 className="h-4 w-4 text-primary-red" />
                Target Penempatan Default (Bila di Excel Tidak Ditentukan):
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="gap-1.5 text-xs text-primary-red border-primary-red/40 hover:bg-red-50 bg-white"
                title="Download template file Excel resmi"
              >
                <Download className="h-3.5 w-3.5 text-primary-red" />
                <span>Download Template Excel (.xlsx)</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-ink mb-1">Klien Penempatan Terpilih</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-medium"
                >
                  {allClients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-ink mb-1">Lokasi Penempatan Terpilih</label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-medium"
                >
                  {filteredLocations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name} - {l.city}</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[11px] text-muted flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary-red flex-none" />
              <span>Seluruh personel yang diimpor akan langsung terhubung ke penugasan aktif di: <strong>{currentClient?.name}</strong> • <strong>{currentLocation?.name}</strong>.</span>
            </p>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary-red/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-canvas/30 hover:bg-red-50/20 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="p-3 bg-white rounded-full shadow-xs border border-border group-hover:scale-105 transition-transform">
                <Upload className="h-6 w-6 text-primary-red" />
              </div>
              <div>
                <p className="font-semibold text-ink text-sm">
                  {fileName ? fileName : 'Klik untuk memilih file Excel (.xlsx / .xls) atau seret ke sini'}
                </p>
                <p className="text-muted text-[11px] mt-0.5">
                  Format didukung: Microsoft Excel (.xlsx, .xls) atau CSV. Pastikan terdapat kolom Nama Karyawan dan NIK.
                </p>
              </div>
            </div>
          </div>

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-ink">Preview Data Karyawan</h4>
                  <Badge variant="success" className="text-[11px]">
                    <Users className="h-3 w-3 mr-1" />
                    {parsedRows.length} Personel Terdeteksi
                  </Badge>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setParsedRows([]);
                    setFileName('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-[11px] text-muted hover:text-error flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Reset Berkas</span>
                </button>
              </div>

              <div className="border border-border rounded-xl overflow-hidden shadow-xs max-h-64 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-canvas/80 text-muted font-semibold sticky top-0 border-b border-border z-10">
                    <tr>
                      <th className="py-2 px-3 text-center w-10">No</th>
                      <th className="py-2 px-3">Nama Lengkap</th>
                      <th className="py-2 px-3 font-mono">NIK</th>
                      <th className="py-2 px-3">Jabatan</th>
                      <th className="py-2 px-3">Klien Penempatan</th>
                      <th className="py-2 px-3">Lokasi Penempatan</th>
                      <th className="py-2 px-3">No. Telp / WA</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white font-normal">
                    {parsedRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-canvas/50 transition-colors">
                        <td className="py-2 px-3 text-center text-muted">{r.index}</td>
                        <td className="py-2 px-3 font-medium text-ink">{r.nama_lengkap_sesuai_KTP}</td>
                        <td className="py-2 px-3 font-mono text-slate">{r.NIK || '-'}</td>
                        <td className="py-2 px-3">{r.jabatan || 'Staff'}</td>
                        <td className="py-2 px-3 text-muted">{r.clientName || currentClient?.name}</td>
                        <td className="py-2 px-3 text-muted">{r.locationName || currentLocation?.name}</td>
                        <td className="py-2 px-3 font-mono">{r.nomor_telepon || '-'}</td>
                        <td className="py-2 px-3 text-center">
                          {r.isValid ? (
                            <span className="inline-flex items-center text-success gap-1 text-[11px] font-semibold">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Siap
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-warning gap-1 text-[11px] font-semibold">
                              <AlertCircle className="h-3.5 w-3.5" /> Cek Data
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-canvas/40 flex items-center justify-between gap-3">
          <div className="text-muted text-[11px]">
            {parsedRows.length > 0 ? (
              <span>Siap menyimpan <strong>{parsedRows.length}</strong> karyawan ke sistem.</span>
            ) : (
              <span>Silakan unggah file Excel untuk melihat pratinjau data.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={parsedRows.length === 0 || isProcessing}
              onClick={handleCommitImport}
              className="gap-1.5 bg-primary-red hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Proses & Simpan Data Karyawan ({parsedRows.length})</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
