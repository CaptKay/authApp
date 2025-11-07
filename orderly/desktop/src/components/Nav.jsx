import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import  useHasPermission  from "../auth/useHasPermission";

export default function Nav() {
  const { accessToken, logout } = useAuth();

  const canProfile = useHasPermission("profile:read");
  const canAccounts = useHasPermission("invoices:read");
  const canSales = useHasPermission("orders:read");
  const canAdmin = useHasPermission("users:manage");

  return (
    <nav style={{display:'flex',gap:12,padding:12,borderBottom:'1px solid #ddd'}}>
      {!accessToken && <Link to="/login">Login</Link>}

      {canProfile && <Link to="/profile">Profile</Link>}
      {canAccounts && <Link to="/accounts/invoices">Accounts</Link>}
      {canSales && <Link to="/sales/orders">Sales</Link>}
      {canAdmin && <Link to="/admin">Admin</Link>}

      {accessToken && (
        <button
          onClick={logout}
          style={{
            marginLeft: "auto",
            background: "transparent",
            border: "none",
            color: "crimson",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      )}
    </nav>
  );
}