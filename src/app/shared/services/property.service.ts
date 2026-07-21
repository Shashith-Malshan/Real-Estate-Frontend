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
   * Search properties by advanced filters
   */
  searchProperties(filters: { district?: string; categoryId?: number }): Observable<PropertyDTO[]> {
    return this.apiService.get<PropertyDTO[]>(`${this.endpoint}/search`, filters);
  }

  /**
   * Search properties by location string
   */
  searchByLocation(location: string): Observable<PropertyDTO[]> {
    return this.apiService.get<PropertyDTO[]>(`${this.endpoint}/search/location`, { location });
  }

  /**
   * Search properties by district
   */
  searchByDistrict(district: string): Observable<PropertyDTO[]> {
    return this.apiService.get<PropertyDTO[]>(`${this.endpoint}/search/district`, { district });
  }

  /**
   * Get properties by category
   */
  getPropertiesByCategory(categoryId: PropertyCategory): Observable<PropertyDTO[]> {
    return this.apiService.get<PropertyDTO[]>(
      `${this.endpoint}/search/category`, { categoryId }
    );
  }



  /**
   * Get properties by seller ID
   */
  getPropertiesBySeller(sellerId: number): Observable<PropertyDTO[]> {
    return this.apiService.get<PropertyDTO[]>(`${this.endpoint}/seller/${sellerId}`);
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


}
