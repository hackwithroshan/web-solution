import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { createCartOrder, verifyCartPayment, fetchPublicKeys } from '../services/api';
import Button from '../components/ui/Button';
import { Loader, ShoppingCart, Trash2 } from 'lucide-react';
import { ServicePlan } from '../types';

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


const CheckoutPage: React.FC = () => {
    const { cartItems, removeFromCart, clearCart, totalPrice } = useCart();
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCheckout = async () => {
        if (!user) {
            addToast('Please log in to proceed.', 'info');
            navigate('/login');
            return;
        }

        setIsProcessing(true);
        try {
            const cartPayload = cartItems.map(item => ({
                planId: item.plan._id,
                domainName: item.domainName
            }));
            const { orderId, razorpayOrder } = await createCartOrder(cartPayload);
            const keys = await fetchPublicKeys();

            const options: RazorpayOptions = {
                key: keys.razorpayKeyId,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "ApexNucleus",
                description: "Service Plan Purchase",
                order_id: razorpayOrder.id,
                handler: async (response) => {
                    const verificationData = {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        orderId: orderId
                    };
                    try {
                        await verifyCartPayment(verificationData);
                        addToast('Payment successful! Your services are now active.', 'success');
                        clearCart();
                        navigate('/user/dashboard');
                    } catch (verifyError: any) {
                        addToast(`Payment verification failed: ${verifyError.message}`, 'error');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email
                },
                notes: {
                    orderId: orderId,
                    userId: user._id
                },
                theme: {
                    color: "#0891b2" // Tailwind cyan-600
                }
            };
            
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error: any) {
            addToast(`Error initiating payment: ${error.message}`, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Your Shopping Cart</h1>
                        {cartItems.length > 0 ? (
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <ul className="divide-y divide-gray-200">
                                    {cartItems.map(item => (
                                        <li key={item.plan._id} className="py-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-gray-800">{item.plan.name}</p>
                                                {item.domainName && <p className="text-sm text-blue-600 font-mono">{item.domainName}</p>}
                                                <p className="text-sm text-gray-500">{item.plan.category.name}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="font-semibold">₹{item.plan.price.toLocaleString('en-IN')}</p>
                                                <button onClick={() => removeFromCart(item.plan._id)} className="text-gray-400 hover:text-red-500">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <div className="border-t border-gray-200 mt-4 pt-4">
                                    <div className="flex justify-between items-center font-bold text-lg">
                                        <span>Total</span>
                                        <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                                    </div>
                                    <Button onClick={handleCheckout} disabled={isProcessing} className="w-full mt-6">
                                        {isProcessing ? <Loader className="animate-spin h-5 w-5 mx-auto"/> : 'Proceed to Payment'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                                <ShoppingCart size={40} className="mx-auto text-gray-400" />
                                <h3 className="mt-4 text-lg font-medium text-gray-800">Your cart is empty</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Looks like you haven't added any services yet.
                                </p>
                                <Button onClick={() => navigate('/user/all-services')} className="mt-6">
                                    Browse Services
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CheckoutPage;