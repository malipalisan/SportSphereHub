import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password.component',
  imports: [FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  token: string = ""
  password: string = ""
  confirmPassword: string = ""
  message: string = ""
  error: string = ""

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(){
    this.token = this.route.snapshot.paramMap.get("token") || ""
  }

  resetPassword(){
    this.authService.resetPassword(this.token, this.password, this.confirmPassword).subscribe(response => {
      if(response.status === 200){
        this.message = response.message
        this.error = ""
        setTimeout(() => this.router.navigate(["/login"]), 1200)
      } else {
        this.error = response.message
        this.message = ""
      }
    })
  }
}
