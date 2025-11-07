import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ServicePlan, CartItem, PlanTier } from '../types';
import { useToast } from './useToast';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (plan: ServicePlan, tierName: PlanTier['name'], billingCycle: 'monthly' | 'yearly', domainName?: string) => void;
  removeFromCart: (planId: string) => void;
  updateCartItem: (planId: string, updates: Partial<Pick<CartItem, 'tierName' | 'billingCycle'>>) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { addToast } = useToast();

  const addToCart = (plan: ServicePlan, tierName: PlanTier['name'], billingCycle: 'monthly' | 'yearly', domainName?: string) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.plan._id === plan._id);
      if (existingItem) {
        addToast(`${plan.name} is already in your cart.`, 'info');
        return prevItems;
      }
      return [...prevItems, { planId: plan._id, plan, tierName, billingCycle, domainName }];
    });
  };

  const removeFromCart = (planId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.plan._id !== planId));
    addToast('Item removed from cart.', 'info');
  };

  const updateCartItem = useCallback((planId: string, updates: Partial<Pick<CartItem, 'tierName' | 'billingCycle'>>) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.planId === planId ? { ...item, ...updates } : item
      )
    );
  }, []);

  const clearCart = () => {
    setCartItems([]);
  };
  
  const totalPrice = cartItems.reduce((total, item) => {
      const tier = item.plan.plans.find(t => t.name === item.tierName);
      if (!tier) return total;
      const price = item.billingCycle === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice;
      return total + price;
  }, 0);

  const value = { cartItems, addToCart, removeFromCart, updateCartItem, clearCart, totalPrice };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};