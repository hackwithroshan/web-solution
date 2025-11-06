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
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

// --- Skeleton Components for Loading State ---
const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 ${className}`} />
);

const ServicePlanCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {/* Top Section */}
        <div className="flex flex-col items-center p-6 bg-slate-50 border-b border-slate-100 text-center">
            <Skeleton className="w-16 h-16 rounded-full mb-4" />
            <Skeleton className="h-6 w-3/4 rounded mb-2" />
            <Skeleton className="h-4 w-1/2 rounded" />
        </div>
        
        {/* Bottom Section */}
        <div className="p-6 flex flex-col flex-grow">
            <div className="flex flex-col items-center mb-6">
                <Skeleton className="h-10 w-1/3 rounded mb-2" />
                <Skeleton className="h-3 w-2/3 rounded" />
            </div>

            <div className="space-y-3 mb-6 flex-grow">
                <Skeleton className="h-5 w-full rounded" />
                <Skeleton className="h-5 w-5/6 rounded" />
                <Skeleton className="h-5 w-full rounded" />
            </div>
            
            <Skeleton className="h-10 w-full rounded-full mt-auto" />
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
    const { addToCart, clearCart } = useCart();
    const navigate = useNavigate();

    // State for domain modal
    const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
    const [domainName, setDomainName] = useState('');
    const [domainError, setDomainError] = useState('');


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
            addToast('Please log in to purchase a service.', 'info');
            navigate('/login');
            return;
        }
        if (plan.category.name.toLowerCase().includes('domain registration')) {
            setSelectedPlan(plan);
            setIsDomainModalOpen(true);
        } else {
            clearCart();
            addToCart(plan);
            navigate('/user/checkout');
        }
    };

    const handleDomainSubmit = () => {
        const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!domainName.trim() || !domainRegex.test(domainName)) {
            setDomainError('Please enter a valid domain name (e.g., example.com).');
            return;
        }

        if (selectedPlan) {
            clearCart();
            addToCart(selectedPlan, domainName);
            navigate('/user/checkout');
        }
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

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                            <div className="lg:col-span-1 lg:sticky top-8">
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Array.from({ length: 4 }).map((_, index) => (
                                            <ServicePlanCardSkeleton key={index} />
                                        ))}
                                    </div>
                                ) : filteredAndSortedPlans.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
             {isDomainModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 text-gray-800">
                        <h3 className="text-lg font-bold">Enter Your Domain</h3>
                        <p className="text-sm text-gray-600 mt-1">Please provide the domain name you wish to register for the plan: <strong>{selectedPlan?.name}</strong>.</p>
                        <div className="mt-4">
                            <Input
                                label="Domain Name"
                                value={domainName}
                                onChange={(e) => {
                                    setDomainName(e.target.value);
                                    setDomainError('');
                                }}
                                placeholder="example.com"
                                variant="light"
                                required
                            />
                            {domainError && <p className="text-red-500 text-xs mt-1">{domainError}</p>}
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="secondary" onClick={() => {
                                setIsDomainModalOpen(false);
                                setDomainName('');
                                setDomainError('');
                            }}>Cancel</Button>
                            <Button onClick={handleDomainSubmit}>Confirm & Add</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllServicesPage;