import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PropertyService } from '../../../shared/services/property.service';
import { PropertyDTO, PropertyCategory } from '../../../shared/models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import AOS from 'aos';

@Component({
  selector: 'app-browse-properties',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.css'
})
export class BrowsePropertiesComponent implements OnInit, OnDestroy {
  properties: PropertyDTO[] = [];
  filteredProperties: PropertyDTO[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Filter state
  searchTerm = '';
  selectedCategory: number | null = null;
  selectedStatus = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minBedrooms: number | null = null;

  categories = [
    { id: PropertyCategory.RESIDENTIAL, name: 'Residential' },
    { id: PropertyCategory.COMMERCIAL, name: 'Commercial' },
    { id: PropertyCategory.LAND, name: 'Land' }
  ];

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private propertyService: PropertyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    AOS.init({ duration: 600, easing: 'ease-out-cubic', once: true, offset: 60 });

    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => this.loadProperties());

    this.loadProperties();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProperties(): void {
    this.isLoading = true;
    this.errorMessage = null;

    let request$: Observable<PropertyDTO[]>;

    if (this.searchTerm) {
      request$ = this.propertyService.searchByLocation(this.searchTerm);
    } else if (this.selectedCategory) {
      request$ = this.propertyService.getPropertiesByCategory(this.selectedCategory);
    } else {
      request$ = this.propertyService.getAllProperties();
    }

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.properties = data;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
        // Re-init AOS after new cards render
        setTimeout(() => AOS.refresh(), 100);
      },
      error: (err) => {
        this.errorMessage = 'Failed to load properties. Please try again.';
        console.error('Error loading properties:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    this.filteredProperties = this.properties.filter((property) => {
      // Search term
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        const matchesLocation = property.location.toLowerCase().includes(term);
        const matchesTitle = property.title.toLowerCase().includes(term);
        if (!matchesLocation && !matchesTitle) return false;
      }

      // Category
      if (this.selectedCategory && property.propertyCategoryId !== this.selectedCategory) {
        return false;
      }

      // Status
      if (this.selectedStatus) {
        const propStatus = (property.status || property.type || '').toLowerCase();
        if (!propStatus.includes(this.selectedStatus.toLowerCase())) return false;
      }

      // Price range
      const price = property.propertyCategoryId === PropertyCategory.LAND
        ? property.unitPrice
        : property.price;
      if (this.minPrice != null && (price == null || price < this.minPrice)) return false;
      if (this.maxPrice != null && (price == null || price > this.maxPrice)) return false;

      // Bedrooms
      if (this.minBedrooms != null && (property.bedroomCount == null || property.bedroomCount < this.minBedrooms)) {
        return false;
      }

      return true;
    });
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.selectedCategory ||
      this.selectedStatus ||
      this.minPrice ||
      this.maxPrice ||
      this.minBedrooms
    );
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onPriceChange(): void {
    this.applyFilters();
  }

  onBedroomsChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = null;
    this.selectedStatus = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.minBedrooms = null;
    this.loadProperties();
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Property';
  }

  getCategoryClass(categoryId: number): string {
    switch (categoryId) {
      case PropertyCategory.RESIDENTIAL: return 'badge-residential';
      case PropertyCategory.COMMERCIAL:  return 'badge-commercial';
      case PropertyCategory.LAND:        return 'badge-land';
      default:                           return 'badge-residential';
    }
  }

  getPropertyBedrooms(property: PropertyDTO): number {
    return property.bedroomCount ?? 0;
  }

  getPropertyBathrooms(property: PropertyDTO): number {
    return property.bathroomCount ?? 0;
  }

  getPropertyPrice(property: PropertyDTO): string {
    const amount = property.propertyCategoryId === PropertyCategory.LAND
      ? property.unitPrice
      : property.price;
    if (amount == null) return 'Price N/A';
    return property.propertyCategoryId === PropertyCategory.LAND
      ? `${this.formatPrice(amount)}/plot`
      : this.formatPrice(amount);
  }

  getPropertyImage(property: PropertyDTO): string {
    if (property.imageUrls && property.imageUrls.length > 0) {
      return this.normalizeImageUrl(property.imageUrls[0]);
    }
    return this.normalizeImageUrl('');
  }

  private normalizeImageUrl(imageValue: string): string {
    const placeholder = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80';
    const normalized = (imageValue || '').trim();
    if (!normalized) return placeholder;
    if (normalized.startsWith('data:image/') || normalized.startsWith('http://') || normalized.startsWith('https://')) {
      return normalized;
    }
    return `data:image/jpeg;base64,${normalized}`;
  }

  formatPrice(price: number): string {
    return `Rs. ${new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 }).format(price)}`;
  }
}
