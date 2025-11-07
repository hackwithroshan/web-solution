import React from 'react';
import { ServicePlan } from '../types';
import Button from './ui/Button';
import { Check, Loader } from 'lucide-react';

interface PricingCardProps {
  plan: ServicePlan;
  onPurchase: (plan: ServicePlan) => void;
  isPurchasing: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, onPurchase, isPurchasing }) => {
  // Find the popular plan, or default to the first one if none is marked.
  const tierToDisplay = plan.plans.find(p => p.isPopular) || plan.plans[0];

  if (!tierToDisplay) {
    // Handle case where a plan might have no tiers defined
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col border">
            <h3 className="text-2xl font-bold text-center">{plan.name}</h3>
            <p className="text-gray-500 text-center mt-2 flex-grow">Pricing information is currently unavailable.</p>
        </div>
    );
  }

  const isFeatured = tierToDisplay.isPopular;
  const cardClasses = `bg-white p-8 rounded-xl shadow-lg flex flex-col ${isFeatured ? 'border-4 border-cyan-500 relative transform scale-105' : 'border'}`;

  return (
    <div className={cardClasses}>
      {isFeatured && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-center">{plan.name} - {tierToDisplay.name}</h3>
      <p className="text-gray-500 text-center mt-2">{plan.description}</p>
      <div className="my-8 text-center">
        <span className="text-5xl font-extrabold">₹{tierToDisplay.monthlyPrice.toLocaleString('en-IN')}</span>
        <span className="text-gray-500">/month</span>
      </div>
      <ul className="space-y-4 mb-8 flex-grow">
        {tierToDisplay.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      <Button 
        variant={isFeatured ? 'primary' : 'secondary'} 
        className="w-full"
        onClick={() => onPurchase(plan)}
        disabled={isPurchasing}
      >
        {isPurchasing ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Buy Now'}
      </Button>
    </div>
  );
};

export default PricingCard;