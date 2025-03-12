'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { restaurantService } from '@/services/restaurantService';
import { Restaurant } from '@/types/restaurant';
import { Input } from '@/components/ui/input';
import { SecureImage } from '@/components/ui/secure-image';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await restaurantService.getAllRestaurants();
        setRestaurants(response.data.restaurants);
      } catch (err) {
        setError('Erreur lors du chargement des restaurants');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants?.filter((restaurant) => {
    return restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
           restaurant.description.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  if (loading) return <div className="text-center p-8">Chargement...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Nos restaurants</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un restaurant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <Link
            key={restaurant.id}
            href={`/restaurant/${restaurant.id}`}
            className="block group"
          >
            <div className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <SecureImage
                  src={restaurant.images?.[0]?.image_url || '/placeholder-restaurant.jpg'}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {restaurant.name}
                </h2>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {restaurant.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{restaurant.cuisine}</Badge>
                  {restaurant.features?.slice(0, 2).map((feature: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun restaurant ne correspond à votre recherche.
        </div>
      )}
    </div>
  );
} 