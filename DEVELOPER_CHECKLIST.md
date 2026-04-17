# Developer Checklist

## Phase 0: Initial Setup

### Environment
- [ ] Node.js 18+ installed
- [ ] Git configured locally
- [ ] Code editor setup (VSCode recommended)
- [ ] Browser devtools enabled
- [ ] Supabase account created

### Project Setup
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Copy `.env.development.local` to `.env.local`
- [ ] Verify Supabase credentials in env file
- [ ] Run `npm run dev`
- [ ] Visit http://localhost:3000

### Database Setup
- [ ] Read `SUPABASE_SETUP.md`
- [ ] Copy SQL script from document
- [ ] Paste into Supabase SQL Editor
- [ ] Execute SQL (wait for all statements)
- [ ] Verify tables exist in Supabase UI

## Phase 1: Feature Testing

### Customer Features
- [ ] Homepage loads without errors
- [ ] Products display correctly
- [ ] Category filtering works
- [ ] Sign up creates new user
- [ ] Confirmation email received
- [ ] Login with test account works
- [ ] Add product to cart
- [ ] Update cart quantity
- [ ] Remove from cart
- [ ] Add to wishlist
- [ ] Proceed to checkout
- [ ] Fill shipping address
- [ ] Create order successfully
- [ ] Order confirmation page shows
- [ ] Orders page lists purchases
- [ ] Logout works
- [ ] Responsive design on mobile

### Admin Features
- [ ] Set is_admin = true for test user (Supabase)
- [ ] Visit /admin/products
- [ ] Access granted (not denied)
- [ ] Create new product
  - [ ] Fill all required fields
  - [ ] Click "Create Product"
  - [ ] Product appears in list
- [ ] Edit product
  - [ ] Click "Edit"
  - [ ] Change product details
  - [ ] Click "Update"
  - [ ] Changes reflected
- [ ] Delete product
  - [ ] Click "Delete"
  - [ ] Confirm deletion
  - [ ] Product removed from list
- [ ] Non-admin user cannot access /admin/products

## Phase 2: API Testing

### Products API
```bash
# List products
curl http://localhost:3000/api/products

# List with filters
curl "http://localhost:3000/api/products?category=electronics&page=1"

# Create product (requires admin)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":99.99,"stock":10}'
```
- [ ] GET /api/products returns products
- [ ] GET with filters works
- [ ] Response includes pagination
- [ ] POST requires authentication
- [ ] POST requires admin role

### Cart API
```bash
# Get cart
curl http://localhost:3000/api/cart

# Add to cart
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"productId":"xxx","quantity":1}'
```
- [ ] GET returns user's cart items
- [ ] POST adds item to cart
- [ ] PUT updates quantity
- [ ] DELETE removes item
- [ ] All operations require auth

### Orders API
```bash
# Get orders
curl http://localhost:3000/api/orders

# Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{...}'
```
- [ ] GET returns user's orders
- [ ] POST creates new order
- [ ] Orders isolated by user
- [ ] Cart cleared after order

## Phase 3: Security Testing

### Authentication
- [ ] Cannot access /admin without login
- [ ] Cannot access /orders without login
- [ ] Cannot access /cart without login
- [ ] JWT token in cookies (DevTools → Application)
- [ ] Token is httpOnly (cannot access via JS)
- [ ] Token refreshes automatically

### Authorization
- [ ] User can only see own cart
- [ ] User can only see own orders
- [ ] User can only see own wishlist
- [ ] Non-admin cannot create products
- [ ] Non-admin cannot edit products
- [ ] Non-admin cannot delete products

### Data Isolation
- [ ] Create order as User A
- [ ] Login as User B
- [ ] User B cannot see User A's order
- [ ] User B cart is empty
- [ ] User B wishlist is empty

### Input Validation
- [ ] Empty product name rejected
- [ ] Negative price rejected
- [ ] Invalid email format rejected
- [ ] SQL injection attempt blocked
- [ ] XSS script attempt blocked

## Phase 4: Performance Testing

### Page Load Times (Chrome DevTools → Performance)
- [ ] Homepage: < 1 second
- [ ] Product page: < 1 second
- [ ] Cart page: < 500ms
- [ ] Checkout page: < 500ms

