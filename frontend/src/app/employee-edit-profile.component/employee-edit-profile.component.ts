import { Component, OnInit } from '@angular/core';
import { User } from '../models/user';
import { EmployeeService } from '../services/employee.service';
import { Router } from '@angular/router';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-edit-profile.component',
  imports: [FormsModule],
  templateUrl: './employee-edit-profile.component.html',
  styleUrl: './employee-edit-profile.component.css',
})
export class EmployeeEditProfileComponent implements OnInit{

  user: User = new User()
  avatarFile: File | null = null
  avatarPreview: string = ""
  generatedAvatarSvg: string = ""
  message: string = ""

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const loggedIn = localStorage.getItem("loggedIn")

    if(loggedIn){
      this.user = JSON.parse(loggedIn)
    } else {
      this.message = "Niste ulogovani"
      return
    }
  }

  onFileSelected(event: any){
    const file = event.target.files[0]

    if(file){
      this.avatarFile = file
    }
  }

  generateAvatar(){
    const avatar = createAvatar(adventurer, {
      seed: crypto.randomUUID()
    })

    this.generatedAvatarSvg = avatar.toString()

    const svgBlob = new Blob([this.generatedAvatarSvg], {type: "image/svg+xml;charset=utf-8"})

    this.avatarPreview = URL.createObjectURL(svgBlob)
  }

  saveAvatarAsProfileImage(){
    const image = new Image()

    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 256
      canvas.height = 256

      const ctx = canvas.getContext("2d")!

      ctx.drawImage(image, 0, 0, 256, 256)

      canvas.toBlob(blob => {
        if(!blob) {
          return
        }

        this.avatarFile = new File([blob], "avatar.png", {type: "image/png"})
      }, "image/png")
    }

    image.src = this.avatarPreview
  }

  save(){
    const formData = new FormData()

    formData.append("_id", this.user._id)
    formData.append("firstName", this.user.firstName)
    formData.append("lastName", this.user.lastName)
    formData.append("email", this.user.email)
    formData.append("phone", this.user.phone)

    if(this.avatarFile){
      formData.append("avatar", this.avatarFile)
    }

    this.employeeService.updateProfile(formData).subscribe(response => {
      if(response.status === 200){
        localStorage.setItem("loggedIn", JSON.stringify(response.user))
        window.dispatchEvent(new Event("storage"))
        this.router.navigate(["/employee"])
      }
    })
  }

  cancel(){
    this.router.navigate(["/employee"])
  }
}
