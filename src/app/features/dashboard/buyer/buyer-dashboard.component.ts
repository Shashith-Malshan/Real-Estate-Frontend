import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InquiryService } from '../../../shared/services/inquiry.service';
import { VisitService } from '../../../shared/services/visit.service';
import { DealService } from '../../../shared/services/deal.service';
import { AuthService } from '../../../shared/services/auth.service';
import { InquiryDTO, VisitDTO, DealDTO } from '../../../shared/models';

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

  private destroy$ = new Subject<void>();

  constructor(
    private inquiryService: InquiryService,
    private visitService: VisitService,
    private dealService: DealService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get user name
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user) {
          this.userName = user.firstName;
        }
      });

    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Get user ID from auth service currentUser$ observable
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (!user || !user.userId) {
          this.errorMessage = 'User not authenticated';
          this.isLoading = false;
          return;
        }

        const userId = user.userId;

        // Load all data in parallel
        forkJoin({
          inquiries: this.inquiryService.getInquiriesByCustomer(userId),
          visits: this.visitService.getVisitsByCustomer(userId),
          deals: this.dealService.getDealsByCustomer(userId)
        })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (data) => {
              this.inquiries = data.inquiries;
              this.visits = data.visits;
              this.deals = data.deals;
              this.isLoading = false;
            },
            error: (err) => {
              this.errorMessage = 'Failed to load dashboard data. Please try again.';
              console.error('Error loading dashboard data:', err);
              this.isLoading = false;
            }
          });
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}
