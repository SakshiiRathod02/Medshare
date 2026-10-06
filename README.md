# MedShare – Medicine Donation & Expiry Management Platform

> **Disclaimer**: MedShare is a digital coordination platform connecting licensed donors, charitable clinics, and verified recipients to eliminate medicine waste. It facilitates logistics and safety verification; it does not replace statutory pharmacist review, prescription requirements, or government regulatory procedures.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18+ (tested on v24.14.1)
- **NPM**: v9+

### Setup & Run
```bash
# 1. Install dependencies for root, server, and client
npm install
npm --prefix server install
npm --prefix client install

# 2. Seed database with demo data (medicines, donors, clinics, donations)
npm run seed

# 3. Start development server (runs backend and frontend concurrently)
npm run dev
```

The frontend will run at: `http://localhost:5173`  
The backend REST API will run at: `http://localhost:5000`

---

## 🔑 Demo Credentials

All seeded demo accounts use the standard password: `Password123!`

| Role | Email | Organisation / Type | Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@medshare.org` | MedShare Central HQ | Full platform oversight & rules |
| **Verifier** | `verifier1@medshare.org` | Dr. Aditi Sharma (Chief Pharmacist) | Verification review queue |
| **Verifier** | `verifier2@medshare.org` | Dr. Rajesh Mehta (Clinical Pharmacist)| Verification review queue |
| **Donor (Pharma)** | `donor.pharma@example.com` | Apex Care Pharmacy | Institutional donor |
| **Donor (Hospital)** | `donor.hosp@example.com` | Lifeline Multi-Specialty Hospital | Cold-chain & Rx donor |
| **Donor (Distributor)**| `donor.dist@example.com` | MediSupply Global Logistics | Bulk distributor |
| **Donor (Individual)** | `donor.indiv@example.com` | Rahul Verma | Individual donor |
| **Recipient (NGO)** | `recipient.sewa@example.com` | Sewa Community Health Foundation | Verified NGO recipient |
| **Recipient (Clinic)** | `recipient.clinic@example.com`| Asha Charitable Clinic | Verified Charitable Clinic |
| **Recipient (Individual)** | `recipient.indiv@example.com` | Amit Kumar | Individual low-income patient |

---

## 🏗️ Architecture & Features

- **Pillars**:
  - **Medicine Donation**: list -> verify -> match -> request -> handover
  - **Expiry Management**: validation, alerts, near-expiry redistribution, disposal queue
- **Shelf-Life Match Engine**: Multi-factor scoring (Usability 45%, Proximity 30%, Urgency 15%, Trust 10%).
- **Batch Trail & QR**: Immutable audit trail, public verification timeline, QR-based secure handover.
- **Safety Score**: Multi-parameter rating (0-100) on each listing.
