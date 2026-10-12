import { Component, OnInit } from '@angular/core';
import { FacilityCreate } from '../models/facility-create';
import { Sport } from '../models/sport';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { FacilityService } from '../services/facility.service';
import { Resources } from '../models/resources';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-edit-facility.component',
  imports: [FormsModule],
  templateUrl: './employee-edit-facility.component.html',
  styleUrl: './employee-edit-facility.component.css',
})
export class EmployeeEditFacilityComponent implements OnInit{
  facilityId: string = ""
  facility: FacilityCreate = new FacilityCreate()
  sports: Sport[] = []
  message: string = ""

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private facilityService: FacilityService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")
    if(!id){
      this.message = "Objekat nije pronadjen"
      return
    }

    this.facilityId = id

    this.facilityService.getSearchFormData().subscribe(response => {
      if(response.status === 200){
        this.sports = response.sports
      }
    })

    this.facilityService.getFacilityDetails(this.facilityId).subscribe(response => {
      if(response.status === 200){
        this.facility = response.facility
        this.facility.resources = response.resources
      } else {
        this.message = response.message
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

  toggleSport(sportId: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
        this.facility.sportIds.push(sportId);
    } else {
        this.facility.sportIds = this.facility.sportIds.filter(id => id !== sportId);
    }
  }

  isSportChecked(sportId: string){
    return this.facility.sportIds.includes(sportId)
  }

  toggleResourceSport(resource: Resources, sportId: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
        resource.sportIds.push(sportId);
    } else {
        resource.sportIds = resource.sportIds.filter(id => id !== sportId);
    }
  }

  isResourceSportChecked(resource: Resources, sportId: string){
    return resource.sportIds.includes(sportId)
  }


  save(){
    this.employeeService.updateFacility(this.facilityId, this.facility).subscribe(response => {
      this.message = response.message

      if(response.status ===200){
        this.router.navigate(["/employee"])
      }
    })

  }

  cancel(){
    this.router.navigate(["/employee"])
  }


}
