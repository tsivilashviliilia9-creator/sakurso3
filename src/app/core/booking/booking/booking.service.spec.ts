import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { BookingService } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(BookingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request available rooms with date query params', () => {
    service.getAvailableRooms('2026-06-01T00:00:00.000Z', '2026-06-03T00:00:00.000Z').subscribe();

    const req = http.expectOne((request) => {
      return (
        request.method === 'GET' &&
        request.url === 'https://hotelbooking.stepprojects.ge/api/Rooms/GetAvailableRooms' &&
        request.params.get('from') === '2026-06-01T00:00:00.000Z' &&
        request.params.get('to') === '2026-06-03T00:00:00.000Z'
      );
    });

    req.flush([]);
  });

  it('should post room filters using the Swagger RoomFilter shape', () => {
    service
      .getFilteredRooms({
        maximumGuests: 2,
        checkIn: '2026-06-01T00:00:00.000Z',
        checkOut: '2026-06-03T00:00:00.000Z',
      })
      .subscribe();

    const req = http.expectOne('https://hotelbooking.stepprojects.ge/api/Rooms/GetFiltered');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      maximumGuests: 2,
      checkIn: '2026-06-01T00:00:00.000Z',
      checkOut: '2026-06-03T00:00:00.000Z',
    });

    req.flush([]);
  });
});
