import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DealDTO, DealCreateRequest } from '../models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DealService {
  private readonly endpoint = '/deals';

  constructor(private apiService: ApiService) {}

  /**
   * Create a new deal
   */
  createDeal(dealData: DealCreateRequest): Observable<DealDTO> {
    return this.apiService.post<DealDTO>(
      this.endpoint,
      dealData
    );
  }

  /**
   * Get deal by ID
   */
  getDealById(dealId: number): Observable<DealDTO> {
    return this.apiService.get<DealDTO>(`${this.endpoint}/${dealId}`);
  }

  /**
   * Get all deals for a customer
   */
  getDealsByCustomer(customerId: number): Observable<DealDTO[]> {
    return this.apiService.get<DealDTO[]>(
      `${this.endpoint}/customer/${customerId}`
    );
  }

  /**
   * Get all deals for a property
   */
  getDealsByProperty(propertyId: number): Observable<DealDTO[]> {
    return this.apiService.get<DealDTO[]>(
      `${this.endpoint}/property/${propertyId}`
    );
  }

  /**
   * Get all deals for a seller
   */
  getDealsBySeller(sellerId: number): Observable<DealDTO[]> {
    return this.apiService.get<DealDTO[]>(
      `${this.endpoint}/seller/${sellerId}`
    );
  }

  /**
   * Get all deals (admin only)
   */
  getAllDeals(filters?: {
    page?: number;
    pageSize?: number;
  }): Observable<DealDTO[]> {
    return this.apiService.get<DealDTO[]>(this.endpoint, filters);
  }
}
