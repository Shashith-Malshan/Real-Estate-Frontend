import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VisitDTO, VisitCreateRequest } from '../models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  private readonly endpoint = '/visits';

  constructor(private apiService: ApiService) {}

  /**
   * Schedule a property visit
   */
  scheduleVisit(visitData: VisitCreateRequest): Observable<VisitDTO> {
    return this.apiService.post<VisitDTO>(
      this.endpoint,
      visitData
    );
  }

  /**
   * Get visit by ID
   */
  getVisitById(visitId: number): Observable<VisitDTO> {
    return this.apiService.get<VisitDTO>(`${this.endpoint}/${visitId}`);
  }

  /**
   * Get all visits for a customer
   */
  getVisitsByCustomer(customerId: number): Observable<VisitDTO[]> {
    return this.apiService.get<VisitDTO[]>(
      `${this.endpoint}/customer/${customerId}`
    );
  }

  /**
   * Get all visits for a property
   */
  getVisitsByProperty(propertyId: number): Observable<VisitDTO[]> {
    return this.apiService.get<VisitDTO[]>(
      `${this.endpoint}/property/${propertyId}`
    );
  }

  /**
   * Get visits scheduled for seller (visits to their properties)
   */
  getScheduledVisitsForSeller(sellerId: number): Observable<VisitDTO[]> {
    return this.apiService.get<VisitDTO[]>(
      `${this.endpoint}/seller/${sellerId}`
    );
  }

  /**
   * Mark visit as completed
   */
  completeVisit(visitId: number): Observable<VisitDTO> {
    return this.apiService.patch<VisitDTO>(
      `${this.endpoint}/${visitId}/complete`,
      {}
    );
  }

  /**
   * Cancel visit
   */
  cancelVisit(visitId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${visitId}`);
  }
}
