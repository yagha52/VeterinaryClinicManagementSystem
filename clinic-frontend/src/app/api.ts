import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // This makes the service immortal (it never dies when changing screens)
})
export class ApiService {
  // We only write this once!
  private baseUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) { }

  // 1. The Login Postman
  loginVet(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login/`, data);
  }

  // 2. The Appointment Postman
  getAppointments(searchQuery: string = ''): Observable<any> {
    const url = searchQuery ? `${this.baseUrl}/appointments/?search=${searchQuery}` : `${this.baseUrl}/appointments/`;
    return this.http.get(url);
  }

  createAppointment(data: any ): Observable<any> {
    return this.http.post(`${this.baseUrl}/appointments/`, data);
  }

  updateAppointment(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/appointments/${id}/`, data);
  }
}
