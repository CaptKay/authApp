import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RequirePermission({ needed, children }) {
  const { user } = useAuth();
  const have = new Set(user?.permissions || []);
  const needList = Array.isArray(needed) ? needed : [needed];
  const ok = needList.every((p) => have.has(p));

  if (!ok) return <Navigate to="/profile" replace />;

  return children;
}
