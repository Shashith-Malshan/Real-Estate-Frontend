import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, filter, tap } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { InquiryService } from '../../../shared/services/inquiry.service';
import { VisitService } from '../../../shared/services/visit.service';
import { DealService } from '../../../shared/services/deal.service';
import { AuthService } from '../../../shared/services/auth.service';
import { InquiryDTO, VisitDTO, DealDTO } from '../../../shared/models';

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './buyer-dashboard.component.html',
  styleUrl: './buyer-dashboard.component.css'
})
export class BuyerDashboardComponent implements OnInit, OnDestroy {
  // Stats
  inquiries: InquiryDTO[] = [];
  visits: VisitDTO[] = [];
  deals: DealDTO[] = [];

  // Loading states
  isLoading = true;
  errorMessage: string | null = null;

  // Tabs
  activeTab: 'inquiries' | 'visits' | 'deals' = 'inquiries';

  // User info
  userName = '';
  private currentCustomerId: number | null = null;
  private dashboardDataLoaded = false;

  private destroy$ = new Subject<void>();

  constructor(
    private inquiryService: InquiryService,
    private visitService: VisitService,
    private dealService: DealService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get user name and load dashboard data once user is available
    this.authService.currentUser$
      .pipe(
        filter(user => !!user),
        tap((user) => {
          this.userName = user.firstName;
          this.currentCustomerId = user.customerId ?? null;
          // Load dashboard data only once when user becomes available
          if (!this.dashboardDataLoaded) {
            this.dashboardDataLoaded = true;
            this.loadDashboardData();
          }
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.dashboardDataLoaded = false;
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    if (!this.currentCustomerId) {
      this.errorMessage = 'User not authenticated';
      this.isLoading = false;
      return;
    }

    // Load all data in parallel
    forkJoin({
      inquiries: this.inquiryService.getInquiriesByCustomer(this.currentCustomerId),
      visits: this.visitService.getVisitsByCustomer(this.currentCustomerId),
      deals: this.dealService.getDealsByCustomer(this.currentCustomerId)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.inquiries = data.inquiries;
          this.visits = data.visits;
          this.deals = data.deals;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = 'Failed to load dashboard data. Please try again.';
          console.error('Error loading dashboard data:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  setActiveTab(tab: 'inquiries' | 'visits' | 'deals'): void {
    this.activeTab = tab;
  }

  getInquiryStats(): { pending: number; replied: number } {
    return {
      pending: this.inquiries.filter((i) => !i.isReplied).length,
      replied: this.inquiries.filter((i) => i.isReplied).length
    };
  }

  getVisitStats(): { scheduled: number; completed: number } {
    return {
      scheduled: this.visits.filter((v) => !v.isVisited).length,
      completed: this.visits.filter((v) => v.isVisited).length
    };
  }

  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatPrice(price: number): string {
    return `Rs. ${new Intl.NumberFormat('en-LK', {
      maximumFractionDigits: 0
    }).format(price)}`;
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}
