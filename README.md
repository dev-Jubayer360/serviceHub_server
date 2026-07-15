# NEXLI GADGET Backend API

This is the complete, production-ready Express.js backend for the NEXLI GADGET eCommerce platform.

## Features
- **Authentication**: JWT-based auth, standard email/password, and Google Login.
- **Roles**: User and Admin access controls.
- **Products**: Advanced filtering, search, sorting, stock management, and admin CRUD.
- **Categories & Brands**: Full management for organization.
- **Cart & Wishlist**: Dedicated user shopping experiences with complex stock-aware logic.
- **Orders**: Secure order placement, timeline tracking, and admin management.
- **Coupons**: Discount system with minimum orders and usage limits.
- **Reviews**: Customer reviews with admin approval workflows.
- **Dashboard**: Real-time stats for both users and admins.
- **Security**: Helmet, Rate-Limiting, CORS, and Data Sanitization.
- **Uploads**: Cloudinary integration for robust media handling.

## Tech Stack
- **Node.js & Express.js**
- **MongoDB & Mongoose**
- **JWT & bcryptjs**
- **Cloudinary & Multer**
- **Zod (Validation)**

## Installation

1. Clone the repository and navigate to the Server directory:
   ```bash
   cd Server
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in your actual MongoDB URI, JWT Secret, Google Client ID, and Cloudinary keys.

3. Seed the database with the default admin and sample products:
   ```bash
   node src/seed/seedAdmin.js
   node src/seed/seedProducts.js
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Admin Credentials
The `seedAdmin.js` script creates the following default admin:
- **Email**: `admin@nexligadget.com`
- **Password**: `Admin@12345`

## Folder Structure
```
src/
  config/      - Database & Cloudinary configurations
  models/      - Mongoose schemas
  middleware/  - Auth, admin, error, validation middlewares
  controllers/ - Request handling logic
  routes/      - Express routes definitions
  utils/       - Helpers (slug, token generation, math)
  seed/        - Database seed scripts
  app.js       - Main Express configuration
server.js      - Entry point and server listener
```

## API Route List
- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/google`, `/api/auth/logout`
- **User**: `/api/user/profile`, `/api/user/addresses`, `/api/user/dashboard-stats`
- **Products**: `/api/products`
- **Categories**: `/api/categories`
- **Brands**: `/api/brands`
- **Cart**: `/api/cart`, `/api/cart/add`, `/api/cart/update`, `/api/cart/remove/:productId`
- **Wishlist**: `/api/wishlist`, `/api/wishlist/add`, `/api/wishlist/remove/:productId`
- **Orders**: `/api/orders`, `/api/orders/my-orders`, `/api/orders/:id`
- **Coupons**: `/api/coupons/apply`
- **Admin**: `/api/admin/*` (Products, Categories, Brands, Orders, Coupons, Users, Reviews, Dashboard)
