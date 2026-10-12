import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AthleteService } from '../services/athlete.service';

@Component({
  selector: 'app-athlete-search.component',
  imports: [FormsModule],
  templateUrl: './athlete-search.component.html',
  styleUrl: './athlete-search.component.css',
})
export class AthleteSearchComponent implements OnInit {
  name: string = ""
  cities: string[] = []
  sportId: string = ""
  resourceType: string = ""
  onlyFreeToday: boolean = false

  availableCities: string[] = []
  sports: any[] = []
  resourceTypes: string[] = []
  results: any[] = []
  message: string = ""

  constructor(
    private athleteService: AthleteService,
    private router: Router
  ) {}

  ngOnInit(){
    this.athleteService.getSearchData().subscribe(response => {
      if(response.status === 200){
        this.availableCities = response.cities || []
        this.sports = response.sports || []
        this.resourceTypes = response.resourceTypes || []
      }
    })
  }

  search(){
    this.athleteService.searchFacilities({
      name: this.name,
      cities: this.cities,
      sportId: this.sportId,
      resourceType: this.resourceType,
      onlyFreeToday: this.onlyFreeToday
    }).subscribe(response => {
      if(response.status === 200){
        this.results = response.results || []
        this.message = this.results.length === 0 ? "Nema rezultata za zadate kriterijume." : ""
      } else {
        this.message = response.message
      }
    })
  }

  openDetails(facilityId: string){
    this.router.navigate(["/athlete/facility", facilityId])
  }
}
