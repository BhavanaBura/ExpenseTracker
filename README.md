# 💰 ExpenseIQ — Full-Stack MERN Expense Tracker

A modern, full-featured expense tracking application built with the MERN stack (MongoDB, Express, React, Node.js).

## 🚀 Features

- **JWT Authentication** — Secure signup, login, and protected routes
- **Expense CRUD** — Add, view, edit, and delete expenses
- **Smart Dashboard** — Total spending, monthly charts, category breakdown
- **Category Filtering** — 11 built-in expense categories
- **Monthly Reports** — Filter expenses by month/year
- **Pagination** — Efficient list rendering
- **Responsive UI** — Works on desktop and mobile
- **Dark Mode Design** — Modern, refined interface

## 🗂 Project Structure

```
expense-tracker/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Register, login, profile
│   │   └── expenseController.js # CRUD + stats
│   ├── middleware/
│   │   ├── auth.js            # JWT protect middleware
│   │   └── errorHandler.js    # Global error handler
│   ├── models/
│   │   ├── User.js            # User schema + password hashing
│   │   └── Expense.js         # Expense schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── expenseRoutes.js
│   │   └── categoryRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Express entry point
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js       # Axios instance with interceptors
    │   │   └── services.js    # API functions
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── PrivateRoute.jsx
    │   │   └── ExpenseModal.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx # Global auth state
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Expenses.jsx
    │   │   └── AddExpense.jsx
    │   ├── styles/
    │   │   └── global.css
    │   ├── App.jsx            # Router setup
    │   └── main.jsx
    ├── .env.example
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## ⚙️ Setup Instructions

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB** — either:
  - Local: [Install MongoDB Community](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier available)
- **npm** v9+

---

### Step 1 — Clone / Unzip the Project

```bash
unzip expense-tracker.zip
cd expense-tracker
```

---

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

This installs:
- `express` — Web framework
- `mongoose` — MongoDB ODM
- `bcryptjs` — Password hashing
- `jsonwebtoken` — JWT generation & verification
- `cors` — Cross-Origin Resource Sharing
- `dotenv` — Environment variables
- `express-validator` — Input validation
- `nodemon` (dev) — Auto-restart on file changes

**Create your `.env` file:**

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_long_random_secret_string_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

**Start the backend (with auto-reload):**

```bash
npm run dev
```

You should see:
```
🚀 Server running in development mode on port 5000
✅ MongoDB Connected: localhost
```

---

### Step 3 — Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
```

This installs:
- `react` + `react-dom` — UI library
- `react-router-dom` — Client-side routing
- `axios` — HTTP client for API calls
- `recharts` — Charts library
- `vite` + `@vitejs/plugin-react` (dev) — Build tool

**Start the frontend:**

```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### Step 4 — Open the App

Navigate to `http://localhost:5173` in your browser.

1. Click **"Create one free"** to register
2. You'll be redirected to the Dashboard
3. Click **"+ Add Expense"** to add your first expense
4. Explore the Dashboard charts and Expenses list

---

## 🔌 How Frontend Communicates with Backend

```
React (Vite :5173)
      │
      │  HTTP requests via Axios
      │  Authorization: Bearer <JWT>
      ▼
Vite Dev Proxy (/api → :5000)
      │
      ▼
Express Server (:5000)
      │
      ├── POST /api/auth/register
      ├── POST /api/auth/login
      ├── GET  /api/auth/me         [protected]
      ├── GET  /api/expenses        [protected]
      ├── GET  /api/expenses/stats  [protected]
      ├── POST /api/expenses        [protected]
      ├── PUT  /api/expenses/:id    [protected]
      ├── DELETE /api/expenses/:id  [protected]
      └── GET  /api/categories      [protected]
      │
      ▼
MongoDB (via Mongoose)
```

**Authentication flow:**
1. User logs in → backend returns JWT token
2. Frontend stores token in `localStorage`
3. Axios interceptor automatically adds `Authorization: Bearer <token>` to every request
4. Backend `protect` middleware verifies the token and attaches `req.user`
5. If token is expired/invalid, Axios response interceptor redirects to `/login`

---

## 📡 API Reference

### Auth Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{ name, email, password }` | Register new user |
| POST | `/api/auth/login` | `{ email, password }` | Login + get JWT |
| GET | `/api/auth/me` | — | Get current user |

### Expense Endpoints (all require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List expenses (query: `month, year, category, page, limit`) |
| GET | `/api/expenses/stats` | Dashboard stats |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Expense Categories

- Food & Dining
- Transportation
- Shopping
- Entertainment
- Health & Medical
- Housing & Utilities
- Education
- Travel
- Personal Care
- Savings & Investments
- Other

---

## 🏗 Production Build

**Frontend:**
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

**Backend:**
```bash
# Set NODE_ENV=production in .env
# Deploy dist/ folder as static files from Express or a CDN
```

---

## 🔒 Security Notes

- Change `JWT_SECRET` to a long random string in production
- Use MongoDB Atlas with IP allowlisting in production
- Never commit `.env` to version control
- Use HTTPS in production

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Charts | Recharts |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Dev Server | Nodemon |
