import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { InquiryService } from '../../../shared/services/inquiry.service';
import { VisitService } from '../../../shared/services/visit.service';
import { DealService } from '../../../shared/services/deal.service';
import { PropertyService } from '../../../shared/services/property.service';
import { AuthService } from '../../../shared/services/auth.service';
import { PropertyDTO, InquiryDTO, VisitDTO, DealDTO } from '../../../shared/models';

interface InquiryWithProperty extends InquiryDTO {
  propertyTitle: string;
}

interface VisitWithProperty extends VisitDTO {
  propertyTitle: string;
}

interface DealWithProperty extends DealDTO {
  propertyTitle: string;
}

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  templateUrl: './seller-dashboard.component.html',
  styleUrl: './seller-dashboard.component.css'
})
export class SellerDashboardComponent implements OnInit, OnDestroy {
  // Properties
  properties: PropertyDTO[] = [];
  propertiesLoading = true;
  propertiesError: string | null = null;

  // Inquiries
  inquiries: InquiryWithProperty[] = [];
  inquiriesLoading = false;
  inquiriesError: string | null = null;

  // Visits
  visits: VisitWithProperty[] = [];
  visitsLoading = false;
  visitsError: string | null = null;

  // Deals
  deals: DealWithProperty[] = [];
  dealsLoading = false;
  dealsError: string | null = null;

  // Confirmation dialog state
  confirmDeletePropertyId: number | null = null;
  confirmDeleteInquiryId: number | null = null;

  userName = '';

  private destroy$ = new Subject<void>();

