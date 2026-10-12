import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { User } from './models/user';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title="SportSphere Hub"
  isLoggedIn: boolean = false
  user: User | null = null

  constructor(private router: Router) {}
  ngOnInit() {
    this.checkLogin()
  }

  checkLogin() {
    const loggedUser = localStorage.getItem("loggedIn")

    this.isLoggedIn = loggedUser !== null

    if (loggedUser) {
      this.user = JSON.parse(loggedUser)
    } else {
      this.user = null
    }
  }

  @HostListener('window:storage')
  onStorageChange(){
    this.checkLogin()
  }

  logout() {
    localStorage.removeItem("loggedIn")
    this.isLoggedIn = false
    this.user = null
    this.router.navigate(["/"])
  }
}
