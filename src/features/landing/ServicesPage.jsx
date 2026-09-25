import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ServicesPage() {
  // Redirect /layanan to first service /layanan/security matching Image 3 layout
  return <Navigate to="/layanan/security" replace />;
}
