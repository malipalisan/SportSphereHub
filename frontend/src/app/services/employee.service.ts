import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Equipment } from '../models/equipment';
import { PromotionRequest } from '../models/promotion-request';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private uri = `http://localhost:4000/api/employee`

  constructor(private http: HttpClient) {}

  updateProfile(formData: FormData){
    return this.http.put<any>(`${this.uri}/profile/${formData.get("_id")}`, formData)
  }

  getFacilitiesByOrganization(organizationId: string){
    return this.http.get<any>(`${this.uri}/facilities/${organizationId}`)
  }

  createFacility(data: any){
    return this.http.post<any>(`${this.uri}/facilities`, data)
  }

  updateFacility(id: string, data: any){
    return this.http.put<any>(`${this.uri}/facilities/${id}`, data)
  }

  getSchedule(organizationId: string){
    return this.http.get<any>(`${this.uri}/schedule/${organizationId}`)
  }

  markReservationAttended(id: string, employeeId: string){
    return this.http.put<any>(`${this.uri}/reservations/${id}/attended`, {employeeId: employeeId})
  }

  markReservationNoShow(id: string, employeeId: string){
    return this.http.put<any>(`${this.uri}/reservations/${id}/no-show`, {employeeId: employeeId})
  }

  markTrainingAttended(id: string){
    return this.http.put<any>(`${this.uri}/trainings/${id}/attended`, {})
  }

  markTrainingNoShow(id: string){
    return this.http.put<any>(`${this.uri}/trainings/${id}/no-show`, {})
  }

  getPromotionsForFacility(facilityId: string) {
    return this.http.get<any>(`${this.uri}/promotions/${facilityId}`)
  }

  createPromotion(promotion: PromotionRequest) {
      return this.http.post<any>(`${this.uri}/promotions`, promotion)
  }

  updatePromotion(promotion: PromotionRequest) {
      return this.http.put<any>(`${this.uri}/promotions/${promotion._id}`, promotion)
  }

  getEquipmentForFacility(facilityId: string) {
      return this.http.get<any>(`${this.uri}/equipment/${facilityId}`)
  }

  createEquipment(formData: FormData) {
      return this.http.post<any>(`${this.uri}/equipment`, formData)
  }

  updateEquipment(id:string, formData: FormData) {
      return this.http.put<any>(`${this.uri}/equipment/${id}`, formData)
  }

  getOrdersForFacility(facilityId: string) {
      return this.http.get<any>(`${this.uri}/orders/${facilityId}`)
  }

  updateOrderStatus(orderId: string, status: string) {
      return this.http.put<any>(`${this.uri}/orders/${orderId}/status`, {
          status: status
      })
  }

  generateOccupancyReport(facilityId: string, year: number, month: number) {
    return this.http.get(
      `${this.uri}/reports/occupancy/${facilityId}/${year}/${month}`,
      { responseType: "blob" }
    )
  }

  generateEquipmentReport(facilityId: string, year: number, month: number) {
    return this.http.get(
      `${this.uri}/reports/equipment/${facilityId}/${year}/${month}`,
      { responseType: "blob" }
    )
  }

  getCalendarEvent(resourceId: string, startDate: string, endDate: string){
    return this.http.get<any>(`${this.uri}/calendar/${resourceId}/${startDate}/${endDate}`)
  }
}
