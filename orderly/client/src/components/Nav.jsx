import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import useHasPermission from "../auth/useHasPermission";
import ThemeToggle from "../theme/ThemeToggle";

export default function Nav() {
  const { accessToken, logout } = useAuth();
  const location = useLocation();

  const canProfile = useHasPermission("profile:read");
  const canAccounts = useHasPermission("invoices:read");
  const canSales = useHasPermission("orders:read");
  const canAdmin = useHasPermission("users:manage");

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="top-nav">
      {!accessToken && <Link to="/login">Login</Link>}

      {canProfile && (
        <Link to="/profile" aria-current={isActive('/profile') ? 'page' : undefined}>
          Profile
        </Link>
      )}
      {canAccounts && (
        <Link
          to="/accounts/invoices"
          aria-current={isActive('/accounts') ? 'page' : undefined}
        >
          Accounts
        </Link>
      )}
      {canSales && (
        <Link to="/sales/orders" aria-current={isActive('/sales') ? 'page' : undefined}>
          Sales
        </Link>
      )}
      {canAdmin && (
        <Link to="/admin" aria-current={isActive('/admin') ? 'page' : undefined}>
          Admin
        </Link>
      )}

      <div className="top-nav__spacer" />
      <ThemeToggle />

      {accessToken && (
        <button
          onClick={logout}
          className="link-button danger"
          type="button"
        >
          Logout
        </button>
      )}
    </nav>
  );
}
