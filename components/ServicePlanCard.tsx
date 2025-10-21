import React from 'react';
import { ServicePlan } from '../types';
import { CheckCircle, ShoppingCart } from 'lucide-react';
import Button from './ui/Button';

interface Props {
  plan: ServicePlan;
  onAddToCart: (plan: ServicePlan) => void;
}

const ServicePlanCard: React.FC<Props> = ({ plan, onAddToCart }) => {
  const isFeatured = plan.tags.includes('featured');

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border ${isFeatured ? 'border-blue-500' : 'border-gray-200'} hover:shadow-lg hover:border-blue-500 transition-all duration-300 flex flex-col`}>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-bold text-gray-800">{plan.name}</h3>
                <p className="text-sm text-gray-500">{plan.category.name}</p>
            </div>
            {isFeatured && (
                <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    Featured
                </div>
            )}
        </div>
      
        <p className="text-sm text-gray-600 mt-3 mb-5">{plan.description}</p>
      
        <div className="my-2">
            <span className="text-3xl font-extrabold text-gray-900">₹{plan.price.toLocaleString('en-IN')}</span>
            <span className="text-gray-500 font-medium">{plan.priceUnit}</span>
        </div>
      
        <div className="border-t border-gray-200 my-5"></div>

        <h4 className="text-sm font-semibold text-gray-800 mb-3">Key Features:</h4>
        <ul className="space-y-2 text-sm">
          {plan.keyFeatures.map((feature, index) => (
            <li key={index} className="flex items-center text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <Button onClick={() => onAddToCart(plan)} className="w-full text-sm py-2 px-4 flex items-center justify-center" variant={isFeatured ? 'primary' : 'secondary'}>
            <ShoppingCart size={16} className="mr-2"/>
            Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ServicePlanCard;