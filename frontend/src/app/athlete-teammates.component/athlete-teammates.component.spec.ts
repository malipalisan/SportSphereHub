import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AthleteTeammatesComponent } from './athlete-teammates.component';

describe('AthleteTeammatesComponent', () => {
  let component: AthleteTeammatesComponent;
  let fixture: ComponentFixture<AthleteTeammatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AthleteTeammatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AthleteTeammatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
