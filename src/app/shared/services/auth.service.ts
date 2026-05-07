import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { 
  UserResponseDTO, 
  UserRegistrationDTO, 
  LoginRequest, 
  AuthResponse,
  UserRole
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth'; // Update with actual backend URL
  private currentUserSubject = new BehaviorSubject<UserResponseDTO | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  /**
   * Register a new user
   */
  register(userData: UserRegistrationDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => this.storeAuth(response))
    );
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.storeAuth(response))
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Get current user
   */
  getCurrentUser(): UserResponseDTO | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Check if current user has specific role
   */
  hasRole(roleId: number | UserRole): boolean {
    const user = this.getCurrentUser();
    return user ? user.activeRoleId === roleId : false;
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  /**
   * Check if current user is seller
   */
  isSeller(): boolean {
    return this.hasRole(UserRole.SELLER);
  }

  /**
   * Check if current user is buyer
   */
  isBuyer(): boolean {
    return this.hasRole(UserRole.BUYER);
  }

  /**
   * Store authentication data
   */
  private storeAuth(response: AuthResponse): void {
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    localStorage.setItem('current_user', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Load stored user from localStorage on service initialization
   */
  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('current_user');
    const token = localStorage.getItem('auth_token');

    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser) as UserResponseDTO;
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        this.logout();
      }
    }
  }
}
