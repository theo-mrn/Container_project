"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { bookingService } from "@/services/bookingService"
import { useToast } from "@/components/ui/use-toast"
import { getAuthToken } from "@/lib/auth"

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    numberOfGuests: "",
    specialRequests: ""
  })

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    const token = getAuthToken()
    if (!token) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour réserver une table.",
        variant: "destructive"
      })
      router.push(`/login?redirect=/restaurant/${params.id}/book`)
    }
  }, [router, params.id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Vérifier à nouveau l'authentification avant d'envoyer la requête
      const token = getAuthToken()
      if (!token) {
        router.push(`/login?redirect=/restaurant/${params.id}/book`)
        return
      }

      await bookingService.createBooking({
        restaurantId: params.id,
        date: formData.date,
        time: formData.time,
        numberOfGuests: parseInt(formData.numberOfGuests),
        specialRequests: formData.specialRequests
      })

      toast({
        title: "Réservation confirmée",
        description: "Votre table a été réservée avec succès.",
        variant: "success"
      })

      router.push("/my-bookings")
    } catch (error) {
      console.error("Error creating booking:", error)
      if (error instanceof Error && error.message.includes("Token invalide")) {
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter pour continuer.",
          variant: "destructive"
        })
        router.push(`/login?redirect=/restaurant/${params.id}/book`)
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la réservation. Veuillez réessayer.",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="flex justify-center container max-w-2xl py-8">
      <div className="mb-6">
        <Link href={`/restaurant/${params.id}`} className="flex items-center text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour au restaurant
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Réserver une table</h1>
          <p className="text-muted-foreground">
            Remplissez le formulaire ci-dessous pour réserver votre table.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Heure</Label>
              <Input
                id="time"
                name="time"
                type="time"
                required
                value={formData.time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfGuests">Nombre de personnes</Label>
            <Input
              id="numberOfGuests"
              name="numberOfGuests"
              type="number"
              required
              min="1"
              max="20"
              value={formData.numberOfGuests}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequests">Demandes spéciales (optionnel)</Label>
            <Textarea
              id="specialRequests"
              name="specialRequests"
              placeholder="Ex: allergies, préférences alimentaires, occasion spéciale..."
              value={formData.specialRequests}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Réservation en cours..." : "Confirmer la réservation"}
          </Button>
        </form>
      </motion.div>
    </div>
  )
} 