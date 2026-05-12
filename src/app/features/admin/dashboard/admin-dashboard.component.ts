import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService, SystemMetricsDTO } from '../../../shared/services/admin.service';
import { UserResponseDTO } from '../../../shared/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  // Metrics
  metrics: SystemMetricsDTO | null = null;
  metricsLoading = true;
  metricsError: string | null = null;

  // Users
  users: UserResponseDTO[] = [];
  filteredUsers: UserResponseDTO[] = [];
  usersLoading = true;
  usersError: string | null = null;
  searchQuery = '';

  // Pagination
  pageSize = 25;
  currentPage = 0;

  // Confirmation
  confirmDeleteUser: UserResponseDTO | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMetrics();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMetrics(): void {
    this.metricsLoading = true;
    this.adminService.getSystemMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.metrics = data;
          this.metricsLoading = false;
        },
        error: () => {
          this.metricsError = 'Failed to load system metrics.';
          this.metricsLoading = false;
        }
      });
  }

  loadUsers(): void {
    this.usersLoading = true;
    this.usersError = null;
    this.adminService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.applyFilter();
          this.usersLoading = false;
        },
        error: () => {
          this.usersError = 'Failed to load users.';
          this.usersLoading = false;
        }
      });
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.applyFilter();
  }

  applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(u => {
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
        return fullName.includes(q) || u.email.toLowerCase().includes(q);
      });
    }
  }

  get pagedUsers(): UserResponseDTO[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  prevPage(): void {
    if (this.currentPage > 0) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) this.currentPage++;
  }

  // Delete
  openDeleteConfirm(user: UserResponseDTO): void {
    this.confirmDeleteUser = user;
  }

  cancelDelete(): void {
    this.confirmDeleteUser = null;
  }

  executeDelete(): void {
    const user = this.confirmDeleteUser;
    if (!user) return;
    this.confirmDeleteUser = null;

    this.adminService.deleteUser(user.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.users = this.users.filter(u => u.userId !== user.userId);
          this.applyFilter();
          this.snackBar.open(`User "${user.firstName} ${user.lastName}" deleted.`, 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Failed to delete user. Please try again.', 'Dismiss');
        }
      });
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getFullName(user: UserResponseDTO): string {
    return `${user.firstName} ${user.lastName}`;
  }
}
