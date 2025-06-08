'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
  showStock: boolean;
}

interface Shop {
  id: string;
  name: string;
  logo?: string;
  banner?: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  socialMedia?: Record<string, string>;
  products: Product[];
}

export default function ShopPublicPage() {
  const { id } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchShop() {
      setLoading(true);
      const res = await fetch(`/api/shops/${id}`);
      if (res.ok) {
        const data = await res.json();
        setShop(data);
      }
      setLoading(false);
    }
    if (id) fetchShop();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!shop) return <div className="p-8 text-center">Boutique introuvable.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {shop.logo && (
              <img src={shop.logo} alt="Logo" className="h-12 w-12 rounded-full object-cover" />
            )}
            <span className="text-2xl font-bold text-blue-700">{shop.name}</span>
          </div>
          <nav className="space-x-6">
            <Link href={`/shops/${shop.id}`}>Accueil</Link>
            <a href="#products">Produits</a>
            {shop.socialMedia?.facebook && (
              <a href={shop.socialMedia.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
            )}
            {shop.socialMedia?.instagram && (
              <a href={shop.socialMedia.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
            )}
          </nav>
        </div>
      </header>

      {/* Bannière */}
      {shop.banner && (
        <div className="w-full h-48 md:h-64 bg-gray-200 flex items-center justify-center mb-8">
          <img src={shop.banner} alt="Bannière" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Description */}
      {shop.description && (
        <div className="container mx-auto px-4 mb-8">
          <p className="text-center text-lg text-gray-700">{shop.description}</p>
        </div>
      )}

      {/* Produits */}
      <section id="products" className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Nos produits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {shop.products.length === 0 && (
            <div className="col-span-full text-center text-gray-500">Aucun produit pour le moment.</div>
          )}
          {shop.products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
              <img
                src={product.images[0] || '/placeholder.png'}
                alt={product.name}
                className="h-48 w-full object-cover rounded mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
              <p className="text-blue-600 font-bold mb-2">
                {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
              </p>
              <button
                onClick={() => addItem({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.images[0] || '/placeholder.png',
                  shopId: shop.id,
                  shopName: shop.name,
                })}
                className="mt-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                disabled={product.showStock && product.stock === 0}
              >
                {product.showStock && product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} {shop.name} - Propulsé par Sellio</p>
        </div>
      </footer>
    </div>
  );
} 