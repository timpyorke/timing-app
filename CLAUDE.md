# TIMING - Ordering App

## Project Context

This is a customer-facing menu ordering mobile web app built for TIMING, a tea and coffee shop specializing in matcha and hojicha beverages.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint

# Install i18n packages (required for translations)
npm install react-i18next i18next i18next-browser-languagedetector
```

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + daisyUI
- **Routing**: React Router 6
- **State Management**: React Context API
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Internationalization**: react-i18next (Thai default, English available)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx       # App header with navigation
│   ├── BottomNav.tsx    # Bottom navigation
│   ├── CartDrawer.tsx   # Sliding cart drawer
│   ├── Layout.tsx       # Main layout wrapper
├── pages/              # Route components
│   ├── MenuPage.tsx     # Main menu with menu cards
│   ├── MenuDetailsPage.tsx # Menu customization
│   ├── CheckoutPage.tsx # Customer checkout form
│   ├── OrderConfirmationPage.tsx # Order success
│   └── OrderStatusPage.tsx # Order tracking
├── context/            # React Context providers
│   └── CartContext.tsx # Cart state management
├── hooks/              # Custom React hooks
│   ├── useFavorites.ts # Favorites management (removed)
│   ├── useOrderHistory.ts # Order history
├── services/           # API and external services
│   └── api.ts          # Mock API service
├── i18n/               # Internationalization
│   ├── index.ts        # i18n configuration
│   ├── stub.ts         # Temporary stub implementation
│   └── locales/        # Translation files
│       ├── en.json     # English translations
│       └── th.json     # Thai translations (default)
├── types/              # TypeScript type definitions
│   ├── index.ts        # All app types
│   └── i18next.d.ts    # i18n type declarations
├── utils/              # Utility functions
│   └── index.ts        # Helper functions
└── App.tsx             # Main app component
```

## Key Features

- **Mobile-first responsive design**
- **Thai language support** with Thai as default language
- **Menu browsing** with categories and search
- **Menu customization** (size, milk, sweetness, temperature, add-ons)
- **Shopping cart** with localStorage persistence
- **Quick add to cart** from menu page
- **Customer checkout** with order confirmation
- **Order status tracking**

## Design System

- **Primary Color**: #22c55e (Matcha Green)
- **Secondary Color**: #d97706 (Hojicha Brown)
- **Background**: #ffffff (Oat Milk White)
- **Theme**: daisyUI "matcha" custom theme

## API Endpoints (Mock)

```
GET /api/menu           # Get menu categories and menu
GET /api/menu/:id       # Get menu details
POST /api/orders        # Create new order
GET /api/orders/:id/status # Check order status
```

## Development Notes

- Cart state persists in localStorage
- Default temperature is "Iced" when available
- Header has solid green background (no transparency)
- All text and icons in header are white
- Mock SVG images for all menu
- No favorites functionality (removed per requirements)
- No QR code scanner (removed per requirements)

## Environment Variables

```
VITE_API_BASE_URL=http://localhost:3001
```

## Recent Changes

1. Fixed bottom padding in menu and detail pages
2. Added prominent "Add to Cart" button in detail page
3. Implemented quick add functionality from menu cards
4. Made header background solid (not transparent)
5. Set all header text and icons to white
6. Created custom SVG mock images for menu
7. Removed favorites and QR scanner functionality
8. **Added Thai language support with Thai as default language**
9. **Implemented i18n infrastructure with react-i18next**
10. **Created comprehensive Thai and English translation files**
11. **Updated all UI components to use translations**
12. **Added language toggle button in header with Languages icon**

## Known Issues

- Uses mock API data (no real backend)
- Images are SVG placeholders
- No real payment processing
- Order status is simulated
- **i18n packages need to be installed (see I18N_SETUP.md for instructions)**

## Testing

- Test on mobile devices for touch interactions
- Check cart persistence across sessions
- Validate form inputs on checkout
