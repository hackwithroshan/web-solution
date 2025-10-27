import React from 'react';

interface ProcessCardProps {
  number: string;
  title: string;
  description: string;
}

const ProcessCard: React.FC<ProcessCardProps> = ({ number, title, description }) => {
  return (
    <div className="animated-border-card rounded-2xl h-full">
      <div className="relative z-10 p-6 h-full flex flex-col bg-[#2A2A3A]/80 backdrop-blur-sm rounded-2xl">
        <div className="flex-shrink-0 mb-4">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-white font-bold text-xl shadow-lg">
            {number}
          </span>
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default ProcessCard;
