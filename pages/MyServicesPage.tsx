import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../hooks/useAuth';
import { UserService } from '../types';
import { fetchUserServices } from '../services/api';
import { Loader, Server } from 'lucide-react';
import { useToast } from '../hooks/useToast';

// --- Skeleton Components for Loading State ---
const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 ${className}`} />
);

const SkeletonTableRow: React.FC = () => (
    <tr>
        <td className="px-6 py-4"><Skeleton className="h-5 w-3/5 rounded" /></td>
        <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
        <td className="px-6 py-4"><Skeleton className="h-5 w-24 rounded" /></td>
        <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded" /></td>
        <td className="px-6 py-4"><Skeleton className="h-8 w-20 rounded" /></td>
    </tr>
);

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

const MyServicesPage: React.FC = () => {
    const { user } = useAuth();
    const [services, setServices] = useState<UserService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const loadServices = async () => {
            if (user) {
                setIsLoading(true);
                try {
                    const userServices = await fetchUserServices(user._id);
                    setServices(userServices);
                } catch (err: any) {
                    addToast(err.message || 'Failed to fetch services data', 'error');
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadServices();
    }, [user, addToast]);

    const TableHeader = () => (
        <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service / Domain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renewal Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
        </thead>
    );

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Services</h1>
                            <p className="mt-1 text-gray-600">A complete list of all your active and inactive services.</p>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <TableHeader />
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {isLoading ? (
                                        Array.from({ length: 3 }).map((_, i) => <SkeletonTableRow key={i} />)
                                    ) : services.length > 0 ? services.map(service => (
                                        <tr key={service._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="font-medium text-gray-900">{service.planName}</div>
                                                {service.domainName && <div className="text-gray-500">{service.domainName}</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap"><ServiceStatusBadge status={service.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(service.renewalDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{service.price}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link to={`/user/service/${service._id}`} className="text-blue-600 hover:text-blue-800">
                                                    Manage
                                                </Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-16 text-gray-500">
                                                <Server size={40} className="mx-auto text-gray-400" />
                                                <h3 className="mt-4 text-lg font-medium text-gray-800">No Services Found</h3>
                                                <p className="mt-1 text-sm">You haven't purchased any services yet.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MyServicesPage;