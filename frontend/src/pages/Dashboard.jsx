import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { getStats } from "../api/services";
import { useAuth } from "../context/AuthContext";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CATEGORY_COLORS = [
  "#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6",
  "#8b5cf6","#ec4899","#14b8a6","#f97316","#84cc16","#94a3b8",
];

const StatCard = ({ label, value, sub, icon, color }) => (
  <div className="stat-card" style={{ "--accent": color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getStats();
      setStats(res.data.data);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (error) return <div className="page-error">{error}</div>;

  // Prepare monthly chart data — fill missing months with 0
  const monthlyData = MONTH_NAMES.map((name, i) => {
    const found = stats.monthlySummary?.find((m) => m._id.month === i + 1);
    return { name, amount: found?.total || 0, count: found?.count || 0 };
  });

  const categoryData = stats.byCategory?.map((c) => ({
    name: c._id,
    value: c.total,
    count: c.count,
  })) || [];

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <div>
          <h1>Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="page-subtitle">Here's your financial overview</p>
        </div>
        <Link to="/add-expense" className="btn-primary">+ Add Expense</Link>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        <StatCard
          label="Total Spending"
          value={fmt(stats.totalSpending)}
          icon="💳"
          color="#6366f1"
        />
        <StatCard
          label="This Month"
          value={fmt(stats.thisMonthSpending)}
          icon="📅"
          color="#f59e0b"
        />
        <StatCard
          label="Transactions"
          value={stats.totalTransactions || 0}
          sub="all time"
          icon="📊"
          color="#10b981"
        />
        <StatCard
          label="Top Category"
          value={categoryData[0]?.name || "—"}
          sub={categoryData[0] ? fmt(categoryData[0].value) : ""}
          icon="🏆"
          color="#ef4444"
        />
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Monthly Bar Chart */}
        <div className="chart-card">
          <h3>Monthly Spending — {new Date().getFullYear()}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(v) => [`$${v.toFixed(2)}`, "Amount"]}
                contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8 }}
              />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="chart-card">
          <h3>Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`$${v.toFixed(2)}`]}
                  contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8 }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="recent-section">
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <Link to="/expenses" className="link-view-all">View all →</Link>
        </div>
        {stats.recentExpenses?.length > 0 ? (
          <div className="recent-list">
            {stats.recentExpenses.map((exp) => (
              <div key={exp._id} className="recent-item">
                <div className="recent-left">
                  <span className="category-badge">{exp.category}</span>
                  <div>
                    <p className="recent-title">{exp.title}</p>
                    <p className="recent-date">{new Date(exp.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="recent-amount">-{fmt(exp.amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No expenses yet. <Link to="/add-expense">Add your first one!</Link></p>
          </div>
        )}
      </div>
    </div>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
};

export default Dashboard;
