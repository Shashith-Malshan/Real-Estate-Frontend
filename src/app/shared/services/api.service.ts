import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080/api'; // Update with actual backend URL

  constructor(private http: HttpClient) {}

  /**
   * GET request with optional parameters
   */
  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] != null) {
          httpParams = httpParams.set(key, String(params[key]));
        }
      });
    }

    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  /**
   * POST request with optional headers
   */
  post<T>(endpoint: string, body: any, headers?: Record<string, string>): Observable<T> {
    const httpHeaders = this.buildHeaders(headers);
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, { headers: httpHeaders });
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any, headers?: Record<string, string>): Observable<T> {
    const httpHeaders = this.buildHeaders(headers);
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, { headers: httpHeaders });
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: any, headers?: Record<string, string>): Observable<T> {
    const httpHeaders = this.buildHeaders(headers);
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, { headers: httpHeaders });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, headers?: Record<string, string>): Observable<T> {
    const httpHeaders = this.buildHeaders(headers);
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { headers: httpHeaders });
  }

  /**
   * Build HTTP headers, adding auth token if available
   */
  private buildHeaders(customHeaders?: Record<string, string>): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Add custom headers
    if (customHeaders) {
      Object.keys(customHeaders).forEach(key => {
        headers = headers.set(key, customHeaders[key]);
      });
    }

    // Add authorization token if available
    const token = this.getAuthToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Get stored auth token (to be implemented by auth service)
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
