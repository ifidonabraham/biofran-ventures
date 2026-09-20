# Biofran Ventures — Project Completion Checklist

**Document purpose.** This file is the single source of truth for what has been
built, what is still outstanding, and — most importantly — **what "done" means**
for this project. Work through it top to bottom and the project is complete.

Last updated: after the storefront build session.

---

## 1. What the business needs (the requirement)

| # | Requirement | Status |
|---|-------------|--------|
| 1 | E-commerce store with product listings (clothes, shoes, bags, women's & men's dress watches) | ✅ Built |
| 2 | Home appliances (fridge, freezer, AC, fan, washer, microwave, kettle…) | ✅ Built |
| 3 | Physical-store range: gas accessories, gas refill service, camp gas, cooking stoves, camp stoves | ✅ Built |
| 4 | **Biofran Properties** — housing agency section (sales, rentals, short-lets, land) | ✅ Built |
| 5 | Contacts: `08037211227`, `08141256339`, `07045723013` | ✅ In `src/config.js` |
| 6 | Emails: `ifidonabraham249@gmail.com`, `abiodunifidon@gmail.com`, `francisifidon3@gmail.com` | ✅ In `src/config.js` |
| 7 | Beautiful, classy design | ✅ Navy + champagne-gold design system |
| 8 | A **matching preview link for every image** | ✅ Lightbox preview links generated per product/listing |
| 9 | Frontend: HTML, CSS, JavaScript | ✅ `public/` (vanilla, no build step) |
| 10 | Backend: Django **or** Express.js | ✅ Express.js (`server.js` + `src/`) |
| 11 | Shopping cart | ✅ Session + user carts, slide-over drawer, cart page |
| 12 | Product details page | ✅ Gallery, specs, features, related items |
| 13 | Order processing | ✅ Checkout → order → timeline → admin status updates |
| 14 | Login and registration | ✅ bcrypt hashing, sessions, guest-cart merge |
| 15 | Database for products, users and orders | ✅ JSON document store in `data/` (swappable) |
| 16 | Use `node_modules` packages (Node.js) | ✅ express, express-session, bcryptjs, dotenv |

---

## 2. What is already built and verified

### 2.1 Backend — complete

```
server.js                      Express app, sessions, static hosting, graceful shutdown
src/config.js                  ALL business data: contacts, addresses, hours, fees, payments
src/utils.js                   slugify, order refs, money, paginate, validators
src/catalog.js                 3 departments + 13 leaf categories with generated images
src/icons.js                   ~40 hand-written vector icon shapes
src/artwork.js                 SVG artwork engine (product, category, property, logo)

src/db/store.js                Atomic JSON document store (tmp-file + rename)
src/db/index.js                DB facade + collection registry
src/db/seed.js                 Seeder (idempotent, --force / --wipe)
src/db/seed-data/products.js   63 products across fashion / appliances / gas
src/db/seed-data/properties.js 10 property listings for Biofran Properties

src/models/user.js             register, verify, profile, password change
src/models/product.js          query/filter/sort/paginate, facets, related, stock
src/models/property.js         listings query, facets, related
src/models/cart.js             guest + user carts, merge on login, delivery pricing
src/models/order.js            checkout validation, order create, status history, stats
src/models/message.js          enquiries, newsletter, internal message log

src/middleware/auth.js         session ctx, attachUser, attachCart, requireAuth/Admin
src/middleware/errors.js       asyncHandler, api 404, error handler

src/routes/images.js           /img/p | /img/c | /img/pr | /img/logo | /img/hero
src/routes/site.js             /api/site
src/routes/auth.js             /api/auth/*
src/routes/catalog.js          /api/categories, /api/products*
src/routes/properties.js       /api/properties*
src/routes/cart.js             /api/cart*
src/routes/orders.js           /api/orders*
src/routes/contact.js          /api/contact, /api/newsletter, /api/gas-enquiry
src/routes/admin.js            /api/admin/*
```

**Verified:** `node src/db/seed.js --force` → 63 products, 10 properties, 2 users, exit code 0.

### 2.2 Frontend — complete

```
public/css/   13 stylesheets (tokens, buttons/forms, chrome, drawers, cards,
              hero/sections, footer, shop, product detail, dashboards, misc)
public/js/    api.js, site.js, footer.js, components.js, boot.js
              pages/home.js, pages/shop.js, pages/product.js, pages/cart.js
public/index.html
```

### 2.3 Images — solved without binary assets

Every image is an SVG generated on demand, so a picture can never be missing or
mismatched with the item it belongs to:

| Route | What it draws |
|-------|---------------|
| `/img/p/<slug>.svg` | Product card image, palette derived from its category |
| `/img/p/<slug>.svg?v=2` | Same product, second palette (gallery) |
| `/img/p/<slug>.svg?size=1400` | **Matching high-resolution preview** for the lightbox |
| `/img/c/<key>.svg` | Category tile |
| `/img/c/group-<key>.svg` | Department tile |
| `/img/pr/<slug>.svg` | Property listing image |
| `/img/logo.svg`, `/img/favicon.svg`, `/img/hero.svg` | Brand marks |

