import { useAuth } from "./AuthContext.jsx";

export default function useHasPermission(needed) {
  const { user } = useAuth();
  const have = new Set(user?.permissions || []);
  const needList = Array.isArray(needed) ? needed : [needed];
  return needList.every((p) => have.has(p));
}
