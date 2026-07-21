/**
 * Inquiry Models
 */

export interface InquiryDTO {
  inquiryId: number;
  customerId: number;
  propertyId: number;
  message: string;
  inquiryDate: string | Date;
  isReplied: boolean;
}

export interface InquiryCreateRequest {
  customerId: number;
  propertyId: number;
  message: string;
}
