# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Arcana** is an Angular 19 landing page and web application for a spiritual/mystical services platform. The application provides tarot readings, astrology services, holistic therapies, and lunar cycle rituals. It features a modern, interactive UI with server-side rendering (SSR) support.

## Common Commands

### Development
```bash
npm start              # Start dev server on http://localhost:4200
ng serve              # Alternative to npm start
npm run watch         # Build and watch for changes (development config)
```

### Building
```bash
npm run build         # Production build (outputs to dist/)
ng build              # Alternative to npm run build
```

### Testing
```bash
npm test              # Run Karma/Jasmine unit tests
ng test               # Alternative to npm test
```

### Server-Side Rendering
```bash
npm run serve:ssr:Arcana    # Serve pre-built SSR app
node dist/arcana/server/server.mjs   # Alternative SSR server command
```

### Code Generation
```bash
ng generate component component-name    # Generate new component
ng generate service service-name        # Generate new service
ng generate --help                      # See all available schematics
```

## Architecture

### Tech Stack
- **Framework**: Angular 19 (standalone components)
- **Styling**: Tailwind CSS 4.1, SCSS
- **State Management**: Angular Signals (reactive primitives)
- **Backend Integration**: Supabase (database + edge functions)
- **SSR**: Angular Universal with Express server
- **Icons**: Font Awesome 6.7
- **HTTP**: HttpClient, RxJS 7.8

### Project Structure

```
src/
├── app/
│   ├── app.component.ts           # Root component with footer
│   ├── app.routes.ts              # Main routing configuration
│   ├── app.config.ts              # Browser app configuration
│   ├── app.config.server.ts       # SSR app configuration
│   ├── home/                      # Main landing page component
│   ├── magia/                     # Membership/payment flow component
│   ├── succes/                    # Payment success page
│   ├── cancel/                    # Payment cancellation page
│   ├── soporte/                   # Support page
│   └── terminos-y-condiciones/    # Terms and conditions page
├── services/
│   └── device-detection.service.ts  # SSR-safe mobile/tablet detection
├── environments/
│   └── environment.ts             # Environment config (Supabase, URLs)
├── assets/                        # Static assets (images, PDFs, etc.)
├── .well-known/                   # Deep linking files (iOS/Android)
├── _redirects                     # SPA fallback routing (Netlify/Vercel)
├── server.ts                      # Express SSR server
├── main.ts                        # Browser entry point
└── main.server.ts                 # SSR entry point
```

### Key Architectural Patterns

#### 1. Standalone Components
All components use Angular's standalone architecture (no NgModules):
```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './example.component.html',
})
```

#### 2. Angular Signals for State
The app uses Angular Signals for reactive state management:
```typescript
readonly activeService = signal<string>('tarot');
readonly showMembershipModal = signal<boolean>(false);
```

#### 3. SSR-Safe Code
All browser-specific code must be guarded with platform checks:
```typescript
constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  this.isBrowser = isPlatformBrowser(platformId);
}

ngOnInit(): void {
  if (this.isBrowser) {
    // Browser-only code here
  }
}
```

**Critical**: Never access `window`, `document`, `localStorage`, or browser APIs without checking `isPlatformBrowser` first. The DeviceDetectionService demonstrates proper SSR-safe patterns.

#### 4. Supabase Integration
- Client initialization is lazy (created only when needed)
- Edge functions are called for checkout session creation
- Configuration lives in `src/environments/environment.ts`
- Payment flow: `magia.component.ts` → Supabase Edge Function → Stripe Checkout

#### 5. Routing
- All routes defined in `src/app/app.routes.ts`
- SPA fallback via `_redirects` file (for hosting platforms)
- Payment callbacks: `/payment/success` and `/payment/cancel`
- Deep linking configured via `.well-known/` directory

### Component Communication Patterns

#### Home Component (`home/home.component.ts`)
- Main landing page with extensive features:
  - Service showcase (tarot, astrology, holistic, lunar)
  - Testimonial carousel with auto-rotation
  - Countdown timer to launch date
  - Fortune cat interactive widget (daily messages)
  - Membership plans modal
  - Early access email registration form
  - PDF download functionality (multi-device support)
  - Scroll-based navbar visibility (mobile-specific)

Key patterns:
- Uses `DeviceDetectionService` for responsive behavior
- Manages scroll position when opening/closing modals
- Validates forms using Signals and reactive updates
- Sends data to Google Sheets via HTTP POST

#### Magia Component (`magia/magia.component.ts`)
- Handles membership plan selection and payment flow
- Reads `userId` from query params or localStorage
- Creates Stripe checkout sessions via Supabase Edge Functions
- Opens checkout in new window (`_blank`)

### Services

#### DeviceDetectionService
Location: `src/services/device-detection.service.ts`

Provides SSR-safe device detection:
```typescript
constructor(private deviceService: DeviceDetectionService) {}

ngOnInit() {
  this.deviceService.isMobile$.subscribe(isMobile => {
    this.isMobile = isMobile;
  });
}
```

