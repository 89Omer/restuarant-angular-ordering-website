import { TestBed } from '@angular/core/testing';

import { LazyLoadService } from './lazy-load.service';

describe('LazyLoadService', () => {
  let service: LazyLoadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LazyLoadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
