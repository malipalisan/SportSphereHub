import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password.component',
  imports: [FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  identifier: string = ""
  resetLink: string = ""
  message: string = ""
  error: string = ""

  constructor(private authService: AuthService) {}

  requestReset(){
    this.authService.requestPasswordReset(this.identifier, window.location.origin).subscribe(response => {
      if(response.status === 200){
        this.message = response.message
        this.resetLink = response.resetLink
        this.error = ""
      } else {
        this.error = response.message
        this.message = ""
        this.resetLink = ""
      }
    })
  }
}
