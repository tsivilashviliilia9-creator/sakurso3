import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Booking } from './booking';
import { BookingService } from './booking/booking.service';

describe('Booking', () => {
  let component: Booking;
  let fixture: ComponentFixture<Booking>;
  let bookingService: {
    getCities: ReturnType<typeof vi.fn>;
    getRoomTypes: ReturnType<typeof vi.fn>;
    getHotelsByCity: ReturnType<typeof vi.fn>;
    getAvailableRooms: ReturnType<typeof vi.fn>;
    confirmBooking: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    bookingService = {
      getCities: vi.fn().mockReturnValue(of(['Tbilisi'])),
      getRoomTypes: vi.fn().mockReturnValue(of([{ id: 1, name: 'Standard' }])),
      getHotelsByCity: vi.fn().mockReturnValue(of([])),
      getAvailableRooms: vi.fn().mockReturnValue(of([])),
      confirmBooking: vi.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [Booking],
      providers: [{ provide: BookingService, useValue: bookingService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Booking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load only rooms from the selected hotel for the selected dates', () => {
    bookingService.getAvailableRooms.mockReturnValue(
      of([
        { id: 1, hotelId: 1, name: 'Room A', available: true },
        { id: 2, hotelId: 2, name: 'Room B', available: true },
      ]),
    );

    component.checkInDate.set('2026-06-01');
    component.checkOutDate.set('2026-06-03');
    component.selectHotel({
      id: 1,
      name: 'Hotel A',
      address: null,
      city: 'Tbilisi',
      featuredImage: null,
    });

    expect(bookingService.getAvailableRooms).toHaveBeenCalledWith(
      '2026-06-01T00:00:00.000Z',
      '2026-06-03T00:00:00.000Z',
    );
    expect(component.rooms()).toEqual([{ id: 1, hotelId: 1, name: 'Room A', available: true }]);
  });

  it('should send booking payload using the HotelBooking Swagger shape', () => {
    component.checkInDate.set('2026-06-01');
    component.checkOutDate.set('2026-06-03');
    component.selectedRoom.set({
      id: 7,
      name: 'Room A',
      hotelId: 1,
      pricePerNight: 120,
      available: true,
      maximumGuests: 2,
      roomTypeId: 1,
    });

    component.confirmBooking();

    expect(bookingService.confirmBooking).toHaveBeenCalledWith({
      roomID: 7,
      checkInDate: '2026-06-01T00:00:00.000Z',
      checkOutDate: '2026-06-03T00:00:00.000Z',
      totalPrice: 240,
      isConfirmed: true,
      customerName: null,
      customerId: null,
      customerPhone: null,
    });
  });
});
