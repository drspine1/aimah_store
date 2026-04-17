# E-Commerce MVP Architecture & Implementation Guide

## System Overview

This is a **production-ready e-commerce MVP** built with Next.js 16, Supabase, and React 19. The application follows enterprise-level architecture patterns and best practices for scalability, security, and performance.

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **State Management**: Zustand (client-side cart)
- **HTTP Client**: Fetch API with caching

### Backend
- **Runtime**: Node.js (via Next.js)
- **API**: RESTful with Next.js API Routes
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (JWT)
- **Security**: Row Level Security (RLS) policies
- **ORM**: Direct Supabase client (no ORM for simplicity/speed)

### Deployment
- **Platform**: Vercel
- **CI/CD**: Git-based deployment
- **Environment**: Serverless functions

## Architecture Diagrams

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React Components + Zustand Cart Store           │   │
│  │  - ProductCard, CartPage, CheckoutPage, etc.     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↓ (HTTPS)
┌─────────────────────────────────────────────────────────┐
│              Next.js Server (Vercel)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │  API Routes (/api/*)                             │   │
│  │  - /products, /cart, /orders, /wishlist          │   │
│  │  - Authentication middleware                     │   │
│  │  - Server Actions                                │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Server Components                               │   │
│  │  - Page rendering, metadata, redirects           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↓ (HTTPS)
┌─────────────────────────────────────────────────────────┐
│            Supabase (PostgreSQL + Auth)                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Tables:                                         │   │
│  │  - profiles, products, cart_items, wishlist      │   │
│  │  - orders, order_items                           │   │
│  │  - auth.users (managed by Supabase Auth)         │   │
│  │                                                  │   │
│  │  Row Level Security (RLS):                       │   │
│  │  - User isolation via auth.uid()                 │   │
│  │  - Admin product management                      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### tables/profiles
```sql
id (UUID) → references auth.users(id)
email (TEXT)
full_name (TEXT)
avatar_url (TEXT)
is_admin (BOOLEAN) ← Admin role flag
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```
**Policies**: Users can only read/update their own profile

### tables/products
```sql
id (UUID) PRIMARY KEY
name (TEXT) NOT NULL
description (TEXT)
price (NUMERIC) NOT NULL
image_url (TEXT)
stock (INTEGER)
category (TEXT)
rating (NUMERIC)
reviews_count (INTEGER)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```
**Policies**: Public read, admin-only write/delete. Indexes on category and price for fast queries.

### tables/cart_items
```sql
id (UUID) PRIMARY KEY
user_id (UUID) → references auth.users(id)
product_id (UUID) → references products(id)
quantity (INTEGER)
created_at (TIMESTAMP)
UNIQUE(user_id, product_id)
```
**Policies**: Users can only manage their own cart. Unique constraint prevents duplicate entries.

### tables/wishlist
```sql
id (UUID) PRIMARY KEY
user_id (UUID) → references auth.users(id)
product_id (UUID) → references products(id)
created_at (TIMESTAMP)
UNIQUE(user_id, product_id)
```
**Policies**: Users can only manage their own wishlist.

### tables/orders
```sql
id (UUID) PRIMARY KEY
user_id (UUID) → references auth.users(id)
total_amount (NUMERIC)
status (TEXT) ← 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
shipping_address (TEXT)
billing_address (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```
**Policies**: Users can only view/create their own orders.

### tables/order_items
```sql
id (UUID) PRIMARY KEY
order_id (UUID) → references orders(id)
product_id (UUID) → references products(id)
quantity (INTEGER)
price_at_purchase (NUMERIC) ← Immutable: stores price at order time
created_at (TIMESTAMP)
```
**Policies**: Users can only view order items for their orders.

## Folder Structure

```
project-root/
├── app/
│   ├── layout.tsx                    ← Root layout with Header
│   ├── page.tsx                      ← Home/product listing
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── callback/route.ts         ← Auth callback handler
│   │   └── error/page.tsx
│   ├── admin/
│   │   └── products/page.tsx         ← Admin product management
│   ├── (shop)/
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── orders/page.tsx
│   │   └── order-confirmation/[id]/page.tsx
│   ├── api/
│   │   ├── products/route.ts         ← Product CRUD (public read, admin write)
│   │   ├── cart/route.ts             ← Cart management (user-isolated)
│   │   ├── orders/route.ts           ← Order CRUD (user-isolated)
│   │   ├── wishlist/route.ts         ← Wishlist management
│   │   └── admin/
│   │       └── migrate/route.ts      ← Database migration helper
│   ├── globals.css                   ← Tailwind + design tokens
│   └── middleware.ts                 ← Auth token refresh
│
├── components/
│   ├── header.tsx                    ← Navigation & user menu
│   ├── products/
│   │   └── product-card.tsx          ← Product display card
│   └── ui/                           ← shadcn/ui components
│
├── lib/
│   ├── actions/
│   │   └── auth.ts                   ← Server actions for auth
│   ├── supabase/
│   │   ├── client.ts                 ← Browser client
│   │   ├── server.ts                 ← Server-side client
│   │   └── proxy.ts                  ← Session proxy
│   ├── store/
│   │   └── cart.ts                   ← Zustand cart store
│   ├── types/
│   │   └── index.ts                  ← TypeScript types
│   └── utils.ts                      ← Utility functions
│
├── scripts/
│   ├── 001_create_tables.sql         ← Table creation
│   ├── 002_enable_rls_policies.sql   ← RLS policies
│   ├── 003_profile_trigger.sql       ← Auto-profile trigger
│   └── migrate.js                    ← Migration runner
│
├── public/                           ← Static assets
├── SUPABASE_SETUP.md                 ← Database setup guide
├── ARCHITECTURE.md                   ← This file
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
└── middleware.ts
```

## API Routes Reference

### Products
- **GET** `/api/products?category=&minPrice=&maxPrice=&search=&page=&limit=`
  - Public endpoint
  - Returns paginated products with filtering
  
- **POST** `/api/products`
  - Admin-only
  - Creates new product
  - Body: `{name, description, price, image_url, stock, category}`

### Cart
- **GET** `/api/cart`
  - User-isolated
  - Returns user's cart items with product details
  
- **POST** `/api/cart`
  - Adds/updates product in cart
  - Body: `{productId, quantity}`
  
- **PUT** `/api/cart`
  - Updates quantity of cart item
  - Body: `{cartItemId, quantity}`
  
- **DELETE** `/api/cart?id=cartItemId`
  - Removes item from cart

### Orders
- **GET** `/api/orders`
  - User-isolated
  - Returns user's orders with items
  
- **POST** `/api/orders`
  - Creates new order from cart
  - Body: `{cartItems, totalAmount, shippingAddress, billingAddress}`
  - Automatically clears cart after order creation

### Wishlist
- **GET** `/api/wishlist`
  - User-isolated
  - Returns user's wishlist
  
- **POST** `/api/wishlist`
  - Adds product to wishlist
  - Body: `{productId}`
  
- **DELETE** `/api/wishlist?id=wishlistItemId`
  - Removes product from wishlist

## Authentication Flow

1. **Sign Up**
   - User submits email + password at `/auth/sign-up`
   - Supabase creates auth.users entry
   - Trigger automatically creates profiles entry
   - Confirmation email sent (if email verification required)

2. **Email Verification** (Optional)
   - User clicks link → `/auth/callback?code=...`
   - Code exchanged for session via Supabase
   - User redirected to home

3. **Login**
   - User submits credentials at `/auth/login`
   - JWT token stored in httpOnly cookie (secure)
   - Middleware validates token on each request

4. **Session Refresh**
   - Middleware checks token expiry
   - `proxy.ts` handles automatic refresh
   - User stays logged in seamlessly

5. **Logout**
   - Server action clears session
   - Redirect to login page

## Security Implementation

### Row Level Security (RLS)
- **Enforced at database level** (cannot be bypassed)
- Users can only read their own cart, wishlist, orders
- Products are publicly readable
- Only admins can create/update/delete products

### Authentication
- JWT tokens stored in **httpOnly cookies** (XSS-safe)
- CSRF protection via Supabase Auth
- Server-side validation of all mutations

### API Security
- All POST/PUT/DELETE require authentication
- User ownership checks in API routes
- Rate limiting can be added via Vercel

### Data Validation
- Client-side input validation (UX)
- Server-side validation (security)
- TypeScript for type safety

## State Management Strategy

### Server-side State
- Database source-of-truth via Supabase RLS
- Server Components for initial data fetching
- Server Actions for mutations

### Client-side State
- **Zustand Cart Store** for ephemeral cart state
- Persisted to localStorage for UX
- Synced with backend on checkout

### Data Fetching
- **Client Components**: `fetch()` with proper error handling
- **Server Components**: Direct Supabase queries
- **Caching**: Implicit via HTTP headers, can add SWR

## Scalability Considerations

### Current Capacity (MVP)
- **Database**: ~10K products, ~100K users
- **Requests**: 50-100 concurrent users
- **Storage**: Images via external CDN recommended

### Future Scaling
1. **Horizontal Scaling**
   - Vercel: Auto-scaling via serverless
   - Supabase: Reads auto-scale, writes optimized
   
2. **Database Optimization**
   - Add Redis cache layer via Upstash
   - Implement read replicas for heavy queries
   - Archive old orders to separate table
   
3. **Search Enhancement**
   - Migrate to Elasticsearch or Meilisearch
   - Full-text search with aggregations
   
4. **Image Optimization**
   - Use Vercel Blob or Cloudinary
   - Auto-resize via Next.js Image component
   
5. **Performance**
   - Implement ISR (Incremental Static Regeneration)
   - CDN cache product listing
   - API response caching with ETags

## Development Workflow

### Setup
```bash
# Install dependencies
npm install  # or pnpm install

# Start development server
npm run dev

# Navigate to http://localhost:3000
```

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (for server-only)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=your_redirect_url
```

### Database Setup
1. Open `SUPABASE_SETUP.md`
2. Copy SQL script into Supabase SQL Editor
3. Execute all statements
4. Verify tables in Tables panel

### Testing Admin Features
1. Set `is_admin = true` in profiles table for a user
2. Navigate to `/admin/products`
3. Create/edit/delete products

## Performance Metrics

### Targets
- **Lighthouse**: 90+ score
- **FCP** (First Contentful Paint): < 1.5s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1
- **API Response Time**: < 200ms

### Optimization Strategies
- Image optimization via Next.js Image
- Code splitting via dynamic imports
- Lazy loading for product images
- Database query optimization with indexes
- Caching headers configured

## Deployment to Vercel

1. **Connect Repository**
   - Push to GitHub
   - Link GitHub repo in Vercel

2. **Environment Variables**
   - Set in Vercel project settings
   - Same variables as `.env.local`

3. **Build & Deploy**
   - Auto-deploys on git push
   - Production URL provided

4. **Database Security**
   - RLS policies enforce at database level
   - Service Role key not exposed to client

## Monitoring & Debugging

### Available Tools
- **Vercel Analytics**: Monitor performance
- **Supabase Dashboard**: View database, auth users
- **Browser DevTools**: Debug client-side state
- **Server Logs**: Check `/api` route execution

### Common Issues
- **Auth fails**: Check email confirmation status
- **Cart empty**: Clear localStorage, refresh
- **404 on products**: Run SUPABASE_SETUP.md SQL
- **Admin access denied**: Verify `is_admin = true`

## Future Enhancements

### Phase 2
- [ ] Payment processing (Stripe/PayPal)
- [ ] Email notifications (order confirmation)
- [ ] Product reviews & ratings
- [ ] User profile management
- [ ] Inventory alerts

### Phase 3
- [ ] Advanced analytics dashboard
- [ ] Email marketing integration
- [ ] SMS notifications
- [ ] Recommendation engine
- [ ] A/B testing framework

### Phase 4
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Real-time inventory sync
- [ ] Admin bulk operations
- [ ] Advanced search/filters

## Support & Troubleshooting

For issues:
1. Check Supabase dashboard for errors
2. Review browser console for client errors
3. Check Vercel logs for server errors
4. Verify environment variables are set
5. Ensure database tables exist via SUPABASE_SETUP.md

## License

MIT - Feel free to use for commercial projects
