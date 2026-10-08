import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { UserResponseDTO, UserRole } from '../../models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  currentUser: UserResponseDTO | null = null;
  isAuthenticated = false;
  availableRoleIds: number[] = [];
  isSwitchingRole = false;
  switchRoleError: string | null = null;
  UserRole = UserRole;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      });

    this.authService.availableRoleIds$
      .pipe(takeUntil(this.destroy$))
      .subscribe(roleIds => {
        this.availableRoleIds = roleIds;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.isMenuOpen = false;
  }

  canToggleRoles(): boolean {
    return this.isAuthenticated &&
      !!this.currentUser &&
      this.availableRoleIds.includes(UserRole.BUYER) &&
      this.availableRoleIds.includes(UserRole.SELLER);
  }

  getDashboardLink(): string {
    return this.authService.getDashboardRouteForRole(this.currentUser?.activeRoleId);
  }

  getToggleTargetRole(): UserRole | null {
    if (!this.canToggleRoles() || !this.currentUser) {
      return null;
    }
    return this.currentUser.activeRoleId === UserRole.BUYER ? UserRole.SELLER : UserRole.BUYER;
  }

  switchRole(): void {
    const targetRole = this.getToggleTargetRole();

    if (!targetRole || !this.currentUser) {
      return;
    }

    this.isSwitchingRole = true;
    this.switchRoleError = null;
    this.authService.switchRole(targetRole)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser) => {
          this.isSwitchingRole = false;
          this.router.navigateByUrl(this.authService.getDashboardRouteForRole(updatedUser.activeRoleId));
          this.isMenuOpen = false;
        },
        error: () => {
          this.isSwitchingRole = false;
          this.switchRoleError = 'Role switch failed. Please try again.';
        }
      });
  }
}
