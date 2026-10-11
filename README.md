# DentPro OS — Dental Practice Management SaaS UI

DentPro OS is a modern, enterprise-grade Dental Practice Management Software (DPMS) redesigned with clean typography, collapsible navigation systems, and interactive clinic states. Styled with Vanilla CSS and Tailwind, it simulates a production-grade workspace environment.

## 🚀 Key Features

### 1. Minimal Collapsible Navigation Sidebar
- Supports **Expanded (250px)** and **Collapsed (72px)** states.
- Clean typography and icons aligned side-by-side. In collapsed mode, the logo and button scale down gracefully (`DentalLogo` scales to `32px`, button scales to `24px`) to fit centered on the same line.
- 7 core modules prioritized: Dashboard, Appointments, Patients, Treatments, Billing, Reports, and Settings.

### 2. Clinical Workflow States & Interactive Simulation
- **Intake Database**: Preloaded with 15 detailed mock patients including gender, contact numbers, age, and medical preconditions/warnings.
- **Check-In Flow**: Updates Scheduled patients to Waiting and issues sequential Token tags (e.g. `T-01`, `T-02`).
- **Consultation Workspace**: Access drug prescriptions, diagnosis text fields, diagnostic file uploads (X-Rays/Photos), and an **interactive 32-tooth dental mapping chart** (decayed, filled, or missing tooth status tags).
- **Auto-Billing Engine**: Completing treatments logs clinical records and auto-creates itemized invoices based on treatment costs.
- **Split Payment Checkout**: Logs cash, card, and UPI payment combinations, tracks tax (18% GST), applies discounts, and computes outstanding balances.
- **Invoice Statement Receipts**: Beautiful receipts with print, download PDF, or email simulations.

### 3. Integrated Search & Analytics
- **Grouped Search**: Search across patients, phone numbers, treatment types, and invoice IDs with grouped query returns.
- **Dynamic KPI reports**: Timeframe filters (Today, Week, Month, Year) instantly update revenue, treatment frequency, and patient logs.

---

## 🛠️ Tech Stack & Directory Structure
- **Core Framework**: Next.js (App Router, Turbopack) & React
- **Styling**: TailwindCSS & Vanilla CSS
- **Icons**: Lucide React
- **Page Routing**:
  - `/` (Root Page Tab Router)
  - `/login` & `/register`
  - `/forgot-password`, `/reset-password`
  - `/preview-hub` (Unified Auth Portal)
  - `/dashboard`, `/appointments`, `/patients`, `/treatments`, `/billing`, `/reports`, `/settings` (direct page-level sub-routes)

---

## 📦 Getting Started

### Installation
```bash
npm install
```

### Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### Build and Verify Production Check
```bash
npm run build
```
The compiler ensures all components and sub-routes are statically type-checked with 0 compile errors.
