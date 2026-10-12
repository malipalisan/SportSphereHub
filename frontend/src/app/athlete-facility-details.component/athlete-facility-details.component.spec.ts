import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AthleteFacilityDetailsComponent } from './athlete-facility-details.component';

describe('AthleteFacilityDetailsComponent', () => {
  let component: AthleteFacilityDetailsComponent;
  let fixture: ComponentFixture<AthleteFacilityDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AthleteFacilityDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AthleteFacilityDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
