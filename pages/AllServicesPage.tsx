import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ServicePlan, ServiceCategory } from '../types';
import { fetchServicePlans, fetchCategories } from '../services/api';
import ServiceFilterSidebar from '../components/ServiceFilterSidebar';
import ServicePlanCard from '../components/ServicePlanCard';
import { Search, ShoppingCart } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import UserSidebar from '../components/UserSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useCart } from '../hooks/useCart';

// --- Skeleton Components for Loading State ---
const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 ${className}`} />
);

const ServicePlanCardSkeleton: React.FC = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <div className="flex-grow">
            <div className="flex justify-between items-start">
                <div>
                    <Skeleton className="h-5 w-32 rounded" />
                    <Skeleton className="h-4 w-20 mt-2 rounded" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mt-4 rounded" />
            <Skeleton className="h-4 w-5/6 mt-2 rounded" />
            <div className="my-5">
                <Skeleton className="h-8 w-28 rounded" />
            </div>
            <div className="border-t border-gray-200 my-5"></div>
            <Skeleton className="h-4 w-24 mb-4 rounded" />
            <div className="space-y-3">
                <Skeleton className="h-5 w-full rounded" />
                <Skeleton className="h-5 w-full rounded" />
                <Skeleton className="h-5 w-full rounded" />
            </div>
        </div>
        <div className="mt-6">
            <Skeleton className="h-10 w-full rounded-md" />
        </div>
    </div>
);


const AllServicesPage: React.FC = () => {
    const [plans, setPlans] = useState<ServicePlan[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Filtering state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState('');
    const [sortBy, setSortBy] = useState('price-asc');
    
    const { addToast } = useToast();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [plansData, categoriesData] = await Promise.all([
                    fetchServicePlans(),
                    fetchCategories()
                ]);
                setPlans(plansData);
                setCategories(categoriesData);
            } catch (err: any) {
                addToast(err.message || 'Failed to fetch services and categories', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        // Simulate loading for demo purposes
        setTimeout(loadData, 1000);
    }, [addToast]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategories([]);
        setPriceRange('');
    };

    const filteredAndSortedPlans = useMemo(() => {
        let filtered = [...plans];

        // Search term filter
        if (searchTerm.trim() !== '') {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(plan =>
                plan.name.toLowerCase().includes(lowercasedTerm) ||
                plan.description.toLowerCase().includes(lowercasedTerm) ||
                plan.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm))
            );
        }

        // Category filter
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(plan => selectedCategories.includes(plan.category.name));
        }

        // Price range filter
        if (priceRange) {
            const [min, max] = priceRange.split('-').map(Number);
            if (priceRange.startsWith('under')) { // "under-1000"
                filtered = filtered.filter(plan => plan.price < 1000);
            } else if (priceRange.startsWith('above')) { // "above-50000"
                filtered = filtered.filter(plan => plan.price > 50000);
            } else if (min && max) { // "1000-5000"
                filtered = filtered.filter(plan => plan.price >= min && plan.price <= max);
            }
        }

        // Sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'name-asc': return a.name.localeCompare(b.name);
                default: return 0;
            }
        });

        return filtered;
    }, [plans, searchTerm, selectedCategories, priceRange, sortBy]);

    const handleAddToCart = (plan: ServicePlan) => {
        if (!user) {
            addToast('Please log in to add items to your cart.', 'info');
            navigate('/login');
            return;
        }
        addToCart(plan);
        addToast(`${plan.name} added to cart!`, 'success');
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Explore Services</h1>
                            <p className="mt-1 text-gray-600">Browse and purchase new services to expand your digital toolkit.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            <div className="lg:col-span-1">
                               <ServiceFilterSidebar
                                    categories={categories}
                                    selectedCategories={selectedCategories}
                                    setSelectedCategories={setSelectedCategories}
                                    priceRange={priceRange}
                                    setPriceRange={setPriceRange}
                                    onClear={clearFilters}
                                />
                            </div>

                            <div className="lg:col-span-3">
                                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                                    <div className="relative flex-grow w-full">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Search for services..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex-shrink-0 w-full md:w-auto">
                                        <select 
                                            value={sortBy} 
                                            onChange={e => setSortBy(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="price-asc">Sort by Price: Low to High</option>
                                            <option value="price-desc">Sort by Price: High to Low</option>
                                            <option value="name-asc">Sort by Name</option>
                                        </select>
                                    </div>
                                </div>

                                {isLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                                        {Array.from({ length: 4 }).map((_, index) => (
                                            <ServicePlanCardSkeleton key={index} />
                                        ))}
                                    </div>
                                ) : filteredAndSortedPlans.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                                        {filteredAndSortedPlans.map(plan => (
                                            <ServicePlanCard 
                                                key={plan._id} 
                                                plan={plan}
                                                onAddToCart={handleAddToCart}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                                        <ShoppingCart size={40} className="mx-auto text-gray-400" />
                                        <h3 className="text-lg font-semibold text-gray-800">No Services Found</h3>
                                        <p className="mt-2 text-gray-500">
                                            {plans.length === 0 ? "Could not load services. Please try again later." : "Try adjusting your filters or search term."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AllServicesPage;