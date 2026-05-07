import api from "./axios";

// ── Auth APIs ────────────────────────────────

export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const getProfile = () => api.get("/auth/me");

// ── Expense APIs ─────────────────────────────

// Get expenses with optional query params: { month, year, category, page, limit }
export const getExpenses = (params = {}) => api.get("/expenses", { params });

// Get dashboard stats
export const getStats = () => api.get("/expenses/stats");

// Create new expense
export const createExpense = (data) => api.post("/expenses", data);

// Update expense by ID
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);

// Delete expense by ID
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// ── Category APIs ────────────────────────────
export const getCategories = () => api.get("/categories");
