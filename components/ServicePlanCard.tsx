import React from 'react';
import { ServicePlan } from '../types';
import { CheckCircle, ShoppingCart, Server, Globe, Code, Share2, Mic, Package } from 'lucide-react';
import Button from './ui/Button';

interface Props {
  plan: ServicePlan;
  onAddToCart: (plan: ServicePlan) => void;
}

const categoryIcons: { [key: string]: React.ElementType } = {
    'Web Hosting': Server,
    'Domain Registration': Globe,
    'Web Development': Code,
    'Social Media Marketing': Share2,
    'Podcast Studio': Mic,
};


const ServicePlanCard: React.FC<Props> = ({ plan, onAddToCart }) => {
  const isFeatured = plan.tags.includes('featured');
  const Icon = categoryIcons[plan.category.name] || Package;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative group">
        {isFeatured && (
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg z-10">
                Most Popular
            </div>
        )}
        
        {/* Top Visual Section */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                <Icon size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
            <p className="text-sm text-gray-500">{plan.category.name}</p>
        </div>

        {/* Bottom Informative Section */}
        <div className="p-6 flex flex-col flex-grow">
            <div className="text-center mb-6">
                <span className="text-4xl font-extrabold text-gray-900">₹{plan.price.toLocaleString('en-IN')}</span>
                <span className="text-gray-500 font-medium">{plan.priceUnit}</span>
                <p className="text-xs text-gray-500 mt-2 h-8">{plan.description}</p>
            </div>
            
            <ul className="space-y-3 text-sm mb-6 flex-grow">
                {plan.keyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <Button onClick={() => onAddToCart(plan)} className="w-full mt-auto" variant={isFeatured ? 'primary' : 'secondary'}>
                <ShoppingCart size={16} className="mr-2"/>
                Purchase Plan
            </Button>
        </div>
    </div>
  );
};

export default ServicePlanCard;
