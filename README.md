# JERSEY WORLD — Full-Stack MERN E-Commerce + AI Virtual Jersey Try-On

[![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20TypeScript-blue.svg)](https://github.com)
[![AI](https://img.shields.io/badge/AI%20Fitting%20Room-Proprietary%20Engine-neonlime.svg)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An ultra-premium, dark luxury football jersey e-commerce platform and proprietary AI-powered digital fitting room built with **React 18, Vite, TypeScript, Tailwind CSS, Redux Toolkit, Node.js, Express, MongoDB, and Sharp**.

---

## Key Features

1. **AI Virtual Jersey Studio (Fitting Room)**:
   - 5-step asynchronous virtual fitting room pipeline.
   - Webcam capture with real-time pose guidance or file upload.
   - Pre-generation image validation (resolution, aspect ratio, single-person check).
   - Live multi-stage animated synthesis progress (`analyzing` → `detecting_body` → `mapping_jersey` → `generating_fit` → `finalizing_image`).
   - Interactive Before/After comparison slider.
   - Instant "Save Look", High-res download, and 1-click "Add to Cart with Fitted Size".
   - Provider-independent AI abstraction: supports Google Gemini Multimodal Vision API and built-in Neural Canvas engine.

2. **Luxury Football Marketplace**:
   - 30+ curated football jerseys across European clubs, national federations, retro 90s/00s editions, and custom kits.
   - Real-time faceted discovery filters (Team, Country, Season, Kit Type, Size, Price slider, In-stock toggle).
   - Instant debounced search modal with live suggestions and popular searches.
   - Multi-angle 4K gallery with zoom, verified buyer reviews, and size guide modal.
   - Live custom jersey back name & squad number personalization preview.

3. **Enterprise Security & Architecture**:
   - JWT authentication with access tokens and secure HttpOnly refresh token rotation.
   - Role-based Access Control (`customer`, `manager`, `admin`).
   - Helmet, CORS allowlist, rate limiting, and NoSQL / XSS injection sanitization.
   - Server-side price & stock verification.
   - Razorpay payment gateway integration with signature verification and sandbox simulation mode.

4. **Admin Executive Dashboard**:
   - Real-time KPIs: Revenue, order volume, low stock alerts.
   - Product inventory & AI asset reference manager.
   - Order processing pipeline with courier tracking numbers.
   - User RBAC management.
   - AI telemetry & cost controller with daily generation quota enforcement.

---

## Quick Start Guide

### Prerequisites
- Node.js v18+ (v22 recommended)
- MongoDB running locally on `mongodb://localhost:27017` or MongoDB Atlas URI

### 1. Install Dependencies
```bash
# Install server dependencies
npm install --prefix server

# Install client dependencies
npm install --prefix client
```

### 2. Seed Database
Pre-populates 30+ football jerseys, clubs, countries, coupons, and test accounts:
```bash
npm run seed --workspace=server
```

### 3. Run Development Servers
```bash
# Terminal 1: Run Server (Port 5000)
npm run dev --workspace=server

# Terminal 2: Run Client (Port 5173)
npm run dev --workspace=client
```

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@jerseyworld.com` | `Admin@12345` |
| **Customer** | `customer@jerseyworld.com` | `Customer@12345` |
| **Manager** | `manager@jerseyworld.com` | `Manager@12345` |

---

## Architecture

```
jersey/
├── client/                     # React 18 + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/         # UI, Product, AI Fitting Room, Layouts
│   │   ├── pages/              # Home, Shop, Details, AI Studio, Checkout, Admin, Account
│   │   ├── services/           # Axios client with interceptors
│   │   └── store/              # Redux slices (auth, cart, wishlist, ai, ui)
├── server/                     # Node.js + Express + Mongoose + TypeScript
│   ├── src/
│   │   ├── controllers/        # Auth, Products, Cart, Orders, AI, Admin, Reviews
│   │   ├── middleware/         # Auth, RBAC, RateLimit, Sanitize, Upload, ErrorHandler
│   │   ├── models/             # User, Product, Cart, Order, TryOnJob, SavedLook, Coupon
│   │   ├── services/           # StorageService, AIService, TryOnQueue, PaymentService
│   │   └── seed.ts             # Database catalog seeder
├── shared/types/               # Shared TypeScript interfaces
├── docker-compose.yml          # Containerized deployment
└── .env.example
```
