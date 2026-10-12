import { Routes } from '@angular/router';
import { RegisterComponent } from './register.component/register.component';
import { HomepageComponent } from './homepage.component/homepage.component';
import { LoginComponent } from './login.component/login.component';
import { AthleteComponent } from './athlete.component/athlete.component';
import { EmployeeComponent } from './employee.component/employee.component';
import { FacilityDetailsComponent } from './facility-details.component/facility-details.component';
import { AdminloginComponent } from './adminlogin.component/adminlogin.component';
import { AdminComponent } from './admin.component/admin.component';
import { AdminEditUserComponent } from './admin-edit-user.component/admin-edit-user.component';
import { EmployeeEditProfileComponent } from './employee-edit-profile.component/employee-edit-profile.component';
import { EmployeeAddFacilityComponent } from './employee-add-facility.component/employee-add-facility.component';
import { EmployeeEditFacilityComponent } from './employee-edit-facility.component/employee-edit-facility.component';
import { EmployeeFacilityManagementComponent } from './employee-facility-management.component/employee-facility-management.component';
import { EmployeeCalendarComponent } from './employee-calendar.component/employee-calendar.component';
import { AthleteSearchComponent } from './athlete-search.component/athlete-search.component';
import { AthleteFacilityDetailsComponent } from './athlete-facility-details.component/athlete-facility-details.component';
import { AthleteTeammatesComponent } from './athlete-teammates.component/athlete-teammates.component';
import { AthleteTrainingComponent } from './athlete-training.component/athlete-training.component';
import { AthleteShopComponent } from './athlete-shop.component/athlete-shop.component';
import { ForgotPasswordComponent } from './forgot-password.component/forgot-password.component';
import { ResetPasswordComponent } from './reset-password.component/reset-password.component';

export const routes: Routes = [
  {path: "", component: HomepageComponent},
  {path: "register", component: RegisterComponent},
  {path: "login", component: LoginComponent},
  {path: "forgot-password", component: ForgotPasswordComponent},
  {path: "reset-password/:token", component: ResetPasswordComponent},
  {path: "athlete", component: AthleteComponent},
  {path: "athlete/search", component: AthleteSearchComponent},
  {path: "athlete/facility/:id", component: AthleteFacilityDetailsComponent},
  {path: "athlete/teammates", component: AthleteTeammatesComponent},
  {path: "athlete/training", component: AthleteTrainingComponent},
  {path: "athlete/shop", component: AthleteShopComponent},
  {path: "employee", component: EmployeeComponent},
  {path: "facility-details/:id", component: FacilityDetailsComponent},
  {path: "admin-login", component: AdminloginComponent},
  {path: "admin", component:AdminComponent},
  {path: "admin/edit-user/:id", component:AdminEditUserComponent},
  {path: "employee-edit-profile", component: EmployeeEditProfileComponent},
  {path: "employee-add-facility", component: EmployeeAddFacilityComponent},
  {path: "employee-edit-facility/:id", component:EmployeeEditFacilityComponent},
  {path: "employee-facility-management/:id", component: EmployeeFacilityManagementComponent},
  {path: "employee-calendar", component: EmployeeCalendarComponent}
];
