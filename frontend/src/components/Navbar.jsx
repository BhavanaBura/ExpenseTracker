import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/expenses", label: "Expenses" },
    { path: "/add-expense", label: "+ Add Expense" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">
          <span className="brand-icon">💰</span>
          <span className="brand-name">ExpenseIQ</span>
        </Link>
      </div>

      <div className="navbar-links">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="navbar-user">
        <span className="user-greeting">Hi, {user?.name?.split(" ")[0]}</span>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
