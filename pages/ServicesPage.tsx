import React from 'react';
import ServiceCard from '../components/ServiceCard';
import { SERVICES_DATA } from '../constants';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import Breadcrumb from '../components/ui/Breadcrumb';
import SeoMeta from '../components/SeoMeta';
import RippleGrid from '../components/RippleGrid';

const ServicesPage: React.FC = () => {
  useScrollAnimation();

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Our Services' },
  ];

  return (
    <>
      <SeoMeta
        title="ApexNucleus Services - Web & App Development"
        description="Explore ApexNucleus comprehensive web and app development services including hosting, domain registration, and custom solutions."
      />
      <div className="relative text-white bg-[#1E1E2C] overflow-x-hidden">
        <div className="fixed inset-0 z-0">
          <RippleGrid
            gridColor="#252535"
            rippleIntensity={0.02}
            gridSize={20}
            gridThickness={20}
            mouseInteraction={true}
            mouseInteractionRadius={1.2}
            opacity={0.8}
          />
        </div>
        <div className="relative z-10">
          <div className="container mx-auto px-6 pt-40 pb-20">
            <Breadcrumb crumbs={crumbs} className="mb-8" />
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white scroll-animate slide-up">Our Services</h1>
              <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto scroll-animate slide-up delay-100">
                We provide a comprehensive suite of services to build, launch, and grow your online presence. Explore our offerings to find the perfect solution for your needs.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {SERVICES_DATA.map((service, index) => (
                <div key={service.title} className={`scroll-animate scale-up delay-${(index % 3) * 100 + 200}`}>
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicesPage;