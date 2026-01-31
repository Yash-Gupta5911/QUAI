# 🌌 Quai Network Sentinel Dashboard

[![VIBE CODING HACKATHON](https://img.shields.io/badge/Hackathon-VIBE%20CODING-blueviolet?style=for-the-badge)](https://example.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

**Quai Network Sentinel** is a high-performance, industry-grade analytics dashboard designed for the Quai Network. Built specifically for the **VIBE CODING 12-Hour Hackathon**, it provides real-time insights, indexing, and visualization of the Quai blockchain.

---

## ✨ Key Features

- **🔴 Live Network Heartbeat**: Real-time tracking of Block Height, Gas Prices (Gwei), and network-wide TPS.
- **📊 Dynamic Visualizations**: Interactive time-series charts for TPS history and sparklines for gas price fluctuations.
- **📦 Auto-Archiving Indexer**: Automatically syncs every fetched block and transaction to a **Supabase** database for long-term analytics.
- **🦊 Wallet Connectivity**: Seamless integration with **Pelagus** (Quai native) and **MetaMask**.
- **🔍 Deep Insights**: Detailed data tables for recent blocks and individual transactions with value parsing.
- **💎 Premium UX**: Sleek "OLED Black" UI with glassmorphism, smooth animations (Framer Motion), and responsive layouts.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4 |
| **State & Data** | TanStack Query (React Query), Axios |
| **Charts** | Recharts, Chart.js, React-Chartjs-2 |
| **Database** | Supabase (PostgreSQL) |
| **Blockchain** | Quai Network JSON-RPC, Quais.js |
| **Icons & UI** | Lucide React, Framer Motion |

---

## 🚀 Getting Started

### 1️⃣ Prerequisites
- Node.js (v18+)
- NPM or Yarn
- A Supabase account (for data indexing)

### 2️⃣ Installation
```bash
# Clone the repository
git clone https://github.com/quai-sentinel.git
cd quai-sentinel

# Install dependencies
npm install
```

### 3️⃣ Environment Setup
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4️⃣ Database Initialization
Run the provided SQL script in your Supabase SQL Editor to set up the necessary tables:
- `SUPABASE_SETUP.sql` (Creates `blocks` and `transactions` tables with appropriate schemas).

### 5️⃣ Run Locally
```bash
npm run dev
```

---

## 📡 API Integration & Indexing

The dashboard communicates directly with Quai Network nodes via JSON-RPC.

- **Endpoints**: `quai_blockNumber`, `quai_gasPrice`, `quai_getBlockByNumber`.
- **Indexing Logic**: Located in `src/services/api.js`, the app implements an asynchronous `storeBlocksInSupabase` function that deduplicates and pushes data to the cloud automatically as you browse the dashboard.

---

## 🏛 Project Structure

```text
src/
├── components/          # UI Components (Dashboard, Charts, DataTables)
├── services/            # Logic (API calls, Supabase client, Indexer)
├── App.jsx              # Main Entry Point
└── index.css            # Tailwind & Global Styles
```


## 🤝 Developed By

**Team Sentinel** ✨
