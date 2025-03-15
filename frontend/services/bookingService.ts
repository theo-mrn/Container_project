import { getAuthToken } from '@/lib/auth';

interface CreateBookingData {
  restaurantId: string;
  date: string;
  time: string;
  numberOfGuests: number;
  specialRequests?: string;
}

interface Booking {
  id: number;
  restaurantId: number;
  userId: number;
  date: string;
  time: string;
  numberOfGuests: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

class BookingService {
  private baseUrl = process.env.NEXT_PUBLIC_ORDERS_API_URL || 'http://localhost:5002';

  async createBooking(data: CreateBookingData): Promise<Booking> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`${this.baseUrl}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création de la réservation');
    }

    return response.json();
  }

  async getUserBookings(): Promise<Booking[]> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`${this.baseUrl}/api/bookings/my-bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des réservations');
    }

    return response.json();
  }

  async cancelBooking(bookingId: number): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`${this.baseUrl}/api/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'annulation de la réservation');
    }
  }
}

export const bookingService = new BookingService(); 