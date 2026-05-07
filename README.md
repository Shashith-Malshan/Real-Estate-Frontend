# Real Estate Frontend

A comprehensive Angular 21 frontend for a direct Customer-to-Seller real estate marketplace. This application allows users to browse properties, manage listings, schedule visits, create inquiries, finalize deals, and administer the platform.

**Version**: 1.0.0  
**Build**: Angular 21.1 | TypeScript 5.9 | Tailwind CSS 4.1  
**Last Updated**: May 7, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Development](#development)
6. [Project Structure](#project-structure)
7. [API Integration](#api-integration)
8. [Available Scripts](#available-scripts)
9. [Building](#building)
10. [Testing](#testing)
11. [Architecture](#architecture)
12. [Contributing](#contributing)

---

## Overview

This frontend application is designed to work with the **Real Estate Backend API** (Spring Boot 4.0.6). It implements a **direct Customer-to-Seller real estate model** where:

- **Customers (Buyers)** can browse properties, schedule visits, submit inquiries, and finalize deals.
- **Sellers** can list properties (residential, commercial, or land), manage inquiries, track visits, and view deals.
- **Admins** can oversee users, listings, and system-wide metrics.

The application uses:
- **Angular 21** for the frontend framework
- **Standalone components** for modular, tree-shakeable architecture
- **TypeScript** for type safety
- **Tailwind CSS** for responsive, utility-first styling
- **RxJS** for reactive state and HTTP streams
- **Angular Router** for SPA routing with role-based guards

---

## Features

### Public Features
- **Property Marketplace**: Browse all properties with search and filtering by district, location, or category.
- **Property Details**: View full property information, images, inquiry count, and visit history.
- **User Registration**: Create new buyer or seller accounts.
- **User Login**: Authenticate and access role-specific features.

### Customer Features
- **Property Search & Filter**: Find properties by district, location, or category.
- **Property Inquiry**: Submit questions and messages to sellers.
- **Visit Scheduling**: Schedule property viewings.
- **My Dashboard**: View submitted inquiries, scheduled visits, and completed deals.
- **Profile Management**: Update personal information and contact details.

### Seller Features
- **Property Management**: Create, edit, and delete property listings.
- **Category-Specific Listings**: Add residential (house/apartment), commercial (office/shopping/restaurant/hotel), or land properties.
- **Inquiry Management**: View and respond to customer inquiries.
- **Visit Management**: Track scheduled visits and mark them as completed.
- **Seller Dashboard**: View listing performance, inquiry counts, and deal history.

### Admin Features
- **User Management**: View all users, roles, and registration details.
- **Listing Oversight**: Monitor all properties and category distributions.
- **Platform Metrics**: View visit and inquiry statistics.

---

## Prerequisites

Ensure the following are installed on your system:

- **Node.js** >= 18.x (includes npm)
- **npm** >= 11.x
- **Angular CLI** >= 21.1.4 (optional, for local development)
- **Real Estate Backend API** running at `http://localhost:8080` (see [API Integration](#api-integration))

---

## Installation

1. **Clone the repository** or navigate to the project directory:
   ```bash
   cd "Real Estate-Frontend/Real-Estate-Frontend"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify Angular CLI is available**:
   ```bash
   ng version
   ```

---

## Development

### Start the Development Server

```bash
npm start
```

or

```bash
ng serve
```

- The application will be available at `http://localhost:4200/`
- The development server auto-reloads when you modify source files.

### Code Generation

Use Angular CLI schematics to scaffold new components, services, or directives:

```bash
# Generate a new component
ng generate component features/properties/property-list

# Generate a new service
ng generate service services/property

# Generate a directive
ng generate directive directives/highlight

# View all available schematics
ng generate --help
```

### Development Guidelines

- **Components**: Use standalone components and prefer composition over inheritance.
- **Services**: Leverage dependency injection and RxJS observables for state management.
- **Routing**: Use lazy loading for feature modules and implement route guards for role-based access.
- **Styling**: Use Tailwind CSS utility classes; avoid writing custom CSS unless necessary.
- **State**: Keep auth state in a service; use signals for reactive components.
- **HTTP**: Centralize API calls in services with proper error handling and request/response mapping.

---

## Project Structure

```
src/
├── app/
│   ├── app.ts                 # Root component with router outlet
│   ├── app.html               # Root template (shell, layout, nav)
│   ├── app.css                # Root-level styling
│   ├── app.routes.ts          # App-wide route definitions
│   ├── app.config.ts          # Angular config (providers, interceptors)
│   ├── app.spec.ts            # Root app tests
│   │
│   ├── auth/                  # Authentication module
│   │   ├── login.component.ts
│   │   ├── register.component.ts
│   │   └── auth.service.ts
│   │
│   ├── features/              # Feature modules
│   │   ├── marketplace/       # Public property browse
│   │   ├── property-detail/   # Single property view
│   │   ├── customer/          # Customer workspace
│   │   ├── seller/            # Seller workspace
│   │   ├── profile/           # User profile
│   │   └── admin/             # Admin oversight
│   │
│   ├── shared/                # Shared utilities, guards, directives
│   │   ├── services/          # API services (property, inquiry, visit, deal, auth)
│   │   ├── guards/            # Route guards (role-based)
│   │   ├── models/            # TypeScript interfaces and DTOs
│   │   ├── components/        # Reusable UI components
│   │   └── pipes/             # Custom pipes
│   │
│   └── styles.css             # Global theme and design tokens
│
├── index.html                 # HTML entry point
├── main.ts                    # App bootstrapping
├── styles.css                 # Additional global styles
├── environment.ts             # Environment configuration (API base URL)
│
├── angular.json               # Angular build configuration
├── tsconfig.json              # TypeScript configuration
├── tsconfig.app.json          # App-specific TypeScript config
├── package.json               # npm dependencies and scripts
└── tailwind.config.js         # Tailwind CSS customization
```

---

## API Integration

### Backend Configuration

The application connects to the **Real Estate Backend API** at:

```
http://localhost:8080
```

To change the API base URL, update the environment file (if created) or configure the API service directly.

### Supported Endpoints

All endpoints are documented in the backend repository at:

```
c:\iCET\My Final CW\Real Estate-Backend\API_DOCUMENTATION.md
```

**Key Endpoint Groups**:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/register` | User registration |
| `POST /api/auth/login` | User login |
| `GET /api/properties` | List all properties |
| `GET /api/properties/{propertyId}` | Property details |
| `POST /api/properties` | Create property (seller only) |
| `POST /api/inquiries` | Submit inquiry |
| `POST /api/visits` | Schedule visit |
| `POST /api/deals` | Finalize deal |
| `GET /api/users/{userId}` | User profile |

### Data Models

The frontend uses typed interfaces that match the backend DTOs:

- **UserResponseDTO**: User info (no password)
- **PropertyDTO**: Property details
- **InquiryDTO**: Customer inquiry
- **VisitDTO**: Scheduled visit
- **DealDTO**: Completed transaction

See `src/shared/models/` for interface definitions.

---

## Available Scripts

### Development

```bash
# Start dev server with hot reload
npm start

# Build with watch mode
npm run watch
```

### Production Build

```bash
# Build for production
npm run build
```

Output artifacts are in `dist/real-estate-frontend/`.

### Testing

```bash
# Run unit tests with Vitest
npm test

# Run tests in watch mode
npm test -- --watch
```

### Linting & Formatting (Optional)

```bash
# Format code with Prettier (if configured)
npx prettier --write .
```

---

## Building

### Production Build

```bash
npm run build
```

This compiles the Angular app and optimizes for production:

- Tree-shaking unused code
- Minification of JS and CSS
- AOT compilation for faster runtime

**Output**: `dist/real-estate-frontend/`

### Deployment

1. Build the app: `npm run build`
2. Serve the `dist/` directory with a static web server (nginx, Express, etc.)
3. Ensure the backend API is accessible from the deployment environment
4. Update the API base URL if needed (e.g., for production/staging environments)

---

## Testing

### Unit Tests with Vitest

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Test Structure

- **Component Tests**: Test UI logic, event handling, and template rendering.
- **Service Tests**: Test API calls, state management, and business logic.
- **Guard Tests**: Test role-based route protection.

Example test file:

```typescript
import { TestBed } from '@angular/core/testing';
import { PropertyService } from './property.service';

describe('PropertyService', () => {
  let service: PropertyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertyService);
  });

  it('should fetch properties', () => {
    // Test implementation
  });
});
```

---

## Architecture

### Component Organization

The app uses **standalone components** with lazy-loaded feature modules:

```
AppComponent (root)
├── AuthComponent (public)
├── MarketplaceComponent (public)
├── PropertyDetailComponent (public)
├── CustomerDashboardComponent (role-guarded)
├── SellerDashboardComponent (role-guarded)
├── AdminDashboardComponent (role-guarded)
└── ProfileComponent (authenticated)
```

### State Management

- **Auth State**: Managed by `AuthService` (user, role, token)
- **Property State**: Managed by `PropertyService` (marketplace, details)
- **Customer State**: Managed by `CustomerService` (inquiries, visits, deals)
- **Seller State**: Managed by `SellerService` (listings, inquiries management)

### Route Guards

- **Role Guard**: Restricts routes based on user role (buyer, seller, admin)
- **Auth Guard**: Ensures user is logged in before accessing protected routes

### HTTP Interceptors (Optional)

Future enhancements may include:

- Bearer token attachment to requests
- Global error handling
- Request/response logging

---

## Contributing

### Adding a New Feature

1. **Create a feature module folder** in `src/app/features/`:
   ```bash
   mkdir src/app/features/my-feature
   ```

2. **Generate components and services**:
   ```bash
   ng generate component features/my-feature/my-feature
   ng generate service services/my-feature
   ```

3. **Update routes** in `src/app/app.routes.ts`:
   ```typescript
   export const routes: Routes = [
     { path: 'my-feature', component: MyFeatureComponent },
   ];
   ```

4. **Add tests** for new components and services.

5. **Commit and document** your changes.

### Code Standards

- Follow Angular style guide: https://angular.io/guide/styleguide
- Use TypeScript strict mode
- Write descriptive commit messages
- Keep components focused and reusable
- Document complex logic with comments

---

## Troubleshooting

### Development Server Not Starting

```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install

# Try serving again
npm start
```

### API Connection Issues

- Verify the backend API is running at `http://localhost:8080`
- Check browser console for CORS errors
- Ensure the API base URL is configured correctly in the service

### Build Failures

```bash
# Clear Angular cache
ng cache clean

# Rebuild
npm run build
```

---

## Additional Resources

- [Angular Documentation](https://angular.io/)
- [Angular CLI Guide](https://angular.dev/tools/cli)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [RxJS Guide](https://rxjs.dev/)
- [Backend API Documentation](../Real Estate-Backend/API_DOCUMENTATION.md)

---

## Support

For issues or questions:

1. Check the backend API documentation at: `c:\iCET\My Final CW\Real Estate-Backend\API_DOCUMENTATION.md`
2. Review the UI mockups at: `c:\iCET\My Final CW\Real Estate-Frontend\UIs/`
3. Consult the Angular CLI and framework documentation
