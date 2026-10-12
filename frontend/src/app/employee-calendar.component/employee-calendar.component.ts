import { Component, OnInit } from '@angular/core';
import { Facility } from '../models/facility';
import { Resources } from '../models/resources';
import { CalendarEvent } from '../models/calendarEvent';
import { EmployeeService } from '../services/employee.service';
import { FacilityService } from '../services/facility.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-employee-calendar.component',
  imports: [FormsModule, DatePipe],
  templateUrl: './employee-calendar.component.html',
  styleUrl: './employee-calendar.component.css',
})
export class EmployeeCalendarComponent implements OnInit{
  facilities: Facility[] = []
  resources: Resources[] = []
  events: CalendarEvent[] = []
  selectedFacilityId: string = ""
  selectedResourceId: string = ""

  weekStart = this.startOfWeek(new Date())
  days: Date[] = []

  startHour = 8
  endHour = 22
  hours = this.buildHours()
  timeLabels = this.buildTimeLabels()
  hourHeight = 48
  calendarHeight = (this.endHour - this.startHour) * this.hourHeight

  constructor(private employeeService: EmployeeService, private facilityService: FacilityService) {}

  ngOnInit() {
    this.buildWeek()

    const loggedIn = localStorage.getItem("loggedIn")

    if(loggedIn){
      const user = JSON.parse(loggedIn)
      this.employeeService.getFacilitiesByOrganization(user.organizationId).subscribe(response => {
        this.facilities = response.facilities.map((x:any)=>x.facility)
        if(this.facilities.length){
          this.selectedFacilityId = this.facilities[0]._id
          this.onFacilityChange()
        }
      })
    }
  }

  onFacilityChange(){
    if(!this.selectedFacilityId){
      this.resources = []
      this.selectedResourceId = ""
      this.events = []
      return
    }

    this.facilityService.getFacilityDetails(this.selectedFacilityId).subscribe(response => {
      this.applyWorkingHours(response.facility)
      this.resources = response.resources || []
      this.selectedResourceId = this.resources[0]?._id || ""
      this.loadEvents()
    })
  }

  onResourceChange(){
    this.loadEvents()
  }

  loadEvents(){
    if(!this.selectedResourceId) return

    const from = this.toIsoDate(this.weekStart)
    const to = this.toIsoDate(this.addDays(this.weekStart, 7))

    this.employeeService.getCalendarEvent(this.selectedResourceId, from, to).subscribe(response => {
      this.events = response.events
    })
  }

  previousWeek() {
    this.weekStart = this.addDays(this.weekStart, -7)
    this.buildWeek()
    this.loadEvents()
  }

  nextWeek(){
    this.weekStart = this.addDays(this.weekStart, 7)
    this.buildWeek()
    this.loadEvents()
  }

  goToday() {
    this.weekStart = this.startOfWeek(new Date())
    this.buildWeek()
    this.loadEvents()
  }

  eventsForDay(day: Date){
    return this.events.filter(e => this.sameDay(new Date(e.startAt), day))
  }

  eventTop(event: CalendarEvent){
    const start = new Date(event.startAt)
    const minutes = start.getHours() * 60 + start.getMinutes() - this.startHour * 60
    return Math.max(0, minutes * this.hourHeight / 60)
  }

  eventHeight(event: CalendarEvent){
    const start = new Date(event.startAt)
    const end = new Date(event.endAt)
    return Math.max(32, (end.getTime() - start.getTime()) / 60000 * this.hourHeight / 60)
  }

  timeLabelTop(hour: number){
    return (hour - this.startHour) * this.hourHeight
  }


  private addDays(date: Date, days: number){
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
  }

  private startOfWeek(date: Date){
    const d = new Date(date)
    const diff = d.getDay() === 0 ? -6 : 1 - d.getDay()
    d.setDate(d.getDate() + diff)
    d.setHours(0,0,0,0)
    return d
  }

  private buildWeek(){
    this.days = Array.from( {length: 7}, (_, i) => this.addDays(this.weekStart, i))
  }

  private applyWorkingHours(facility: Facility){
    const from = this.parseWorkingHour(facility?.workingHours?.from, 8, "floor")
    const to = this.parseWorkingHour(facility?.workingHours?.to, 22, "ceil")

    this.startHour = from
    this.endHour = Math.max(to, from + 1)
    this.hours = this.buildHours()
    this.timeLabels = this.buildTimeLabels()
    this.calendarHeight = (this.endHour - this.startHour) * this.hourHeight
  }

  private buildHours(){
    return Array.from(
      {length: this.endHour - this.startHour},
      (_, i) => this.startHour + i
    )
  }

  private buildTimeLabels(){
    return Array.from(
      {length: this.endHour - this.startHour + 1},
      (_, i) => this.startHour + i
    )
  }

  private parseWorkingHour(value: string | undefined, fallback: number, rounding: "floor" | "ceil"){
    if(!value){
      return fallback
    }

    const [hourPart, minutePart = "0"] = value.split(":")
    const hour = Number(hourPart)
    const minutes = Number(minutePart)

    if(Number.isNaN(hour) || Number.isNaN(minutes)){
      return fallback
    }

    if(rounding === "ceil" && minutes > 0){
      return hour + 1
    }

    return hour
  }

  private sameDay(a: Date, b: Date){
    return a.toDateString() === b.toDateString()
  }

  private toIsoDate(date: Date){
    return date.toISOString().slice(0,10)
  }
}
