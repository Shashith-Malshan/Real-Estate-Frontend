import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InquiryDTO, InquiryCreateRequest } from '../models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class InquiryService {
  private readonly endpoint = '/inquiries';

  constructor(private apiService: ApiService) {}

  /**
   * Create new inquiry
   */
  createInquiry(inquiryData: InquiryCreateRequest): Observable<InquiryDTO> {
    return this.apiService.post<InquiryDTO>(
      this.endpoint,
      inquiryData
    );
  }

  /**
   * Get inquiry by ID
   */
  getInquiryById(inquiryId: number): Observable<InquiryDTO> {
    return this.apiService.get<InquiryDTO>(`${this.endpoint}/${inquiryId}`);
  }

  /**
   * Get all inquiries for a customer
   */
  getInquiriesByCustomer(customerId: number): Observable<InquiryDTO[]> {
    return this.apiService.get<InquiryDTO[]>(
      `${this.endpoint}/customer/${customerId}`
    );
  }

  /**
   * Get all inquiries for a property
   */
  getInquiriesByProperty(propertyId: number): Observable<InquiryDTO[]> {
    return this.apiService.get<InquiryDTO[]>(
      `${this.endpoint}/property/${propertyId}`
    );
  }

  /**
   * Get unanswered inquiries for a property
   */
  getUnansweredInquiries(propertyId: number): Observable<InquiryDTO[]> {
    return this.apiService.get<InquiryDTO[]>(
      `${this.endpoint}/property/${propertyId}/unanswered`
    );
  }

  /**
   * Mark inquiry as replied
   */
  replyToInquiry(inquiryId: number): Observable<InquiryDTO> {
    return this.apiService.put<InquiryDTO>(
      `${this.endpoint}/${inquiryId}/reply`,
      {}
    );
  }

  /**
   * Delete inquiry
   */
  deleteInquiry(inquiryId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${inquiryId}`);
  }
}
