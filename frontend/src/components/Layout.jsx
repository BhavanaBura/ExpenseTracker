import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => (
  <div className="app-layout">
    <Navbar />
    <main className="main-content">
      <Outlet />
    </main>
  </div>
);

export default Layout;
