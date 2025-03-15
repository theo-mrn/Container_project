"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import { Restaurant, restaurantService } from "@/services/restaurantService"
import { SecureImage } from "@/components/ui/secure-image"
import { toast } from "sonner"

interface ImageData {
  id?: number
  image_url: string
  image_type: 'main' | 'interior' | 'food' | 'other'
  display_order: number
}

interface FormData extends Omit<Restaurant, 'id' | 'rating' | 'phone' | 'images'> {
  features: string[]
  images: ImageData[]
}

export default function EditRestaurantPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [newFeature, setNewFeature] = useState("")
  const [newImage, setNewImage] = useState<ImageData>({
    image_url: "",
    image_type: "other",
    display_order: 0
  })

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    cuisine: "",
    location: "",
    features: [],
    images: []
  })

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true)
        const data = await restaurantService.getRestaurant(params.id)
        setRestaurant(data)
        // Initialiser le formulaire avec les données existantes
        setFormData({
          name: data.name,
          description: data.description,
          cuisine: data.cuisine,
          location: data.location,
          features: data.features || [],
          images: data.images || []
        })
      } catch (error) {
        console.error('Error fetching restaurant:', error)
        setError("Impossible de charger les informations du restaurant")
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddFeature = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newFeature.trim()) {
      e.preventDefault()
      if (!formData.features.includes(newFeature.trim())) {
        setFormData(prev => ({
          ...prev,
          features: [...prev.features, newFeature.trim()]
        }))
      }
      setNewFeature("")
    }
  }

  const handleRemoveFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }))
  }

  const handleImageInputChange = (field: keyof ImageData, value: string) => {
    setNewImage(prev => ({
      ...prev,
      [field]: value,
      display_order: prev.display_order || formData.images.length + 1
    }))
  }

  const handleAddImage = () => {
    if (newImage.image_url.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { ...newImage, display_order: prev.images.length + 1 }]
      }))
      setNewImage({
        image_url: "",
        image_type: "other",
        display_order: 0
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await restaurantService.updateRestaurant(params.id, formData)
      toast.success("Restaurant mis à jour avec succès")
      router.push(`/restaurant/${params.id}`)
    } catch (error) {
      console.error('Error updating restaurant:', error)
      toast.error("Erreur lors de la mise à jour du restaurant")
    } finally {
      setSaving(false)
    }
  }

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
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => router.back()} className="mt-4">
            Retour
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link href={`/restaurant/${params.id}`} className="flex items-center space-x-2">
            <ChevronLeft className="h-4 w-4" />
            <span>Retour au restaurant</span>
          </Link>
        </div>
      </header>

      <main className="container py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Modifier le restaurant</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nom du restaurant
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="cuisine" className="text-sm font-medium">
                Type de cuisine
              </label>
              <Input
                id="cuisine"
                name="cuisine"
                value={formData.cuisine}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Adresse
              </label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Images</label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="relative h-40 rounded-lg overflow-hidden">
                      <SecureImage
                        src={image.image_url}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveImage(index)}
                      >
                        Supprimer
                      </Button>
                    </div>
                    <Badge className="absolute top-2 left-2">
                      {image.image_type}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="URL de l'image"
                  value={newImage.image_url}
                  onChange={(e) => handleImageInputChange('image_url', e.target.value)}
                />
                <select
                  value={newImage.image_type}
                  onChange={(e) => handleImageInputChange('image_type', e.target.value as 'main' | 'interior' | 'food' | 'other')}
                  className="flex h-10 w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="main">Principale</option>
                  <option value="interior">Intérieur</option>
                  <option value="food">Nourriture</option>
                  <option value="other">Autre</option>
                </select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddImage}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Caractéristiques</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(feature)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Ajouter une caractéristique"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={handleAddFeature}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (newFeature.trim()) {
                      setFormData(prev => ({
                        ...prev,
                        features: [...prev.features, newFeature.trim()]
                      }))
                      setNewFeature("")
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/restaurant/${params.id}`)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 