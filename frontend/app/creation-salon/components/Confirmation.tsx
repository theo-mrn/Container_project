"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SecureImage } from "@/components/ui/secure-image"
import { Check, AlertCircle } from "lucide-react"
import { restaurantService } from "@/services/restaurantService"
import { toast } from "sonner"

interface ConfirmationProps {
  formData: {
    informations: {
      name: string
      description: string
      cuisine: string
      location: string
      features: string[]
    }
    images: {
      image_url: string
      image_type: string
      display_order: number
    }[]
    menu: {
      categories: {
        name: string
        items: {
          name: string
          description: string
          price: number
        }[]
      }[]
    }
  }
}

export default function Confirmation({ formData }: ConfirmationProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Créer le restaurant
      const restaurant = await restaurantService.createRestaurant({
        ...formData.informations,
        images: formData.images,
      })

      // Créer les catégories et les plats
      const categoryPromises = formData.menu.categories.map(category =>
        restaurantService.createMenuCategory(restaurant.id.toString(), {
          name: category.name,
          items: category.items
        })
      )

      await Promise.all(categoryPromises)

      toast.success("Restaurant créé avec succès !")
      router.push(`/restaurant/${restaurant.id}`)
    } catch (error) {
      console.error("Erreur lors de la création du restaurant:", error)
      toast.error("Une erreur est survenue lors de la création du restaurant")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validation des données
  const validateData = () => {
    const validations = [
      {
        condition: formData.informations.name.length > 0,
        message: "Nom du restaurant renseigné",
      },
      {
        condition: formData.informations.description.length > 0,
        message: "Description renseignée",
      },
      {
        condition: formData.informations.cuisine.length > 0,
        message: "Type de cuisine renseigné",
      },
      {
        condition: formData.informations.location.length > 0,
        message: "Adresse renseignée",
      },
      {
        condition: formData.images.some(img => img.image_type === "main"),
        message: "Image principale présente",
      },
      {
        condition: formData.images.some(img => img.image_type === "interior"),
        message: "Image(s) de l'intérieur présente(s)",
      },
      {
        condition: formData.menu.categories.length > 0,
        message: "Menu avec catégories créé",
      },
    ]

    return validations
  }

  const validations = validateData()
  const isValid = validations.every(v => v.condition)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Confirmation</h2>
        <p className="text-muted-foreground mb-6">
          Vérifiez les informations de votre salon avant de finaliser la création.
        </p>
      </div>

      {/* Résumé des informations */}
      <div className="space-y-8">
        <div>
          <h3 className="font-semibold mb-2">Informations générales</h3>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="font-medium">{formData.informations.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{formData.informations.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge>{formData.informations.cuisine}</Badge>
              <span className="text-sm text-muted-foreground">{formData.informations.location}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.informations.features.map((feature, index) => (
                <Badge key={index} variant="secondary">{feature}</Badge>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Images ({formData.images.length})</h3>
          <div className="grid grid-cols-2 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative">
                <div className="relative h-32 rounded-lg overflow-hidden">
                  <SecureImage
                    src={image.image_url}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <Badge className="absolute top-2 left-2">
                  {image.image_type}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Menu</h3>
          <div className="space-y-4">
            {formData.menu.categories.map((category, index) => (
              <div key={index} className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{category.name}</h4>
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="font-medium">{item.price.toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liste de validation */}
        <div>
          <h3 className="font-semibold mb-2">Validation</h3>
          <div className="space-y-2">
            {validations.map((validation, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-2 rounded ${
                  validation.condition ? "text-green-600" : "text-red-600"
                }`}
              >
                {validation.condition ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{validation.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bouton de soumission */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? "Création en cours..." : "Créer le restaurant"}
        </Button>
      </div>
    </div>
  )
} 