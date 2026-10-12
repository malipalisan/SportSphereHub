import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AthleteService } from '../services/athlete.service';
import { User } from '../models/user';

@Component({
  selector: 'app-athlete.component',
  imports: [FormsModule, DatePipe],
  templateUrl: './athlete.component.html',
  styleUrl: './athlete.component.css',
})
export class AthleteComponent implements OnInit {
  user: User = new User()
  sports: any[] = []
  reservations: any[] = []
  trainings: any[] = []
  orders: any[] = []
  selectedAvatar: File | null = null
  message: string = ""
  error: string = ""

  sortColumn: string = "startAt"
  sortDirection: "asc" | "desc" = "desc"

  constructor(private athleteService: AthleteService) {}

  ngOnInit(){
    const loggedIn = localStorage.getItem("loggedIn")

    if(loggedIn){
      const user = JSON.parse(loggedIn)
      this.user = user
      this.loadProfile()
    }
  }

  loadProfile(){
    this.athleteService.getProfileData(this.user._id).subscribe(response => {
      if(response.status === 200){
        this.user = response.user
        this.user.favoriteSportIds = response.user.favoriteSportIds || []
        this.sports = response.sports || []
        this.reservations = response.reservations || []
        this.trainings = response.trainings || []
        this.orders = response.orders || []
        this.sortReservations(this.sortColumn, true)
      } else {
        this.error = response.message
      }
    })
  }

  onAvatarSelected(event: Event){
    const input = event.target as HTMLInputElement
    this.selectedAvatar = input.files && input.files.length > 0 ? input.files[0] : null
  }

  isFavoriteSport(sportId: string){
    return this.user.favoriteSportIds.includes(sportId)
  }

  toggleFavoriteSport(sportId: string, event: Event){
    const checked = (event.target as HTMLInputElement).checked

    if(checked && !this.user.favoriteSportIds.includes(sportId)){
      this.user.favoriteSportIds.push(sportId)
    }

    if(!checked){
      this.user.favoriteSportIds = this.user.favoriteSportIds.filter(id => id !== sportId)
    }
  }

  updateProfile(){
    const formData = new FormData()
    formData.append("_id", this.user._id)
    formData.append("firstName", this.user.firstName)
    formData.append("lastName", this.user.lastName)
    formData.append("email", this.user.email)
    formData.append("phone", this.user.phone)

    for(const sportId of this.user.favoriteSportIds){
      formData.append("favoriteSportIds", sportId)
    }

    if(this.selectedAvatar){
      formData.append("avatar", this.selectedAvatar)
    }

    this.athleteService.updateProfile(formData).subscribe(response => {
      if(response.status === 200){
        this.user = response.user
        this.user.favoriteSportIds = response.user.favoriteSportIds || []
        localStorage.setItem("loggedIn", JSON.stringify(response.user))
        window.dispatchEvent(new Event("storage"))
        this.selectedAvatar = null
        this.message = response.message
        this.error = ""
      } else {
        this.error = response.message
        this.message = ""
      }
    })
  }

  canCancelReservation(reservation: any){
    if(reservation.status === "cancelled" ||  reservation.status === "attended"){
      return false
    }

    const startsInMs = new Date(reservation.startAt).getTime() - Date.now()
    return startsInMs >= 12 * 60 * 60 * 1000
  }

  cancelReservation(reservation: any){
    this.athleteService.cancelReservation(reservation._id, this.user._id).subscribe(response => {
      if(response.status === 200){
        this.message = response.message
        this.error = ""
        this.loadProfile()
      } else {
        this.error = response.message
        this.message = ""
      }
    })
  }

  canConfirmReservation(reservation: any){
    if(reservation.status === "confirmed"){
      return false
    }

    const startsInMs = new Date(reservation.startAt).getTime() - Date.now()
    return startsInMs >= 12 * 60 * 60 * 1000
  }

  confirmReservation(reservation: any){
    this.athleteService.confirmReservation(reservation._id, this.user._id).subscribe(response => {
      if(response.status === 200){
        this.message = response.message
        this.error = ""
        this.loadProfile()
      } else {
        this.error = response.message
        this.message = ""
      }
    })
  }

  cancelOrder(order: any){
    this.athleteService.cancelOrder(order._id, this.user._id).subscribe(response => {
      if(response.status === 200){
        this.message = response.message
        this.error = ""
        this.loadProfile()
      } else {
        this.error = response.message
        this.message = ""
      }
    })
  }

  sortReservations(column: string, keepDirection: boolean = false){
    if(!keepDirection){
      if(this.sortColumn === column){
        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc"
      } else {
        this.sortColumn = column
        this.sortDirection = "asc"
      }
    }

    const direction = this.sortDirection === "asc" ? 1 : -1

    this.reservations = [...this.reservations].sort((a, b) => {
      const left = this.sortValue(a, column)
      const right = this.sortValue(b, column)

      if(left < right) return -1 * direction
      if(left > right) return 1 * direction
      return 0
    })
  }

  sortIndicator(column: string){
    if(this.sortColumn !== column){
      return ""
    }

    return this.sortDirection === "asc" ? " ^" : " v"
  }

  private sortValue(reservation: any, column: string){
    switch(column){
      case "facility":
        return reservation.facilityId?.name || ""
      case "city":
        return reservation.facilityId?.city || ""
      case "resource":
        return reservation.resourceId?.name || ""
      case "sport":
        return reservation.sportId?.name || ""
      case "startAt":
        return new Date(reservation.startAt).getTime()
      case "endAt":
        return new Date(reservation.endAt).getTime()
      case "status":
        return reservation.status || ""
      default:
        return ""
    }
  }

}
