import { Component, OnInit } from '@angular/core';
import { Facility } from '../models/facility';
import { Resources } from '../models/resources';
import { FacilityService } from '../services/facility.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-facility-details.component',
  imports: [],
  templateUrl: './facility-details.component.html',
  styleUrl: './facility-details.component.css',
})
export class FacilityDetailsComponent implements OnInit{

  facility: Facility = new Facility()
  resources: Resources[] = []
  message: string = ""

  constructor(
    private facilityService: FacilityService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")

    if(id){
      this.facilityService.getFacilityDetails(id).subscribe(response=>{
        if(response.status === 200){
          this.facility = response.facility
          this.resources = response.resources
        } else{
          this.message = response.message
        }
      })
    }
  }

  getResourceTypeLabel(type: string){
    if (type === "outdoor") return "Otvoreni teren";
    if (type === "indoor") return "Zatvoreni teren / hala";
    if (type === "arena") return "Hala / arena";
    return type;
  }


}
