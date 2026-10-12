import { Component, OnInit } from '@angular/core';
import { User } from '../models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-edit-user.component',
  imports: [FormsModule],
  templateUrl: './admin-edit-user.component.html',
  styleUrl: './admin-edit-user.component.css',
})
export class AdminEditUserComponent implements OnInit{
  user: User = new User();
  message: string = "";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");

    if (id) {
      this.adminService.getUserById(id).subscribe(response => {
        if (response.status === 200) {
          this.user = response.user;
        } else {
          this.message = response.message;
        }
      });
    }
  }

  save(): void {
    this.adminService.updateUser(this.user).subscribe(response => {
      this.message = response.message;

      if (response.status === 200) {
        this.router.navigate(["/admin"]);
      }
    });
  }

  cancel(): void {
    this.router.navigate(["/admin"]);
  }
}
