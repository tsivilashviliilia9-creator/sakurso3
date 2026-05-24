import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'https://hotelbooking.stepprojects.ge';

export interface Hotel {
  id: number;
  name: string | null;
  address: string | null;
  city: string | null;
  featuredImage: string | null;
  rooms?: Room[] | null;
}

export interface RoomImage {
  id: number;
  source: string | null;
  roomId: number;
}

export interface BookedDate {
  id: number;
  date: string;
  roomId: number;
}

export interface Room {
  id: number;
  name: string | null;
  hotelId: number;
  pricePerNight: number;
  available: boolean;
  maximumGuests: number;
  roomTypeId: number;
  bookedDates?: BookedDate[] | null;
  images?: RoomImage[] | null;
}

export interface RoomType {
  id: number;
  name: string | null;
}

export interface RoomFilter {
  roomTypeId?: number | null;
  priceFrom?: number | null;
  priceTo?: number | null;
  maximumGuests?: number | null;
  checkIn?: string | null;
  checkOut?: string | null;
}

export interface BookingPayload {
  roomID: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  isConfirmed: boolean;
  customerName: string | null;
  customerId: string | null;
  customerPhone: string | null;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private http: HttpClient) {}

  getAllHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${BASE}/api/Hotels/GetAll`);
  }

  getHotelsByCity(city: string): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${BASE}/api/Hotels/GetHotels`, {
      params: { city },
    });
  }

  getHotelById(id: number): Observable<Hotel> {
    return this.http.get<Hotel>(`${BASE}/api/Hotels/GetHotel/${id}`);
  }

  getCities(): Observable<string[]> {
    return this.http.get<string[]>(`${BASE}/api/Hotels/GetCities`);
  }

  getRoomTypes(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(`${BASE}/api/Rooms/GetRoomTypes`);
  }

  getAvailableRooms(from: string, to: string): Observable<Room[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<Room[]>(`${BASE}/api/Rooms/GetAvailableRooms`, { params });
  }

  getFilteredRooms(filter: RoomFilter): Observable<Room[]> {
    return this.http.post<Room[]>(`${BASE}/api/Rooms/GetFiltered`, filter);
  }

  // Server returns plain text, not JSON — use responseType: 'text'
  confirmBookingRaw(payload: Record<string, unknown>): Observable<string> {
    return this.http.post(`${BASE}/api/Booking`, payload, { responseType: 'text' });
  }

  getMyBookings(): Observable<BookingPayload[]> {
    return this.http.get<BookingPayload[]>(`${BASE}/api/Booking`);
  }

  cancelBooking(id: number): Observable<string> {
    return this.http.delete(`${BASE}/api/Booking/${id}`, { responseType: 'text' });
  }
}