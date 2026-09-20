# Biofran Ventures

E-commerce storefront for fashion (clothing, shoes, bags, watches), home appliances, a physical LPG gas store (gas refills, accessories, camp gas, stoves), and **Biofran Properties** (housing agency).

---

## 1. Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Seed database (first run or to re-populate)
npm run seed:reset

# 3. Start the server
npm start
```

The web server will boot on `http://localhost:3000`.

To run with automatic server reload during development:
```bash
npm run dev
```

---

## 2. Default Logins (Seeded)

| Role | Email | Password | Access |
|---|---|---|---|
| **Administrator** | `ifidonabraham249@gmail.com` | `Biofran@Admin1` | Full `/admin` dashboard, inventory, orders, enquiries |
| **Demo Customer** | `demo@biofranventures.com` | `Biofran@1234` | `/account` portal, order tracking, address book |

---

## 3. Automated Smoke Tests & Acceptance

Run the comprehensive end-to-end smoke test:
```bash
node tests/smoke.js
```
Expected output: **`=== 85 passed, 0 failed ===`** (exit code 0).

The smoke test validates:
- Health and branding probe (`/api/health`, `/api/site`).
- Three contact numbers (`08037211227`, `08141256339`, `07045723013`).
- Three official emails (`ifidonabraham249@gmail.com`, `abiodunifidon@gmail.com`, `francisifidon3@gmail.com`).
- Catalogue facets, filters, search, and pagination.
- Dynamic SVG artwork generation and 1400px lightbox previews.
- Biofran Properties listings and filters.
- Secure auth (bcrypt hashing, session protection, no password leaks).
- Cart workflows (add, quantity patch, delivery repricing, delete).
- Checkout and order creation (`BFV-` reference, timeline, WhatsApp confirmation link).
- Contact form, newsletter, and gas refill bookings.
- Admin dashboard endpoints, customer authorization barriers, order status updates.
- All 14 static storefront HTML pages.

---

## 4. Key Routes

| Route | Page Description |
|---|---|
| `/` | Storefront home (hero, department tiles, featured, trust factors) |
| `/shop` | Full catalogue with department/category/price filters, search, and sorting |
| `/product/:slug` | Product detail page with image gallery, specs, features, related items |
| `/gas` | Gas refills, cylinder size pricing, doorstep booking, camp gas & stoves |
| `/properties` | Biofran Properties listings (sale, rent, short-let, land) |
| `/property/:slug` | Property detail with specifications, verified docs, and inspection booking |
| `/cart` | Shopping cart drawer and full cart review page |
| `/checkout` | Checkout form with delivery/payment methods and WhatsApp order confirmation |
| `/login` · `/register` | Customer sign in and account registration |
| `/account` | Customer dashboard, order history, profile settings, and order tracker |
| `/contact` | Contact form, department phone desks, store address, opening hours |
| `/about` | Company story, trust factors, and multi-department overview |
| `/admin` | Administrator dashboard (KPI stats, orders, status changes, enquiries) |
| `/healthz` · `/api/health` | Health checks for deployment platforms |

---

## 5. Dynamic Vector SVG Artwork System

Every product, category tile, property listing, and logo has an on-demand generated SVG route under `/img/*`. This guarantees that image links can never break, missing assets never occur, and high-resolution previews match the item exactly:

- `/img/p/<slug>.svg`: Product card artwork with department-derived palette.
- `/img/p/<slug>.svg?size=1400`: High-resolution matching lightbox preview.
- `/img/p/<slug>.svg?v=2`: Variant gallery view.
- `/img/c/<category-key>.svg`: Category tile illustration.
- `/img/pr/<property-slug>.svg`: Property architectural elevation.
- `/img/logo.svg` & `/img/hero.svg`: Brand vector marks.
- Unknown slugs return a branded 404 SVG (never a broken `<img>`).

---

## 6. Business Customization

### Contacts, Addresses & Hours
All business parameters reside in [`src/config.js`](file:///C:/Users/PC/biofran%20ventures/src/config.js):
- `site.storeAddress`: Physical store address.
- `site.propertyOffice`: Real estate office location.
- `site.contacts.phones`: Dedicated phone lines.
- `site.contacts.emails`: Official department emails.
- `site.openingHours`: Weekly operating schedule.
- `commerce.freeDeliveryThreshold`: Threshold for free shipping (default `₦150,000`).
- `commerce.deliveryFees`: Fees for store pickup, same-day city delivery, and nationwide.

### Changing Prices or Adding Products
- **Via Admin UI:** Log in as administrator at `/admin` and use the **Quick Add Product** form.
- **Via Seed Data:** Edit [`src/db/seed-data/products.js`](file:///C:/Users/PC/biofran%20ventures/src/db/seed-data/products.js) or [`src/db/seed-data/properties.js`](file:///C:/Users/PC/biofran%20ventures/src/db/seed-data/properties.js) and run `npm run seed:reset`.

---

## 7. Production Deployment Notes

1. **Environment Variables:** Set in `.env`:
   ```ini
   PORT=3000
   NODE_ENV=production
   SESSION_SECRET=your-super-long-secure-random-secret
   ADMIN_EMAIL=ifidonabraham249@gmail.com
   ADMIN_PASSWORD=your-secure-admin-password
   DATA_DIR=/var/data/biofran
   ```
2. **Persistent Storage:** The database uses an atomic JSON file store in `./data`. In production (Render, Railway, Fly.io, or VPS), attach a persistent volume to `DATA_DIR` so that orders and accounts persist across container restarts.
3. **SSL / Reverse Proxy:** Serve behind Nginx, Caddy, or a cloud load balancer with SSL enabled (`secure: true` cookies automatically activate in `production` mode).
