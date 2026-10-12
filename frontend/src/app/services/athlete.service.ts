import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AthleteService {
  private uri = `http://localhost:4000/api/athlete`

  constructor(private http: HttpClient) {}

  getProfileData(id: string){
    return this.http.get<any>(`${this.uri}/profile/${id}`)
  }

  updateProfile(formData: FormData){
    return this.http.put<any>(`${this.uri}/profile/${formData.get("_id")}`, formData)
  }

  cancelReservation(id: string, athleteId: string){
    return this.http.put<any>(`${this.uri}/reservations/${id}/cancel`, {athleteId: athleteId})
  }

  confirmReservation(id: string, athleteId: string){
    return this.http.put<any>(`${this.uri}/reservations/${id}/confirm`, {athleteId: athleteId})
  }

  getSearchData(){
    return this.http.get<any>(`${this.uri}/search-data`)
  }

  searchFacilities(data: any){
    return this.http.post<any>(`${this.uri}/search`, data)
  }

  getFacilityDetails(id: string, athleteId: string = ""){
    return this.http.get<any>(`${this.uri}/facilities/${id}`, {
      params: {athleteId: athleteId}
    })
  }

  createFacilityReview(facilityId: string, data: any){
    return this.http.post<any>(`${this.uri}/facilities/${facilityId}/reviews`, data)
  }

  getResourceEvents(resourceId: string, from: string, to: string){
    return this.http.get<any>(`${this.uri}/calendar/${resourceId}/${from}/${to}`)
  }

  createReservation(data: any){
    return this.http.post<any>(`${this.uri}/reservations`, data)
  }

  getTeammateAds(athleteId: string){
    return this.http.get<any>(`${this.uri}/teammates/${athleteId}`)
  }

  createTeammateAd(data: any){
    return this.http.post<any>(`${this.uri}/teammates`, data)
  }

  requestJoinAd(id: string, athleteId: string){
    return this.http.put<any>(`${this.uri}/teammates/${id}/join`, {athleteId: athleteId})
  }

  updateJoinRequest(id: string, athleteId: string, requestAthleteId: string, status: string){
    return this.http.put<any>(`${this.uri}/teammates/${id}/request`, {
      athleteId: athleteId,
      requestAthleteId: requestAthleteId,
      status: status
    })
  }

  closeTeammateAd(id: string, athleteId: string){
    return this.http.put<any>(`${this.uri}/teammates/${id}/close`, {athleteId: athleteId})
  }

  getTrainingData(facilityId: string, sportId: string){
    return this.http.get<any>(`${this.uri}/training`, {
      params: {
        facilityId: facilityId,
        sportId: sportId
      }
    })
  }

  bookTraining(data: any){
    return this.http.post<any>(`${this.uri}/training`, data)
  }

  getShopData(sportId: string){
    return this.http.get<any>(`${this.uri}/shop`, {
      params: {sportId: sportId}
    })
  }

  createOrder(data: any){
    return this.http.post<any>(`${this.uri}/orders`, data)
  }

  cancelOrder(id: string, athleteId: string){
    return this.http.put<any>(`${this.uri}/orders/${id}/cancel`, {athleteId: athleteId})
  }
}
