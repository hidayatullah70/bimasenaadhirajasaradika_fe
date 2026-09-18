import React, { useState } from 'react';
import { LandingNavbar } from '../../components/layout/LandingNavbar';
import { LandingFooter } from '../../components/layout/LandingFooter';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { AdvantagesSection } from './components/AdvantagesSection';
import { StatsSection } from './components/StatsSection';
import { ProcessSection } from './components/ProcessSection';
import { ClientsSection } from './components/ClientsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { BackToTop } from '../../components/ui/BackToTop';
import { WhatsAppCta } from '../../components/ui/WhatsAppCta';

export function LandingPage({ onNavigate }) {
  const [selectedService, setSelectedService] = useState('Pengamanan / Security');

  const handleSelectService = (serviceTitle) => {
    setSelectedService(serviceTitle);
    const contactEl = document.querySelector('#kontak');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenContact = () => {
    const contactEl = document.querySelector('#kontak');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreServices = () => {
    const servicesEl = document.querySelector('#layanan');
    if (servicesEl) {
      servicesEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-neutral text-brand-dark">
      <LandingNavbar onNavigate={onNavigate} />

      <main className="flex-1">
        <HeroSection
          onOpenContact={handleOpenContact}
          onExploreServices={handleExploreServices}
        />
        <AboutSection />
        <ServicesSection onSelectService={handleSelectService} />
        <AdvantagesSection />
        <StatsSection />
        <ProcessSection />
        <ClientsSection />
        <TestimonialsSection />
        <FaqSection />
        <ContactSection selectedService={selectedService} />
      </main>

      <LandingFooter onNavigate={onNavigate} />
      <WhatsAppCta />
      <BackToTop />
    </div>
  );
}
