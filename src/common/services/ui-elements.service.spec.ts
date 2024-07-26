import { TestBed } from '@angular/core/testing';

import { UiElementsService } from './ui-elements.service';

describe('UiElementsService', () => {
  let service: UiElementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiElementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
