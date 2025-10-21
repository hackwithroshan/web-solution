import React, { useEffect, useState, useMemo } from 'react';
import UserSidebar from '../components/UserSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../hooks/useAuth';
import { UserService } from '../types';
import { fetchUserServices, fetchPublicKeys, createBulkRenewalOrder, verifyBulkRenewalPayment } from '../services/api';
import { Server, CheckCircle, Clock, Star, ChevronRight, HelpCircle, Settings, BarChart2, Briefcase, AlertTriangle, RefreshCw, Loader } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import BulkRenewal from '../components/BulkRenewal';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name?: string;
    email?: string;
  };
  notes: {
    orderId: string;
    userId: string;
  };
  theme: {
    color: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open(): void;
    };
  }
}

// --- Skeleton Components for Loading State ---
const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 ${className}`} />
);

const StatCardSkeleton: React.FC = () => (
    <div className="bg-white p-5 rounded-xl shadow-sm flex items-center space-x-4 border border-gray-200/80">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-6 w-1/2 rounded" />
        </div>
    </div>
);

const TableRowSkeleton: React.FC = () => (
    <tr>
        <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-5 w-32 rounded" /></td>
        <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-5 w-24 rounded" /></td>
        <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-5 w-16 rounded" /></td>
        <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-5 w-28 rounded" /></td>
    </tr>
);

const ExpiredServicesRenewal: React.FC<{ services: UserService[]; onSuccessfulRenewal: () => void; }> = ({ services, onSuccessfulRenewal }) => {
    const [selectedServices, setSelectedServices] = useState<string[]>(services.map(s => s._id)); // Auto-select all expired
    const [isProcessing, setIsProcessing] = useState(false);
    const { addToast } = useToast();
    const { user } = useAuth();

    const handleSelectService = (serviceId: string) => {
        setSelectedServices(prev => 
            prev.includes(serviceId) 
            ? prev.filter(id => id !== serviceId)
            : [...prev, serviceId]
        );
    };

    const totalRenewalCost = useMemo(() => {
        return services.reduce((total, service) => {
            if (selectedServices.includes(service._id)) {
                return total + service.price;
            }
            return total;
        }, 0);
    }, [selectedServices, services]);

    const handleRenew = async () => {
        if (selectedServices.length === 0 || !user) {
            addToast('Please select at least one service to renew.', 'info');
            return;
        }

        setIsProcessing(true);
        try {
            const keys = await fetchPublicKeys();
            const { orderId, razorpayOrder } = await createBulkRenewalOrder(selectedServices);

            const options: RazorpayOptions = {
                key: keys.razorpayKeyId, amount: razorpayOrder.amount, currency: razorpayOrder.currency,
                name: "ApexNucleus", description: `Expired Service Renewal (${selectedServices.length} items)`,
                order_id: razorpayOrder.id,
                handler: async (response) => {
                    const verificationData = {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        orderId: orderId,
                    };
                    try {
                        await verifyBulkRenewalPayment(verificationData);
                        addToast('Services renewed successfully!', 'success');
                        setSelectedServices([]);
                        onSuccessfulRenewal();
                    } catch (verifyError: any) {
                        addToast(`Renewal verification failed: ${verifyError.message}`, 'error');
                    }
                },
                prefill: { name: user.name, email: user.email },
                notes: { orderId: orderId, userId: user._id },
                theme: { color: "#0891b2" },
            };
            
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error: any) {
            addToast(`Error initiating renewal: ${error.message}`, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4 flex-grow">
                    <h3 className="text-lg font-bold text-gray-800">{services.length} Service(s) Have Expired!</h3>
                    <p className="text-sm text-gray-600 mt-1">Select the services you wish to renew to restore functionality. Unrenewed services may be subject to deletion.</p>
                    <div className="mt-4 space-y-3">
                        {services.map(service => (
                            <div key={service._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                 <div className="flex items-center">
                                    <input type="checkbox" id={`renew-${service._id}`} checked={selectedServices.includes(service._id)} onChange={() => handleSelectService(service._id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                    <label htmlFor={`renew-${service._id}`} className="ml-3">
                                        <span className="font-semibold text-gray-800">{service.planName}</span>
                                        <span className="text-sm text-red-700 ml-2 font-semibold">(Expired: {new Date(service.renewalDate).toLocaleDateString()})</span>
                                    </label>
                                </div>
                                <span className="font-semibold text-gray-800">₹{service.price}</span>
                            </div>
                        ))}
                    </div>
                     {selectedServices.length > 0 && (
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg">Total: ₹{totalRenewalCost.toLocaleString('en-IN')}</p>
                            </div>
                            <Button onClick={handleRenew} disabled={isProcessing} className="flex items-center">
                                {isProcessing ? <Loader className="animate-spin h-5 w-5 mr-2" /> : <RefreshCw size={16} className="mr-2" />}
                                {isProcessing ? 'Processing...' : `Renew ${selectedServices.length} Service(s)`}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, color: string }> = ({ icon: Icon, title, value, color }) => {
    const colorClasses = {
        green: { bg: 'bg-green-50', text: 'text-green-600' },
        yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
    }[color] || { bg: 'bg-gray-100', text: 'text-gray-700' };

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm flex items-center space-x-4 border border-gray-200/80">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses.bg}`}>
                <Icon className={`w-6 h-6 ${colorClasses.text}`} />
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
};


