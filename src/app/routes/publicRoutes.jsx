/**
 * Public Routes — PT. BARAK IOMS
 * ABSOLUTELY FROZEN / READ-ONLY
 * Preserves exact visual design, SEO paths, and components from approved baseline.
 */

import React, { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import PageLoader from '@/components/ui/PageLoader';

const LandingPage = lazy(() => import('@/features/landing/LandingPage'));
const AboutPage = lazy(() => import('@/features/landing/AboutPage'));
const ServicesPage = lazy(() => import('@/features/landing/ServicesPage'));
const ServiceDetailPage = lazy(() => import('@/features/landing/ServiceDetailPage'));
const ClientsPage = lazy(() => import('@/features/landing/ClientsPage'));
const CareerPage = lazy(() => import('@/features/landing/CareerPage'));
const NewsPage = lazy(() => import('@/features/landing/NewsPage'));
const BlogPage = lazy(() => import('@/features/landing/BlogPage'));
const FaqPage = lazy(() => import('@/features/landing/FaqPage'));
const ContactPage = lazy(() => import('@/features/landing/ContactPage'));
const NotFoundPage = lazy(() => import('@/features/landing/NotFoundPage'));

export const publicRoutes = [
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: '/perusahaan',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AboutPage />
      </Suspense>
    ),
  },
  {
    path: '/perusahaan/:tab',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AboutPage />
      </Suspense>
    ),
  },
  {
    path: '/tentang',
    element: <Navigate to="/perusahaan/profil" replace />,
  },
  {
    path: '/portfolio',
    element: <Navigate to="/client?tab=portfolio" replace />,
  },
  {
    path: '/layanan',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ServicesPage />
      </Suspense>
    ),
  },
  {
    path: '/layanan/:slug',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ServiceDetailPage />
      </Suspense>
    ),
  },
  {
    path: '/client',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ClientsPage />
      </Suspense>
    ),
  },
  {
    path: '/career',
    element: (
      <Suspense fallback={<PageLoader />}>
        <CareerPage />
      </Suspense>
    ),
  },
  {
    path: '/news',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NewsPage />
      </Suspense>
    ),
  },
  {
    path: '/blog',
    element: (
      <Suspense fallback={<PageLoader />}>
        <BlogPage />
      </Suspense>
    ),
  },
  {
    path: '/faq',
    element: (
      <Suspense fallback={<PageLoader />}>
        <FaqPage />
      </Suspense>
    ),
  },
  {
    path: '/contact',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ContactPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
];

export default publicRoutes;
