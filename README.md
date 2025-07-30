# TIMING ☕ 🍵

> A modern, mobile-first Progressive Web App for ordering delicious matcha and coffee drinks

![TIMING App](https://img.shields.io/badge/PWA-Ready-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)

## 🌟 Features

### 📱 Customer Experience
- **Mobile-First Design** - Optimized for phones and tablets
- **Quick Order Flow** - Less than 3 taps to complete an order
- **Drink Customization** - Size, milk type, sweetness, temperature, and add-ons
- **Smart Defaults** - Automatically defaults to "Iced" drinks for mobile users
- **Cart Persistence** - Your cart saves automatically using localStorage
- **Order Tracking** - Check your order status with order number

### 🎨 User Interface
- **Matcha Theme** - Beautiful green and brown color scheme
- **Touch-Friendly** - Large buttons optimized for one-handed use
- **Visual Feedback** - Smooth animations and hover effects
- **Custom Images** - Hand-crafted SVG illustrations for each drink
- **Responsive Design** - Works perfectly on all screen sizes

### ⚡ Technical Features
- **Progressive Web App** - Install on your home screen
- **Offline Capable** - Browse menu even without internet
- **Fast Loading** - Optimized with Vite build system
- **Type Safe** - Built with TypeScript for reliability

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd timing-app

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Build for Production
```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## 🍵 Menu

### Tea Collection
- **Matcha Latte** - Premium ceremonial grade matcha with steamed milk
- **Hojicha Latte** - Roasted green tea with warm, nutty flavors

### Coffee Collection  
- **Cappuccino** - Classic Italian espresso with steamed milk foam

### Specialty Drinks
- **Matcha Hojicha Swirl** - Half matcha, half hojicha for the best of both worlds

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **Tailwind CSS** | Styling Framework |
| **daisyUI** | UI Component Library |
| **React Router** | Client-side Routing |
| **Lucide React** | Icon Library |
| **PWA Plugin** | Progressive Web App Features |

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Route-based page components  
├── context/       # React Context for state management
├── hooks/         # Custom React hooks
├── services/      # API services and external integrations
├── types/         # TypeScript type definitions
├── utils/         # Utility functions and helpers
└── App.tsx        # Main application component
```

## 🎯 User Journey

1. **Browse Menu** - View drinks by category with search functionality
2. **Quick Add or Customize** - Add with defaults or customize every detail
3. **Review Cart** - Modify quantities and review your order
4. **Checkout** - Enter contact info and table number
5. **Order Confirmation** - Get your order number and pickup time
6. **Track Status** - Check preparation progress

## 🎨 Design System

### Colors
- **Primary (Matcha)**: `#22c55e` - The signature green of premium matcha
- **Secondary (Hojicha)**: `#d97706` - Warm brown of roasted hojicha  
- **Background**: `#ffffff` - Clean white like oat milk

### Typography
- **Headings**: Bold, clear hierarchy
- **Body Text**: Optimized for mobile reading
- **Interactive**: Large, touch-friendly button text

### Components
- **Cards**: Subtle shadows with hover effects
- **Buttons**: Minimum 48px height for accessibility
- **Forms**: Large input fields with clear labels

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment Variables
Create a `.env` file:
```
VITE_API_BASE_URL=http://localhost:3001
```

### Key Development Notes
- Uses mock API data for demonstration
- Cart state persists in localStorage
- PWA features require HTTPS in production
- Images are custom SVG illustrations

## 📱 PWA Installation

### On Mobile (iOS/Android)
1. Open the app in your mobile browser
2. Look for the "Add to Home Screen" prompt
3. Tap "Install" to add TIMING to your home screen
4. Launch like a native app!

### On Desktop
1. Look for the install icon in the address bar
2. Click to install as a desktop app
3. Access from your applications folder

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile devices
5. Submit a pull request

## 📄 License

This project is for educational and demonstration purposes.

## 💡 About TIMING

TIMING is a modern tea and coffee shop specializing in premium matcha and hojicha beverages. Our mobile app brings the authentic taste experience directly to your fingertips with a focus on quality, convenience, and beautiful design.

---

**Built with ❤️ for tea and coffee lovers everywhere**