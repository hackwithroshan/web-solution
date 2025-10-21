import React from 'react';
import { PRICING_DATA } from '../constants';
import { PricingPlan } from '../types';
import Button from '../components/ui/Button';
import { Check } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const PricingCard: React.FC<{ plan: PricingPlan }> = ({ plan }) => {
  const cardClasses = `bg-white p-8 rounded-xl shadow-lg flex flex-col ${plan.isFeatured ? 'border-4 border-cyan-500 relative transform scale-105' : 'border'}`;

  return (
    <div className={cardClasses}>
      {plan.isFeatured && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-center">{plan.name}</h3>
      <p className="text-gray-500 text-center mt-2">{plan.description}</p>
      <div className="my-8 text-center">
        <span className="text-5xl font-extrabold">{plan.price}</span>
        <span className="text-gray-500">/month</span>
      </div>
      <ul className="space-y-4 mb-8 flex-grow">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      <Button 
        variant={plan.isFeatured ? 'primary' : 'secondary'} 
        className="w-full"
      >
        Choose Plan
      </Button>
    </div>
  );
};


const PricingPage: React.FC = () => {
    useScrollAnimation();
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 scroll-animate slide-up">Our Pricing Plans</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto scroll-animate slide-up delay-100">
            Choose the perfect plan that fits your needs. All plans come with our 100% satisfaction guarantee.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 items-center">
          {PRICING_DATA.map((plan, index) => (
            <div key={plan.name} className={`scroll-animate scale-up delay-${(index % 3) * 100 + 200}`}>
              <PricingCard plan={plan} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
