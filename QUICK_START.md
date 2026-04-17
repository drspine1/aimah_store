# Quick Start Guide - E-Commerce MVP

## 30-Second Setup

### Step 1: Database Setup (5 minutes)
1. Open `/SUPABASE_SETUP.md` in this project
2. Copy the **entire SQL script** (the big `sql` code block)
3. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
4. Navigate to **SQL Editor**
5. Click **New Query**
6. Paste the SQL script
7. Click **Execute**
8. Wait for success message ✅

### Step 2: Environment Variables (Already Set)
✅ Your Supabase credentials are already configured in `.env.development.local`

### Step 3: Run the App
```bash
npm run dev
# Opens http://localhost:3000
```

---

## Testing the MVP

### As a Customer

1. **Browse Products**
   - Visit home page `/`
   - See sample products (if any exist)
   - Use category filters

2. **Create Account**
   - Click "Sign Up" (top right)
   - Enter email & password
   - Verify email (check spam folder)
   - Done! You're logged in

3. **Shop**
   - Click product to see details
   - Add to cart
   - Adjust quantity
   - Add to wishlist (heart icon)

4. **Checkout**
   - Go to `/cart`
   - Review items
   - Click "Proceed to Checkout"
   - Fill shipping address
   - Click "Place Order"
   - See order confirmation

5. **View Orders**
   - Go to `/orders` (in header)
   - See all your orders
   - Click order to see details

### As an Admin

1. **Enable Admin**
   - Go to Supabase Dashboard
   - Navigate to **Table Editor**
   - Click **profiles** table
   - Find your user row
   - Set `is_admin` = `true`
   - Save

2. **Manage Products**
   - Go to `/admin/products`
   - Click "Add Product"
   - Fill form:
     - Name: "Awesome Headphones"
     - Price: 99.99
     - Stock: 50
     - Category: "electronics"
     - Description: (optional)
     - Image URL: (optional)
   - Click "Create Product"

3. **Edit Products**
   - Click "Edit" on any product
   - Modify fields
   - Click "Update Product"

4. **Delete Products**
   - Click "Delete" on any product
   - Confirm deletion

---

## Project Structure (What's Where?)

```
🏠 Home Page
  └─ /app/page.tsx
     └─ Components: ProductCard, Header

🛒 Shopping Cart
  └─ /app/(shop)/cart/page.tsx
     └─ API: /app/api/cart/route.ts

💳 Checkout
  └─ /app/(shop)/checkout/page.tsx
     └─ Creates orders via /app/api/orders/route.ts

📦 Orders
  └─ /app/(shop)/orders/page.tsx
     └─ Shows user's order history

👤 Auth (Login/SignUp)
  └─ /app/auth/login/page.tsx
  └─ /app/auth/sign-up/page.tsx
     └─ Server actions: /lib/actions/auth.ts

⚙️ Admin
  └─ /admin/products/page.tsx
     └─ Manage products (admin only)

🗄️ Database
  └─ Tables created via SUPABASE_SETUP.md

💾 State Management
  └─ Client cart: /lib/store/cart.ts (Zustand)
  └─ Server data: Supabase with RLS
```

---

## Key Features

✅ **Authentication**
- Email/password signup
- Secure JWT tokens in httpOnly cookies
- Auto-logout on expiry
- Profile auto-creation

✅ **Shopping**
- Product catalog with filtering
- Cart management (add, update, remove)
- Wishlist support
- Stock tracking

✅ **Orders**
- Complete checkout flow
- Order history
- Order confirmation page
- Automatic cart clearing after checkout

✅ **Admin Dashboard**
- Create products
- Edit products
- Delete products
- Only accessible to admin users

✅ **Security**
- Row Level Security (RLS) enforced at database
- User data isolation
- Admin-only operations
- No CORS issues (same origin)

✅ **Performance**
- Server-side rendering
- Optimized images
- API caching
- Database indexes

---

## Customization

### Add More Products
```bash
# Visit /admin/products
# Create products via the form
# Or insert directly in Supabase Table Editor
```

### Change Styling
- Edit `/app/globals.css` for colors & fonts
- Update `/tailwind.config.ts` for theme
- Modify component className in `/components/ui/*`

### Add New Categories
1. Update category list in `/app/page.tsx`
2. Products automatically filter by category

### Customize Home Page
- Edit `/app/page.tsx`
- Change hero text, colors, buttons
- Adjust grid layout for products

---

## Troubleshooting

### "Products not showing"
- Did you run the SQL setup from SUPABASE_SETUP.md?
- Check Supabase Dashboard → Tables → products exists
- Visit `/admin/products` and create a test product

### "Can't login"
- Check email in browser's developer console (Network tab)
- Verify email & password are correct
- Check if email is verified in Supabase Auth

### "Cart items disappear"
- This is expected - cart is stored locally
- Refresh page should restore it
- After checkout, cart clears automatically

### "Admin access denied"
- Set `is_admin = true` in profiles table (see Admin section)
- Refresh page
- Try `/admin/products` again

### "Database errors"
- Re-run the SQL script from SUPABASE_SETUP.md
- Check Supabase SQL Editor for error messages
- Ensure all tables exist: products, cart_items, orders, etc.

---

## Next Steps

### To Add Payments
1. Get Stripe API keys
2. Create `/app/api/checkout-session` endpoint
3. Use Stripe SDK to create checkout session
4. Redirect to Stripe Checkout

### To Send Emails
1. Setup SendGrid or Resend
2. Send email on order creation
3. Send order confirmation + tracking

### To Add Images
1. Upload to Supabase Storage OR Vercel Blob
2. Copy public URL
3. Add to product.image_url field
4. Images auto-optimize via Next.js Image component

### To Deploy Live
1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy!

---

## Architecture Docs

For deep dive into:
- Database schema
- API design
- Security implementation
- Scalability strategy

👉 See **ARCHITECTURE.md**

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Shadcn/ui**: https://ui.shadcn.com

Enjoy building! 🚀
