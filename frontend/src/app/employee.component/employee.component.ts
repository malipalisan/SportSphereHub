import { Component, OnInit } from '@angular/core';
import { User } from '../models/user';
import { EmployeeFacilityRow } from '../models/employee-facility-row';
import { EmployeeService } from '../services/employee.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Reservation } from '../models/reservation';
import { TrainingSession } from '../models/trainingSession';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-employee.component',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css',
})
export class EmployeeComponent implements OnInit{

  user : User = new User()
  facilities: EmployeeFacilityRow[] = []
  employeeId: string = ""
  reservations: Reservation[] = []
  trainings: TrainingSession[] = []

  message: string = ""

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const loggedIn = localStorage.getItem("loggedIn")

    if(loggedIn){
      this.user = JSON.parse(loggedIn)
      this.employeeId = this.user._id
      if(this.user.organizationId){
        this.loadSchedule(this.user.organizationId)
      }
    } else {
      this.message = "Niste ulogovani"
      return
    }

    if(this.user.organizationId){
      this.loadFacilities(this.user.organizationId)
    }
  }

  loadFacilities(organizationId: string){
    this.employeeService.getFacilitiesByOrganization(organizationId).subscribe(response => {
      if(response.status === 200){
        this.facilities = response.facilities
      }
    })
  }

  editProfile(){
    this.router.navigate(["/employee-edit-profile"])
  }

  generateResourceTypeLabel(type: string){
    if(type === "outdoor") return "Otvoreni teren"
    if(type === "indoor") return "Zatvoreni teren / hala"
    if(type === "arena") return "Dvorana"
    return type
  }

  editFacility(id: string){
    this.router.navigate(["/employee-edit-facility", id])
  }

  loadSchedule(organizationId: string){
    this.employeeService.getSchedule(organizationId).subscribe(response => {
      if(response.status === 200){
        this.reservations = response.reservations
        this.trainings = response.trainings
      }
    })
  }

  canMarkAttendance(startAt: Date, status: string){
    if(status === "attended" || status === "no_show"){
      return false
    }

    const now = new Date()
    const start = new Date(startAt)
    const limit = new Date(start.getTime() - 10*60*1000)

    return now <= limit
  }

  confirmReservation(id: string){
    this.employeeService.markReservationAttended(id, this.employeeId).subscribe(response => {
      this.message = response.message
      this.loadSchedule(this.user.organizationId!)
    })
  }

  noShowReservation(id: string){
    this.employeeService.markReservationNoShow(id, this.employeeId).subscribe(response => {
      this.message = response.message
      this.loadSchedule(this.user.organizationId!)
    })
  }

  confirmTraining(id: string){
    this.employeeService.markTrainingAttended(id).subscribe(response=> {
      this.message = response.message
      this.loadSchedule(this.user.organizationId!)
    })
  }

  noShowTraining(id: string){
    this.employeeService.markTrainingNoShow(id).subscribe(response=> {
      this.message = response.message
      this.loadSchedule(this.user.organizationId!)
    })
  }

  manage(id: string){
    this.router.navigate(["/employee-facility-management", id])
  }

}
