import { Component, OnInit } from '@angular/core';
import { User } from '../models/user';
import { AdminService } from '../services/admin.service';
import { Router } from '@angular/router';
import { Facility } from '../models/facility';
import { Trainer } from '../models/trainer';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin.component',
  imports: [FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit{

  users: User[] = []
  selectedUser: User = new User()
  registrationRequests: User[] = []
  facilityRequests: Facility[] = []
  trainers: Trainer[] = []
  newSportName: string = ""

  message: string = ""

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers()
    this.loadRegistrationRequests()
    this.loadFacilityRequests()
    this.loadTrainers()
  }

  loadUsers(){
    this.adminService.getAllUsers().subscribe(response => {
      if(response.status === 200){
        this.users = response.users
      }
    })
  }

  editUser(id: string){
    this.router.navigate(["/admin/edit-user", id])
  }

  deleteUser(id: string){
    this.adminService.deleteUser(id).subscribe(response => {
      this.message = response.message
      if(response.status === 200){
        this.loadUsers()
        this.loadRegistrationRequests()
      }
    })
  }

  loadRegistrationRequests() {
    this.adminService.getRegistrationRequests().subscribe(response => {
        if (response.status === 200) {
            this.registrationRequests = response.users
        }
    })
  }

  approveRegistrationRequest(id: string) {
      this.adminService.approveRegistrationRequest(id).subscribe(response => {
          this.message = response.message

          if (response.status === 200) {
              this.loadRegistrationRequests()
              this.loadUsers()
          }
      })
  }

  rejectRegistrationRequest(id: string) {
      this.adminService.rejectRegistrationRequest(id).subscribe(response => {
          this.message = response.message

          if (response.status === 200) {
              this.loadRegistrationRequests()
              this.loadUsers()
          }
      })
  }

  loadFacilityRequests() {
      this.adminService.getFacilityRequests().subscribe(response => {
          if (response.status === 200) {
              this.facilityRequests = response.facilities
          }
      })
  }

  approveFacility(id: string) {
    this.adminService.approveFacility(id).subscribe(response => {
        this.message = response.message

        if (response.status === 200) {
            this.loadFacilityRequests()
        }
    })
  }

  rejectFacility(id: string) {
    this.adminService.rejectFacility(id).subscribe(response => {
        this.message = response.message

        if (response.status === 200) {
            this.loadFacilityRequests()
        }
    })
  }

  loadTrainers() {
    this.adminService.getAllTrainers().subscribe(response => {
      if (response.status === 200) {
        this.trainers = response.trainers
      }
    })
  }

  deactivateTrainer(id: string) {
    this.adminService.deactivateTrainer(id).subscribe(response => {
      this.message = response.message

      if (response.status === 200) {
        this.loadTrainers()
      }
    })
  }

  addSport() {
    this.adminService.addSport(this.newSportName).subscribe(response => {
      this.message = response.message

      if (response.status === 200) {
        this.newSportName = ""
      }
    })
  }


}
