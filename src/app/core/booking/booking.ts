import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService, Hotel, Room } from './booking/booking.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking implements OnInit {
  location = signal('');
  checkInDate = signal('');
  checkOutDate = signal('');

  cities = signal<string[]>([]);
  hotels = signal<Hotel[]>([]);
  selectedHotel = signal<Hotel | null>(null);
  rooms = signal<Room[]>([]);
  selectedRoom = signal<Room | null>(null);
  roomTypes = signal<Record<number, string>>({});

  isLoadingHotels = signal(false);
  isLoadingRooms = signal(false);
  hasSearched = signal(false);
  bookingSuccess = signal(false);
  errorMessage = signal('');

  constructor(private svc: BookingService, private router: Router) {}

  ngOnInit() {
    this.svc.getRoomTypes().subscribe({
      next: (types) => {
        const namesById: Record<number, string> = {};
        types.forEach((type) => {
          namesById[type.id] = type.name || 'Standard Room';
        });
        this.roomTypes.set(namesById);
      },
      error: () => {},
    });

    this.svc.getCities().subscribe({
      next: (cities) => this.cities.set(cities),
      error: () => {},
    });
  }

  onSearch(): void {
    if (!this.location() || !this.checkInDate() || !this.checkOutDate()) {
      this.errorMessage.set('გთხოვთ შეავსოთ ყველა ველი');
      return;
    }

    if (this.checkOutDate() <= this.checkInDate()) {
      this.errorMessage.set('გამოსვლის თარიღი შესვლის შემდეგ უნდა იყოს');
      return;
    }

    this.errorMessage.set('');
    this.isLoadingHotels.set(true);
    this.hasSearched.set(false);
    this.hotels.set([]);
    this.selectedHotel.set(null);
    this.selectedRoom.set(null);

    this.svc.getHotelsByCity(this.location()).subscribe({
      next: (hotels) => {
        this.hotels.set(hotels);
        this.hasSearched.set(true);
        this.isLoadingHotels.set(false);
      },
      error: () => {
        this.errorMessage.set('სასტუმროების ჩატვირთვა ვერ მოხერხდა');
        this.isLoadingHotels.set(false);
      },
    });
  }

  selectHotel(hotel: Hotel): void {
    this.selectedHotel.set(hotel);
    this.selectedRoom.set(null);
    this.rooms.set([]);
    this.isLoadingRooms.set(true);

    this.svc.getHotelById(hotel.id).subscribe({
      next: (fullHotel) => {
        const rooms = fullHotel.rooms || [];
        if (rooms.length > 0) {
          this.rooms.set(rooms.filter((room) => this.isRoomAvailableForDates(room)));
          this.isLoadingRooms.set(false);
        } else {
          this.loadRoomsFromAvailability(hotel.id);
        }
      },
      error: () => this.loadRoomsFromAvailability(hotel.id),
    });
  }

  private loadRoomsFromAvailability(hotelId: number): void {
    this.svc
      .getAvailableRooms(this.toApiDate(this.checkInDate()), this.toApiDate(this.checkOutDate()))
      .subscribe({
        next: (rooms) => {
          const filtered = rooms.filter((r) => String(r.hotelId) === String(hotelId));
          if (filtered.length > 0) {
            this.rooms.set(filtered);
            this.isLoadingRooms.set(false);
          } else if (rooms.length > 0) {
            this.rooms.set(rooms);
            this.isLoadingRooms.set(false);
          } else {
            this.loadRoomsFromFiltered(hotelId);
          }
        },
        error: () => this.loadRoomsFromFiltered(hotelId),
      });
  }

  private loadRoomsFromFiltered(hotelId: number): void {
    this.svc.getFilteredRooms({
      checkIn: this.toApiDate(this.checkInDate()),
      checkOut: this.toApiDate(this.checkOutDate()),
    }).subscribe({
      next: (rooms) => {
        const filtered = rooms.filter((r) => String(r.hotelId) === String(hotelId));
        this.rooms.set(filtered.length > 0 ? filtered : rooms);
        this.isLoadingRooms.set(false);
      },
      error: () => {
        this.errorMessage.set('ოთახების ჩატვირთვა ვერ მოხერხდა');
        this.isLoadingRooms.set(false);
      },
    });
  }

  selectRoom(room: Room): void {
    this.selectedRoom.set(room);
  }

  confirmBooking(): void {
    const room = this.selectedRoom();
    if (!room) return;

    // Omit null optional fields entirely — server rejects them as invalid.
    // Use camelCase roomId (C# JSON serializer default).
    // Send plain date strings, not ISO with time, to avoid timezone shift issues.
    const payload = {
      roomId: room.id,
      checkInDate: this.checkInDate(),
      checkOutDate: this.checkOutDate(),
      totalPrice: this.getTotalPrice(),
      isConfirmed: true,
    };

    console.log('[booking] POST /api/Booking payload →', JSON.stringify(payload));

    this.svc.confirmBookingRaw(payload).subscribe({
      next: (res) => {
        console.log('[booking] success →', res);
        this.bookingSuccess.set(true);
        this.selectedRoom.set(null);
        setTimeout(() => this.router.navigate(['/cart']), 1500);
      },
      error: (err) => {
        // Print the full server response so we can read the exact validation error
        console.error('[booking] error status →', err?.status);
        console.error('[booking] error body  →', err?.error);
        const msg =
          err?.error?.message ||
          err?.error?.title ||
          (typeof err?.error === 'string' ? err.error : null) ||
          JSON.stringify(err?.error) ||
          'დაჯავშნა ვერ მოხერხდა';
        this.errorMessage.set(msg);
      },
    });
  }

  getRoomTypeName(room: Room): string {
    return this.roomTypes()[room.roomTypeId] || 'Standard Room';
  }

  getTotalNights(): number {
    if (!this.checkInDate() || !this.checkOutDate()) return 1;
    return Math.max(
      1,
      Math.round(
        (new Date(this.checkOutDate()).getTime() - new Date(this.checkInDate()).getTime()) /
          86400000,
      ),
    );
  }

  getTotalPrice(): number {
    const room = this.selectedRoom();
    if (!room) return 0;
    return Math.round(room.pricePerNight * this.getTotalNights());
  }

  backToSearch(): void {
    this.hasSearched.set(false);
    this.hotels.set([]);
    this.selectedHotel.set(null);
    this.selectedRoom.set(null);
    this.bookingSuccess.set(false);
    this.errorMessage.set('');
  }

  backToHotels(): void {
    this.selectedHotel.set(null);
    this.selectedRoom.set(null);
    this.rooms.set([]);
    this.errorMessage.set('');
  }

  toApiDate(date: string): string {
    return `${date}T00:00:00.000Z`;
  }

  private isRoomAvailableForDates(room: Room): boolean {
    const bookedDates = room.bookedDates || [];
    if (!bookedDates.length) return room.available;

    const checkIn = new Date(this.checkInDate()).getTime();
    const checkOut = new Date(this.checkOutDate()).getTime();

    return (
      room.available &&
      !bookedDates.some((bookedDate) => {
        const date = new Date(bookedDate.date).getTime();
        return date >= checkIn && date < checkOut;
      })
    );
  }
}