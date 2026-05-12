import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PropertyService } from '../../../shared/services/property.service';
import { PropertyDTO, PropertyCategory } from '../../../shared/models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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

  // Filter properties
  searchTerm = '';
  selectedCategory: number | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minBedrooms: number | null = null;

  // Categories for dropdown
  categories = [
    { id: PropertyCategory.RESIDENTIAL, name: 'Residential' },
    { id: PropertyCategory.COMMERCIAL, name: 'Commercial' },
    { id: PropertyCategory.LAND, name: 'Land' }
  ];

  private destroy$ = new Subject<void>();

  private searchSubject = new Subject<string>();

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    // Setup search debounce
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadProperties();
    });

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

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.properties = data;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load properties. Please try again.';
          console.error('Error loading properties:', err);
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredProperties = this.properties.filter((property) => {
      // Local fallback for title search if searchByLocation didn't cover it
      if (this.searchTerm && !property.location.toLowerCase().includes(this.searchTerm.toLowerCase())) {
        if (!property.title.toLowerCase().includes(this.searchTerm.toLowerCase())) {
          return false;
        }
      }

      // Category filter
      if (this.selectedCategory && property.propertyCategoryId !== this.selectedCategory) {
        return false;
      }

      // Price range filter
      if (this.minPrice && (property.price === undefined || property.price < this.minPrice)) {
        return false;
      }
      if (this.maxPrice && (property.price === undefined || property.price > this.maxPrice)) {
        return false;
      }

      // Bedrooms filter
      if (this.minBedrooms && (property.bedroomCount === undefined || property.bedroomCount < this.minBedrooms)) {
        return false;
      }

      return true;
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onCategoryChange(): void {
    this.loadProperties();
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
    this.minPrice = null;
    this.maxPrice = null;
    this.minBedrooms = null;
    this.loadProperties();
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  getPropertyBedrooms(property: PropertyDTO): number {
    return property.bedroomCount ?? 0;
  }

  getPropertyBathrooms(property: PropertyDTO): number {
    return property.bathroomCount ?? 0;
  }

  getPropertyPrice(property: PropertyDTO): number {
    return property.price ?? 0;
  }

  getPropertyImage(property: PropertyDTO): string {
    // Use first uploaded image if available, otherwise use placeholder
    if (property.imageUrls && property.imageUrls.length > 0) {
      return property.imageUrls[0];
    }
    // Fallback to placeholder image
    return 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }
}
