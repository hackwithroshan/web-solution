import React from 'react';
import ServiceCard from '../components/ServiceCard';
import { SERVICES_DATA } from '../constants';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const ServicesPage: React.FC = () => {
  useScrollAnimation();

  return (
    <div className="bg-white">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 scroll-animate slide-up">Our Services</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto scroll-animate slide-up delay-100">
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
  );
};

export default ServicesPage;