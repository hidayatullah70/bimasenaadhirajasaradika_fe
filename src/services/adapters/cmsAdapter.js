/**
 * Website CMS Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 17 (CMS), Section 18 (Cross-department workflow: Public Inquiries to Marketing Leads),
 * Section 22 (Audit Log).
 */

import apiClient from '@/services/apiClient';
import {
  MOCK_ARTICLES,
  MOCK_CAREER_POSTINGS,
  MOCK_FAQS,
  MOCK_PAGE_SEO,
  MOCK_INCOMING_INQUIRIES,
} from '@/services/mock/mockCMSData';
import { marketingAdapter } from '@/services/adapters/marketingAdapter';
import { emitAudit } from '@/utils/auditLogger';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
let articlesStore = [...MOCK_ARTICLES];
let careersStore = [...MOCK_CAREER_POSTINGS];
let faqsStore = [...MOCK_FAQS];
let pageSeoStore = [...MOCK_PAGE_SEO];
let inquiriesStore = [...MOCK_INCOMING_INQUIRIES];

export const cmsAdapter = {
  // ── 1. ARTICLES (NEWS & BLOG) ──────────────────────────────────────────
  async getArticles({ search = '', category = '', status = '', page = 1, pageSize = 12 } = {}) {
    if (isMock) {
      let filtered = [...articlesStore];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.excerpt.toLowerCase().includes(q) ||
            a.author.toLowerCase().includes(q)
        );
      }

      if (category) filtered = filtered.filter((a) => a.category === category);
      if (status) filtered = filtered.filter((a) => a.status === status);

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        error: null,
      };
    }

    const { data } = await apiClient.get('/cms/articles', {
      params: { search, category, status, page, pageSize },
    });
    return data;
  },

  async getArticleBySlug(slug) {
    if (isMock) {
      const art = articlesStore.find((a) => a.slug === slug);
      return { data: art || null, error: art ? null : 'Artikel tidak ditemukan' };
    }
    const { data } = await apiClient.get(`/cms/articles/${slug}`);
    return data;
  },

  async createArticle(articleData) {
    if (isMock) {
      const newId = `ART-2026-${String(articlesStore.length + 1).padStart(3, '0')}`;
      const slug = articleData.slug || articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const newArticle = {
        id: newId,
        title: articleData.title,
        slug,
        category: articleData.category || 'KEAMANAN',
        categoryLabel: articleData.categoryLabel || articleData.category,
        excerpt: articleData.excerpt,
        content: articleData.content,
        author: articleData.author || 'Admin Editorial BARAK',
        authorRole: articleData.authorRole || 'Tim Komunikasi Publik',
        status: articleData.status || 'DRAFT',
        featured: Boolean(articleData.featured),
        publishedAt: articleData.status === 'PUBLISHED' ? new Date().toISOString() : null,
        viewsCount: 0,
        metaTitle: articleData.metaTitle || articleData.title,
        metaDescription: articleData.metaDescription || articleData.excerpt,
        ogImage: articleData.ogImage || '/images/default-article.jpg',
        createdAt: new Date().toISOString(),
      };

      articlesStore = [newArticle, ...articlesStore];

      emitAudit({
        action: 'CMS_ARTICLE_CREATE',
        module: 'CMS',
        targetId: newId,
        details: { title: newArticle.title, slug: newArticle.slug, status: newArticle.status },
      });

      return { data: newArticle, error: null };
    }

    const { data } = await apiClient.post('/cms/articles', articleData);
    return data;
  },

  async updateArticle(id, articleData) {
    if (isMock) {
      const index = articlesStore.findIndex((a) => a.id === id);
      if (index === -1) return { data: null, error: 'Artikel tidak ditemukan' };

      const old = articlesStore[index];
      const updated = {
        ...old,
        ...articleData,
        publishedAt:
          articleData.status === 'PUBLISHED' && !old.publishedAt
            ? new Date().toISOString()
            : old.publishedAt,
        updatedAt: new Date().toISOString(),
      };

      articlesStore[index] = updated;

      emitAudit({
        action: 'CMS_ARTICLE_UPDATE',
        module: 'CMS',
        targetId: id,
        details: { title: updated.title, status: updated.status },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.put(`/cms/articles/${id}`, articleData);
    return data;
  },

  async deleteArticle(id) {
    if (isMock) {
      const art = articlesStore.find((a) => a.id === id);
      if (!art) return { data: null, error: 'Artikel tidak ditemukan' };

      articlesStore = articlesStore.filter((a) => a.id !== id);

      emitAudit({
        action: 'CMS_ARTICLE_DELETE',
        module: 'CMS',
        targetId: id,
        details: { title: art.title, slug: art.slug },
      });

      return { data: { success: true }, error: null };
    }

    const { data } = await apiClient.delete(`/cms/articles/${id}`);
    return data;
  },

  // ── 2. CAREER JOB POSTINGS ─────────────────────────────────────────────
  async getCareers({ search = '', department = '', status = '', page = 1, pageSize = 12 } = {}) {
    if (isMock) {
      let filtered = [...careersStore];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.location.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q)
        );
      }

      if (department) filtered = filtered.filter((c) => c.department === department);
      if (status) filtered = filtered.filter((c) => c.status === status);

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        error: null,
      };
    }

    const { data } = await apiClient.get('/cms/careers', {
      params: { search, department, status, page, pageSize },
    });
    return data;
  },

  async createCareer(careerData) {
    if (isMock) {
      const newId = `JOB-2026-${String(careersStore.length + 1).padStart(3, '0')}`;
      const slug = careerData.slug || careerData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const newJob = {
        id: newId,
        title: careerData.title,
        slug,
        department: careerData.department || 'OPERATIONS',
        departmentLabel: careerData.departmentLabel || careerData.department,
        employmentType: careerData.employmentType || 'KONTRAK (PKWT)',
        location: careerData.location || 'Jabodetabek',
        manpowerQuota: Number(careerData.manpowerQuota) || 5,
        salaryRange: careerData.salaryRange || 'Standar UMR / UMK Wilayah',
        deadline: careerData.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: careerData.status || 'PUBLISHED',
        description: careerData.description,
        requirements: Array.isArray(careerData.requirements) ? careerData.requirements : [careerData.requirements],
        createdAt: new Date().toISOString(),
      };

      careersStore = [newJob, ...careersStore];

      emitAudit({
        action: 'CMS_CAREER_CREATE',
        module: 'CMS',
        targetId: newId,
        details: { title: newJob.title, quota: newJob.manpowerQuota, location: newJob.location },
      });

      return { data: newJob, error: null };
    }

    const { data } = await apiClient.post('/cms/careers', careerData);
    return data;
  },

  async updateCareerStatus(id, newStatus) {
    if (isMock) {
      const index = careersStore.findIndex((c) => c.id === id);
      if (index === -1) return { data: null, error: 'Lowongan tidak ditemukan' };

      careersStore[index] = {
        ...careersStore[index],
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      emitAudit({
        action: 'CMS_CAREER_STATUS_UPDATE',
        module: 'CMS',
        targetId: id,
        details: { title: careersStore[index].title, status: newStatus },
      });

      return { data: careersStore[index], error: null };
    }

    const { data } = await apiClient.patch(`/cms/careers/${id}/status`, { status: newStatus });
    return data;
  },

  // ── 3. FAQS ────────────────────────────────────────────────────────────
  async getFaqs({ search = '', category = '' } = {}) {
    if (isMock) {
      let filtered = [...faqsStore];
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
        );
      }
      if (category) filtered = filtered.filter((f) => f.category === category);
      return { data: filtered, error: null };
    }
    const { data } = await apiClient.get('/cms/faqs', { params: { search, category } });
    return data;
  },

  async createFaq(faqData) {
    if (isMock) {
      const newFaq = {
        id: `FAQ-${String(faqsStore.length + 1).padStart(3, '0')}`,
        category: faqData.category || 'LAYANAN',
        categoryLabel: faqData.categoryLabel || faqData.category,
        question: faqData.question,
        answer: faqData.answer,
        order: faqsStore.length + 1,
        status: 'PUBLISHED',
      };
      faqsStore = [...faqsStore, newFaq];
      return { data: newFaq, error: null };
    }
    const { data } = await apiClient.post('/cms/faqs', faqData);
    return data;
  },

  // ── 4. INCOMING INQUIRIES & LEAD CAPTURE (PRD Section 17 & 18) ────────
  async getInquiries({ search = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...inquiriesStore];
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.company.toLowerCase().includes(q) ||
            i.phone.toLowerCase().includes(q) ||
            i.email.toLowerCase().includes(q) ||
            i.message.toLowerCase().includes(q)
        );
      }
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        error: null,
      };
    }
    const { data } = await apiClient.get('/cms/inquiries', { params: { search, page, pageSize } });
    return data;
  },

  async submitPublicInquiry(formData) {
    if (isMock) {
      const newInqId = `INQ-2026-${String(inquiriesStore.length + 1).padStart(3, '0')}`;
      const nowIso = new Date().toISOString();

      // 1. Save into CMS inquiries store
      const newInquiry = {
        id: newInqId,
        name: formData.name,
        company: formData.company || 'Pribadi / Retail',
        phone: formData.phone,
        email: formData.email || '-',
        service: formData.service || 'security',
        serviceLabel: formData.serviceLabel || formData.service || 'Jasa Pengamanan',
        message: formData.message || '',
        status: 'CONVERTED_TO_LEAD',
        submittedAt: nowIso,
      };

      inquiriesStore = [newInquiry, ...inquiriesStore];

      // 2. Wire directly to Marketing Leads store (PRD Section 18)
      const leadRes = await marketingAdapter.createLead({
        companyName: newInquiry.company,
        picName: newInquiry.name,
        phone: newInquiry.phone,
        email: newInquiry.email,
        source: 'WEBSITE',
        sourceLabel: 'Inquiry Website BARAK (Form Konsultasi)',
        serviceInterest: newInquiry.serviceLabel,
        estimatedManpower: 6,
        locationCity: 'Jabodetabek',
        notes: `Permintaan Konsultasi Masuk dari Website: "${newInquiry.message}"`,
        assignedSales: 'Reza Pratama (Sales Rep)',
      });

      newInquiry.leadId = leadRes.data?.id;

      emitAudit({
        action: 'WEBSITE_INQUIRY_SUBMIT',
        module: 'CMS',
        targetId: newInqId,
        details: {
          clientName: newInquiry.name,
          company: newInquiry.company,
          leadId: newInquiry.leadId,
        },
      });

      return { data: { inquiry: newInquiry, lead: leadRes.data }, error: null };
    }

    const { data } = await apiClient.post('/cms/inquiries', formData);
    return data;
  },

  // ── 5. PAGE SEO CONFIGURATION (PRD Section 17) ────────────────────────
  async getAllPagesSeo() {
    if (isMock) {
      return { data: pageSeoStore, error: null };
    }
    const { data } = await apiClient.get('/cms/seo');
    return data;
  },

  async updatePageSeo(pageKey, seoData) {
    if (isMock) {
      const index = pageSeoStore.findIndex((p) => p.pageKey === pageKey);
      if (index === -1) return { data: null, error: 'Halaman tidak ditemukan' };

      pageSeoStore[index] = {
        ...pageSeoStore[index],
        ...seoData,
        updatedAt: new Date().toISOString(),
      };

      emitAudit({
        action: 'CMS_SEO_UPDATE',
        module: 'CMS',
        targetId: pageKey,
        details: { pageName: pageSeoStore[index].pageName, title: seoData.metaTitle },
      });

      return { data: pageSeoStore[index], error: null };
    }

    const { data } = await apiClient.put(`/cms/seo/${pageKey}`, seoData);
    return data;
  },

  // ── 6. CMS STATS & OVERVIEW ───────────────────────────────────────────
  async getCMSStats() {
    if (isMock) {
      const totalArticles = articlesStore.length;
      const publishedArticles = articlesStore.filter((a) => a.status === 'PUBLISHED').length;
      const draftArticles = articlesStore.filter((a) => a.status === 'DRAFT').length;

      const totalCareers = careersStore.length;
      const activeCareers = careersStore.filter((c) => c.status === 'PUBLISHED').length;

      const totalFaqs = faqsStore.length;
      const totalInquiries = inquiriesStore.length;

      const totalViews = articlesStore.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);

      return {
        data: {
          totalArticles,
          publishedArticles,
          draftArticles,
          totalCareers,
          activeCareers,
          totalFaqs,
          totalInquiries,
          totalViews,
          totalPages: pageSeoStore.length,
        },
        error: null,
      };
    }

    const { data } = await apiClient.get('/cms/stats');
    return data;
  },
};
