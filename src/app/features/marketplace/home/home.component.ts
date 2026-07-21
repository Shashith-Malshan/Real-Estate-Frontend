import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PropertyService } from '../../../shared/services/property.service';
import { PropertyDTO } from '../../../shared/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredProperties: PropertyDTO[] = [];
  isLoadingProperties = true;
  propertiesLoadFailed = false;

  private destroy$ = new Subject<void>();

  constructor(
    private propertyService: PropertyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProperties();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFeaturedProperties(): void {
    this.isLoadingProperties = true;
    this.propertiesLoadFailed = false;

    this.propertyService.getAllProperties()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (properties) => {
          this.featuredProperties = properties.slice(0, 6);
          this.isLoadingProperties = false;
        },
        error: () => {
          this.propertiesLoadFailed = true;
          this.isLoadingProperties = false;
        }
      });
  }

  navigateToProperty(propertyId: number): void {
    this.router.navigate(['/marketplace/property', propertyId]);
  }

  getPropertyPrice(p: PropertyDTO): string {
    const amount = p.price ?? p.unitPrice;
    if (amount == null) return 'Price on request';
    const formatted = new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
    return p.unitPrice != null && p.price == null ? formatted + '/plot' : formatted;
  }

  skeletonItems = Array(6).fill(0);
}
