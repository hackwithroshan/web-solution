import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AdminService } from '../types';
import { fetchAllServices } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Loader, Search } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const ServiceStatusBadge: React.FC<{ status: 'active' | 'cancelled' | 'pending' }> = ({ status }) => {
    const statusStyles = {
        active: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800',
    };
    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const ServicesTable: React.FC<{ services: AdminService[] }> = ({ services }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renewal Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                    <tr key={service._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="font-medium text-gray-900">{service.planName}</div>
                            {service.domainName && (
                                <div className="text-gray-500">{service.domainName}</div>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.user?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm"><ServiceStatusBadge status={service.status} /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(service.renewalDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{service.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/admin/services/${service._id}`} className="text-cyan-600 hover:text-cyan-900">Manage</Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const AdminServicesPage: React.FC = () => {
    const [services, setServices] = useState<AdminService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { addToast } = useToast();
    
    // Filtering and sorting state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('renewalDate-asc');

    useEffect(() => {
        const loadServices = async () => {
            setIsLoading(true);
            try {
                const serviceList = await fetchAllServices();
                setServices(serviceList);
            } catch (err: any) {
                addToast(err.message || 'Failed to fetch services data', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        loadServices();
    }, [addToast]);
    
    const filteredAndSortedServices = useMemo(() => {
        let filtered = [...services];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(service => service.status === statusFilter);
        }

        if (searchTerm.trim() !== '') {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(service =>
                service.planName.toLowerCase().includes(lowercasedTerm) ||
                (service.user?.name && service.user.name.toLowerCase().includes(lowercasedTerm)) ||
                (service.user?.email && service.user.email.toLowerCase().includes(lowercasedTerm))
            );
        }

        const [sortField, sortOrder] = sortBy.split('-');
        if (sortField === 'renewalDate') {
             filtered.sort((a, b) => {
                const dateA = new Date(a.renewalDate).getTime();
                const dateB = new Date(b.renewalDate).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });
        }

        return filtered;
    }, [services, searchTerm, statusFilter, sortBy]);

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">All Services</h1>
                        <p className="mt-1 text-gray-600">View and manage all user services.</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by plan, user..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                             <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="renewalDate-asc">Renewal Date: Soonest</option>
                                <option value="renewalDate-desc">Renewal Date: Latest</option>
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                           <Loader className="w-12 h-12 animate-spin text-cyan-600" />
                        </div>
                    ) : (
                        <ServicesTable services={filteredAndSortedServices} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminServicesPage;