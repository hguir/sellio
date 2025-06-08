'use client';

import { useState, useEffect } from 'react';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  order: {
    customerName: string;
    createdAt: string;
  };
}

interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
}

interface ShopReviewsProps {
  shopId: string;
}

export default function ShopReviews({ shopId }: ShopReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/shops/${shopId}/reviews`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des avis');
        const data = await response.json();
        setReviews(data.reviews);
        setStatistics(data.statistics);
      } catch (err) {
        setError('Impossible de charger les avis');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [shopId]);

  if (loading) return <div>Chargement des avis...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!statistics) return null;

  return (
    <div className="space-y-8">
      {/* Statistiques */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Avis clients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-4">
              <div className="text-4xl font-bold mr-4">
                {statistics.averageRating.toFixed(1)}
              </div>
              <div>
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-2xl">
                      {i < Math.round(statistics.averageRating) ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  {statistics.totalReviews} avis
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(statistics.ratingDistribution)
              .reverse()
              .map(([rating, count]) => (
                <div key={rating} className="flex items-center">
                  <div className="w-12 text-sm text-gray-500">
                    {rating} étoiles
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                    <div
                      className="h-2 bg-yellow-400 rounded-full"
                      style={{
                        width: `${(count / statistics.totalReviews) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="w-12 text-sm text-gray-500 text-right">
                    {count}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-xl">
                      {i < review.rating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {review.order.customerName}
              </div>
            </div>
            {review.comment && (
              <p className="text-gray-700 mt-2">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 