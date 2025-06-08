'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED';
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shop: {
    name: string;
    contactEmail: string | null;
    contactPhone: string | null;
  };
  items: OrderItem[];
  review?: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
  };
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchOrder();
    }
  }, [status, router, params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération de la commande');
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError('Impossible de charger les détails de la commande');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'CONFIRMED':
        return 'Confirmée';
      case 'DELIVERED':
        return 'Livrée';
      default:
        return status;
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/orders/${params.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'envoi de l\'avis');

      // Rafraîchir les données de la commande
      await fetchOrder();
    } catch (err) {
      setError('Impossible d\'envoyer votre avis');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!order) return <div>Commande non trouvée</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/orders"
          className="text-blue-600 hover:text-blue-900"
        >
          ← Retour à mes commandes
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Détails de la commande #{order.orderNumber}</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Informations de la commande</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Statut</dt>
              <dd>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Date de commande</dt>
              <dd>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total</dt>
              <dd>{order.total.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'XOF'
              })}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Informations de livraison</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nom</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd>{order.customerEmail}</dd>
            </div>
            {order.customerPhone && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                <dd>{order.customerPhone}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Produits commandés</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix unitaire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {item.product.images[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                    )}
                    <div className="text-sm font-medium text-gray-900">
                      {item.product.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.price.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'XOF'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(item.price * item.quantity).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'XOF'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Contact de la boutique</h2>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Nom de la boutique</dt>
            <dd>{order.shop.name}</dd>
          </div>
          {order.shop.contactEmail && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd>{order.shop.contactEmail}</dd>
            </div>
          )}
          {order.shop.contactPhone && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
              <dd>{order.shop.contactPhone}</dd>
            </div>
          )}
        </dl>
      </div>

      {order.status === 'DELIVERED' && !order.review && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Donnez votre avis</h2>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Commentaire
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Partagez votre expérience..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Envoi en cours...' : 'Envoyer mon avis'}
            </button>
          </form>
        </div>
      )}

      {order.review && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Votre avis</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-2xl">
                    {i < order.review.rating ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-500">
                {new Date(order.review.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
            {order.review.comment && (
              <p className="text-gray-700">{order.review.comment}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 