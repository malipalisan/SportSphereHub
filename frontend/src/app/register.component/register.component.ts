import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sport } from '../models/sport';
import { AuthService } from '../services/auth.service';
import { SportsService } from '../services/sports.service';
import { createAvatar } from '@dicebear/core';
import { adventurer, thumbs } from '@dicebear/collection';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register.component',
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit{

  role: "athlete" | "employee" = "athlete";

  username: string = ""
  password: string = ""
  firstName: string = ""
  lastName: string = ""
  phone: string = ""
  email: string = ""

  favoriteSportIds: string[] = []
  sports: Sport[] = []

  organizationName: string = ""
  headquartersAddress: string = ""
  registrationNumber: string = ""
  taxId: string = ""

  avatarFile: File | null = null
  avatarPreview: string = ""
  generatedAvatarSvg: string = ""

  message: string = ""


  constructor(
    private authService: AuthService,
    private sportsService: SportsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sportsService.getActiveSports().subscribe(response => {
      console.log(response.status)
      this.sports = response.sports
    })
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

  register(): void{
    const formData = new FormData()

    formData.append("role", this.role)
    formData.append("username", this.username)
    formData.append("password", this.password)
    formData.append("firstName", this.firstName)
    formData.append("lastName", this.lastName)
    formData.append("phone", this.phone)
    formData.append("email", this.email)

    for(let sportId of this.favoriteSportIds) {
      formData.append("favoriteSportIds", sportId)
    }

    if(this.avatarFile){
      formData.append("avatar", this.avatarFile)
    }

    if(this.role == "employee"){
      formData.append("organizationName", this.organizationName)
      formData.append("headquartersAddress", this.headquartersAddress)
      formData.append("registrationNumber", this.registrationNumber)
      formData.append("taxId", this.taxId)
    }

    for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
    }

    this.authService.register(formData).subscribe(response => {
      if(response.status === 200){
        this.router.navigate([""])
      } else {
        this.message = response.message
      }
    })
  }

  onRoleChange(): void{
    if(this.role == "athlete"){
      this.organizationName = ""
      this.headquartersAddress = ""
      this.registrationNumber = ""
      this.taxId = ""
    }
  }

}
