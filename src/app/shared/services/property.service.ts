import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  PropertyDTO, 
  PropertyCreateDTO, 
  PropertyUpdateDTO,
  PropertyCategory
} from '../models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private readonly endpoint = '/properties';

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {}

  /**
   * Get all properties with optional filters
   */
  getAllProperties(filters?: {
    category?: PropertyCategory;
    location?: string;
    district?: string;
    maxPrice?: number;
    minPrice?: number;
    page?: number;
    pageSize?: number;
  }): Observable<PropertyDTO[]> {
    return this.apiService.get<PropertyDTO[]>(this.endpoint, filters);
  }

  /**
   * Get property by ID
   */
  getPropertyById(propertyId: number): Observable<PropertyDTO> {
    return this.apiService.get<PropertyDTO>(`${this.endpoint}/${propertyId}`);
  }

  /**
   * Search properties
   */
  searchProperties(searchTerm: string, filters?: any): Observable<PropertyDTO[]> {
    const params = { ...filters, search: searchTerm };
    return this.apiService.get<PropertyDTO[]>(`${this.endpoint}/search`, params);
  }

  /**
   * Get properties by category
   */
  getPropertiesByCategory(categoryId: PropertyCategory): Observable<PropertyDTO[]> {
    return this.apiService.get<PropertyDTO[]>(
      `${this.endpoint}/category/${categoryId}`
    );
  }

  /**
   * Get properties by seller
   */
  getPropertiesBySeller(sellerId: number): Observable<PropertyDTO[]> {
    return this.apiService.get<PropertyDTO[]>(
      `${this.endpoint}/seller/${sellerId}`
    );
  }

  /**
   * Create new property
   */
  createProperty(propertyData: PropertyCreateDTO): Observable<PropertyDTO> {
    return this.apiService.post<PropertyDTO>(
      this.endpoint,
      propertyData
    );
  }

  /**
   * Update existing property
   */
  updateProperty(propertyId: number, propertyData: Partial<PropertyCreateDTO>): Observable<PropertyDTO> {
    return this.apiService.put<PropertyDTO>(
      `${this.endpoint}/${propertyId}`,
      propertyData
    );
  }

  /**
   * Delete property
   */
  deleteProperty(propertyId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${propertyId}`);
  }

  /**
   * Get featured properties
   */
  getFeaturedProperties(limit: number = 6): Observable<PropertyDTO[]> {
    return this.apiService.get<PropertyDTO[]>(
      `${this.endpoint}/featured`,
      { limit }
    );
  }

  /**
   * Get recently added properties
   */
  getRecentProperties(limit: number = 6): Observable<PropertyDTO[]> {
    return this.apiService.get<PropertyDTO[]>(
      `${this.endpoint}/recent`,
      { limit }
    );
  }
}
