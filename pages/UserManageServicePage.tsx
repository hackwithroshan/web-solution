import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { ArrowLeft, Loader, HardDrive, Wifi, Database, AlertTriangle, X, Settings, CreditCard } from 'lucide-react';
import { UserService } from '../types';
import { fetchUserServiceById, cancelUserService } from '../services/api';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';

// A simple progress bar component
const StatProgressBar: React.FC<{ label: string; value: number; max: number; unit: string }> = ({ label, value, max, unit }) => {
    const percentage = (value / max) * 100;
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="text-gray-500">{`${value} ${unit} / ${max} ${unit}`}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

// Main page component
const UserManageServicePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [service, setService] = useState<UserService | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    
    useEffect(() => {
        if (!id) {
            addToast("Service ID is missing.", 'error');
            navigate('/user/dashboard');
            return;
        }

        const loadService = async () => {
            setIsLoading(true);
            try {
                const serviceData = await fetchUserServiceById(id);
                setService(serviceData);
            } catch (error: any) {
                addToast(error.message || 'Failed to load service details.', 'error');
                navigate('/user/dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        loadService();
    }, [id, navigate, addToast]);

    const handleCancelService = async () => {
        if (!id) return;
        setIsCancelling(true);
        try {
            await cancelUserService(id);
            addToast("Your service has been cancelled successfully.", "success");
            setShowCancelModal(false);
            navigate('/user/dashboard');
        } catch (error: any) {
            addToast(error.message || "Failed to cancel service.", "error");
        } finally {
            setIsCancelling(false);
        }
    };
    
    const usageData = () => {
        if (!service) return null;
        if (service.planName.toLowerCase().includes('hosting')) {
            return (
                <div className="space-y-6">
                    <StatProgressBar label="Disk Usage" value={7.8} max={20} unit="GB" />
                    <StatProgressBar label="Bandwidth" value={153} max={1024} unit="GB" />
                    <StatProgressBar label="Databases" value={2} max={5} unit="" />
                    <StatProgressBar label="Email Accounts" value={10} max={25} unit="" />
                </div>
            );
        }
        return <p className="text-gray-500">Usage statistics are not applicable for this service type.</p>;
    };

    const configurationData = () => {
        if (!service) return null;
        const lowerCaseName = service.planName.toLowerCase();
        
        if (lowerCaseName.includes('hosting')) {
            return (
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center"><span className="text-gray-500">FTP Host</span><span className="font-mono text-gray-700">ftp.apexnucleus.com</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-500">FTP Username</span><span className="font-mono text-gray-700">{service.user.toString().slice(-8)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-500">PHP Version</span><span className="font-mono text-gray-700">8.2</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-500">Server Location</span><span className="font-mono text-gray-700">Mumbai, India</span></div>
                </div>
            );
        }
        
        if (lowerCaseName.includes('domain')) {
             return (
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center"><span className="text-gray-500">Nameserver 1</span><span className="font-mono text-gray-700">ns1.apexnucleus.com</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-500">Nameserver 2</span><span className="font-mono text-gray-700">ns2.apexnucleus.com</span></div>
                     <div className="flex justify-between items-center"><span className="text-gray-500">Registration Date</span><span className="font-mono text-gray-700">{new Date(service.startDate).toLocaleDateString()}</span></div>
                    <Button variant="secondary" className="mt-4 !text-sm !py-1.5 !px-3">Manage DNS</Button>
                </div>
            );
        }

        return <p className="text-gray-500">Configuration details are not applicable for this service type.</p>;
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-gray-100 font-sans">
                 <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                 <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                    <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                    <main className="flex-1 flex items-center justify-center">
                        <Loader className="w-12 h-12 animate-spin text-blue-600" />
                    </main>
                </div>
            </div>
        );
    }
    
    if (!service) {
        return (
            <div className="flex h-screen bg-gray-100 font-sans">
                <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                    <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                    <main className="flex-1 flex items-center justify-center">
                        <p>Could not load service details.</p>
                    </main>
                </div>
            </div>
        );
    }
    
    const isCancelled = service.status === 'cancelled';

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                         <div className="mb-6">
                            <Link to="/user/dashboard" className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-800">
                                <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
                            </Link>
                        </div>
                        
                        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                            <h1 className="text-xl font-bold text-gray-800">{service.planName}</h1>
                            {service.domainName && <p className="text-blue-600 font-mono">{service.domainName}</p>}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4 text-sm">
                                <div><p className="text-gray-500">Status</p><p className="font-semibold capitalize">{service.status}</p></div>
                                <div><p className="text-gray-500">Price</p><p className="font-semibold">₹{service.price}</p></div>
                                <div><p className="text-gray-500">Start Date</p><p className="font-semibold">{new Date(service.startDate).toLocaleDateString()}</p></div>
                                <div><p className="text-gray-500">Renewal Date</p><p className="font-semibold">{new Date(service.renewalDate).toLocaleDateString()}</p></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-3 space-y-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm">
                                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><HardDrive size={20} className="mr-2 text-blue-500" /> Usage Statistics</h2>
                                    {usageData()}
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm">
                                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Settings size={20} className="mr-2 text-blue-500" /> Configuration</h2>
                                    {configurationData()}
                                </div>
                            </div>
                            <div className="lg:col-span-2 space-y-6">
                                 <div className="bg-white p-6 rounded-xl shadow-sm">
                                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><CreditCard size={20} className="mr-2 text-blue-500" /> Billing & Renewal</h2>
                                    <div className="space-y-3 text-sm">
                                         <div className="flex justify-between items-center"><span className="text-gray-500">Price</span><span className="font-semibold text-gray-700">₹{service.price} / year</span></div>
                                         <div className="flex justify-between items-center"><span className="text-gray-500">Next Due Date</span><span className="font-semibold text-gray-700">{new Date(service.renewalDate).toLocaleDateString()}</span></div>
                                    </div>
                                    {!isCancelled && (
                                         <Button className="w-full mt-6">Renew Now</Button>
                                    )}
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                                     <h2 className="text-lg font-bold text-red-700 mb-2">Danger Zone</h2>
                                     <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">Cancel Service</p>
                                            <p className="text-sm text-gray-600">
                                                {isCancelled ? 'This service has already been cancelled.' : 'This action cannot be undone.'}
                                            </p>
                                        </div>
                                        <Button onClick={() => setShowCancelModal(true)} disabled={isCancelled} className="!bg-red-600 hover:!bg-red-700 disabled:!bg-red-300">
                                            Cancel Service
                                        </Button>
                                     </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
            
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                        <div className="flex items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Cancel Service Confirmation</h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to cancel the "{service.planName}" service? This action is effective immediately and cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                            <Button onClick={handleCancelService} disabled={isCancelling} className="!bg-red-600 hover:!bg-red-700 w-full sm:w-auto">
                                {isCancelling ? <Loader className="animate-spin h-5 w-5"/> : 'Confirm Cancellation'}
                            </Button>
                            <Button variant="secondary" onClick={() => setShowCancelModal(false)} className="w-full sm:w-auto">
                                Keep Service
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManageServicePage;