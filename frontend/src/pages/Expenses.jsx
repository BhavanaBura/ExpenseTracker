import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getExpenses, deleteExpense } from "../api/services";
import ExpenseModal from "../components/ExpenseModal";

const MONTHS = [
  "All Months","January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editExpense, setEditExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const now = new Date();
  const [filters, setFilters] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    category: "",
  });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;
      if (filters.category) params.category = filters.category;

      const res = await getExpenses(params);
      setExpenses(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch {
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      fetchExpenses();
    } catch {
      alert("Failed to delete expense");
    }
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditExpense(null);
  };

  const handleSaved = () => {
    handleModalClose();
    fetchExpenses();
  };

  const fmt = (n) => `$${Number(n).toFixed(2)}`;

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>All Expenses</h1>
          <p className="page-subtitle">{total} total records</p>
        </div>
        <Link to="/add-expense" className="btn-primary">+ Add Expense</Link>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <select
          value={filters.month}
          onChange={(e) => { setFilters({ ...filters, month: e.target.value }); setCurrentPage(1); }}
        >
          {MONTHS.map((m, i) => <option key={i} value={i === 0 ? "" : i}>{m}</option>)}
        </select>

        <select
          value={filters.year}
          onChange={(e) => { setFilters({ ...filters, year: e.target.value }); setCurrentPage(1); }}
        >
          {[2022, 2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={filters.category}
          onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setCurrentPage(1); }}
        >
          <option value="">All Categories</option>
          {[
            "Food & Dining","Transportation","Shopping","Entertainment",
            "Health & Medical","Housing & Utilities","Education","Travel",
            "Personal Care","Savings & Investments","Other",
          ].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Summary Bar */}
      {expenses.length > 0 && (
        <div className="summary-bar">
          <span>Showing {expenses.length} expenses</span>
          <span className="summary-total">Page Total: <strong>{fmt(totalAmount)}</strong></span>
        </div>
      )}

      {/* Expense Table */}
      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No expenses found for this period.</p>
          <Link to="/add-expense" className="btn-primary">Add First Expense</Link>
        </div>
      ) : (
        <div className="expense-table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp._id}>
                  <td>
                    <div className="expense-title">{exp.title}</div>
                    {exp.description && (
                      <div className="expense-desc">{exp.description}</div>
                    )}
                  </td>
                  <td><span className="badge">{exp.category}</span></td>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                  <td>{exp.paymentMethod}</td>
                  <td className="amount-cell">{fmt(exp.amount)}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleEdit(exp)} className="btn-edit">Edit</button>
                      <button onClick={() => handleDelete(exp._id)} className="btn-delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>
            ← Prev
          </button>
          <span>{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>
            Next →
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <ExpenseModal expense={editExpense} onClose={handleModalClose} onSaved={handleSaved} />
      )}
    </div>
  );
};

export default Expenses;
