# BOOK NEO - Mobile Hotel Booking Web App

## Overview

BOOK NEO is a comprehensive mobile-optimized hotel booking web application built with a modern full-stack architecture. The application provides a seamless booking experience for guests, management dashboards for hotels, and administrative controls for system oversight. It features secure payment processing through Cashfree, real-time booking management, and a Progressive Web App (PWA) experience optimized for mobile devices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system and neon effect animations
- **State Management**: TanStack Query for server state management
- **Animation**: GSAP for advanced animations and smooth transitions
- **PWA Features**: Service worker for offline caching and app-like experience

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Cloud Database**: Neon serverless PostgreSQL
- **Session Management**: In-memory storage with plans for PostgreSQL sessions
- **API Design**: RESTful APIs with structured error handling

### Authentication & Authorization
- **Hotel Staff**: Username/password authentication with role-based access
- **Admin**: Email/password authentication with hardcoded credentials
- **Session Management**: Custom auth manager with in-memory state
- **Security**: Input validation using Zod schemas

## Key Components

### Database Schema
- **Hotels Table**: Store hotel information, location, amenities, and base rates
- **Hotel Users Table**: Staff credentials and role management
- **Bookings Table**: Complete booking records with payment status tracking
- **Admins Table**: Administrative user credentials

### Payment Integration
- **Provider**: Cashfree payment gateway
- **Environment**: Production-ready configuration
- **Flow**: Order creation → Payment processing → Webhook confirmation
- **Security**: Server-side order creation with secure credentials

### User Flows
1. **Guest Booking**: Hotel selection → Room booking → Payment → Confirmation
2. **Hotel Management**: Staff login → Dashboard → Booking management
3. **Admin Panel**: Admin login → System overview → Hotel management

### Progressive Web App Features
- **Offline Support**: Service worker with strategic caching
- **Mobile Optimization**: Touch-friendly interface with mobile-first design
- **Installation**: Manifest configuration for app installation
- **Performance**: Optimized assets and lazy loading

## Data Flow

### Booking Process
1. Guest selects hotel and room type from available options
2. Form validation ensures data integrity before submission
3. Backend creates Cashfree payment order with unique booking ID
4. Payment processing through Cashfree's secure checkout
5. Webhook confirmation updates booking status
6. Success/failure redirect with appropriate user feedback

### Hotel Dashboard
1. Staff authentication validates credentials against database
2. Dashboard fetches bookings filtered by hotel ID
3. Real-time booking status updates and management features
4. Export capabilities for booking reports

### Admin Operations
1. System-wide hotel and booking overview
2. Hotel creation with automatic staff account setup
3. Comprehensive booking analytics and management

## External Dependencies

### Payment Services
- **Cashfree**: Production payment gateway with test/live environment support
- **Configuration**: Environment-based credential management

### Database Services
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Drizzle Kit**: Database migrations and schema management

### CDN Services
- **Font Assets**: Google Fonts for typography
- **Icons**: Font Awesome for comprehensive icon library
- **Animation**: GSAP CDN for performance-optimized animations

### Development Tools
- **Replit Integration**: Development environment optimization
- **Error Handling**: Runtime error overlay for development
- **Hot Reload**: Vite's fast refresh for development efficiency

## Deployment Strategy

### Build Process
1. Frontend builds to optimized static assets in `dist/public`
2. Backend compiles TypeScript to ES modules in `dist`
3. Single build command handles both frontend and backend compilation

### Production Environment
- **Static Serving**: Express serves built frontend assets
- **API Routes**: RESTful endpoints under `/api` prefix
- **Database**: PostgreSQL connection with environment-based configuration
- **Environment Variables**: Secure credential management for all services

### Development Workflow
- **Development Server**: Vite dev server with Express API proxy
- **Database**: Drizzle push for schema synchronization
- **Type Safety**: Shared schema types between frontend and backend
- **Hot Reload**: Instant feedback for both client and server changes

The application is designed for scalability with clear separation of concerns, type safety throughout the stack, and modern development practices optimized for both developer experience and production performance.