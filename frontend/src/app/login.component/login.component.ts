import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login.component',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  username = ""
  password = ""
  message = ""

  constructor(
    private authService: AuthService
  ) {}
  private router = inject(Router)

  login(){
    this.authService.login(this.username, this.password).subscribe(response => {
      if(response.status !== 200){
        this.message = response.message
      } else {
        localStorage.setItem("loggedIn", JSON.stringify(response.user))
        window.dispatchEvent(new Event("storage"));
        this.message = ""
        if(response.user.role == "employee"){
          this.router.navigate(["/employee"])
        } else if (response.user.role == "athlete"){
          this.router.navigate(["/athlete"])
        }
      }
    })
  }


}
