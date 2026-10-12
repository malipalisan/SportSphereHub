import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAddFacilityComponent } from './employee-add-facility.component';

describe('EmployeeAddFacilityComponent', () => {
  let component: EmployeeAddFacilityComponent;
  let fixture: ComponentFixture<EmployeeAddFacilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeAddFacilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeAddFacilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
