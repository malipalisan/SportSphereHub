import { Component, inject, OnInit } from '@angular/core';
import { Facility } from '../models/facility';
import { FacilityService } from '../services/facility.service';
import { Promotions } from '../models/promotions';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Sport } from '../models/sport';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-homepage.component',
  imports: [DatePipe, FormsModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css',
})
export class HomepageComponent implements OnInit{

  activeFacilitiesCount: number = 0
  topFacilities: Facility[] = []
  promotions: Promotions[] = []

  name: string = ""
  selectedCities: string[] = []
  selectedSportId: string = ""
  selectedResourceType: string = ""

  cities: string[] = []
  sports: Sport[] = []
  resourceTypes: string[] = []

  facilities: Facility[] = []

  message: string = ""

  sortColumn : string = ""
  sortDirection: string = "asc"

  constructor(private facilityService: FacilityService) {}
  private router = inject(Router)

  ngOnInit(): void {
    this.facilityService.getHomePageStats().subscribe(response=>{
      if(response.status == 200){
        this.activeFacilitiesCount = response.activeFacilitiesCount
        this.topFacilities = response.topFacilities
        this.promotions = response.promotions
      }
    })

    this.facilityService.getSearchFormData().subscribe(response=>{
      if(response.status === 200){
        this.cities = response.cities
        this.sports = response.sports
        this.resourceTypes = response.resourceTypes
      }
    })
  }

  search() {
    this.facilityService.searchFacilities(this.name, this.selectedCities, this.selectedSportId, this.selectedResourceType).subscribe(response=>{
      if(response.status === 200){
        this.facilities = response.facilities
        if(this.facilities.length ===0){
          this.message = "Nema objekata koji odgovaraju pretrazi"
        } else{
          this.message = ""
        }
      } else {
        this.message = response.message
      }
    })
  }

  sortFacilities(column: string){
    if(this.sortColumn===column){
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc"
    } else{
      this.sortColumn = column
      this.sortDirection = "asc"
    }

    this.facilities.sort((a: any, b: any)=> {
      let valueA = a[column]
      let valueB = b[column]

      if(valueA < valueB) {
        return this.sortDirection === "asc" ? -1 : 1
      }

      if(valueA > valueB) {
        return this.sortDirection === "asc" ? 1 : -1
      }

      return 0
    })
  }

  details(id: string){
    this.router.navigate(["/facility-details", id])
  }
  getSportsText(facility: Facility){
    let names: string[] = []

    facility.sportIds.forEach(id => {
      let sport = this.sports.find(s => s._id === id)
      if(sport){
        names.push(sport.name)
      }
    })

    return names.join(" ")
  }

  sortBySport(){
    if(this.sortColumn === "sport"){
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc"
    } else {
      this.sortColumn = "sport"
      this.sortDirection = "asc"
    }

    this.facilities.sort((a, b) => {
      const valueA = this.getSportsText(a);
      const valueB = this.getSportsText(b);

      if (valueA < valueB) {
        return this.sortDirection === "asc" ? -1 : 1;
      }

      if (valueA > valueB) {
        return this.sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });
  }
}
