import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-adminlogin.component',
  imports: [FormsModule],
  templateUrl: './adminlogin.component.html',
  styleUrl: './adminlogin.component.css',
})
export class AdminloginComponent {
  username: string = ""
  password: string = ""
  message: string = ""

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(){
    this.authService.adminLogin(this.username, this.password).subscribe(response => {
      if(response.status === 200){
        localStorage.setItem("loggedIn", JSON.stringify(response.user))
        window.dispatchEvent(new Event("storage"));
        this.router.navigate(["/admin"])
      } else {
        this.message = response.message
      }
    })
  }
}
