
import React from 'react';
import { Service } from '../types';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div className="bg-[#2A2A3A] p-8 rounded-xl border border-white/10 transition-all duration-300 transform hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(78,222,227,0.1)]">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-cyan-900/50 mb-6">
        {service.icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
      <p className="text-gray-300">{service.description}</p>
    </div>
  );
};

export default React.memo(ServiceCard);