  constructor(
    private propertyService: PropertyService,
    private inquiryService: InquiryService,
    private visitService: VisitService,
    private dealService: DealService,
    private authService: AuthService,
    private snackBar: MatSnackBar
    , private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.userName = user.firstName;
        if (user.sellerId) {
          this.loadProperties(user.sellerId);
        } else {
          this.propertiesLoading = false;
          this.propertiesError = 'Seller profile not found. Please re-login.';
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProperties(sellerId: number): void {
    this.propertiesLoading = true;
    this.propertiesError = null;

    this.propertyService.getPropertiesBySeller(sellerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (props) => {
          this.properties = props;
          this.propertiesLoading = false;
          this.loadAggregatedData(props);
          this.cdr.detectChanges();
        },
        error: () => {
          this.propertiesLoading = false;
          this.propertiesError = 'Failed to load your properties. Please try again.';
          this.cdr.detectChanges();
        }
      });
  }

  retryLoadProperties(): void {
    const user = this.authService.getCurrentUser();
    if (user?.sellerId) {
      this.loadProperties(user.sellerId);
    }
  }

  private loadAggregatedData(properties: PropertyDTO[]): void {
    if (properties.length === 0) {
      this.inquiriesLoading = false;
      this.visitsLoading = false;
      this.dealsLoading = false;
      return;
    }

    this.loadInquiries(properties);
    this.loadVisits(properties);
    this.loadDeals(properties);
  }

  private loadInquiries(properties: PropertyDTO[]): void {
    this.inquiriesLoading = true;
    this.inquiriesError = null;

    const requests = properties.map(p =>
      this.inquiryService.getInquiriesByProperty(p.propertyId).pipe(
        catchError(() => of([] as InquiryDTO[])),
        takeUntil(this.destroy$)
      )
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        this.inquiries = results.flatMap((inquiries, i) =>
          inquiries.map(inq => ({ ...inq, propertyTitle: properties[i].title }))
        );
        this.inquiriesLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.inquiriesLoading = false;
        this.inquiriesError = 'Failed to load inquiries.';
        this.cdr.detectChanges();
      }
    });
  }

  private loadVisits(properties: PropertyDTO[]): void {
    this.visitsLoading = true;
    this.visitsError = null;

    const requests = properties.map(p =>
      this.visitService.getVisitsByProperty(p.propertyId).pipe(
        catchError(() => of([] as VisitDTO[])),
        takeUntil(this.destroy$)
      )
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        this.visits = results.flatMap((visits, i) =>
          visits.map(v => ({ ...v, propertyTitle: properties[i].title }))
        );
        this.visitsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.visitsLoading = false;
        this.visitsError = 'Failed to load visits.';
        this.cdr.detectChanges();
      }
    });
  }

  private loadDeals(properties: PropertyDTO[]): void {
    this.dealsLoading = true;
    this.dealsError = null;

    const requests = properties.map(p =>
      this.dealService.getDealsByProperty(p.propertyId).pipe(
        catchError(() => of([] as DealDTO[])),
        takeUntil(this.destroy$)
      )
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        this.deals = results.flatMap((deals, i) =>
          deals.map(d => ({ ...d, propertyTitle: properties[i].title }))
        );
        this.dealsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.dealsLoading = false;
        this.dealsError = 'Failed to load deals.';
        this.cdr.detectChanges();
      }
    });
  }

  // --- Property Delete ---
  confirmDeleteProperty(propertyId: number): void {
    this.confirmDeletePropertyId = propertyId;
  }

  cancelDeleteProperty(): void {
    this.confirmDeletePropertyId = null;
  }

  executeDeleteProperty(): void {
    const id = this.confirmDeletePropertyId;
    if (id == null) return;
    this.confirmDeletePropertyId = null;

    this.propertyService.deleteProperty(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.properties = this.properties.filter(p => p.propertyId !== id);
          this.snackBar.open('Property deleted.', 'Close', { duration: 3000 });
          this.cdr.detectChanges();
        },
        error: () => {
          this.snackBar.open('Failed to delete property. Please try again.', 'Dismiss', { duration: 5000 });
          this.cdr.detectChanges();
        }
      });
  }

  // --- Inquiry Actions ---
  markInquiryReplied(inquiryId: number): void {
    this.inquiryService.replyToInquiry(inquiryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          const idx = this.inquiries.findIndex(i => i.inquiryId === inquiryId);
          if (idx !== -1) {
            this.inquiries[idx] = { ...this.inquiries[idx], isReplied: updated.isReplied };
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.snackBar.open('Failed to mark inquiry as replied.', 'Dismiss', { duration: 5000 });
          this.cdr.detectChanges();
        }
      });
  }

  confirmDeleteInquiry(inquiryId: number): void {
    this.confirmDeleteInquiryId = inquiryId;
  }

  cancelDeleteInquiry(): void {
    this.confirmDeleteInquiryId = null;
  }

  executeDeleteInquiry(): void {
    const id = this.confirmDeleteInquiryId;
    if (id == null) return;
    this.confirmDeleteInquiryId = null;

    this.inquiryService.deleteInquiry(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.inquiries = this.inquiries.filter(i => i.inquiryId !== id);
          this.cdr.detectChanges();
        },
        error: () => {
          this.snackBar.open('Failed to delete inquiry.', 'Dismiss', { duration: 5000 });
          this.cdr.detectChanges();
        }
      });
  }

  // --- Visit Actions ---
  markVisitCompleted(visitId: number): void {
    this.visitService.completeVisit(visitId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          const idx = this.visits.findIndex(v => v.visitId === visitId);
          if (idx !== -1) {
            this.visits[idx] = { ...this.visits[idx], isVisited: updated.isVisited };
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.snackBar.open('Failed to mark visit as completed.', 'Dismiss', { duration: 5000 });
          this.cdr.detectChanges();
        }
      });
  }

  // --- Computed stats ---
  get pendingVisitsCount(): number {
    return this.visits.filter(v => !v.isVisited).length;
  }

  // --- Formatting ---
  formatPrice(amount: number | undefined): string {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '—';
    return new Date(date).toISOString().split('T')[0];
  }

  getPropertyPrice(p: PropertyDTO): string {
    if (p.price != null) return this.formatPrice(p.price);
    if (p.unitPrice != null) return this.formatPrice(p.unitPrice) + '/plot';
    return '—';
  }
}
