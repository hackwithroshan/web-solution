import React, { useState, useMemo } from 'react';
import { ServicePlan, PlanTier } from '../types';
import { CheckCircle, Package, Server, Globe, Code, Share2, Mic, User, Zap, Star as StarIcon } from 'lucide-react';

interface Props {
  plan: ServicePlan;
  onAddToCart: (plan: ServicePlan, tierName: PlanTier['name'], billingCycle: 'monthly' | 'yearly') => void;
}

const categoryIcons: { [key: string]: React.ElementType } = {
    'Web Hosting': Server, 'Domain Registration': Globe, 'Web Development': Code,
    'Social Media Marketing': Share2, 'Podcast Studio': Mic,
};

const ServicePlanCard: React.FC<Props> = ({ plan, onAddToCart }) => {
  const [selectedTierName, setSelectedTierName] = useState<PlanTier['name']>(
    plan.plans.find(p => p.isPopular)?.name || plan.plans[0]?.name || 'Starter'
  );
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const selectedTier = useMemo(() => {
    return plan.plans.find(p => p.name === selectedTierName);
  }, [plan.plans, selectedTierName]);

  const price = useMemo(() => {
    if (!selectedTier) return 0;
    return billingCycle === 'yearly' ? selectedTier.yearlyPrice : selectedTier.monthlyPrice;
  }, [selectedTier, billingCycle]);

  const Icon = categoryIcons[plan.category?.name] || Package;
  const isFeatured = selectedTier?.isPopular;

  const handleAddToCart = () => {
    if (selectedTier) {
      onAddToCart(plan, selectedTier.name, billingCycle);
    }
  };
  
  if (!plan.plans || plan.plans.length === 0) {
      return (
          <div className="relative flex flex-col bg-[#1C1C24] border border-white/10 rounded-2xl p-6 md:p-8 h-full justify-center items-center text-center">
              <Package size={32} className="text-gray-500 mb-4" />
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="text-sm text-gray-400 mt-2">Pricing information is currently unavailable.</p>
          </div>
      );
  }

  return (
    <div className={`relative flex flex-col bg-[#1C1C24] border rounded-2xl transition-all duration-300 h-full overflow-hidden ${isFeatured ? 'border-purple-500 shadow-2xl shadow-purple-900/20' : 'border-white/10'}`}>
        
        {isFeatured && (
            <div className="absolute top-4 right-[-1px] bg-white/10 backdrop-blur-sm text-white text-xs font-bold px-4 py-1 rounded-l-full z-20 flex items-center gap-1">
                <StarIcon size={12} className="text-yellow-400 fill-current"/> Most popular
            </div>
        )}
        
        <div className={`absolute inset-0 rounded-2xl overflow-hidden opacity-10 pointer-events-none transition-opacity ${isFeatured ? 'opacity-20' : ''}`}>
            <div className={`absolute -top-1/4 -right-1/4 w-1/2 h-1/2 ${isFeatured ? 'bg-purple-500' : 'bg-cyan-500'}`} style={{ filter: 'blur(100px)' }}></div>
        </div>
        
        <div className="relative z-10 flex flex-col flex-grow p-6 md:p-8">
            {/* Tier Selector */}
            <div className="flex bg-black/20 rounded-full p-1 mb-6">
                {plan.plans.map(tier => (
                    <button
                        key={tier.name}
                        onClick={() => setSelectedTierName(tier.name)}
                        className={`w-1/3 py-2 text-sm font-semibold rounded-full transition-colors ${selectedTierName === tier.name ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                    >
                        {tier.name}
                    </button>
                ))}
            </div>

            <div className="flex-shrink-0 flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isFeatured ? 'bg-purple-500/10 text-purple-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-gray-400">{plan.description}</p>
                </div>
            </div>
            
             {/* Price and Billing Cycle */}
            <div className="flex items-end justify-between my-6">
                <div>
                    <span className="text-5xl font-extrabold text-white">₹{price.toLocaleString('en-IN')}</span>
                    <span className="text-gray-400 ml-1">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>
                <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full">
                    <button onClick={() => setBillingCycle('monthly')} className={`px-3 py-1 text-xs rounded-full ${billingCycle === 'monthly' ? 'bg-white/10 text-white' : 'text-gray-400'}`}>Monthly</button>
                    <button onClick={() => setBillingCycle('yearly')} className={`px-3 py-1 text-xs rounded-full relative ${billingCycle === 'yearly' ? 'bg-white/10 text-white' : 'text-gray-400'}`}>
                        Yearly
                    </button>
                </div>
            </div>

            <button 
                onClick={handleAddToCart}
                className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 mt-4 ${isFeatured ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
            >
                Choose this plan
            </button>
            
            <div className="border-t border-white/10 mt-8 pt-6 flex-grow">
              <ul className="space-y-3 text-sm">
                  {(selectedTier?.features || []).map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-300">
                          <CheckCircle size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                      </li>
                  ))}
                   {selectedTier?.name === 'Professional' && (
                       <li className="flex items-start gap-3 text-purple-400 font-semibold">
                          <Zap size={16} className="flex-shrink-0 mt-0.5" />
                          <span>All features from Starter, plus:</span>
                      </li>
                   )}
                   {selectedTier?.name === 'Enterprise' && (
                       <li className="flex items-start gap-3 text-purple-400 font-semibold">
                          <StarIcon size={16} className="flex-shrink-0 mt-0.5" />
                          <span>All features from Professional, plus:</span>
                      </li>
                   )}
              </ul>
            </div>
        </div>
    </div>
  );
};

export default ServicePlanCard;