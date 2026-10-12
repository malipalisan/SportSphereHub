import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeEditFacilityComponent } from './employee-edit-facility.component';

describe('EmployeeEditFacilityComponent', () => {
  let component: EmployeeEditFacilityComponent;
  let fixture: ComponentFixture<EmployeeEditFacilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeEditFacilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeEditFacilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
