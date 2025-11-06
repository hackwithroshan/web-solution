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

  return (
    <aside className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Filters</h3>
        <button
            onClick={onClear}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
            Clear All
        </button>
      </div>

      {/* Service Categories */}
      <div className="border-t pt-4">
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
      <div className="mt-6 border-t pt-4">
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
             <li key="clear-price" className="flex items-center">
                <input
                    type="radio"
                    id="clear-price"
                    name="price-range"
                    checked={priceRange === ''}
                    onChange={() => setPriceRange('')}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="clear-price" className="ml-3 text-sm text-gray-600">Any Price</label>
            </li>
        </ul>
      </div>
    </aside>
  );
};

export default ServiceFilterSidebar;