Methods:
- `isMobile$: Observable<boolean>` - reactive mobile state
- `isMobile: boolean` - current mobile state
- `isDesktop: boolean` - desktop check
- `isTablet: boolean` - tablet detection (768-1024px)
- `isPortrait/isLandscape: boolean` - orientation
- `getDeviceType(): 'mobile' | 'tablet' | 'desktop'`
- `forceDetection()` - manual re-detection

### Styling Approach

- **Primary Framework**: Tailwind CSS 4.1 (utility-first)
- **Component Styles**: SCSS files (scoped per component)
- **Global Styles**: `src/styles.scss`
- **Icons**: Font Awesome classes (e.g., `fas fa-star`)
- **Color Palette**: Purple/gold mystical theme (`#b4a2fd`, `#ffa500`, `#100820`)

### Environment Configuration

File: `src/environments/environment.ts`

Contains:
- `arcanaTestUrl`: Development URL (localhost:4200)
- `arcanaProdUrl`: Production URL (arcanaoficial.com)
- `successUrl/cancelUrl`: Payment redirect paths
- `supabase.url/key`: Supabase project credentials

**Note**: Environment file is committed (contains public anon key only). Never commit secret keys.

## Development Guidelines

### When Creating New Components
1. Use Angular CLI: `ng generate component path/name`
2. Components are automatically standalone (Angular 19 default)
3. Import CommonModule for `*ngIf`, `*ngFor`, etc.
4. Import FormsModule for forms (`[(ngModel)]`)
5. Always inject `PLATFORM_ID` and check `isPlatformBrowser` if using browser APIs

### When Working with Forms
- Use Angular Signals for validation errors
- Implement field-specific validation methods (`validateEmail()`, `validateName()`)
- Call validation on input change events
- Display errors conditionally based on Signal state

### When Adding New Routes
1. Create component in `src/app/`
2. Import component in `app.routes.ts`
3. Add route object to `routes` array
4. Update footer links in `app.component.ts` if needed

### When Integrating External Services
- Place configuration in `environment.ts`
- Use lazy initialization for clients (see Supabase pattern in `magia.component.ts`)
- Handle errors gracefully with try-catch and user feedback

### Testing Considerations
- Tests run with Karma + Jasmine
- Test files: `*.spec.ts`
- Mock `PLATFORM_ID` for SSR-safe component tests
- Mock `DeviceDetectionService` for responsive component tests

## Build and Deployment

### Production Build Output
```bash
npm run build
# Outputs to: dist/landing-page-arcana/
```

Directory structure:
```
dist/landing-page-arcana/
├── browser/        # Client-side bundles
└── server/         # SSR server code
    └── server.mjs  # Express server entry point
```

### SSR Deployment
The app uses Angular Universal with Express:
- Server entry: `dist/arcana/server/server.mjs`
- Default port: 4000 (configurable via `PORT` env var)
- Serves static files with 1-year cache
- Handles all routes via Angular app

### Hosting Requirements
- SPA fallback routing required (via `_redirects` or equivalent)
- Node.js environment for SSR
- Deep linking support (`.well-known/` directory must be publicly accessible)

## Special Features

### Fortune Cat Widget
- Daily fortune messages (one per day)
- Uses localStorage to track last seen date
- Animated sequence: throw cookie → flying cookie → fortune paper reveal
- 10 rotating fortune messages based on date seed

### PDF Download System
- Multi-device download strategy:
  - Desktop: Traditional download link
  - iOS/Safari: Opens in new tab
  - Mobile: Opens with fallback instructions if popup blocked
- File: `/assets/5-rituales-poderosos.pdf`
- Triggered after successful registration form submission

### Scroll Management
- Saves/restores scroll position when opening/closing modals
- Mobile-specific navbar hide/show on scroll
- Always visible navbar on desktop
- Blur effect on scroll for all devices

### Payment Integration
- Stripe checkout via Supabase Edge Functions
- Product IDs stored in component (basic, premium, premium-annual)
- Success/cancel callbacks include tier and product in query params
- Opens checkout in new window to preserve app state

## Common Pitfalls to Avoid

1. **SSR Errors**: Always check `isPlatformBrowser` before accessing browser APIs
2. **Signal Mutation**: Use `.set()` or `.update()` - never mutate signal values directly
3. **Memory Leaks**: Clear intervals/timeouts in `ngOnDestroy`
4. **Modal Scroll Issues**: Always pair `blockBodyScroll()` with `unblockBodyScroll()`
5. **Route Guards**: This app has no auth guards - add if implementing protected routes

## Future Considerations

The codebase shows active development with:
- Membership portal component committed but not yet linked
- Multiple "Próximamente" (Coming Soon) plan buttons
- Commented-out test navigation buttons in `app.component.ts`
- Placeholder social links (Facebook URLs in openAppStore/openGooglePlay methods)
