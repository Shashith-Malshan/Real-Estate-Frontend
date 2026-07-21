/**
 * Visit Models
 */

export interface VisitDTO {
  visitId: number;
  customerId: number;
  propertyId: number;
  visitPlannedDate: string | Date;
  isVisited: boolean;
}

export interface VisitCreateRequest {
  customerId: number;
  propertyId: number;
  visitPlannedDate: string;
}
