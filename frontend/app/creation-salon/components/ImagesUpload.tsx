"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SecureImage } from "@/components/ui/secure-image"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface Image {
  image_url: string
  image_type: "main" | "interior" | "food" | "other"
  display_order: number
}

interface ImagesUploadProps {
  data: Image[]
  onUpdate: (images: Image[]) => void
}

export default function ImagesUpload({ data, onUpdate }: ImagesUploadProps) {
  const [newImage, setNewImage] = useState<Image>({
    image_url: "",
    image_type: "main",
    display_order: 0
  })

  const handleImageInputChange = (field: keyof Image, value: string) => {
    setNewImage(prev => ({
      ...prev,
      [field]: value,
      display_order: prev.display_order || data.length + 1
    }))
  }

  const handleAddImage = () => {
    if (newImage.image_url.trim()) {
      onUpdate([...data, { ...newImage, display_order: data.length + 1 }])
      setNewImage({
        image_url: "",
        image_type: "main",
        display_order: 0
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = data.filter((_, i) => i !== index)
    // Réorganiser les display_order
    const updatedImages = newImages.map((img, i) => ({
      ...img,
      display_order: i + 1
    }))
    onUpdate(updatedImages)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Images du salon</h2>
        <p className="text-muted-foreground mb-6">
          Ajoutez des images pour présenter votre salon. Commencez par une image principale,
          puis ajoutez des photos de l'intérieur et des plats.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {data.map((image, index) => (
          <div key={index} className="relative group">
            <div className="relative h-48 rounded-lg overflow-hidden">
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
          onChange={(e) => handleImageInputChange("image_url", e.target.value)}
        />
        <select
          value={newImage.image_type}
          onChange={(e) => handleImageInputChange("image_type", e.target.value as Image["image_type"])}
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
          disabled={!newImage.image_url.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>Types d'images requis :</p>
        <ul className="list-disc list-inside mt-2">
          <li>Une image principale (obligatoire)</li>
          <li>Au moins une image de l'intérieur</li>
          <li>Au moins une image des plats</li>
        </ul>
      </div>
    </div>
  )
} 