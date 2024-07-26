import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectCardInfoComponent } from './connect-card-info.component';

describe('ConnectCardInfoComponent', () => {
  let component: ConnectCardInfoComponent;
  let fixture: ComponentFixture<ConnectCardInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectCardInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectCardInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
