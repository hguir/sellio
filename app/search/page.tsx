'use client';

import ProductSearch from '../components/ProductSearch';

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Recherche de produits</h1>
      <ProductSearch />
    </div>
  );
} 