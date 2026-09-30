# Insight_IQ — Data Profiling & Predictive Engine

Insight_IQ is a browser-based analytics workspace that lets users upload a spreadsheet (CSV or Excel), automatically profile the data, run predictive (machine learning) forecasts, and generate an exportable executive report — all without needing any data-science background.

**Live app:** https://descision-support-systems.vercel.app

---

## ✨ Features

- **Dataset Ingestion Hub** — drag-and-drop or browse to upload `.csv`, `.xlsx`, or `.xls` files, with automatic schema detection and row counting.
- **Data Profiling** — inspect column types, missing values, and summary statistics; build visual and custom charts.
- **Predictive Engine** — run multiple ML algorithms (Random Forest, Gradient Boosting, etc.) to forecast a target variable, with SHAP-based feature contribution explanations.
- **Executive Reports** — a clean, printable audit-style report summarizing dataset quality, key drivers, and the latest prediction; exportable as CSV or printed to PDF.
- **History** — every uploaded dataset and prediction run is saved and can be revisited later.
- **Real Authentication** — users sign up / sign in with their own account (powered by Supabase Auth). Nothing is shared across accounts, and the app requires sign-in before use.
- **In-app Notifications** — real-time alerts for account and workflow events (sign-in, predictions run, password changes, etc.).

---

## 🛠️ Tech Stack

| Layer          | Technology                          |
|----------------|--------------------------------------|
| Frontend       | React + TypeScript + Vite            |
| Styling        | Tailwind CSS                         |
| Icons          | lucide-react                         |
| Authentication | Supabase Auth                        |
| Dev server     | `tsx` running a custom `server.ts`   |

---

## 🚀 Getting Started

### 1. Clone & install

```bash
git clone https://github.com/rida-cpu/Descision-Support-Systems.git
cd Descision-Support-Systems
npm install
```

### 2. Environment variables

Create a `.env.local` file in the project root:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
```

You can find both values in your Supabase project under **Project Settings → API Keys**.

### 3. Run locally

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

---

## 🔐 Authentication Setup (Supabase)

This project uses [Supabase](https://supabase.com) for real user accounts (sign up, sign in, password reset, password change). To connect your own Supabase project:

1. Create a free project at supabase.com.
2. Under **Authentication → Providers → Email**, enable email/password sign-in.
3. Under **Authentication → URL Configuration**, add your local (`http://localhost:3000`) and production (your Vercel URL) addresses to **Site URL** / **Redirect URLs**.
4. Copy your **Project URL** and **anon/publishable key** into `.env.local` (see above).

---

## ☁️ Deployment (Vercel)

1. Push your code to GitHub.
2. Import the repo into [Vercel](https://vercel.com).
3. In **Project Settings → Environment Variables**, add the same two keys:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy (or redeploy) — Vercel will rebuild automatically on every push to `main`.

---

## 📁 Project Structure

```
src/
├── components/       # Reusable UI: Navbar, Sidebar, AuthModal, NotificationDropdown, etc.
├── pages/            # One file per app page (Upload, Data Profiling, Prediction, Reports, History)
├── utils/            # Data analysis / formatting helpers
├── types.ts          # Shared TypeScript types
├── supabaseClient.ts # Supabase client instance
├── App.tsx           # Root component: routing, auth gate, global state
└── main.tsx          # App entry point
```

---

## 📄 License

This project is for educational / personal use. Add a license of your choice here if you plan to open-source it.
