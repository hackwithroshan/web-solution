import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ServicePlan, CartItem } from '../types';
import { useToast } from './useToast';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (plan: ServicePlan, domainName?: string) => void;
  removeFromCart: (planId: string) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { addToast } = useToast();

  const addToCart = (plan: ServicePlan, domainName?: string) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.plan._id === plan._id);
      if (existingItem) {
        addToast(`${plan.name} is already in your cart.`, 'info');
        return prevItems;
      }
      return [...prevItems, { plan, quantity: 1, domainName }];
    });
  };

  const removeFromCart = (planId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.plan._id !== planId));
    addToast('Item removed from cart.', 'info');
  };

  const clearCart = () => {
    setCartItems([]);
  };
  
  const totalPrice = cartItems.reduce((total, item) => total + item.plan.price * item.quantity, 0);

  const value = { cartItems, addToCart, removeFromCart, clearCart, totalPrice };

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