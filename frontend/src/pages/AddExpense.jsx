import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createExpense } from "../api/services";

const CATEGORIES = [
  "Food & Dining","Transportation","Shopping","Entertainment",
  "Health & Medical","Housing & Utilities","Education","Travel",
  "Personal Care","Savings & Investments","Other",
];

const PAYMENT_METHODS = ["Cash", "Credit Card", "Debit Card", "UPI", "Bank Transfer", "Other"];

const AddExpense = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    paymentMethod: "Other",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setApiError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      newErrors.amount = "Enter a valid amount greater than 0";
    if (!form.category) newErrors.category = "Please select a category";
    if (!form.date) newErrors.date = "Date is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await createExpense({ ...form, amount: Number(form.amount) });
      navigate("/expenses");
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Add New Expense</h1>
          <p className="page-subtitle">Track a new transaction</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="expense-form">
          {apiError && <div className="alert alert-error">{apiError}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Grocery shopping"
                className={errors.title ? "input-error" : ""}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label>Amount (USD) *</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
                className={errors.amount ? "input-error" : ""}
              />
              {errors.amount && <span className="field-error">{errors.amount}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={errors.category ? "input-error" : ""}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span className="field-error">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label>Date *</label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className={errors.date ? "input-error" : ""}
              />
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add notes about this expense..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
