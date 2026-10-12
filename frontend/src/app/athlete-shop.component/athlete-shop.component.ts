import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AthleteService } from '../services/athlete.service';

@Component({
  selector: 'app-athlete-shop.component',
  imports: [FormsModule],
  templateUrl: './athlete-shop.component.html',
  styleUrl: './athlete-shop.component.css',
})
export class AthleteShopComponent implements OnInit {
  athleteId: string = ""
  sports: any[] = []
  equipment: any[] = []
  cart: any[] = []
  sportId: string = ""
  message: string = ""
  error: string = ""

  constructor(private athleteService: AthleteService) {}

  ngOnInit(){
    const loggedIn = localStorage.getItem("loggedIn")
    if(loggedIn){
      this.athleteId = JSON.parse(loggedIn)._id
    }
    this.loadShop()
  }

  loadShop(){
    this.athleteService.getShopData(this.sportId).subscribe(response => {
      if(response.status === 200){
        this.sports = response.sports || []
        this.equipment = response.equipment || []
      } else {
        this.error = response.message
      }
    })
  }

  addToCart(item: any){
    const existing = this.cart.find(cartItem => cartItem.equipmentId === item._id)
    if(existing){
      existing.quantity++
    } else {
      this.cart.push({
        equipmentId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1
      })
    }
  }

  removeFromCart(item: any){
    this.cart = this.cart.filter(cartItem => cartItem.equipmentId !== item.equipmentId)
  }

  total(){
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  createOrder(){
    this.athleteService.createOrder({
      athleteId: this.athleteId,
      items: this.cart
    }).subscribe(response => {
      if(response.status === 200){
        this.message = response.message
        this.error = ""
        this.cart = []
        this.loadShop()
      } else {
        this.error = response.message
        this.message = ""
      }
    })
  }
}
