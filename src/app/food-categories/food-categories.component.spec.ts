import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodCategoriesComponent } from './food-categories.component';

describe('FoodCategoriesComponent', () => {
  let component: FoodCategoriesComponent;
  let fixture: ComponentFixture<FoodCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FoodCategoriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoodCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
