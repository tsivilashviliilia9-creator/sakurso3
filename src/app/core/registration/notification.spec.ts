import { TestBed } from '@angular/core/testing';

import { NotificationService } from './notification';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store and clear notification messages', () => {
    service.success('Saved');

    expect(service.message()).toEqual({ text: 'Saved', type: 'success' });

    service.clear();

    expect(service.message()).toBeNull();
  });
});
