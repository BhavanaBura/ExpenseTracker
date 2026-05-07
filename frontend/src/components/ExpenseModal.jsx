import { useState } from "react";
import { updateExpense } from "../api/services";

const CATEGORIES = [
  "Food & Dining","Transportation","Shopping","Entertainment",
  "Health & Medical","Housing & Utilities","Education","Travel",
  "Personal Care","Savings & Investments","Other",
];

const PAYMENT_METHODS = ["Cash", "Credit Card", "Debit Card", "UPI", "Bank Transfer", "Other"];

const ExpenseModal = ({ expense, onClose, onSaved }) => {
  const [form, setForm] = useState({
    title: expense?.title || "",
    amount: expense?.amount || "",
    category: expense?.category || "",
    date: expense?.date ? new Date(expense.date).toISOString().split("T")[0] : "",
    description: expense?.description || "",
    paymentMethod: expense?.paymentMethod || "Other",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.category) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      await updateExpense(expense._id, { ...form, amount: Number(form.amount) });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Expense</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="expense-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input name="title" value={form.title} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Amount *</label>
              <input name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="">Select</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : "Update Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
