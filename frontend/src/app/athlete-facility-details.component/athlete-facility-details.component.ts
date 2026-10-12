import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AthleteService } from '../services/athlete.service';

@Component({
  selector: 'app-athlete-facility-details.component',
  imports: [FormsModule, DatePipe],
  templateUrl: './athlete-facility-details.component.html',
  styleUrl: './athlete-facility-details.component.css',
})
export class AthleteFacilityDetailsComponent implements OnInit {
  facility: any = null
  resources: any[] = []
  selectedResourceId: string = ""
  selectedSportId: string = ""
  events: any[] = []
  athleteId: string = ""
  comments: any[] = []
  reviewInfo: any = null
  reviewReaction: "like" | "dislike" = "like"
  reviewComment: string = ""

  reservationDate: string = ""
  reservationStartHour: number = 8
  duration: number = 1
  message: string = ""
  error: string = ""
  selectedCalendarSlot: string = ""
  reservationInProgress: boolean = false

  weekStart = this.startOfWeek(new Date())
  days: Date[] = []
  startHour = 8
  endHour = 22
  hours = this.buildHours()
  timeLabels = this.buildTimeLabels()
  hourHeight = 48
  calendarHeight = (this.endHour - this.startHour) * this.hourHeight

  constructor(
    private athleteService: AthleteService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(){
    this.buildWeek()
    const id = this.route.snapshot.paramMap.get("id")
    const loggedIn = localStorage.getItem("loggedIn")

    if(loggedIn){
      this.athleteId = JSON.parse(loggedIn)._id
    }

    if(id){
      this.athleteService.getFacilityDetails(id, this.athleteId).subscribe(response => {
        if(response.status === 200){
          this.facility = response.facility
          this.resources = response.resources || []
          this.comments = response.comments || []
          this.reviewInfo = response.reviewInfo
          this.applyWorkingHours()
          this.selectedResourceId = this.resources[0]?._id || ""
          this.selectedSportId = this.resources[0]?.sportIds?.[0] || this.facility.sportIds?.[0] || ""
          this.reservationDate = this.toIsoDate(new Date())
          this.reservationStartHour = this.hours[0] || 8
          this.loadEvents()
        } else {
          this.error = response.message
        }
      })
    }
  }

  submitReview(){
    if(!this.facility){
      return
    }

    if(this.reviewComment.trim() === ""){
      this.error = "Komentar je obavezan"
      this.message = ""
      return
    }

    this.athleteService.createFacilityReview(this.facility._id, {
      athleteId: this.athleteId,
      reaction: this.reviewReaction,
      comment: this.reviewComment
    }).subscribe(response => {
      if(response.status === 200){
        this.facility = response.facility
        this.comments = response.comments || []
        this.reviewInfo = response.reviewInfo
        this.reviewComment = ""
        this.message = response.message
        this.error = ""
      } else {
        this.error = response.message
        this.message = ""
      }
    })
  }

  onResourceChange(){
    const resource = this.resources.find(r => r._id === this.selectedResourceId)
    this.selectedSportId = resource?.sportIds?.[0] || this.facility?.sportIds?.[0] || ""
    this.selectedCalendarSlot = ""
    this.loadEvents()
  }

  previousWeek(){
    this.weekStart = this.addDays(this.weekStart, -7)
    this.buildWeek()
    this.loadEvents()
  }

  nextWeek(){
    this.weekStart = this.addDays(this.weekStart, 7)
    this.buildWeek()
    this.loadEvents()
  }

  goToday(){
    this.weekStart = this.startOfWeek(new Date())
    this.buildWeek()
    this.loadEvents()
  }

  loadEvents(){
    if(!this.selectedResourceId) return

    const from = this.toIsoDate(this.weekStart)
    const to = this.toIsoDate(this.addDays(this.weekStart, 8))

    this.athleteService.getResourceEvents(this.selectedResourceId, from, to).subscribe(response => {
      if(response.status === 200){
        this.events = response.events || []
      }
    })
  }

  createReservation(){
    if(this.reservationInProgress) return

    const loggedIn = localStorage.getItem("loggedIn")
    if(!loggedIn){
      this.error = "Morate biti prijavljeni da biste rezervisali termin"
      this.message = ""
      return
    }

    if(!this.facility || !this.selectedResourceId){
      this.error = "Izaberite teren ili halu za rezervaciju"
      this.message = ""
      return
    }

    const user = JSON.parse(loggedIn)
    const startAt = this.localDateTime(this.reservationDate, this.reservationStartHour)
    const endAt = this.localDateTime(this.reservationDate, Number(this.reservationStartHour) + Number(this.duration))

    this.reservationInProgress = true

    this.athleteService.createReservation({
      athleteId: user._id,
      facilityId: this.facility._id,
      resourceId: this.selectedResourceId,
      sportId: this.selectedSportId,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString()
    }).subscribe(response => {
      if(response.status === 200){
        this.message = response.message
        this.error = ""
        this.selectedCalendarSlot = ""
        this.loadEvents()
      } else {
        this.error = response.message
        this.message = ""
      }
      this.reservationInProgress = false
    })
  }

  reserveFromCalendar(day: Date, hour: number){
    if(!this.isCalendarSlotAvailable(day, hour)){
      this.error = this.calendarSlotTitle(day, hour)
      this.message = ""
      return
    }

    this.reservationDate = this.toIsoDate(day)
    this.reservationStartHour = hour
    this.selectedCalendarSlot = this.calendarSlotKey(day, hour)
    this.createReservation()
  }

  eventsForDay(day: Date){
    return this.events.filter(event => this.sameDay(new Date(event.startAt), day))
  }

  eventTop(event: any){
    const start = new Date(event.startAt)
    const minutes = start.getHours() * 60 + start.getMinutes() - this.startHour * 60
    return Math.max(0, minutes * this.hourHeight / 60)
  }

  eventHeight(event: any){
    const start = new Date(event.startAt)
    const end = new Date(event.endAt)
    return Math.max(32, (end.getTime() - start.getTime()) / 60000 * this.hourHeight / 60)
  }

  timeLabelTop(hour: number){
    return (hour - this.startHour) * this.hourHeight
  }

  isCalendarSlotAvailable(day: Date, hour: number){
    return !this.reservationInProgress
      && !this.isCalendarSlotPast(day, hour)
      && this.isCalendarSlotInsideWorkingHours(hour)
      && !this.isCalendarSlotBusy(day, hour)
  }

  isCalendarSlotBusy(day: Date, hour: number){
    const slotStart = this.localDateTime(this.toIsoDate(day), hour)
    const slotEnd = this.localDateTime(this.toIsoDate(day), hour + Number(this.duration))

    return this.events.some(event => {
      const eventStart = new Date(event.startAt)
      const eventEnd = new Date(event.endAt)
      return slotStart < eventEnd && slotEnd > eventStart
    })
  }

  isCalendarSlotPast(day: Date, hour: number){
    const slotEnd = this.localDateTime(this.toIsoDate(day), hour + Number(this.duration))
    return slotEnd.getTime() <= Date.now()
  }

  isCalendarSlotInsideWorkingHours(hour: number){
    const closingMinutes = this.timeToMinutes(this.facility?.workingHours?.to || "22:00")
    const endMinutes = (hour + Number(this.duration)) * 60
    return endMinutes <= closingMinutes
  }

  isCalendarSlotSelected(day: Date, hour: number){
    return this.selectedCalendarSlot === this.calendarSlotKey(day, hour)
  }

  calendarSlotTitle(day: Date, hour: number){
    if(this.reservationInProgress){
      return "Rezervacija je u toku"
    }

    if(this.isCalendarSlotPast(day, hour)){
      return "Nije moguce rezervisati prosli termin"
    }

    if(!this.isCalendarSlotInsideWorkingHours(hour)){
      return "Objekat ne radi u periodu vase rezervacije"
    }

    if(this.isCalendarSlotBusy(day, hour)){
      return "Izabrani termin nije slobodan"
    }

    return `Rezervisi termin ${this.toIsoDate(day)} u ${hour}:00`
  }

  private applyWorkingHours(){
    const from = this.parseWorkingHour(this.facility?.workingHours?.from, 8, "floor")
    const to = this.parseWorkingHour(this.facility?.workingHours?.to, 22, "ceil")

    this.startHour = from
    this.endHour = Math.max(to, from + 1)
    this.hours = this.buildHours()
    this.timeLabels = this.buildTimeLabels()
    this.calendarHeight = (this.endHour - this.startHour) * this.hourHeight
  }

  private buildWeek(){
    this.days = Array.from({length: 7}, (_, i) => this.addDays(this.weekStart, i))
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

  private startOfWeek(date: Date){
    const d = new Date(date)
    const diff = d.getDay() === 0 ? -6 : 1 - d.getDay()
    d.setDate(d.getDate() + diff)
    d.setHours(0, 0, 0, 0)
    return d
  }

  private addDays(date: Date, days: number){
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
  }

  private toIsoDate(date: Date){
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  private localDateTime(date: string, hour: number){
    const [year, month, day] = date.split("-").map(Number)
    return new Date(year, month - 1, day, hour, 0, 0, 0)
  }

  private calendarSlotKey(day: Date, hour: number){
    return `${this.toIsoDate(day)}-${hour}`
  }

  private timeToMinutes(time: string){
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
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
}
