import { Component, OnInit } from '@angular/core';
import { Equipment } from '../models/equipment';
import { Facility } from '../models/facility';
import { Sport } from '../models/sport';
import {  PromotionRequest } from '../models/promotion-request';
import { Order } from '../models/order';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { FacilityService } from '../services/facility.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-employee-facility-management.component',
  imports: [FormsModule, DatePipe],
  templateUrl: './employee-facility-management.component.html',
  styleUrl: './employee-facility-management.component.css',
})
export class EmployeeFacilityManagementComponent implements OnInit{

  facilityId: string = "";
  facility: Facility = new Facility();
  facilitySports: Sport[] = []

  sports: Sport[] = [];

  promotions: PromotionRequest[] = [];
  equipmentList: Equipment[] = [];
  orders: Order[] = [];

  newPromotion: PromotionRequest = new PromotionRequest();
  selectedPromotion: PromotionRequest = new PromotionRequest();

  newEquipment: Equipment = new Equipment();
  selectedEquipment: Equipment = new Equipment();

  newEquipmentImage: File | null = null
  selectedEquipmentImage: File | null = null

  reportYear: number = new Date().getFullYear()
  reportMonth: number = new Date().getMonth() + 1

  message: string = "";

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private facilityService: FacilityService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");

    if (!id) {
      this.message = "Objekat nije pronađen";
      return;
    }

    this.facilityId = id;

    this.newPromotion.facilityId = id;
    this.newEquipment.facilityId = id;

    this.loadFacility();
    this.loadSports();
    this.loadPromotions();
    this.loadEquipment();
    this.loadOrders();
  }

  loadFacility(): void {
    this.facilityService.getFacilityDetails(this.facilityId).subscribe(response => {
      if (response.status === 200) {
        this.facility = response.facility;
        this.setFacilitySports()
      }
    });
  }

  setFacilitySports(){
    this.facilitySports = this.sports.filter(sport =>
      this.facility.sportIds.includes(sport._id)
    )
  }

  loadSports(): void {
    this.facilityService.getSearchFormData().subscribe(response => {
      if (response.status === 200) {
        this.sports = response.sports;
        this.setFacilitySports()
      }
    });
  }

  loadPromotions(): void {
    this.employeeService.getPromotionsForFacility(this.facilityId).subscribe(response => {
      if (response.status === 200) {
        this.promotions = response.promotions;
      }
    });
  }

  loadEquipment(): void {
    this.employeeService.getEquipmentForFacility(this.facilityId).subscribe(response => {
      if (response.status === 200) {
        this.equipmentList = response.equipment;
      }
    });
  }

  loadOrders(): void {
    this.employeeService.getOrdersForFacility(this.facilityId).subscribe(response => {
      if (response.status === 200) {
        this.orders = response.orders;
      }
    });
  }

  createPromotion(): void {
    this.employeeService.createPromotion(this.newPromotion).subscribe(response => {
      this.message = response.message;

      if (response.status === 200) {
        this.newPromotion = new PromotionRequest();
        this.newPromotion.facilityId = this.facilityId;
        this.loadPromotions();
      }
    });
  }

  editPromotion(promotion: PromotionRequest): void {
    this.selectedPromotion = { ...promotion };
  }

  updatePromotion(): void {
    this.employeeService.updatePromotion(this.selectedPromotion).subscribe(response => {
      this.message = response.message;

      if (response.status === 200) {
        this.selectedPromotion = new PromotionRequest();
        this.loadPromotions();
      }
    });
  }

  createEquipment(): void {
    const formData = new FormData()

    formData.append("facilityId", this.newEquipment.facilityId)
    formData.append("sportId", this.newEquipment.sportId)
    formData.append("name", this.newEquipment.name)
    formData.append("price", this.newEquipment.price.toString())
    formData.append("stock", this.newEquipment.stock.toString())
    formData.append("active", this.newEquipment.active.toString())

    if(this.newEquipmentImage){
      formData.append("image", this.newEquipmentImage)
    }
    this.employeeService.createEquipment(formData).subscribe(response => {
      this.message = response.message;

      if (response.status === 200) {
        this.newEquipment = new Equipment();
        this.newEquipment.facilityId = this.facilityId;
        this.loadEquipment();
      }
    });
  }

  editEquipment(equipment: Equipment): void {
    this.selectedEquipment = { ...equipment };
  }

  updateEquipment(): void {
    const formData = new FormData()

    formData.append("sportId", this.newEquipment.sportId)
    formData.append("name", this.newEquipment.name)
    formData.append("price", this.newEquipment.price.toString())
    formData.append("stock", this.newEquipment.stock.toString())
    formData.append("active", this.newEquipment.active.toString())

    if(this.selectedEquipmentImage){
      formData.append("image", this.selectedEquipmentImage)
    }

    this.employeeService.updateEquipment(this.selectedEquipment._id, formData).subscribe(response => {
      this.message = response.message;

      if (response.status === 200) {
        this.selectedEquipment = new Equipment();
        this.loadEquipment();
      }
    });
  }

  updateOrderStatus(orderId: string, status: string): void {
    this.employeeService.updateOrderStatus(orderId, status).subscribe(response => {
      this.message = response.message;

      if (response.status === 200) {
        this.loadOrders();
      }
    });
  }

  getSportName(id: string): string {
    const sport = this.sports.find(s => s._id === id);
    return sport ? sport.name : id;
  }

  cancelPromotionEdit(){
    this.selectedPromotion = new PromotionRequest()
  }

  cancelEquipmentEdit(){
    this.selectedEquipment = new Equipment()
  }

  onNewEquipmentImageSelected(event: Event){
    const input = event.target as HTMLInputElement

    if(input.files && input.files.length > 0){
      this.newEquipmentImage = input.files[0]
    }
  }

  onSelectedEquipmentImageSelected(event: Event){
    const input = event.target as HTMLInputElement

    if(input.files && input.files.length > 0){
      this.selectedEquipmentImage = input.files[0]
    }
  }

  downloadOccupancyReport(): void {
    this.employeeService.generateOccupancyReport(
      this.facilityId,
      this.reportYear,
      this.reportMonth
    ).subscribe(blob => {
      this.downloadPdf(blob, `popunjenost-${this.reportYear}-${this.reportMonth}.pdf`)
    })
  }

  downloadEquipmentReport(): void {
    this.employeeService.generateEquipmentReport(
      this.facilityId,
      this.reportYear,
      this.reportMonth
    ).subscribe(blob => {
      this.downloadPdf(blob, `promet-opreme-${this.reportYear}-${this.reportMonth}.pdf`)
    })
  }

  downloadPdf(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()

    window.URL.revokeObjectURL(url)
  }
}