Unknown slugs return a **404 SVG**, so an `<img>` tag can never break.

---

## 3. What is STILL TO DO (remaining scope)

All remaining items have been built, connected, and verified against the acceptance smoke test.

### 3.1 Front-end page controllers — `public/js/pages/`

| File | Page it drives | Status |
|------|----------------|--------|
| `checkout.js` | Checkout form, delivery/payment pickers, place-order, success screen | ✅ Built |
| `auth.js` | Login + register forms (shared controller) | ✅ Built |
| `account.js` | Profile, addresses, password, order history, order tracking | ✅ Built |
| `gas.js` | Gas services page: refill calculator, cylinder sizes, booking form | ✅ Built |
| `properties.js` | Property listing page with filters | ✅ Built |
| `property.js` | Single property detail + inspection request | ✅ Built |
| `contact.js` | Contact form, topic/ref prefill from query string | ✅ Built |
| `admin.js` | Admin dashboard: stats, orders, status updates, enquiries, customers | ✅ Built |

### 3.2 HTML pages — `public/`

| File | Served at | Status |
|------|-----------|--------|
| `shop.html` | `/shop` | ✅ Built |
| `product.html` | `/product/<slug>` | ✅ Built |
| `cart.html` | `/cart` | ✅ Built |
| `checkout.html` | `/checkout` | ✅ Built |
| `login.html` | `/login` | ✅ Built |
| `register.html` | `/register` | ✅ Built |
| `account.html` | `/account` | ✅ Built |
| `gas.html` | `/gas` | ✅ Built |
| `properties.html` | `/properties` | ✅ Built |
| `property.html` | `/property/<slug>` | ✅ Built |
| `contact.html` | `/contact` | ✅ Built |
| `about.html` | `/about` | ✅ Built |
| `admin.html` | `/admin` | ✅ Built |
| `404.html` | any unknown URL | ✅ Built |

### 3.3 Documentation

| File | Purpose | Status |
|------|---------|--------|
| `README.md` | Install, run, first login, how to change prices/products, deployment notes | ✅ Built |

---

## 4. Definition of Done — this is how the project is "complete"

The project is **complete** when every one of the following is true. Run these in
order; each is objectively verifiable.

### Gate 1 — the server boots cleanly

```powershell
npm install
npm start
```

Expected: a banner printed with the storefront URL, the shop URL, the gas URL, the
property URL, the admin URL and the three phone numbers. **No stack traces.**

### Gate 2 — the database is populated

```powershell
npm run seed:reset
```

Expected: `products ... 63`, `properties ... 10`, `users ... 2`.

### Gate 3 — the automated smoke test passes 100%

```powershell
node tests/smoke.js
```

This is the acceptance test. It must print **`=== N passed, 0 failed ===`** and exit
with code `0`. It covers:

- health + `/api/site` (branding, the 3 phone numbers, the 3 emails, departments)
- catalogue: pagination, gas filter, search, sorting, product detail, 404s
- generated artwork: product image, **1400px preview**, gallery variants, category,
  department, logo, and a 404 SVG for unknown slugs
- Biofran Properties: 10 listings, purpose/city filters, image + preview
- authentication: register, session, duplicate email rejected, wrong password rejected,
  **no password hash ever returned**
- cart: add, quantity patch, remove, gas delivery option, repricing
- checkout: order created with `BFV-` reference, timeline, WhatsApp link, frozen line
  items, cart emptied, tracking with correct email works, tracking with wrong email is 403,
  invalid input rejected
- contact form, newsletter, gas-refill booking
- admin: customer blocked (403), admin login, stats, orders, status change + history,
  enquiries, customers, create product, delete product
- all 14 static pages served, unknown page returns 404

### Gate 4 — every image link resolves

```powershell
# spot-check the three link types the brief asked for
curl.exe -s -o NUL -w "product %{http_code}\n"  http://localhost:3000/img/p/premium-oxford-shirt.svg
curl.exe -s -o NUL -w "preview %{http_code}\n"  "http://localhost:3000/img/p/premium-oxford-shirt.svg?size=1400"
curl.exe -s -o NUL -w "property %{http_code}\n" http://localhost:3000/img/pr/4-bedroom-duplex-with-bq-gra.svg
```

Expected: three times `200`. In the browser, clicking the 🔍 on any product or listing
opens a lightbox showing the **same item** at high resolution.

### Gate 5 — the full purchase journey works in the browser

