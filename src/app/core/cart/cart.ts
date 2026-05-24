import { Component, OnInit, signal } from '@angular/core';
import { BookingService } from '../booking/booking/booking.service';
import { BookingPayload } from '../booking/booking/booking.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


export interface BookingItem extends BookingPayload {
  id: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  bookings = signal<BookingItem[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  cancellingId = signal<number | null>(null);
  cancelSuccessId = signal<number | null>(null);

  constructor(private svc: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.svc.getMyBookings().subscribe({
      next: (data) => {
        const sorted = (data as BookingItem[]).sort((a, b) => b.id - a.id);
        this.bookings.set(sorted);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('დაჯავშნების ჩატვირთვა ვერ მოხერხდა.');
        this.isLoading.set(false);
      },
    });
  }

  cancelBooking(id: number): void {
    this.cancellingId.set(id);

    this.svc.cancelBooking(id).subscribe({
      next: () => {
        this.cancelSuccessId.set(id);
        this.cancellingId.set(null);
        // Remove from list after short delay so user sees success state
        setTimeout(() => {
          this.bookings.set(this.bookings().filter((b) => b.id !== id));
          this.cancelSuccessId.set(null);
        }, 800);
      },
      error: () => {
        this.errorMessage.set('გაუქმება ვერ მოხერხდა. სცადეთ მოგვიანებით.');
        this.cancellingId.set(null);
      },
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  }

  getNights(checkIn: string, checkOut: string): number {
    const a = new Date(checkIn).getTime();
    const b = new Date(checkOut).getTime();
    return Math.max(1, Math.round((b - a) / 86400000));
  }
}