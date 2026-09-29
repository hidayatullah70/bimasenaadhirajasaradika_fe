/**
 * Document & File Storage Abstraction Adapter — PT. BARAK IOMS
 * 
 * Provides an agnostic interface for file and document management.
 * Designed to interface seamlessly with:
 * - S3-compatible Object Storage (AWS S3, MinIO, Cloudflare R2, Wasabi)
 * - Google Cloud Storage / Azure Blob Storage
 * - Backend multipart/form-data upload endpoints (/api/v1/storage/upload)
 * 
 * UI components invoke this adapter exclusively, preventing any hardcoded
 * dependency on localStorage, mock blobs, or specific cloud vendors.
 */

import apiClient, { isMockMode } from '@/services/apiClient';
import { emitAudit } from '@/utils/auditLogger';

/** Supported Document Categories */
export const DOCUMENT_CATEGORIES = Object.freeze({
  EMPLOYEE_KTP: 'employee/ktp',
  EMPLOYEE_FOTO: 'employee/foto',
  EMPLOYEE_CERTIFICATE: 'employee/certificates',
  EMPLOYEE_RESUME: 'employee/resumes',
  CLIENT_CONTRACT: 'client/contracts',
  LEGAL_DOCUMENT: 'legal/documents',
  FINANCE_INVOICE: 'finance/invoices',
  FINANCE_RECEIPT: 'finance/receipts',
  OPERATIONS_INCIDENT: 'operations/incidents',
  OPERATIONS_PATROL: 'operations/patrols',
  WEBSITE_MEDIA: 'website/media',
});

export const fileAdapter = {
  /**
   * Upload a single file with category classification.
   * @param {File|Blob} file - The file object from input or camera
   * @param {object} options
   * @param {string} options.category - One of DOCUMENT_CATEGORIES
   * @param {string} [options.entityId] - Associated record ID (e.g. EMP-001, CTR-2026-001)
   * @param {string} [options.description] - Document description/title
   * @returns {Promise<{ data: { fileId: string, url: string, filename: string, size: number, mimeType: string, uploadedAt: string }, error: null }>}
   */
  async uploadFile(file, { category = DOCUMENT_CATEGORIES.EMPLOYEE_KTP, entityId = '', description = '' } = {}) {
    if (isMockMode()) {
      // In development / mock mode: generate persistent blob URI or simulated cloud URL
      return new Promise((resolve) => {
        const fileId = `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const reader = new FileReader();

        reader.onloadend = () => {
          const simulatedUrl = reader.result || `https://storage.barak.co.id/vault/${category}/${fileId}.pdf`;
          const result = {
            fileId,
            url: simulatedUrl,
            filename: file.name || `${fileId}.dat`,
            size: file.size || 0,
            mimeType: file.type || 'application/octet-stream',
            category,
            entityId,
            description,
            uploadedAt: new Date().toISOString(),
          };

          emitAudit({
            action: 'DOCUMENT_UPLOAD',
            module: category.split('/')[0].toUpperCase(),
            entity: 'Document',
            entityId: fileId,
            details: { category, filename: result.filename, size: result.size, entityId },
          });

          resolve({ data: result, error: null });
        };

        // If file is an actual File/Blob object with read capability
        if (file instanceof Blob) {
          reader.readAsDataURL(file);
        } else {
          // If a base64 or string is passed directly
          const simulatedUrl = typeof file === 'string' ? file : `https://storage.barak.co.id/vault/${category}/${fileId}.pdf`;
          resolve({
            data: {
              fileId,
              url: simulatedUrl,
              filename: `${fileId}.pdf`,
              size: 1024,
              mimeType: 'application/pdf',
              category,
              entityId,
              description,
              uploadedAt: new Date().toISOString(),
            },
            error: null,
          });
        }
      });
    }

    // In REST/Production mode: Send multipart form data to API backend
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (entityId) formData.append('entityId', entityId);
    if (description) formData.append('description', description);

    const { data } = await apiClient.post('/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Request a presigned upload URL (for direct S3 / R2 client upload architectures)
   */
  async getPresignedUploadUrl(filename, mimeType, category) {
    if (isMockMode()) {
      const fileId = `S3-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      return {
        data: {
          fileId,
          uploadUrl: `https://s3.ap-southeast-1.amazonaws.com/barak-vault-bucket/${category}/${filename}?mock_token=presigned`,
          publicUrl: `https://storage.barak.co.id/vault/${category}/${fileId}-${filename}`,
          expiresInSeconds: 900,
        },
        error: null,
      };
    }

    const { data } = await apiClient.post('/storage/presigned-url', {
      filename,
      mimeType,
      category,
    });
    return data;
  },

  /**
   * Delete an uploaded document.
   */
  async deleteFile(fileId) {
    if (isMockMode()) {
      await emitAudit({
        action: 'DOCUMENT_DELETE',
        module: 'Storage',
        entity: 'Document',
        entityId: fileId,
        details: { fileId },
      });
      return { data: { success: true, message: 'Dokumen berhasil dihapus.' }, error: null };
    }

    const { data } = await apiClient.delete(`/storage/files/${fileId}`);
    return data;
  },
};

export default fileAdapter;