1. Open `http://localhost:3000` → hero, categories, featured products all render.
2. Click a product → detail page with gallery, specs, features, related items.
3. Add to cart → cart drawer slides in, header badge increments.
4. Open `/shop`, filter by department + category + price, sort, paginate — URL updates.
5. Go to `/cart`, change quantity, change delivery method, total recalculates.
6. `/register` a new account → then `/login` → the guest cart survives the login.
7. `/checkout` → fill the form → place the order → success screen with the `BFV-…`
   reference and a working “Confirm on WhatsApp” button.
8. `/account` → the order appears in history, status timeline renders.
9. `/admin` logged in as the administrator → the order is listed, change its status and
   confirm it appears in the timeline.
10. `/gas` → submit a refill booking; `/contact` → submit an enquiry; both appear in the
    admin table.

### Gate 6 — responsive check

At **360px**, **768px**, **1280px** wide: no horizontal scrolling, the hamburger drawer
opens, the cart drawer is usable, and tables scroll inside their container.

### Gate 7 — business details are correct

- Footer shows `08037211227`, `08141256339`, `07045723013`.
- Footer shows `ifidonabraham249@gmail.com`, `abiodunifidon@gmail.com`, `francisifidon3@gmail.com`.
- The WhatsApp button opens a chat to `+2348037211227`.
- The gas button dials `08141256339`.
- Biofran Properties uses `07045723013` / `francisifidon3@gmail.com`.

---

## 5. Things the owner must supply before going live

These are **content/business decisions**, not code. The code is ready for them.

| # | What is needed | Where it goes |
|---|----------------|---------------|
| 1 | **Exact physical store address** (street, landmark, city) | `src/config.js` → `site.storeAddress` |
| 2 | **Exact property office address** | `src/config.js` → `site.propertyOffice` |
| 3 | Real opening hours | `src/config.js` → `site.openingHours` |
| 4 | Bank account details shown to customers paying by transfer | `src/config.js` → new `bank` block (surface it on `/checkout`) |
| 5 | Real product photos (optional) — drop files in `public/img/uploads/` and set `product.image` to the file path; the SVG art stays as the fallback | `data/products.json` or the admin product form |
| 6 | Confirm the seeded prices match today's market (especially LPG per-kg) | `src/db/seed-data/products.js` then re-seed |
| 7 | A long random `SESSION_SECRET` | `.env` |
| 8 | Change the admin password from `Biofran@Admin1` | `.env` → `ADMIN_PASSWORD`, then re-seed or change it in `/account` |

---

## 6. Larger, optional future work (not required for "done")

Only do these if the business asks for them:

1. **Real payments** — Paystack or Flutterwave integration on `/checkout`
   (replace the `paymentMethods` transfer/POS/cash flow).
2. **Email/SMS notifications** — send the order receipt from `src/models/order.js`
   using Nodemailer or a Termii/SMS provider.
3. **Move to a real database** — swap `src/db/store.js` for MongoDB (Mongoose) or
   SQLite. The model layer already mimics a document store, so only `src/db/` and the
   small query helpers change.
4. **Customer reviews** — currently the review counts are seeded display data.
5. **Image uploads from the admin dashboard** — `multer` + `public/img/uploads/`.
6. **Property enquiry-to-deal pipeline** — statuses per property (viewing booked,
   offer made, closed).
7. **Delivery tracking map** and rider assignment.
8. **Loyalty / discount codes.**
9. **Deployment** — Render, Railway, Fly.io or a VPS. Set `NODE_ENV=production`,
   a strong `SESSION_SECRET`, and `DATA_DIR` pointing at a persistent volume
   (the JSON database is file-based, so the disk must persist between restarts).

---

## 7. Quick reference

```powershell
npm install          # install dependencies
npm run seed         # seed only if the database is empty
npm run seed:reset   # wipe and reseed everything
npm start            # run the store
npm run dev          # run with auto-restart on file changes
node tests/smoke.js  # run the acceptance test
```

**Seeded logins**

| Role | Email | Password |
|------|-------|----------|
| Administrator | `ifidonabraham249@gmail.com` | `Biofran@Admin1` |
| Demo customer | `demo@biofranventures.com` | `Biofran@1234` |

**Key routes**

| URL | Page |
|-----|------|
| `/` | Storefront home |
| `/shop` | All products with filters |
| `/product/<slug>` | Product detail |
| `/gas` | Gas refills, accessories, camp gas, stoves |
| `/properties` | Biofran Properties listings |
| `/cart` · `/checkout` | Cart and order placement |
| `/login` · `/register` · `/account` | Authentication and customer area |
| `/contact` · `/about` | Contact and company information |
| `/admin` | Administrator dashboard (admin login required) |
| `/api/health` | API health probe |

---

## 8. How to understand "the project is complete"

> The project is complete when `node tests/smoke.js` reports **0 failed** and every
> page in section 3.2 exists and renders its content, and the ten steps of **Gate 5**
> can be performed in a browser without an error appearing in the console.

Everything else in this document is either already done (section 2), owner-supplied
content (section 5), or explicitly optional (section 6).