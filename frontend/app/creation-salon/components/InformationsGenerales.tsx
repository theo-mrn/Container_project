"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface InformationsGeneralesProps {
  data: {
    name: string
    description: string
    cuisine: string
    location: string
    features: string[]
  }
  onUpdate: (data: {
    name: string
    description: string
    cuisine: string
    location: string
    features: string[]
  }) => void
}

export default function InformationsGenerales({ data, onUpdate }: InformationsGeneralesProps) {
  const [newFeature, setNewFeature] = useState("")

  const handleInputChange = (field: keyof typeof data, value: string) => {
    onUpdate({
      ...data,
      [field]: value
    })
  }

  const handleAddFeature = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newFeature.trim()) {
      e.preventDefault()
      if (!data.features.includes(newFeature.trim())) {
        onUpdate({
          ...data,
          features: [...data.features, newFeature.trim()]
        })
      }
      setNewFeature("")
    }
  }

  const handleRemoveFeature = (feature: string) => {
    onUpdate({
      ...data,
      features: data.features.filter(f => f !== feature)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
        <p className="text-muted-foreground mb-6">
          Renseignez les informations de base de votre salon.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Nom du salon
          </label>
          <Input
            placeholder="Le nom de votre salon"
            value={data.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Description
          </label>
          <Textarea
            placeholder="Décrivez votre salon..."
            value={data.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Type de cuisine
          </label>
          <Input
            placeholder="Ex: Française, Italienne, Japonaise..."
            value={data.cuisine}
            onChange={(e) => handleInputChange("cuisine", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Adresse
          </label>
          <Input
            placeholder="Adresse complète du salon"
            value={data.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Caractéristiques
          </label>
          <Input
            placeholder="Appuyez sur Entrée pour ajouter une caractéristique"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={handleAddFeature}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {data.features.map((feature, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {feature}
                <button
                  onClick={() => handleRemoveFeature(feature)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 