### API Response Times
- [ ] GET /api/products: < 200ms
- [ ] GET /api/cart: < 200ms
- [ ] POST /api/cart: < 200ms
- [ ] POST /api/orders: < 300ms

### Database Performance
- [ ] Create 100 products
- [ ] Product list still loads < 1s
- [ ] Search with 100 products < 500ms
- [ ] No slow queries in logs

## Phase 5: Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Samsung Internet

### Responsiveness
- [ ] 320px width (small phone)
- [ ] 768px width (tablet)
- [ ] 1024px width (laptop)
- [ ] 1920px width (desktop)

## Phase 6: Accessibility Testing

### Keyboard Navigation
- [ ] Tab through form fields
- [ ] Tab order is logical
- [ ] Can submit form with keyboard
- [ ] Can navigate between pages

### Screen Reader
- [ ] Use VoiceOver (Mac) or NVDA (Windows)
- [ ] All images have alt text
- [ ] Form labels associated with inputs
- [ ] Buttons have clear labels
- [ ] Links have meaningful text

### Color Contrast
- [ ] Text contrast > 4.5:1 for small text
- [ ] Text contrast > 3:1 for large text
- [ ] Not relying on color alone
- [ ] Error messages understandable

## Phase 7: Error Handling

### Network Errors
- [ ] Disconnect internet while loading
- [ ] Appropriate error message shown
- [ ] Can retry operation
- [ ] App recovers gracefully

### Validation Errors
- [ ] Submit empty form
- [ ] Show validation errors
- [ ] Errors near invalid field
- [ ] Clear what to fix

### Server Errors
- [ ] Simulate API error (set status 500)
- [ ] Show user-friendly error message
- [ ] Suggest next steps
- [ ] Log error for debugging

## Phase 8: Mobile Testing

### Touch Interactions
- [ ] Buttons have 48x48px minimum target
- [ ] No hover-only interactions
- [ ] Swipe works on product carousel
- [ ] Pinch zoom not disabled

### Forms on Mobile
- [ ] Input fields are large enough
- [ ] Keyboard doesn't cover input
- [ ] Clear button to clear field
- [ ] Easy to correct mistakes

### Performance
- [ ] Load time < 3s on 4G
- [ ] Smooth scrolling
- [ ] No jank/stuttering
- [ ] Images properly sized

## Phase 9: Local Development Workflow

### Code Quality
- [ ] Run `npm run lint`
- [ ] Fix any linting issues
- [ ] No console errors/warnings
- [ ] TypeScript types correct

### Hot Reload
- [ ] Edit component
- [ ] Page reloads automatically
- [ ] Changes visible immediately
- [ ] No need to restart dev server

### Debugging
- [ ] Can set breakpoints in VSCode
- [ ] Can debug in Chrome DevTools
- [ ] Network tab shows API calls
- [ ] Source maps work for TypeScript

## Phase 10: Production Preparation

### Build Test
- [ ] Run `npm run build`
- [ ] Build completes successfully
- [ ] No build errors/warnings
- [ ] Bundle size reasonable

### Environment Variables
- [ ] Verify .env.local has all vars
- [ ] No secrets in git (check .gitignore)
- [ ] Production env vars ready for Vercel
- [ ] Redis URL ready (if using cache)

### Documentation
- [ ] README.md is accurate
- [ ] ARCHITECTURE.md covers system
- [ ] DEPLOYMENT.md has production setup
- [ ] API routes documented
- [ ] Database schema documented

### Monitoring Setup
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Performance monitoring ready
- [ ] Alerts configured

## Phase 11: Deployment

### Pre-Deploy
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Environment variables added to Vercel
- [ ] Database backups enabled
- [ ] Monitoring alerts configured

### Deploy to Vercel
- [ ] Push to GitHub
- [ ] Vercel deployment triggered
- [ ] Build succeeds
- [ ] Environment variables loaded
- [ ] App is live

### Post-Deploy
- [ ] Visit production URL
- [ ] Test signup/login
- [ ] Create test order
- [ ] Check database in Supabase
- [ ] Monitor error logs
- [ ] Performance metrics

## Phase 12: Post-Launch

### Week 1
- [ ] Monitor error logs daily
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Fix critical bugs immediately
- [ ] Document issues found

