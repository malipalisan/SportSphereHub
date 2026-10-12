import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AthleteService } from '../services/athlete.service';

@Component({
  selector: 'app-athlete-training.component',
  imports: [FormsModule],
  templateUrl: './athlete-training.component.html',
  styleUrl: './athlete-training.component.css',
})
export class AthleteTrainingComponent implements OnInit {
  athleteId: string = ""
  facilities: any[] = []
  sports: any[] = []
  trainers: any[] = []
  resources: any[] = []

  facilityId: string = ""
  sportId: string = ""
  trainerId: string = ""
  resourceId: string = ""
  date: string = ""
  startHour: number = 10
  duration: number = 1
  message: string = ""
  error: string = ""

  constructor(private athleteService: AthleteService) {}

  ngOnInit(){
    const loggedIn = localStorage.getItem("loggedIn")
    if(loggedIn){
      this.athleteId = JSON.parse(loggedIn)._id
    }
    this.loadData()
  }

  loadData(){
    this.athleteService.getTrainingData(this.facilityId, this.sportId).subscribe(response => {
      if(response.status === 200){
        this.facilities = response.facilities || []
        this.sports = response.sports || []
        this.trainers = response.trainers || []
        this.resources = response.resources || []
      } else {
        this.error = response.message
      }
    })
  }

  chooseTrainer(trainer: any){
    this.trainerId = trainer._id
    this.facilityId = trainer.facilityId?._id || trainer.facilityId
    this.loadData()
  }

  bookTraining(){
    const startAt = this.localDateTime(this.date, Number(this.startHour))
    const endAt = this.localDateTime(this.date, Number(this.startHour) + Number(this.duration))

    this.athleteService.bookTraining({
      athleteId: this.athleteId,
      trainerId: this.trainerId,
      facilityId: this.facilityId,
      resourceId: this.resourceId,
      sportId: this.sportId,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString()
    }).subscribe(response => {
      if(response.status === 200){
        this.message = response.message
        this.error = ""
      } else {
        this.error = response.message
        this.message = ""
      }
    })
  }

  private localDateTime(date: string, hour: number){
    const [year, month, day] = date.split("-").map(Number)
    return new Date(year, month - 1, day, hour, 0, 0, 0)
  }
}
