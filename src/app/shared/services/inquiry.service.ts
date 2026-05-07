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
   * Get inquiries for seller (all inquiries on their properties)
   */
  getInquiriesForSeller(sellerId: number): Observable<InquiryDTO[]> {
    return this.apiService.get<InquiryDTO[]>(
      `${this.endpoint}/seller/${sellerId}`
    );
  }

  /**
   * Reply to inquiry
   */
  replyToInquiry(inquiryId: number, replyMessage: string): Observable<InquiryDTO> {
    return this.apiService.post<InquiryDTO>(
      `${this.endpoint}/${inquiryId}/reply`,
      { message: replyMessage }
    );
  }

  /**
   * Mark inquiry as read/replied
   */
  markAsReplied(inquiryId: number): Observable<InquiryDTO> {
    return this.apiService.patch<InquiryDTO>(
      `${this.endpoint}/${inquiryId}/mark-replied`,
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
