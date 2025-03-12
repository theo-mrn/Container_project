"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, MapPin, AlertCircle } from "lucide-react"
import { ImageProps } from "next/image"
import Link from "next/link"
import { RestaurantWithMenu, restaurantService } from "@/services/restaurantService"
import { SecureImage } from "@/components/ui/secure-image"

export default function RestaurantDetailPage({ params }: { params: { id: string } }) {
  const [restaurant, setRestaurant] = useState<RestaurantWithMenu | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await restaurantService.getRestaurantMenu(params.id)
        console.log('API Response:', data)
        if (!data) {
          throw new Error('No data received from the API')
        }
        setRestaurant(data)
      } catch (error: unknown) {
        console.error('Error fetching data:', error)
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Une erreur est survenue lors du chargement du restaurant"
        setError(errorMessage)
        setRestaurant(null)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [params.id])

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Chargement...</span>
        </div>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h2 className="text-xl font-bold">Erreur</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Réessayer
          </Button>
          <Link href="/restaurants">
            <Button variant="ghost">Retour aux restaurants</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Fonction pour obtenir toutes les images d'un type donné
  const getImagesByType = (type: string) => {
    return restaurant.images?.filter(img => img.image_type === type) || []
  }

  // Composant Image avec gestion d'erreur
  const SafeImage = ({ src, alt, ...props }: Omit<ImageProps, "src"> & { src: string }) => {
    return (
      <SecureImage
        {...props}
        src={src}
        alt={alt}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background max-w-screen-xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center space-x-2 mr-4">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full bg-primary opacity-20 blur-sm"></div>
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-primary text-white">
                <span className="font-bold text-xs">GR</span>
              </div>
            </div>
            <span className="font-bold">GourmetRoute</span>
          </Link>

          <nav className="ml-auto flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/">Accueil</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/restaurants">Restaurants</Link>
            </Button>
            <Button>Réserver</Button>
          </nav>
        </div>
      </header>

      <main className="container py-6">
        <div className="flex items-center mb-6">
          <Link href="/restaurants" className="flex items-center text-muted-foreground hover:text-foreground mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour aux restaurants
          </Link>
        </div>

        {/* Restaurant Hero */}
        <div className="mb-8">
          {/* Image principale */}
          <div className="relative h-[300px] md:h-[400px] w-full rounded-xl overflow-hidden mb-4">
            <SafeImage
              src={getImagesByType('main')[0]?.image_url || "/placeholder.svg"}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Grille d'images secondaires */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Images intérieures */}
            {getImagesByType('interior').map((image, index) => (
              <div key={`interior-${index}`} className="relative h-[120px] rounded-xl overflow-hidden">
                <SafeImage
                  src={image.image_url}
                  alt={`${restaurant.name} interior ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}

            {/* Images de nourriture */}
            {getImagesByType('food').map((image, index) => (
              <div key={`food-${index}`} className="relative h-[120px] rounded-xl overflow-hidden">
                <SafeImage
                  src={image.image_url}
                  alt={`${restaurant.name} food ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}

            {/* Autres images */}
            {getImagesByType('other').map((image, index) => (
              <div key={`other-${index}`} className="relative h-[120px] rounded-xl overflow-hidden">
                <SafeImage
                  src={image.image_url}
                  alt={`${restaurant.name} other ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>

          <div className="flex items-center mb-4">
            <Badge variant="outline" className="mr-2">
              {restaurant.cuisine}
            </Badge>
            <div className="flex items-start">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 mr-1" />
              <span className="text-muted-foreground">{restaurant.location}</span>
            </div>
            <div className="ml-auto">
              <Button variant="outline" asChild>
                <Link href={`/restaurant/${params.id}/edit`}>
                  Modifier le restaurant
                </Link>
              </Button>
            </div>
          </div>

          <p className="text-muted-foreground mb-6">{restaurant.description}</p>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Caractéristiques</h2>
            <div className="flex flex-wrap gap-2">
              {restaurant.features?.map((feature) => (
                <Badge key={feature} variant="secondary">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Menu</h2>
            <div className="space-y-8">
              {restaurant.categories?.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <h3 className="text-lg font-bold mb-4">{category.name}</h3>
                  <div className="space-y-4">
                    {category.items?.map((item) => (
                      <div key={item.id} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <span className="font-semibold">{item.price.toFixed(2)} €</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <Button size="lg">Réserver une table</Button>
          </div>
        </div>
      </main>
    </div>
  )
}

