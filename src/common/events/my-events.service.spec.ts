import { TestBed } from '@angular/core/testing';

import { MyEventsService } from './my-events.service';

describe('MyEventsService', () => {
  let service: MyEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
