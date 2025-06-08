'use client';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </CartProvider>
    </SessionProvider>
  );
} 