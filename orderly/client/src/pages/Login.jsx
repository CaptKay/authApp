import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin123!");
  const [totp, setTotp] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [error, setError] = useState("");
  const { login, loading, accessToken, nextPath } = useAuth();
  const nav = useNavigate();

  if(accessToken){
    return <Navigate to={nextPath || "/profile"} replace />
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(" ");
    const res = await login({ email, password, totp, backupCode });
    if (!res.ok) return setError(res.error);
    nav(res.nextPath || "/profile", { replace: true });
    // nav("/profile", { replace: true });
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={onSubmit}>
        <h2>Sign in</h2>
        <p className="auth-subtitle">Use your seeded account to log in.</p>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="••••••••"
          />
        </div>
        <div className="field">
          <label htmlFor="totp">TOTP (if 2FA is enabled)</label>
          <input
            id="totp"
            inputMode="numeric"
            pattern="\d*"
            value={totp}
            onChange={(e) => setTotp(e.target.value)}
            placeholder="6-digit code"
          />
        </div>
        <div className="field">
            <label htmlFor="backup">Backup code (optional)</label>
            <input id="backup" value={backupCode} onChange={(e)=>setBackupCode(e.target.value)} placeholder="ABCD-EFGH" />
        </div>
        {error && <div className="error">{error}</div>}

        <div className="actions">
            <button className="btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <span className="link">Forgot password?</span>
        </div>
      </form>
    </div>
  );
}
