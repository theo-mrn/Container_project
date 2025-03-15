"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Restaurant, restaurantService } from "@/services/restaurantService"

export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true)
        const response = await restaurantService.getAllRestaurants()
        console.log('Restaurants from API:', response)
        setRestaurants(response)
      } catch (err) {
        console.error('Error fetching restaurants:', err)
        setError("Impossible de charger les restaurants")
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  const filteredRestaurants = restaurants?.filter((restaurant) => {
    return restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
           restaurant.description.toLowerCase().includes(searchQuery.toLowerCase())
  }) || []

  if (loading) {
    return <div className="container py-6">Chargement...</div>
  }

  if (error) {
    return <div className="container py-6">Erreur: {error}</div>
  }

  return (
    <div className="min-h-screen max-w-screen-xl mx-auto bg-background">
      <main className="container py-6">
        <div className="flex-1 flex items-center mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher des restaurants ou cuisines..."
              className="w-full pl-8 rounded-full bg-muted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6">Découvrez nos restaurants</h1>

        {/* Restaurant List */}
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Aucun restaurant trouvé</h3>
            <p className="text-muted-foreground">Essayez une autre recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <motion.div
                key={restaurant.id}
                className="group relative overflow-hidden rounded-xl bg-card shadow-md transition-all hover:shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <Link href={`/restaurant/${restaurant.id}`}>
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={restaurant.images.find(img => img.image_type === 'main')?.image_url || "/placeholder.svg"}
                      alt={restaurant.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{restaurant.name}</h3>

                    <div className="flex items-center text-muted-foreground text-sm mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{restaurant.location}</span>
                    </div>

                    <Badge variant="outline" className="mb-3">
                      {restaurant.cuisine}
                    </Badge>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {restaurant.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

