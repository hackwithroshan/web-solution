import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { createCartOrder, verifyCartPayment, fetchPublicKeys } from '../services/api';
import Button from '../components/ui/Button';
import { Loader, ShoppingCart, ArrowLeft, Lock, CreditCard, Trash2 } from 'lucide-react';
import { CartItem } from '../types';

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

const CheckoutItem: React.FC<{ item: CartItem }> = ({ item }) => {
    const { updateCartItem, removeFromCart } = useCart();
    
    const selectedTier = item.plan.plans.find(p => p.name === item.tierName);
    const price = item.billingCycle === 'yearly' ? selectedTier?.yearlyPrice : selectedTier?.monthlyPrice;

    const tierIndex = item.plan.plans.findIndex(p => p.name === item.tierName);
    
    return (
        <div className="py-4 border-b border-white/10 last:border-b-0">
            <div className="grid grid-cols-5 items-center gap-4">
                <div className="col-span-5 md:col-span-2">
                    <p className="font-semibold">{item.plan.name}</p>
                    <p className="text-sm text-gray-400">{item.plan.description}</p>
                </div>
                <div className="col-span-5 md:col-span-3">
                    {/* Billing Cycle Toggle */}
                    <div className="flex items-center justify-end gap-3 mb-3">
                         <span className="text-sm text-gray-300">Billing Cycle:</span>
                         <div className="flex items-center gap-1 bg-gray-700/50 p-1 rounded-full">
                            <button onClick={() => updateCartItem(item.planId, { billingCycle: 'monthly' })} className={`px-3 py-1 text-xs rounded-full ${item.billingCycle === 'monthly' ? 'bg-white/10 text-white' : 'text-gray-400'}`}>Monthly</button>
                            <button onClick={() => updateCartItem(item.planId, { billingCycle: 'yearly' })} className={`px-3 py-1 text-xs rounded-full relative ${item.billingCycle === 'yearly' ? 'bg-white/10 text-white' : 'text-gray-400'}`}>
                                Yearly
                                <span className="absolute -top-2 -right-2 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">10% OFF</span>
                            </button>
                        </div>
                    </div>
                     {/* Tier Selector */}
                    <div className="relative bg-gray-700/50 rounded-full p-1 flex">
                        <div 
                            className="absolute top-1 bottom-1 bg-white/10 rounded-full transition-all duration-300 ease-in-out"
                            style={{
                                width: `calc(100% / 3)`,
                                transform: `translateX(${tierIndex * 100}%)`
                            }}
                        />
                        {item.plan.plans.map(tier => (
                            <button
                                key={tier.name}
                                onClick={() => updateCartItem(item.planId, { tierName: tier.name })}
                                className="relative w-1/3 py-2 text-sm font-semibold text-white z-10"
                            >
                                {tier.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex justify-end items-center mt-3 gap-4">
                 <button onClick={() => removeFromCart(item.planId)} className="text-gray-500 hover:text-red-400 text-xs flex items-center gap-1">
                    <Trash2 size={12} /> Remove
                 </button>
                <div className="text-right font-semibold">
                    ₹{price?.toLocaleString('en-IN')}
                </div>
            </div>
        </div>
    );
};


const CheckoutPage: React.FC = () => {
    const { cartItems, clearCart, totalPrice } = useCart();
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    const taxAmount = totalPrice * 0.18;
    const grandTotal = totalPrice + taxAmount;
    
    const handleCheckout = async () => {
        if (!user) {
            addToast('Please log in to proceed.', 'info');
            navigate('/login');
            return;
        }

        setIsProcessing(true);
        try {
            const cartPayload = cartItems.map(item => ({
                planId: item.planId,
                tierName: item.tierName,
                billingCycle: item.billingCycle,
                domainName: item.domainName,
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
                prefill: { name: user.name, email: user.email },
                notes: { orderId: orderId, userId: user._id },
                theme: { color: "#4f46e5" }
            };
            
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error: any) {
            addToast(`Error initiating payment: ${error.message}`, 'error');
        } finally {
            setIsProcessing(false);
        }
    };
    
    if (cartItems.length === 0) {
        return (
            <div className="flex h-screen bg-[#1E1E2C] text-white items-center justify-center p-4">
                <div className="text-center">
                    <ShoppingCart size={48} className="mx-auto text-gray-500 mb-4" />
                    <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
                    <p className="mt-2 text-gray-400">Please select a service to purchase.</p>
                    <Button onClick={() => navigate('/user/all-services')} className="mt-6">
                        Browse Services
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1E1E2C] text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
                    <ArrowLeft size={16} /> Back to Services
                </button>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left side: Cart items */}
                    <div className="lg:col-span-2 bg-[#2A2A3A]/50 border border-white/10 rounded-xl p-6">
                        <h1 className="text-3xl font-bold mb-6">Check Out</h1>
                        <div className="space-y-4">
                            {cartItems.map(item => (
                                <CheckoutItem key={item.planId} item={item} />
                            ))}
                        </div>
                    </div>

                    {/* Right side: Payment form */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 sticky top-8">
                            <h2 className="text-2xl font-bold mb-4">Payment Info</h2>
                            
                            <div className="border-t border-white/10 mt-6 pt-4 space-y-2">
                                <div className="flex justify-between text-gray-300">
                                    <span>Subtotal</span>
                                    <span>₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Taxes (GST 18%)</span>
                                    <span>₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold pt-2">
                                    <span>Total</span>
                                    <span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            
                            <Button onClick={handleCheckout} disabled={isProcessing} className="w-full mt-8 text-lg py-3">
                                {isProcessing ? <Loader className="animate-spin h-5 w-5 mx-auto"/> : (
                                    <>
                                        <Lock size={18} className="mr-2"/>
                                        Pay ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-gray-500 text-center mt-4">Secure payment via Razorpay.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;