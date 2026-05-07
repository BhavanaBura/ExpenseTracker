import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps routes that require authentication.
// If not logged in, redirects to /login.
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
