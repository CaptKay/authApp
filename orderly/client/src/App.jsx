import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import Profile from "./pages/Profile.jsx";
import RequirePermission from "./auth/RequirePermission.jsx";
import AccountsInvoices from "./pages/AccountsInvoices.jsx";
import SalesOrders from "./pages/SalesOrders";
import AdminUsers from './pages/AdminUsers';
import Nav from "./components/Nav.jsx";

function App() {
  return (
    <div className="app-shell">
      <Nav />
      <main className="app-content">
        <Routes>
          {/* public routes  */}
          <Route path="/login" element={<Login />} />

          {/* protected routes group  */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/accounts/invoices"
              element={
                <RequirePermission needed="invoices:read">
                  <AccountsInvoices />
                </RequirePermission>
              }
            />
            <Route
              path="/sales/orders"
              element={
                <RequirePermission needed="orders:read">
                  <SalesOrders />
                </RequirePermission>
              }
            />
            <Route
              path="/admin"
              element={
                <RequirePermission needed="users:manage">
                  <AdminUsers />
                </RequirePermission>
              }
            />
          </Route>

          {/* fallback  */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
