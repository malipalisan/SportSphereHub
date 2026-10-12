import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AthleteTrainingComponent } from './athlete-training.component';

describe('AthleteTrainingComponent', () => {
  let component: AthleteTrainingComponent;
  let fixture: ComponentFixture<AthleteTrainingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AthleteTrainingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AthleteTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
