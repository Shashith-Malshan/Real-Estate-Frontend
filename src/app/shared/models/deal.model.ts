/**
 * Deal Models
 */

export interface DealDTO {
  dealId: number;
  propertyId: number;
  customerId: number;
  agreedTotalAmount: number;
  dealDate: string | Date;
}

export interface DealCreateRequest {
  propertyId: number;
  customerId: number;
  agreedTotalAmount: number;
}
