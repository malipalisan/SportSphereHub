import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SportsService {
    private apiUrl = `http://localhost:4000/api/sports`

    constructor(private http: HttpClient){}

    getActiveSports(){
      return this.http.get<any>(`${this.apiUrl}`)
    }
}
