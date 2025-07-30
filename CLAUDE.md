# TIMING - Drink Ordering App

## Project Context
This is a customer-facing drink ordering mobile web app built for TIMING, a tea and coffee shop specializing in matcha and hojicha beverages.

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
```

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + daisyUI
- **Routing**: React Router 6
- **State Management**: React Context API
- **Build Tool**: Vite
- **PWA**: Vite PWA Plugin
- **Icons**: Lucide React

## Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx       # App header with navigation
│   ├── BottomNav.tsx    # Bottom navigation
│   ├── CartDrawer.tsx   # Sliding cart drawer
│   ├── Layout.tsx       # Main layout wrapper
│   └── PWAInstallPrompt.tsx # PWA install prompt
├── pages/              # Route components
│   ├── MenuPage.tsx     # Main menu with drink cards
│   ├── DrinkDetailsPage.tsx # Drink customization
│   ├── CartPage.tsx     # Shopping cart view
│   ├── CheckoutPage.tsx # Customer checkout form
│   ├── OrderConfirmationPage.tsx # Order success
│   └── OrderStatusPage.tsx # Order tracking
├── context/            # React Context providers
│   └── CartContext.tsx # Cart state management
├── hooks/              # Custom React hooks
│   ├── useFavorites.ts # Favorites management (removed)
│   ├── useOrderHistory.ts # Order history
│   └── usePWA.ts       # PWA functionality
├── services/           # API and external services
│   └── api.ts          # Mock API service
├── types/              # TypeScript type definitions
│   └── index.ts        # All app types
├── utils/              # Utility functions
│   └── index.ts        # Helper functions
└── App.tsx             # Main app component
```

## Key Features
- **Mobile-first PWA** with offline capability
- **Menu browsing** with categories and search
- **Drink customization** (size, milk, sweetness, temperature, add-ons)
- **Shopping cart** with localStorage persistence
- **Quick add to cart** from menu page
- **Customer checkout** with order confirmation
- **Order status tracking**
- **PWA install prompt**

## Design System
- **Primary Color**: #22c55e (Matcha Green)
- **Secondary Color**: #d97706 (Hojicha Brown)
- **Background**: #ffffff (Oat Milk White)
- **Theme**: daisyUI "matcha" custom theme

## API Endpoints (Mock)
```
GET /api/menu           # Get menu categories and drinks
GET /api/menu/:id       # Get drink details
POST /api/orders        # Create new order
GET /api/orders/:id/status # Check order status
```

## Development Notes
- Cart state persists in localStorage
- Default temperature is "Iced" when available
- Header has solid green background (no transparency)
- All text and icons in header are white
- Mock SVG images for all drinks
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
6. Created custom SVG mock images for drinks
7. Removed favorites and QR scanner functionality

## Known Issues
- Uses mock API data (no real backend)
- Images are SVG placeholders
- No real payment processing
- Order status is simulated

## Testing
- Test on mobile devices for touch interactions
- Verify PWA installation works
- Check cart persistence across sessions
- Test offline functionality
- Validate form inputs on checkout