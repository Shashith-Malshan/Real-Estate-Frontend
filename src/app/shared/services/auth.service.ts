import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import {
  UserResponseDTO, 
  UserRegistrationDTO, 
  LoginRequest, 
  UserRole
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = '/api/auth';
  private currentUserSubject = new BehaviorSubject<UserResponseDTO | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private availableRoleIdsSubject = new BehaviorSubject<number[]>([]);

  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  availableRoleIds$ = this.availableRoleIdsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  /**
   * Register a new user
   */
  register(userData: UserRegistrationDTO): Observable<UserResponseDTO> {
    return this.http.post<UserResponseDTO>(`${this.apiUrl}/register`, userData).pipe(
      tap(user => this.storeAuth(user))
    );
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<UserResponseDTO> {
    return this.http.post<UserResponseDTO>(`${this.apiUrl}/login`, credentials).pipe(
      tap(user => this.storeAuth(user))
    );
  }

  /**
   * Switch the active role for the current user
   */
  switchRole(roleId: number): Observable<UserResponseDTO> {
    const user = this.getCurrentUser();

    if (!user) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.post<UserResponseDTO>(`${this.apiUrl}/switch-role`, {
      userId: user.userId,
      roleId
    }).pipe(
      tap(updatedUser => this.storeAuth(updatedUser))
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
    this.availableRoleIdsSubject.next([]);
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
   * Get the currently cached role IDs available to the user
   */
  getAvailableRoleIds(): number[] {
    return this.availableRoleIdsSubject.value;
  }

  /**
   * Returns true when the user can toggle between buyer and seller
   */
  canToggleBuyerSeller(): boolean {
    const roleIds = this.availableRoleIdsSubject.value;
    return roleIds.includes(UserRole.BUYER) && roleIds.includes(UserRole.SELLER);
  }

  /**
   * Resolve the dashboard route for a role
   */
  getDashboardRouteForRole(roleId: number | null | undefined): string {
    switch (roleId) {
      case UserRole.SELLER:
        return '/seller';
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.BUYER:
      default:
        return '/dashboard';
    }
  }

  /**
   * Resolve the safest post-login route for the current role
   */
  getPostLoginRoute(roleId: number | null | undefined, redirectUrl: string | null): string {
    if (redirectUrl && this.isAllowedRedirectForRole(redirectUrl, roleId)) {
      return redirectUrl;
    }

    return this.getDashboardRouteForRole(roleId);
  }

  /**
   * Store authentication data
   */
  private storeAuth(user: UserResponseDTO): void {
    const tokenToStore = user.token || btoa(user.email + ':' + Date.now());
    localStorage.setItem('auth_token', tokenToStore);
    
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    this.loadAvailableRoles(user.userId);
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
        this.loadAvailableRoles(user.userId);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        this.logout();
      }
    }
  }

  private loadAvailableRoles(userId: number): void {
    this.http.get<number[]>(`${this.apiUrl}/users/${userId}/roles`).subscribe({
      next: roleIds => this.availableRoleIdsSubject.next(roleIds),
      error: () => this.availableRoleIdsSubject.next([])
    });
  }

  private isAllowedRedirectForRole(redirectUrl: string, roleId: number | null | undefined): boolean {
    if (!redirectUrl.startsWith('/')) {
      return false;
    }

    if (roleId === UserRole.SELLER) {
      return redirectUrl.startsWith('/seller') || redirectUrl === '/login' || redirectUrl === '/register';
    }

    if (roleId === UserRole.ADMIN) {
      return redirectUrl.startsWith('/admin');
    }

    return redirectUrl.startsWith('/dashboard') || redirectUrl.startsWith('/marketplace') || redirectUrl === '/';
  }
}
