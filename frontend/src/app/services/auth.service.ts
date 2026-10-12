import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
    private apiUrl = `http://localhost:4000/api/auth`

    constructor(private http: HttpClient) {}

    register(formData: FormData){
      return this.http.post<any>(`${this.apiUrl}/register`, formData)
    }

    login(username: string, password: string){
      const data = {
        username: username,
        password: password
      }
      return this.http.post<any>(`${this.apiUrl}/login`, data)
    }

    adminLogin(username: string, password: string){
      const data = {
        username: username,
        password: password
      }

      return this.http.post<any>(`${this.apiUrl}/adminLogin`, data)
    }

    requestPasswordReset(identifier: string, clientUrl: string){
      return this.http.post<any>(`${this.apiUrl}/forgot-password`, {
        identifier: identifier,
        clientUrl: clientUrl
      })
    }

    resetPassword(token: string, password: string, confirmPassword: string){
      return this.http.post<any>(`${this.apiUrl}/reset-password`, {
        token: token,
        password: password,
        confirmPassword: confirmPassword
      })
    }
}
