import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import AddExpense from "./pages/AddExpense";
import "./styles/global.css";

// ─────────────────────────────────────────────
// App Routing Structure:
//
//  /                  → redirect to /dashboard
//  /login             → Login page (public)
//  /register          → Register page (public)
//  /dashboard         → Dashboard (private)
//  /expenses          → Expense list (private)
//  /add-expense       → Add expense form (private)
//
// PrivateRoute wraps protected pages.
// If not authenticated, redirects to /login.
// ─────────────────────────────────────────────

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes — all share the Layout (Navbar + main) */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/add-expense" element={<AddExpense />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
