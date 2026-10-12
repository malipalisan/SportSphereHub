import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AthleteShopComponent } from './athlete-shop.component';

describe('AthleteShopComponent', () => {
  let component: AthleteShopComponent;
  let fixture: ComponentFixture<AthleteShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AthleteShopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AthleteShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
