"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react"

interface MenuItem {
  name: string
  description: string
  price: number
}

interface MenuCategory {
  name: string
  items: MenuItem[]
}

interface MenuConfigurationProps {
  data: {
    categories: MenuCategory[]
  }
  onUpdate: (data: { categories: MenuCategory[] }) => void
}

export default function MenuConfiguration({ data, onUpdate }: MenuConfigurationProps) {
  const [newCategory, setNewCategory] = useState("")
  const [newItem, setNewItem] = useState<MenuItem & { categoryIndex: number }>({
    categoryIndex: -1,
    name: "",
    description: "",
    price: 0
  })

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCategory.trim()) {
      onUpdate({
        categories: [
          ...data.categories,
          { name: newCategory, items: [] }
        ]
      })
      setNewCategory("")
    }
  }

  const handleRemoveCategory = (index: number) => {
    const newCategories = data.categories.filter((_, i) => i !== index)
    onUpdate({ categories: newCategories })
  }

  const handleAddItem = (categoryIndex: number) => {
    if (newItem.name.trim() && newItem.price > 0) {
      const newCategories = [...data.categories]
      newCategories[categoryIndex].items.push({
        name: newItem.name,
        description: newItem.description,
        price: newItem.price
      })
      onUpdate({ categories: newCategories })
      setNewItem({
        categoryIndex: -1,
        name: "",
        description: "",
        price: 0
      })
    }
  }

  const handleRemoveItem = (categoryIndex: number, itemIndex: number) => {
    const newCategories = [...data.categories]
    newCategories[categoryIndex].items = newCategories[categoryIndex].items.filter((_, i) => i !== itemIndex)
    onUpdate({ categories: newCategories })
  }

  const handleMoveCategory = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === data.categories.length - 1)
    ) {
      return
    }

    const newCategories = [...data.categories]
    const newIndex = direction === "up" ? index - 1 : index + 1
    const temp = newCategories[index]
    newCategories[index] = newCategories[newIndex]
    newCategories[newIndex] = temp
    onUpdate({ categories: newCategories })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Configuration du menu</h2>
        <p className="text-muted-foreground mb-6">
          Créez les catégories de votre menu et ajoutez-y vos plats.
        </p>
      </div>

      {/* Ajout de catégorie */}
      <form onSubmit={handleAddCategory} className="flex gap-2">
        <Input
          placeholder="Nom de la catégorie"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <Button type="submit">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </form>

      {/* Liste des catégories */}
      <div className="space-y-6">
        {data.categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMoveCategory(categoryIndex, "up")}
                  disabled={categoryIndex === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMoveCategory(categoryIndex, "down")}
                  disabled={categoryIndex === data.categories.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveCategory(categoryIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Liste des plats */}
            <div className="space-y-4">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start justify-between gap-4 p-2 bg-muted/50 rounded">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{item.price.toFixed(2)} €</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(categoryIndex, itemIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Ajout de plat */}
            {newItem.categoryIndex === categoryIndex ? (
              <div className="mt-4 space-y-4">
                <Input
                  placeholder="Nom du plat"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
                <Textarea
                  placeholder="Description du plat"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Prix"
                    value={newItem.price || ""}
                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                  />
                  <Button onClick={() => handleAddItem(categoryIndex)}>
                    Ajouter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setNewItem({ categoryIndex: -1, name: "", description: "", price: 0 })}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setNewItem({ ...newItem, categoryIndex })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un plat
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 