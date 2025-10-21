import React, { useState, useMemo } from 'react';
import { UserService } from '../types';
import Button from './ui/Button';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { fetchPublicKeys, createBulkRenewalOrder, verifyBulkRenewalPayment } from '../services/api';
import { Loader, RefreshCw, AlertTriangle } from 'lucide-react';

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

interface BulkRenewalProps {
    services: UserService[];
    onSuccessfulRenewal: () => void;
}

const BulkRenewal: React.FC<BulkRenewalProps> = ({ services, onSuccessfulRenewal }) => {
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
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
                key: keys.razorpayKeyId,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "ApexNucleus",
                description: `Service Renewal (${selectedServices.length} items)`,
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
    
    const calculateDaysRemaining = (dateString: string) => {
        const renewalDate = new Date(dateString);
        const now = new Date();
        const diffTime = renewalDate.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4 flex-grow">
                    <h3 className="text-lg font-bold text-gray-800">{services.length} Service(s) Expiring Soon</h3>
                    <p className="text-sm text-gray-600 mt-1">Select the services you wish to renew to avoid any disruption.</p>
                    <div className="mt-4 space-y-3">
                        {services.map(service => (
                            <div key={service._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                 <div className="flex items-center">
                                    <input type="checkbox" id={`renew-soon-${service._id}`} checked={selectedServices.includes(service._id)} onChange={() => handleSelectService(service._id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                    <label htmlFor={`renew-soon-${service._id}`} className="ml-3">
                                        <span className="font-semibold text-gray-800">{service.planName}</span>
                                        <span className="text-sm text-yellow-700 ml-2 font-semibold">(Expires in {calculateDaysRemaining(service.renewalDate)} days)</span>
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

export default BulkRenewal;
