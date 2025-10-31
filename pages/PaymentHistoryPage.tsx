import React, { useEffect, useState } from 'react';
import UserSidebar from '../components/UserSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../hooks/useAuth';
import { Payment } from '../types';
import { fetchPaymentHistory } from '../services/api';
import { Download, Loader } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { generateInvoice } from '../utils/generateInvoice';

// --- Skeleton Components for Loading State ---
const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 ${className}`} />
);

const SkeletonTableRow: React.FC = () => (
    <tr>
        <td className="px-6 py-4"><Skeleton className="h-5 w-24 rounded" /></td>
        <td className="px-6 py-4"><Skeleton className="h-5 w-40 rounded" /></td>
        <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded" /></td>
        <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
        <td className="px-6 py-4"><Skeleton className="h-5 w-32 rounded" /></td>
        <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded" /></td>
    </tr>
);

const PaymentStatusBadge: React.FC<{ status: 'completed' | 'pending' | 'failed' }> = ({ status }) => {
    const statusStyles = {
        completed: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        failed: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const renderServiceDescription = (payment: Payment) => {
    if (!payment.order || !payment.order.items || payment.order.items.length === 0) {
        return 'N/A';
    }
    const firstItem = payment.order.items[0];
    const firstItemName = firstItem.itemType === 'new_purchase' 
        ? firstItem.plan?.name 
        : firstItem.service?.planName;
    
    if (payment.order.items.length > 1) {
        return `${firstItemName} + ${payment.order.items.length - 1} more`;
    }
    return firstItemName || 'Service details';
};


const PaymentHistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        const loadPayments = async () => {
            if (user) {
                try {
                    const paymentData = await fetchPaymentHistory(user._id);
                    setPayments(paymentData);
                } catch (err: any) {
                    addToast(err.message || 'Failed to fetch payment history', 'error');
                } finally {
                    setIsLoading(false);
                }
            }
        };
        // Simulate loading for demo purposes
        setTimeout(loadPayments, 1000);
    }, [user, addToast]);
    
    const handleDownloadInvoice = async (payment: Payment) => {
        if (!user) {
            addToast('User data not available.', 'error');
            return;
        }
        setDownloadingId(payment._id);
        try {
            // Client-side PDF generation
            await generateInvoice(payment, user);
        } catch (error) {
            addToast('Failed to generate invoice.', 'error');
            console.error(error);
        } finally {
            setDownloadingId(null);
        }
    };

    const TableHeader = () => (
        <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
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
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Payment History</h1>
                            <p className="mt-1 text-gray-600">Review your past transactions and invoices.</p>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <TableHeader />
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} />)
                                    ) : payments.length > 0 ? payments.map(payment => (
                                        <tr key={payment._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{renderServiceDescription(payment)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{payment.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm"><PaymentStatusBadge status={payment.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{payment.transactionId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button 
                                                  onClick={() => handleDownloadInvoice(payment)} 
                                                  disabled={downloadingId === payment._id}
                                                  className="text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50 disabled:cursor-wait"
                                                >
                                                    {downloadingId === payment._id ? (
                                                        <Loader size={16} className="mr-1 animate-spin" />
                                                    ) : (
                                                        <Download size={16} className="mr-1" />
                                                    )}
                                                    PDF
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-gray-500">No payment history found.</td>
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

export default PaymentHistoryPage;