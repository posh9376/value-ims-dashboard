# Value School Uniforms - Frontend

A modern, responsive web application for managing school uniform sales, inventory, and operations. Built with React 19, TypeScript, and Tailwind CSS.

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.13-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF?logo=vite&logoColor=white)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Development](#-development)
- [Project Structure](#-project-structure)
- [API Integration](#-api-integration)
- [Authentication](#-authentication)
- [Components Overview](#-components-overview)
- [Styling](#-styling)
- [Building for Production](#-building-for-production)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with automatic token refresh
- Role-based access control (Admin, Manager, Cashier)
- Secure route protection
- User session management

### 📊 Dashboard & Analytics
- Real-time sales metrics and KPIs
- Interactive charts and graphs using Recharts
- Monthly sales trends analysis
- Inventory overview with stock alerts
- Revenue tracking and growth indicators

### 🛒 Sales Management
- Complete order processing workflow
- Order status tracking (Pending → Confirmed → Completed)
- Customer information management
- Multi-item order support
- Sales history and reporting

### 📦 Inventory Control
- Real-time stock level monitoring
- Low stock and out-of-stock alerts
- Product variant management
- Bulk inventory operations
- Stock movement tracking
- Price management (Buy/Sell prices)

### 🏫 School Management
- Partner school information management
- Contact person details
- Location and address tracking
- School-specific inventory

### 👥 User Management
- Multi-role user system
- User profile management
- Account activation/deactivation
- Password management
- Audit trail for user actions

### 📏 Size Management
- Comprehensive size catalog
- Category-based size organization
- Size variant descriptions
- Easy size lookup and management

### 🎨 Modern UI/UX
- Responsive design for all screen sizes
- Dark/Light theme support (via Tailwind)
- Intuitive navigation and search
- Real-time notifications
- Loading states and error handling

## 🛠 Tech Stack

### Core Technologies
- **Frontend Framework**: React 19.1.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 7.1.2
- **Routing**: React Router DOM 7.8.2

### Styling & UI
- **CSS Framework**: Tailwind CSS 4.1.13
- **Component Library**: DaisyUI 5.1.10
- **Icons**: Lucide React 0.542.0

### Data Visualization
- **Charts**: Recharts 3.2.0
- **Alternative Charts**: Chart.js 4.5.0 with React-ChartJS-2 5.3.0

### HTTP & API
- **HTTP Client**: Axios 1.12.2
- **Notifications**: React Toastify 11.0.5

### Development Tools
- **Linting**: ESLint 9.33.0 with TypeScript support
- **Type Checking**: TypeScript with strict mode
- **Hot Reload**: Vite HMR

## 🔧 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (or yarn/pnpm as alternative)
- **Git**: For version control

### System Requirements
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: At least 1GB free space

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/value-frontend.git
cd value-frontend
```

### 2. Install Dependencies
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
VITE_COMPANY_NAME="Value School Uniforms"
VITE_API_BASE_URL="http://localhost:8000/api"
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## ⚙️ Environment Setup

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_COMPANY_NAME` | Company name displayed in the app | "Value School Uniforms" | ✅ |
| `VITE_API_BASE_URL` | Backend API base URL | "http://localhost:8000/api" | ✅ |

### Development Environment
```env
VITE_COMPANY_NAME="Value School Uniforms"
VITE_API_BASE_URL="http://localhost:8000/api"
```

### Production Environment
```env
VITE_COMPANY_NAME="Value School Uniforms"
VITE_API_BASE_URL="https://api.yourdomain.com/api"
```

## 🚀 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |

### Development Workflow

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Make your changes** - The dev server supports hot module replacement (HMR)

3. **Run linting** before committing:
   ```bash
   npm run lint
   ```

4. **Build and test**:
   ```bash
   npm run build
   npm run preview
   ```

## 📁 Project Structure

```
Value-Frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/        # Common components
│   │   │   ├── sidebar/   # Sidebar components
│   │   │   └── loadingdots/ # Loading components
│   │   ├── Button.tsx     # Custom button component
│   │   ├── Dashdiv.tsx    # Dashboard card component
│   │   ├── ProtectedRoute.tsx # Route protection
│   │   ├── Search.tsx     # Search component
│   │   └── Table.tsx      # Table component
│   ├── context/           # React Context providers
│   │   ├── AuthContext.tsx # Authentication state
│   │   └── SideBarContext.tsx # Sidebar state
│   ├── layouts/           # Layout components
│   │   └── MainLayout.tsx # Main app layout
│   ├── pages/             # Page components
│   │   ├── analytics/     # Analytics dashboard
│   │   ├── auth/          # Authentication pages
│   │   ├── dash/          # Main dashboard
│   │   ├── finance/       # Financial pages
│   │   ├── fines/         # Fines management
│   │   ├── inventory/     # Inventory management
│   │   ├── orders/        # Sales order management
│   │   ├── schools/       # School management
│   │   ├── sizes/         # Size management
│   │   └── users/         # User management
│   ├── routes/            # Route configuration
│   │   └── MainRoutes.tsx # Main routing setup
│   ├── utils/             # Utility functions
│   │   └── api.ts         # API client and types
│   ├── App.tsx            # Main App component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── Dockerfile            # Docker configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── README.md             # This file
```

## 🌐 API Integration

### API Client Configuration

The application uses a centralized API client (`src/utils/api.ts`) with the following features:

#### Features
- **Automatic Authentication**: JWT tokens are automatically attached to requests
- **Token Refresh**: Expired tokens are automatically refreshed
- **Error Handling**: Standardized error responses
- **Type Safety**: Full TypeScript support for all API endpoints

#### Example Usage
```typescript
import { api } from '@/utils/api';

// Get dashboard data
const dashboardData = await api.getDashboardData();

// Create a new sale
const newSale = await api.createSale({
  inventory: 1,
  quantity: 2,
  customer_name: "John Doe"
});
```

### API Endpoints

#### Authentication
- `POST /auth/login/` - User login
- `POST /auth/logout/` - User logout  
- `POST /auth/token/refresh/` - Refresh JWT token
- `GET /auth/profile/` - Get user profile

#### Dashboard & Analytics
- `GET /analytics/dashboard/` - Dashboard metrics
- `GET /analytics/monthly-sales/` - Monthly sales data
- `GET /analytics/inventory-summary/` - Inventory overview

#### Sales Management
- `GET /stock/sales/` - List sales orders
- `POST /stock/sales/` - Create new sale
- `PUT /stock/sales/:id/` - Update sale
- `DELETE /stock/sales/:id/` - Delete sale
- `PATCH /stock/sales/:id/status/` - Update sale status

#### Inventory Management
- `GET /stock/inventory/` - List inventory items
- `POST /stock/inventory/` - Add inventory item
- `PUT /stock/inventory/:id/` - Update inventory item
- `DELETE /stock/inventory/:id/` - Delete inventory item

#### School Management
- `GET /stock/schools/` - List schools
- `POST /stock/schools/` - Create school
- `PUT /stock/schools/:id/` - Update school
- `DELETE /stock/schools/:id/` - Delete school

#### User Management
- `GET /users/users/` - List users
- `POST /users/users/` - Create user
- `PUT /users/users/:id/` - Update user
- `DELETE /users/users/:id/` - Delete user

## 🔒 Authentication

### Authentication Flow

1. **Login**: User provides credentials
2. **Token Storage**: JWT tokens stored in localStorage
3. **Auto-Refresh**: Tokens automatically refreshed when expired
4. **Route Protection**: Protected routes require valid authentication
5. **Logout**: Tokens cleared and user redirected to login

### Protected Routes

All routes except `/auth/login` require authentication. The `ProtectedRoute` component handles:

- Token validation
- Automatic redirects to login
- Loading states during authentication checks

### Role-Based Access

The application supports three user roles:

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, system configuration |
| **Manager** | Sales, inventory, schools, analytics (no user management) |
| **Cashier** | Sales processing, basic inventory viewing |

## 🧩 Components Overview

### Core Components

#### Dashboard Components
- `Dashdiv.tsx` - Metric display cards with trend indicators
- `Dashboard.tsx` - Main dashboard with charts and KPIs

#### Layout Components  
- `MainLayout.tsx` - App shell with sidebar and header
- `Sidebar.tsx` - Navigation sidebar with menu items
- `UserProfileBadge.tsx` - User info display and logout

#### Form Components
- `Button.tsx` - Standardized button component
- `Search.tsx` - Search input with filtering
- `Table.tsx` - Data table with pagination

#### Utility Components
- `ProtectedRoute.tsx` - Authentication wrapper
- `LoadingDots.tsx` - Loading state indicator

### Page Components

Each page follows a consistent pattern:
- **State Management**: React hooks for local state
- **Data Fetching**: API calls with loading states
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Mobile-first approach
- **CRUD Operations**: Create, Read, Update, Delete functionality

## 🎨 Styling

### Tailwind CSS Configuration

The project uses Tailwind CSS with DaisyUI for consistent styling:

#### Customization
- **Color Palette**: Defined in `tailwind.config.js`
- **Typography**: Custom font families and sizes
- **Components**: Pre-built components via DaisyUI
- **Utilities**: Custom utility classes

#### Design System
- **Spacing**: Consistent 8px grid system
- **Colors**: Primary, secondary, accent, neutral palettes
- **Typography**: Hierarchical heading and body text styles
- **Shadows**: Layered shadow system for depth
- **Borders**: Consistent border radius and widths

### Responsive Design

The application is fully responsive with breakpoints:

| Breakpoint | Width | Usage |
|-----------|--------|--------|
| `sm` | 640px+ | Small tablets |
| `md` | 768px+ | Large tablets |
| `lg` | 1024px+ | Laptops |
| `xl` | 1280px+ | Desktops |
| `2xl` | 1536px+ | Large screens |

## 🏗 Building for Production

### Build Process

1. **Type Checking**: TypeScript compilation
2. **Code Bundling**: Vite bundling with optimizations
3. **Asset Processing**: Image and font optimization
4. **Code Splitting**: Automatic chunk splitting for better performance

### Build Command
```bash
npm run build
```

### Build Output
```
dist/
├── assets/
│   ├── index-[hash].js    # Main JavaScript bundle
│   ├── index-[hash].css   # Compiled CSS
│   └── [assets]           # Images, fonts, etc.
└── index.html            # Main HTML file
```

### Performance Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and CSS minification
- **Caching**: Long-term caching with hashed filenames

## 🚀 Deployment

### Environment Preparation

1. **Backend API**: Ensure your backend API is deployed and accessible
2. **Environment Variables**: Update `.env` with production values
3. **CORS Configuration**: Configure backend CORS for your domain

### Deployment Options

#### Option 1: Static Hosting (Netlify, Vercel, GitHub Pages)

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

3. **Configure redirects** for single-page application:
   ```
   /*    /index.html   200
   ```

#### Option 2: Docker Deployment

1. **Build Docker image**:
   ```bash
   docker build -t value-frontend .
   ```

2. **Run container**:
   ```bash
   docker run -p 80:80 value-frontend
   ```

#### Option 3: Traditional Web Server (Apache, Nginx)

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Copy `dist` folder** to web server root

3. **Configure server** for single-page application

### Example Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/value-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://your-backend-api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Production Checklist

- [ ] Environment variables configured
- [ ] API endpoints accessible
- [ ] HTTPS enabled
- [ ] Error monitoring configured
- [ ] Performance monitoring enabled
- [ ] Backup strategy implemented

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**:
   ```bash
   npm run lint
   npm run build
   ```
5. **Commit your changes**:
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Standards

- **TypeScript**: Use strict TypeScript with proper typing
- **ESLint**: Follow the configured ESLint rules
- **Naming**: Use descriptive variable and function names
- **Comments**: Document complex logic and business rules
- **Testing**: Write tests for new features (when applicable)

### Commit Message Format
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: component, page, api, ui, etc.

Example: feat(dashboard): add real-time sales metrics
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Development Server Won't Start
```bash
Error: Cannot find module 'vite'
```
**Solution**: Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 2. API Connection Issues
```bash
Error: Network Error
```
**Solutions**:
- Check if backend API is running
- Verify `VITE_API_BASE_URL` in `.env`
- Check CORS configuration on backend
- Ensure API endpoints are correct

#### 3. Authentication Problems
```bash
Error: 401 Unauthorized
```
**Solutions**:
- Clear localStorage: `localStorage.clear()`
- Check JWT token expiration
- Verify API authentication endpoints
- Ensure proper token refresh logic

#### 4. Build Failures
```bash
Error: TypeScript compilation failed
```
**Solutions**:
- Fix TypeScript errors: `npm run lint`
- Check for missing type definitions
- Verify import/export statements
- Update TypeScript configuration if needed

#### 5. Styling Issues
**Solutions**:
- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS classes
- Verify responsive design breakpoints
- Clear browser cache

### Getting Help

If you encounter issues not covered here:

1. **Check the Issues**: Look for existing GitHub issues
2. **Create an Issue**: Provide detailed reproduction steps
3. **Join Discussions**: Participate in project discussions
4. **Read Documentation**: Review API and component docs

### Debug Mode

Enable debug mode for additional logging:

```bash
# Development
npm run dev -- --debug

# Add debug logging to components
console.log('Debug info:', data);
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Vite** for the fast build tool
- **TypeScript** for type safety
- **All Contributors** who helped build this project

---

**Built with ❤️ by the Value Team**

For questions, suggestions, or support, please open an issue or contact the development team.
