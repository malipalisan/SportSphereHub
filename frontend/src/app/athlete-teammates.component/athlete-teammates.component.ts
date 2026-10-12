import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AthleteService } from '../services/athlete.service';

@Component({
  selector: 'app-athlete-teammates.component',
  imports: [FormsModule, DatePipe],
  templateUrl: './athlete-teammates.component.html',
  styleUrl: './athlete-teammates.component.css',
})
export class AthleteTeammatesComponent implements OnInit {
  athleteId: string = ""
  ads: any[] = []
  myAds: any[] = []
  sports: any[] = []
  cities: string[] = []
  message: string = ""
  error: string = ""

  ad = {
    sportId: "",
    city: "",
    date: "",
    startHour: 18,
    duration: 1,
    missingPlayers: 1
  }

  constructor(private athleteService: AthleteService) {}

  ngOnInit(){
    const loggedIn = localStorage.getItem("loggedIn")
    if(loggedIn){
      this.athleteId = JSON.parse(loggedIn)._id
      this.loadAds()
    }
  }

  loadAds(){
    this.athleteService.getTeammateAds(this.athleteId).subscribe(response => {
      if(response.status === 200){
        this.ads = response.ads || []
        this.myAds = response.myAds || []
        this.sports = response.sports || []
        this.cities = response.cities || []
        if(!this.ad.sportId && this.sports.length) this.ad.sportId = this.sports[0]._id
        if(!this.ad.city && this.cities.length) this.ad.city = this.cities[0]
      } else {
        this.error = response.message
      }
    })
  }

  createAd(){
    const startAt = this.localDateTime(this.ad.date, Number(this.ad.startHour))
    const endAt = this.localDateTime(this.ad.date, Number(this.ad.startHour) + Number(this.ad.duration))

    this.athleteService.createTeammateAd({
      authorId: this.athleteId,
      sportId: this.ad.sportId,
      city: this.ad.city,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      missingPlayers: this.ad.missingPlayers
    }).subscribe(response => this.handleResponse(response))
  }

  joinAd(ad: any){
    this.athleteService.requestJoinAd(ad._id, this.athleteId).subscribe(response => this.handleResponse(response))
  }

  updateRequest(ad: any, request: any, status: string){
    this.athleteService.updateJoinRequest(ad._id, this.athleteId, request.athleteId._id, status)
      .subscribe(response => this.handleResponse(response))
  }

  closeAd(ad: any){
    this.athleteService.closeTeammateAd(ad._id, this.athleteId).subscribe(response => this.handleResponse(response))
  }

  requestStatus(ad: any){
    const request = ad.joinRequests?.find((r: any) => r.athleteId?._id === this.athleteId)
    return request?.status || ""
  }

  approvedCount(ad: any){
    return ad.joinRequests?.filter((r: any) => r.status === "approved").length || 0
  }

  private handleResponse(response: any){
    if(response.status === 200){
      this.message = response.message
      this.error = ""
      this.loadAds()
    } else {
      this.error = response.message
      this.message = ""
    }
  }

  private localDateTime(date: string, hour: number){
    const [year, month, day] = date.split("-").map(Number)
    return new Date(year, month - 1, day, hour, 0, 0, 0)
  }
}
