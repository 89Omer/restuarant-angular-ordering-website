import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdressPopupComponent } from './adress-popup.component';

describe('AdressPopupComponent', () => {
  let component: AdressPopupComponent;
  let fixture: ComponentFixture<AdressPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdressPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdressPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
