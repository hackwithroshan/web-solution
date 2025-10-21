import React from 'react';
import { ServiceCategory } from '../types';

interface Props {
  categories: ServiceCategory[];
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  priceRange: string;
  setPriceRange: (range: string) => void;
  onClear: () => void;
}

const ServiceFilterSidebar: React.FC<Props> = ({
  categories,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  onClear
}) => {
  const handleCategoryChange = (categoryName: string) => {
    const currentIndex = selectedCategories.indexOf(categoryName);
    const newSelectedCategories = [...selectedCategories];

    if (currentIndex === -1) {
      newSelectedCategories.push(categoryName);
    } else {
      newSelectedCategories.splice(currentIndex, 1);
    }
    setSelectedCategories(newSelectedCategories);
  };
  
  const priceRanges = [
      { id: 'under-1000', label: 'Under ₹1,000' },
      { id: '1000-5000', label: '₹1,000 - ₹5,000' },
      { id: '5000-15000', label: '₹5,000 - ₹15,000' },
      { id: '15000-50000', label: '₹15,000 - ₹50,000' },
      { id: 'above-50000', label: 'Above ₹50,000' },
  ];

  const features = [
    'SSL Certificate Included',
    'Automatic Backup',
    '24/7 Support',
    'SEO Tools',
    'Analytics Dashboard',
    'Mobile Responsive'
  ];

  return (
    <aside className="bg-white p-6 rounded-xl shadow-sm lg:sticky top-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Filters</h3>

      {/* Service Categories */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Service Categories</h4>
        <ul className="space-y-2">
          {categories.map(category => (
            <li key={category._id} className="flex items-center">
              <input
                type="checkbox"
                id={`cat-${category._id}`}
                checked={selectedCategories.includes(category.name)}
                onChange={() => handleCategoryChange(category.name)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`cat-${category._id}`} className="ml-3 text-sm text-gray-600">{category.name}</label>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div className="mt-8">
        <h4 className="font-semibold text-gray-700 mb-3">Price Range</h4>
        <ul className="space-y-2">
            {priceRanges.map(range => (
                <li key={range.id} className="flex items-center">
                    <input
                        type="radio"
                        id={range.id}
                        name="price-range"
                        checked={priceRange === range.id}
                        onChange={() => setPriceRange(range.id)}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={range.id} className="ml-3 text-sm text-gray-600">{range.label}</label>
                </li>
            ))}
        </ul>
      </div>

      {/* Features */}
      <div className="mt-8">
        <h4 className="font-semibold text-gray-700 mb-3">Features</h4>
        <ul className="space-y-2">
           {features.map((feature, i) => (
            <li key={i} className="flex items-center">
              <input
                type="checkbox"
                id={`feat-${i}`}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`feat-${i}`} className="ml-3 text-sm text-gray-600">{feature}</label>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onClear}
        className="mt-8 w-full bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Clear Filters
      </button>
    </aside>
  );
};

export default ServiceFilterSidebar;
