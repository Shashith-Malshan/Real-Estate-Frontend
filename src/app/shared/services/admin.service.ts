import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserResponseDTO } from '../models';
import { ApiService } from './api.service';

export interface SystemMetricsDTO {
  totalUsers: number;
  totalProperties: number;
  totalDeals: number;
  platformRevenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly endpoint = '/admin';

  constructor(private apiService: ApiService) {}

  getSystemMetrics(): Observable<SystemMetricsDTO> {
    return this.apiService.get<SystemMetricsDTO>(`${this.endpoint}/metrics`);
  }

  getAllUsers(): Observable<UserResponseDTO[]> {
    return this.apiService.get<UserResponseDTO[]>(`${this.endpoint}/users`);
  }

  getUserById(userId: number): Observable<UserResponseDTO> {
    return this.apiService.get<UserResponseDTO>(`${this.endpoint}/users/${userId}`);
  }

  deleteUser(userId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/users/${userId}`);
  }
}
