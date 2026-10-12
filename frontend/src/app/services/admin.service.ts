import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private uri = `http://localhost:4000/api/admin`

  constructor(private http: HttpClient) {}

  getAllUsers(){
    return this.http.get<any>(`${this.uri}/users`)
  }

  updateUser(user: User){
    return this.http.put<any>(`${this.uri}/users/${user._id}`, user)
  }

  deleteUser(id: string){
    return this.http.delete<any>(`${this.uri}/users/${id}`)
  }

  getUserById(id: string){
    return this.http.get<any>(`${this.uri}/users/${id}`)
  }

  getRegistrationRequests() {
    return this.http.get<any>(`${this.uri}/registration-requests`)
  }

  approveRegistrationRequest(id: string) {
      return this.http.put<any>(`${this.uri}/registration-requests/${id}/approve`, {})
  }

  rejectRegistrationRequest(id: string) {
      return this.http.put<any>(`${this.uri}/registration-requests/${id}/reject`, {})
  }

  getFacilityRequests() {
    return this.http.get<any>(`${this.uri}/facility-requests`)
  }

  approveFacility(id: string) {
      return this.http.put<any>(
          `${this.uri}/facility-requests/${id}/approve`,
          {}
      )
  }

  rejectFacility(id: string) {
      return this.http.put<any>(
          `${this.uri}/facility-requests/${id}/reject`,
          {}
      )
  }

  getAllTrainers() {
    return this.http.get<any>(`${this.uri}/trainers`)
  }

  deactivateTrainer(id: string) {
    return this.http.put<any>(`${this.uri}/trainers/${id}/deactivate`, {})
  }

  addSport(name: string) {
    return this.http.post<any>(`${this.uri}/sports`, { name })
  }
}
