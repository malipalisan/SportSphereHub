import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FacilityService {
  private facilityUrl = `http://localhost:4000/api/facilities`

  constructor(private http: HttpClient) {}

  getHomePageStats(){
    return this.http.get<any>(`${this.facilityUrl}/getHomePageStats`)
  }

  getSearchFormData(){
    return this.http.get<any>(`${this.facilityUrl}/searchFormData`)
  }

  searchFacilities(name: string, cities: string[], sportId: string, resourceType: string){
    const data = {
      name: name,
      cities: cities,
      sportId: sportId,
      resourceType: resourceType
    }

    return this.http.post<any>(`${this.facilityUrl}/search`, data)
  }

  getFacilityDetails(id: string){
    return this.http.get<any>(`${this.facilityUrl}/details/${id}`)
  }
}
