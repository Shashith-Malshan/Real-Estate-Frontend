import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PropertyService } from '../../../shared/services/property.service';
import { InquiryService } from '../../../shared/services/inquiry.service';
import { VisitService } from '../../../shared/services/visit.service';
import { AuthService } from '../../../shared/services/auth.service';
import { PropertyDTO, InquiryCreateRequest, VisitCreateRequest, PropertyCategory } from '../../../shared/models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatIconModule, 
    MatButtonModule, 
    MatInputModule, 
    MatFormFieldModule
  ],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.css'
})
export class PropertyDetailComponent implements OnInit, OnDestroy {
  property: PropertyDTO | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  selectedImageIndex = 0;

  getPropertyPrice(property: PropertyDTO | null): number {
    return property?.price ?? 0;
  }

  getPropertyBedrooms(property: PropertyDTO | null): number {
    return property?.bedroomCount ?? 0;
  }

  getPropertyBathrooms(property: PropertyDTO | null): number {
    return property?.bathroomCount ?? 0;
  }

  inquiryForm: FormGroup;
  visitForm: FormGroup;
  submitError: string | null = null;
  submitSuccess: string | null = null;
  isSubmittingInquiry = false;
  isSubmittingVisit = false;

  showInquiryForm = false;
  showVisitForm = false;

  isAuthenticated = false;
  currentUserId: number | null = null;

  categories = [
    { id: PropertyCategory.RESIDENTIAL, name: 'Residential' },
    { id: PropertyCategory.COMMERCIAL, name: 'Commercial' },
    { id: PropertyCategory.LAND, name: 'Land' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private inquiryService: InquiryService,
    private visitService: VisitService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.inquiryForm = this.formBuilder.group({
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });

    this.visitForm = this.formBuilder.group({
      visitPlannedDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Subscribe to auth state to get current user ID
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.currentUserId = user.userId;
          this.isAuthenticated = true;
        } else {
          this.currentUserId = null;
          this.isAuthenticated = false;
        }
      });

    this.loadProperty();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProperty(): void {
    const propertyId = this.route.snapshot.paramMap.get('id');

    if (!propertyId) {
      this.errorMessage = 'Invalid property ID';
      this.isLoading = false;
      return;
    }

    this.propertyService
      .getPropertyById(parseInt(propertyId))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.property = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load property details. Please try again.';
          console.error('Error loading property:', err);
          this.isLoading = false;
        }
      });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }

  getPropertyHeroImage(): string {
    // Display selected image or first image, with fallback to placeholder
    if (this.property?.imageUrls && this.property.imageUrls.length > 0) {
      return this.property.imageUrls[this.selectedImageIndex] || this.property.imageUrls[0];
    }
    // Fallback to placeholder image
    return 'https://images.unsplash.com/photo-1613490908575-9b7e7abafb1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80';
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  toggleInquiryForm(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { redirectUrl: this.router.url } });
      return;
    }
    this.showInquiryForm = !this.showInquiryForm;
    this.submitError = null;
    this.submitSuccess = null;
  }

  toggleVisitForm(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { redirectUrl: this.router.url } });
      return;
    }
    this.showVisitForm = !this.showVisitForm;
    this.submitError = null;
    this.submitSuccess = null;
  }

  submitInquiry(): void {
    if (this.inquiryForm.invalid || !this.property || !this.currentUserId) {
      return;
    }

    this.isSubmittingInquiry = true;

    const inquiryRequest: InquiryCreateRequest = {
      customerId: this.currentUserId,
      propertyId: this.property.propertyId,
      message: this.inquiryForm.get('message')?.value
    };

    this.inquiryService
      .createInquiry(inquiryRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitSuccess = 'Inquiry sent successfully!';
          this.inquiryForm.reset();
          this.showInquiryForm = false;
          this.isSubmittingInquiry = false;
          setTimeout(() => {
            this.submitSuccess = null;
          }, 5000);
        },
        error: (err) => {
          this.submitError = 'Failed to send inquiry. Please try again.';
          console.error('Error submitting inquiry:', err);
          this.isSubmittingInquiry = false;
        }
      });
  }

  submitVisit(): void {
    if (this.visitForm.invalid || !this.property || !this.currentUserId) {
      return;
    }

    this.isSubmittingVisit = true;

    const visitRequest: VisitCreateRequest = {
      customerId: this.currentUserId,
      propertyId: this.property.propertyId,
      visitPlannedDate: this.visitForm.get('visitPlannedDate')?.value
    };

    this.visitService
      .scheduleVisit(visitRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitSuccess = 'Visit scheduled successfully!';
          this.visitForm.reset();
          this.showVisitForm = false;
          this.isSubmittingVisit = false;
          setTimeout(() => {
            this.submitSuccess = null;
          }, 5000);
        },
        error: (err) => {
          this.submitError = 'Failed to schedule visit. Please try again.';
          console.error('Error scheduling visit:', err);
          this.isSubmittingVisit = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/marketplace/browse']);
  }
}
