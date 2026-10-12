import { Component, OnInit } from '@angular/core';
import { FacilityCreate } from '../models/facility-create';
import { Sport } from '../models/sport';
import { EmployeeService } from '../services/employee.service';
import { FacilityService } from '../services/facility.service';
import { Router } from '@angular/router';
import { Resources } from '../models/resources';
import { FormsModule } from '@angular/forms';
import { User } from '../models/user';

@Component({
  selector: 'app-employee-add-facility.component',
  imports: [FormsModule],
  templateUrl: './employee-add-facility.component.html',
  styleUrl: './employee-add-facility.component.css',
})
export class EmployeeAddFacilityComponent implements OnInit{
  facility: FacilityCreate = new FacilityCreate()
  sports: Sport[] = []
  message: string = ""
  jsonFacility: any = null

  constructor(
    private employeeService: EmployeeService,
    private facilityService: FacilityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const loggedIn = localStorage.getItem("loggedIn")
    if(loggedIn){
      const user = JSON.parse(loggedIn)
      this.facility.organizationId = user.organizationId
    }

    this.facilityService.getSearchFormData().subscribe(response => {
      if(response.status === 200){
        this.sports = response.sports
      }
    })
  }

  addResource() {
    const resource = new Resources()
    this.facility.resources.push(resource)
  }

  removeResource(index: number){
    this.facility.resources.splice(index, 1)
  }

  createFacility(){
    this.employeeService.createFacility(this.facility).subscribe(response => {
      this.message = response.message
      if(response.status === 200){
        this.router.navigate(["/employee"])
      }
    })
  }

  toggleSport(sportId: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
        this.facility.sportIds.push(sportId);
    } else {
        this.facility.sportIds = this.facility.sportIds.filter(id => id !== sportId);
    }
  }

  toggleResourceSport(resource: Resources, sportId: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
        resource.sportIds.push(sportId);
    } else {
        resource.sportIds = resource.sportIds.filter(id => id !== sportId);
    }
  }

  onJsonSelected(event: Event){
    const input = event.target as HTMLInputElement

    if(!input.files || input.files.length === 0 ){
      return
    }

    const file = input.files[0]
    const reader = new FileReader()

    reader.onload = () => {
      try{
        this.jsonFacility = JSON.parse(reader.result as string)
        const loggedIn = localStorage.getItem("loggedIn")
        if(loggedIn){
          const user = JSON.parse(loggedIn)
          this.jsonFacility.organizationId = user.organizationId
        }

        this.message = "JSON fajl je ucitan"
      } catch(err){
        this.message = "JSON fajl nije ispravan"
        this.jsonFacility = null
      }
    }

    reader.readAsText(file)
  }

  createFromJSON() {
    if(!this.jsonFacility){
      this.message = "Prvo odaberite JSON fajl"
      return
    }

    this.employeeService.createFacility(this.jsonFacility).subscribe(response =>{
      this.message = response.messsage
      if(response.status === 200){
        this.router.navigate(["/employee"])
      }
    })
  }

}
