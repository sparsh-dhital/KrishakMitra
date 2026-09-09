# 🌾 KrishakMitra

> **A smart procurement & queue management platform engineered to eliminate Mandi congestion using tonnage-based QR slot booking, real-time wait tracking, and an innovative direct-bidding marketplace.**

![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?style=flat&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%28Python%29-009688?style=flat&logo=fastapi)
![Supabase](https://img.shields.io/badge/Database-Supabase%20%7C%20PostgreSQL-3ECF8E?style=flat&logo=supabase)
![Realtime](https://img.shields.io/badge/Queue-WebSockets%20%26%20Realtime-FF6C37?style=flat)

---

## 📌 Problem & Core Solution

| **The Challenge** | **The KrishakMitra Solution** |
| :--- | :--- |
| **Procurement Bottlenecks:** Farmers face multi-day waiting times, unorganized center arrivals, heavy traffic congestion, and opaque middleman networks at procurement centers (Mandis). | **Automated Queue & Smart Bidding:** A unified platform where farmers book tonnage-capacity slots, receive digital QR entry passes, track real-time queue status, and optionally list produce on an innovative direct-bidding marketplace. |

---

## ✨ Key Features

### 🚜 Core Queue & Slotting Engine (Primary Focus)
*   **Tonnage-Based Slotting:** Smart scheduling algorithm that allocates arrival slots based on total crop tonnage and procurement center handling capacity to prevent bottlenecking.
*   **QR-Based Slot Booking:** Instant digital pass generation with unique QR codes for seamless check-in verification at center entry gates.
*   **Real-Time Queue Tracker:** Live status dashboard powering real-time admission updates, position tracking, and estimated wait times via WebSockets.
*   **Congestion & Traffic Control:** Reduces on-site waiting times and eliminates overcrowding at government procurement facilities.

### 💡 Innovative Added Features
*   **Real-Time Direct Bidding Marketplace:** An integrated auction engine allowing farmers to list reserve prices and verified institutional buyers/wholesalers to place competitive live bids.
*   **AI Crop Pricing Microservice:** Python FastAPI endpoint predicting optimal baseline pricing using historical procurement data, crop type, and volume metrics.
*   **Live Notifications:** Automated SMS/App alerts triggered when slot times approach, queue positions advance, or outbid events occur.
*   **Role-Based Dashboards:** Custom portal views tailored for **Farmers**, **Procurement Center Officers**, and **Institutional Buyers**.

---

## 🛠️ Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | JavaScript, React, Vite, CSS3 | Web application, farmer portal, QR scanner view |
| **Backend API** | Python (FastAPI) | Tonnage allocation algorithms, AI pricing microservice, queue logic |
| **Database & Realtime** | Supabase (PostgreSQL) | Data persistence, WebSocket realtime engine, Auth |
| **Verification** | QR Code Generation & Scanning API | Fast gate check-ins and admission management |

---

## 🗄️ Database & Queue Architecture

The system relies on four primary PostgreSQL structures in Supabase:

1. `procurement_slots` – Manages center capacity, tonnage limits, date-time windows, and booked volume.
2. `queues` – Live state machine tracking farmer check-ins, QR scan statuses, token numbers, and active queue position.
3. `auctions` – Stores marketplace crop metadata, minimum starting price, quantity, and listing status.
4. `bids` – Tracks real-time buyer offers linked directly to active produce listings.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
* Node.js (v18+)
* Python 3.9+
* Supabase Account

### 1. Repository Setup & Frontend
```bash
# Clone repository
git clone [https://github.com/sparsh-dhital/KrishakMitra.git](https://github.com/sparsh-dhital/KrishakMitra.git)
cd KrishakMitra

# Install frontend dependencies
npm --prefix frontend install