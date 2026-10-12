# RENTALS BY MO — Complete Rental Website with Admin Dashboard & WhatsApp Quotation System

A modern, high-performance, responsive rental website for **Rentals BY MO**, offering party, event, tableware, furniture, and event-equipment rentals in Ontario, Canada.

---

## 🌟 Key Features

1. **Complete 38-Product Catalogue**:
   - All 38 products from Plates & Cutlery to Glassware, Chafing Dishes, Banquet Tables, Chairs, Tablecloths, Drapes, and Pipe Frames.
   - Fixed prices, price ranges (e.g. Large Cooking Pot CAD $20–$30 depending on size), and Price on Request items.
   - Pricing basis clearly indicated (`each/day`, `per item/day`).

2. **Rental Quote Cart**:
   - Multi-item selection with quantity adjustments.
   - Daily estimated line subtotals and overall estimated subtotal for known prices.
   - Products marked "Price on Request" designated as "To Be Confirmed" without inventing prices.
   - Transparent disclaimer that prices are 1-day estimates subject to confirmation.

3. **Compulsory Full Event/Delivery Address**:
   - Clean, validated quotation request form.
   - `Full Event/Delivery Address *` field positioned directly beneath `Event Location (City/Town)`.
   - Mandatory for both pickup and delivery, rejecting empty or whitespace-only inputs.

4. **Quote Completion & Empty-Cart Two Action Buttons**:
   - **Primary Button**: `Request on WhatsApp` (opens WhatsApp with formatted quotation or general enquiry when empty).
   - **Secondary Button**: `Browse Rentals` (returns to catalogue, preserving cart contents).

5. **Direct WhatsApp Integration**:
   - Pre-formatted, URL-encoded message sent to Rentals BY MO at `+2347043642879`.
   - Contains customer details, event date, event time, location, full address, preference, line items, quantities, prices, subtotals, and notes.

6. **Secure Administrator Portal (`/admin`)**:
   - Password-protected with salted crypto hashing and bearer session tokens.
   - Real-time inventory management: Add, Edit, Delete, and Toggle Availability.
   - Image file upload (with preview) and custom image URL support.
   - JSON Backup export, JSON backup import, and "Reset to Default 38 Products".
   - Password management from the dashboard.
   - Download complete project ZIP backup.
   - Persistent storage in `data/products.json`.

---

## 🚀 Quick Start & Local Setup

### 1. Installation

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The application runs on `http://localhost:3000`.

### 3. Build for Production

```bash
npm run build
npm run start
```

---

## 🔐 Administrator Credentials

- **Initial Username**: `admin`
- **Initial Password**: `RentalsByMo2026!`
- **Accessing the Portal**: Click the **"Admin"** button in the header/footer or navigate directly to `http://localhost:3000/admin`.
- **Changing Password**: Inside the Admin Dashboard, click **"Change Password"** to set a new password. Credentials are cryptographically salted and persisted in `data/admin.json`.

---

## 📱 How to Change the WhatsApp Number

To change the destination WhatsApp number:

1. Open `src/utils/whatsapp.ts`.
2. Update the constants:
   ```typescript
   export const BUSINESS_PHONE = '+2347043642879'; // Change to new number (with country code)
   export const WHATSAPP_BASE_URL = 'https://wa.me/2347043642879'; // Change number here
   ```
3. Update the display text in `src/components/Navbar.tsx` and `src/components/Footer.tsx`.

---

## 📦 How to Backup and Restore Data

1. **Export JSON Backup**:
   - In the Admin Dashboard, click **"Export JSON"**.
   - A timestamped JSON file containing all current products will download.
2. **Import JSON Backup**:
   - Click **"Import JSON"** and select a previously exported file.
3. **Reset to Factory Default (38 Items)**:
   - Click **"Reset to Default (38)"** to restore the catalog to its initial 38 products.
4. **Download Complete Project ZIP**:
   - Click **"Project ZIP"** in the Admin Dashboard to save a snapshot.

---

## 🌐 Deployment Instructions

### Full-Stack Node / Docker / Render / Railway / VPS

This app features an Express backend for persistent product updates and image uploads:

1. Build command:
   ```bash
   npm run build
   ```
2. Start command:
   ```bash
   npm run start
   ```
3. Environment variables (optional):
   - `PORT=3000`
   - `ADMIN_USERNAME=admin`
   - `ADMIN_PASSWORD=YourCustomStrongPassword123!`

### Netlify Deployment

1. If deploying frontend-only static build:
   - Build command: `npm run build`
   - Publish directory: `dist`
2. For full persistent backend on Netlify:
   - Use Netlify Functions or deploy the server to Render / Railway / Heroku / Fly.io and set the API proxy.

---

## 🛡️ Business Policies & Notes

- **Refundable Deposit**: A refundable security deposit is compulsory for all rentals.
- **Service Area**: Ontario, Canada.
- **Pickup & Delivery**: Available upon arrangement.
- **Currency**: Canadian Dollars (CAD) per item/day.
- **Confirmation**: Final pricing, deposits, and availability are confirmed directly via WhatsApp.
