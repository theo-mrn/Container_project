"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Calendar, Clock, Users, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Booking {
  id: number
  restaurant_name: string
  restaurant_location: string
  date: string
  time: string
  number_of_guests: number
  special_requests: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/auth/login')
      return
    }

    const fetchBookings = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('http://localhost:5002/api/bookings/my-bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch bookings')
        }

        const data = await response.json()
        setBookings(data)
      } catch (error) {
        console.error('Error fetching bookings:', error)
        setError('Une erreur est survenue lors du chargement des réservations')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [router])

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`http://localhost:5002/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to cancel booking')
      }

      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' }
          : booking
      ))

      toast.success('Réservation annulée avec succès')
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Erreur lors de l\'annulation de la réservation')
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

  if (error) {
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
        </div>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h2 className="text-xl font-bold">Aucune réservation</h2>
          <p className="text-muted-foreground">Vous n'avez pas encore de réservation</p>
          <Button onClick={() => router.push('/restaurants')}>
            Voir les restaurants
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Mes réservations</h1>
      <div className="grid gap-6">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="border rounded-lg p-6 bg-card"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{booking.restaurant_name}</h2>
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {booking.restaurant_location}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                booking.status === 'confirmed' 
                  ? 'bg-green-100 text-green-800'
                  : booking.status === 'cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {booking.status === 'confirmed' 
                  ? 'Confirmée'
                  : booking.status === 'cancelled'
                  ? 'Annulée'
                  : 'En attente'}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{format(new Date(booking.date), "PPP", { locale: fr })}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{booking.time}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <span>{booking.number_of_guests} {booking.number_of_guests > 1 ? 'personnes' : 'personne'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-muted-foreground">
                  {format(new Date(booking.created_at), "PPP", { locale: fr })}
                </span>
              </div>
            </div>

            {booking.special_requests && (
              <div className="mb-4">
                <h3 className="font-medium mb-1">Demandes spéciales</h3>
                <p className="text-muted-foreground">{booking.special_requests}</p>
              </div>
            )}

            {booking.status === 'pending' && (
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => handleCancelBooking(booking.id)}
                >
                  Annuler la réservation
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 