'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { addNotification } = useNotifications();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Grouper les articles par boutique
      const ordersByShop = items.reduce((acc, item) => {
        if (!acc[item.shopId]) {
          acc[item.shopId] = {
            shopId: item.shopId,
            shopName: item.shopName,
            items: [],
            total: 0,
          };
        }
        acc[item.shopId].items.push({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        });
        acc[item.shopId].total += item.price * item.quantity;
        return acc;
      }, {} as Record<string, any>);

      // Créer une commande pour chaque boutique
      const orderPromises = Object.values(ordersByShop).map(order =>
        fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shopId: order.shopId,
            items: order.items,
            total: order.total,
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            customerAddress: formData.address,
          }),
        })
      );

      await Promise.all(orderPromises);

      // Ajouter une notification de succès
      addNotification({
        type: 'order',
        title: 'Commande confirmée',
        message: 'Votre commande a été enregistrée avec succès.',
      });

      // Vider le panier
      clearCart();

      // Rediriger vers la page de confirmation
      router.push('/orders');
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      addNotification({
        type: 'alert',
        title: 'Erreur',
        message: 'Une erreur est survenue lors de la commande.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
          <p className="mb-4">Ajoutez des produits à votre panier pour passer commande.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Continuer vos achats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Finaliser votre commande</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Adresse de livraison
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Traitement...' : 'Confirmer la commande'}
            </button>
          </form>
        </div>
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Récapitulatif de la commande</h2>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x{' '}
                      {item.price.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                      })}
                    </p>
                  </div>
                  <p className="font-medium">
                    {(item.price * item.quantity).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                    })}
                  </p>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    {total.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 