"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronDown, Star } from "lucide-react"
import Link from "next/link"
import { Restaurant, restaurantService } from "@/services/restaurantService"
import { SecureImage } from "@/components/ui/secure-image"

export default function RestaurantLanding() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true)
        const response = await restaurantService.getAllRestaurants()
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background"></div>
          <div className="absolute top-0 left-0 right-0 h-[500px] gradient-bg"></div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <motion.div
              className="flex flex-col space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="inline-block rounded-lg bg-primary/10 px-3 w-fit py-1 text-sm text-primary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Découvrez l&apos;Excellence Culinaire
              </motion.div>
              <motion.h1
                className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Trouvez Votre <span className="text-primary">Restaurant</span> Idéal
              </motion.h1>
              <motion.p
                className="text-muted-foreground md:text-xl max-w-[600px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Découvrez des restaurants exceptionnels, réservez votre table et embarquez pour une expérience culinaire qui ravira vos sens.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-3 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button size="lg" className="group" asChild>
                  <Link href="/restaurant">
                    Explorer les Restaurants
                    <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover:rotate-180" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline">
                  Comment ça marche
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative lg:ml-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="relative h-[400px] w-full overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10 rounded-2xl"></div>
                <SecureImage
                  src="/placeholder.svg?height=800&width=1200"
                  alt="Expérience gastronomique"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section id="restaurants" className="py-20 bg-muted/50">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Restaurants en Vedette</h2>
            <p className="mt-4 text-muted-foreground md:text-xl max-w-[800px] mx-auto">
              Découvrez notre sélection des meilleurs établissements gastronomiques de votre région.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Chargement...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              {error}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  className="group relative overflow-hidden rounded-2xl bg-card shadow-md transition-all hover:shadow-xl"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Link href={`/restaurant/${restaurant.id}`}>
                    <div className="relative h-64 w-full overflow-hidden">
                      <SecureImage
                        src={restaurant.images.find(img => img.image_type === 'main')?.image_url || "/placeholder.svg"}
                        alt={restaurant.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white">{restaurant.name}</h3>
                          <p className="text-white/80">{restaurant.location}</p>
                        </div>
                        {restaurant.rating && (
                          <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                            <span className="font-medium">{restaurant.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                          {restaurant.cuisine}
                        </span>
                        <Button variant="ghost" size="sm" className="text-primary">
                          Voir le Menu
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