### Week 2-4
- [ ] Analyze user behavior
- [ ] Optimize slow pages
- [ ] Add popular feature requests
- [ ] Scale database if needed
- [ ] Plan Phase 2 features

### Ongoing
- [ ] Daily: Check logs for errors
- [ ] Weekly: Review analytics
- [ ] Monthly: Performance audit
- [ ] Quarterly: Security review
- [ ] Annually: Major upgrades

## Feature Checklists

### Adding New Product Category

1. Backend
   - [ ] Add category to Products enum (if using)
   - [ ] Test filtering by new category
   - [ ] Verify RLS allows access

2. Frontend
   - [ ] Add to category filter list in `/app/page.tsx`
   - [ ] Test filter shows products
   - [ ] Test admin can create product with new category

3. Admin
   - [ ] Admin can add products with new category
   - [ ] Can filter products by new category
   - [ ] Can edit category on existing products

### Adding New Payment Method

1. Backend
   - [ ] Create `/api/payment` routes
   - [ ] Integrate payment provider SDK
   - [ ] Store payment method safely
   - [ ] Add transaction logging

2. Frontend
   - [ ] Add payment form to checkout
   - [ ] Handle payment errors
   - [ ] Show loading state
   - [ ] Confirm payment success

3. Database
   - [ ] Add payment_method column to orders
   - [ ] Add payment_status column
   - [ ] Create payment_logs table (optional)

### Adding User Profile Page

1. Backend
   - [ ] Create `/app/profile/page.tsx`
   - [ ] Fetch user profile data
   - [ ] Create update profile API

2. Frontend
   - [ ] Display user info
   - [ ] Add edit form
   - [ ] Show account settings
   - [ ] Add logout button

3. Database
   - [ ] Ensure profiles table has needed fields
   - [ ] Create RLS policy for profile access

## Testing Scenarios

### Happy Path: Complete Purchase
1. [ ] Signup
2. [ ] Browse products
3. [ ] Add 3 products to cart
4. [ ] Remove 1 product
5. [ ] Update 1 quantity
6. [ ] Proceed to checkout
7. [ ] Fill shipping info
8. [ ] Create order
9. [ ] See confirmation
10. [ ] Check orders page

### Edge Case: Inventory
1. [ ] Check product with stock = 0
2. [ ] Should show "Out of Stock"
3. [ ] Cannot add to cart
4. [ ] Button disabled

### Edge Case: Session Expiry
1. [ ] Login
2. [ ] Wait 1 hour (or simulate)
3. [ ] Make API call
4. [ ] Session should refresh automatically
5. [ ] No logout

### Edge Case: Cart Persistence
1. [ ] Add products to cart
2. [ ] Refresh page
3. [ ] Cart items still there (local storage)
4. [ ] Logout and login
5. [ ] Cart items may be empty (expected)

## Debugging Tips

### API Issues
```
1. Check Network tab in DevTools
2. Look at response status and body
3. Check API route for console.log
4. Verify authentication header
5. Check RLS policy in Supabase
```

### Database Issues
```
1. Check Supabase SQL Editor
2. Run SELECT queries to verify data
3. Check RLS policies are enabled
4. Look for foreign key violations
5. Check table exists and has columns
```

### Auth Issues
```
1. Check DevTools → Application → Cookies
2. Verify JWT token present
3. Check Supabase Auth settings
4. Verify email confirmation status
5. Check auth redirect URL
```

### Performance Issues
```
1. Run Chrome DevTools → Performance
2. Look for slow API calls (Network tab)
3. Check database query times (Supabase)
4. Reduce image sizes
5. Enable caching headers
```

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Check code quality
npm run type-check   # Check TypeScript

# Database
# Run SUPABASE_SETUP.md SQL in Supabase editor

# Deployment
git push origin main # Triggers Vercel deploy
vercel --prod        # Deploy via CLI

# Debugging
npm run dev -- --inspect  # Node debugger
open http://localhost:9229 # Attach debugger
```

## Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [shadcn/ui Components](https://ui.shadcn.com)
- [MDN Web Docs](https://developer.mozilla.org)

---

**Mark items as complete** (`- [x]`) as you verify them.

**Print this checklist** for your development process.

Good luck! 🚀
