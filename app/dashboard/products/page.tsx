'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  createdAt: string;
}

const UPLOADS = [
  "1748850622306-f7l4ct.png",
  "1748850616563-bbyidq.png",
  "1748823700249-911aqr.png",
  "1748823687675-e0gpmk.png",
  "1748823467691-aikkv8.png",
  "1748823458888-avtvmi.png",
  "1748822992970-7ktouu.webp",
  "1748822958242-pk9hta.png",
  "1748822952622-sxobxs.png",
  "1748821410567-7wqlzl.png",
  "1748821396112-p1jt58.png",
  "1748820915355-y0z71r.png",
  "1748820908544-z37q4f.png",
  "1748817733773-jnvr46.png",
  "1748817720277-pswrfw.png",
  "1748817120616-jo5x1i.png",
  "1748817111075-10ed1m.png",
];

// Fonction utilitaire pour uploader un fichier et retourner l'URL
async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (res.ok) {
    const data = await res.json();
    return data.url;
  }
  return null;
}

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product & { showStock?: boolean }>>();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchProducts();
    }
  }, [status, router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Erreur lors de la récupération des produits');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    // Stock par défaut à 0 si non renseigné
    if (currentProduct.stock === undefined || currentProduct.stock === null || isNaN(currentProduct.stock as any)) {
      currentProduct.stock = 0;
    }

    // Toujours ajouter le champ images (tableau) même s'il est vide
    if (!Array.isArray(currentProduct.images)) {
      currentProduct.images = [];
    }

    try {
      const response = await fetch('/api/products', {
        method: currentProduct.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProduct),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde du produit');
      
      await fetchProducts();
      setIsModalOpen(false);
      setCurrentProduct(undefined);
    } catch (err) {
      setError('Erreur lors de la sauvegarde du produit');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression du produit');
      
      await fetchProducts();
    } catch (err) {
      setError('Erreur lors de la suppression du produit');
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Produits</h1>
        <button
          onClick={() => {
            setCurrentProduct(undefined);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Ajouter un produit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <img
              src={product.images?.[0] || '/placeholder.png'}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">{product.price} XOF</span>
              <span className="text-sm text-gray-500">Stock: {product.stock}</span>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setCurrentProduct(product);
                  setIsModalOpen(true);
                }}
                className="text-blue-500 hover:text-blue-600"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="text-red-500 hover:text-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {currentProduct?.id ? 'Modifier le produit' : 'Ajouter un produit'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={currentProduct?.name || ''}
                    onChange={(e) =>
                      setCurrentProduct({ ...currentProduct, name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={currentProduct?.description || ''}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        description: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Prix (XOF)
                  </label>
                  <input
                    type="number"
                    value={currentProduct?.price || ''}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={currentProduct?.stock ?? ''}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        stock: e.target.value === '' ? undefined : parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-400">Laisse vide pour stock illimité ou non géré</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Afficher le stock
                  </label>
                  <input
                    type="checkbox"
                    checked={currentProduct?.showStock ?? false}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        showStock: e.target.checked,
                      })
                    }
                    className="mt-1"
                  />
                  <span className="text-xs text-gray-400 ml-2">Cocher pour afficher le stock sur la boutique</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={currentProduct?.images?.[0] || ''}
                    onChange={(e) => {
                      setCurrentProduct({
                        ...currentProduct,
                        images: [e.target.value],
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {/* Upload d'image */}
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-2"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await uploadImage(file);
                        if (url) {
                          setCurrentProduct({ ...currentProduct, images: [url] });
                        }
                      }
                    }}
                  />
                  {currentProduct?.images?.[0] && (
                    <img src={currentProduct.images[0]} alt="Aperçu" className="mt-2 h-16" />
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentProduct(undefined);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  {currentProduct?.id ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 