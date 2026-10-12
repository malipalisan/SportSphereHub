import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeFacilityManagementComponent } from './employee-facility-management.component';

describe('EmployeeFacilityManagementComponent', () => {
  let component: EmployeeFacilityManagementComponent;
  let fixture: ComponentFixture<EmployeeFacilityManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeFacilityManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeFacilityManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