const QuickActionItem: React.FC<{ icon: React.ElementType, title: string, subtitle: string, to: string }> = ({ icon: Icon, title, subtitle, to }) => (
    <Link to={to} className="flex items-center p-3 -m-3 rounded-lg hover:bg-gray-50 transition-colors">
        <Icon className="w-8 h-8 text-gray-400 mr-4" />
        <div className="flex-grow">
            <p className="font-semibold text-gray-800">{title}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
    </Link>
);

const UserDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [services, setServices] = useState<UserService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    
    useEffect(() => {
        // Simulate loading for demo purposes
        setTimeout(loadServices, 1000);
    }, [user, addToast]);
    
    const activeUserServices = useMemo(() => services.filter(s => s.status === 'active'), [services]);

    const expiringSoonServices = useMemo(() => {
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        return services.filter(s => {
            const renewal = new Date(s.renewalDate);
            return renewal > now && renewal <= thirtyDaysFromNow && s.status === 'active';
        });
    }, [services]);

    const expiredServices = useMemo(() => {
        const now = new Date();
        return services.filter(s => {
            const renewal = new Date(s.renewalDate);
            return renewal < now && s.status === 'active';
        });
    }, [services]);
    
    const monthlySpending = "₹0"; // Mock data
    const accountType = 'Premium'; // Mock data

    const handleSuccessfulRenewal = () => {
        // Function to refresh data after a successful renewal
       loadServices();
    };
    
    const calculateTimeRemaining = (dateString: string) => {
        const renewalDate = new Date(dateString);
        const now = new Date();
        // Set time to 0 to compare dates only
        renewalDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        const diffTime = renewalDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: `Expired ${Math.abs(diffDays)} days ago`, color: 'text-red-600 font-bold' };
        }
        if (diffDays === 0) {
            return { text: 'Expires today', color: 'text-red-600 font-bold' };
        }
        if (diffDays === 1) {
            return { text: 'Expires tomorrow', color: 'text-red-600 font-semibold' };
        }
        if (diffDays <= 7) {
            return { text: `Expires in ${diffDays} days`, color: 'text-red-500 font-semibold' };
        }
        if (diffDays <= 30) {
            return { text: `Expires in ${diffDays} days`, color: 'text-yellow-600' };
        }
        return { text: `Expires in ${diffDays} days`, color: 'text-gray-600' };
    };


    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center bg-blue-50/50 border border-blue-200/50 rounded-xl p-6 mb-8">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Good Morning, {user?.name}!</h1>
                                <p className="mt-1 text-gray-600">Welcome back to your ApexNucleus dashboard.</p>
                            </div>
                            <div className="hidden sm:flex items-center space-x-2 bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span>Active Account</span>
                            </div>
                        </div>
                        
                         {isLoading ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                </div>
                                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                                        <Skeleton className="h-6 w-1/3 mb-4 rounded" />
                                        <table className="min-w-full">
                                            <tbody>
                                                <TableRowSkeleton />
                                                <TableRowSkeleton />
                                                <TableRowSkeleton />
                                            </tbody>
                                        </table>
                                    </div>
                                     <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm">
                                         <Skeleton className="h-6 w-1/2 mb-6 rounded" />
                                         <div className="space-y-4">
                                             <Skeleton className="h-12 w-full rounded" />
                                             <Skeleton className="h-12 w-full rounded" />
                                             <Skeleton className="h-12 w-full rounded" />
                                         </div>
                                     </div>
                                </div>
                            </>
                        ) : (
                             <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                   <StatCard icon={CheckCircle} title="Active Services" value={activeUserServices.length} color="green" />
                                   <StatCard icon={Clock} title="Expiring Soon" value={expiringSoonServices.length} color="yellow" />
                                   <StatCard icon={Briefcase} title="This Month's Spending" value={monthlySpending} color="blue" />
                                   <StatCard icon={Star} title="Account Type" value={accountType} color="purple" />
                                </div>
                                
                                {expiredServices.length > 0 && (
                                    <div className="mb-8">
                                        <ExpiredServicesRenewal services={expiredServices} onSuccessfulRenewal={handleSuccessfulRenewal} />
                                    </div>
                                )}
                                
                                {expiringSoonServices.length > 0 && (
                                    <div className="mb-8">
                                        <BulkRenewal services={expiringSoonServices} onSuccessfulRenewal={handleSuccessfulRenewal} />
                                    </div>
                                )}
        
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                   <div className="lg:col-span-2">
                                        <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col">
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-lg font-bold text-gray-800">Your Active Services</h2>
                                                <Button variant="secondary" onClick={() => navigate('/user/all-services')} className="!text-sm !py-1 !px-3 !bg-transparent !text-blue-600 hover:!bg-blue-50 !font-semibold !shadow-none">
                                                    + Add Service
                                                </Button>
                                            </div>
                                            <div className="flex-grow">
                                                {activeUserServices.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renewal Date</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Remaining</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {activeUserServices.slice(0, 5).map(service => {
                                                                    const timeRemaining = calculateTimeRemaining(service.renewalDate);
                                                                    return (
                                                                        <tr key={service._id}>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.planName}</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(service.renewalDate).toLocaleDateString()}</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{service.price}</td>
                                                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${timeRemaining.color}`}>{timeRemaining.text}</td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                                                        <div className="text-center py-10 px-4">
                                                            <Server className="mx-auto h-12 w-12 text-gray-300" />
                                                            <h3 className="mt-2 text-lg font-medium text-gray-900">No active services yet</h3>
                                                            <p className="mt-1 text-sm text-gray-500 max-w-sm">It looks like you haven't purchased any services. Get started by exploring our service catalog.</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                   </div>
                                   <div className="lg:col-span-1">
                                        <div className="bg-white p-6 rounded-xl shadow-sm h-full">
                                            <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                                            <div className="space-y-2">
                                                <QuickActionItem icon={BarChart2} title="Payment History" subtitle="View all transactions" to="/user/payment-history" />
                                                <QuickActionItem icon={HelpCircle} title="Support Tickets" subtitle="Get help & support" to="/user/support" />
                                                <QuickActionItem icon={Settings} title="Account Settings" subtitle="Manage your profile" to="/user/profile" />
                                            </div>
                                        </div>
                                   </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserDashboardPage;