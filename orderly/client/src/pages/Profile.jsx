import { useAuth } from "../auth/AuthContext";
import api from "../api/api";
import { useEffect, useState } from "react";

export default function Profile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api
      .get("/profile")
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Profile fetch failed", err));
  }, []);

  return (
    <div className="page">
      <section className="page__section">
        <h2>Profile overview</h2>
        <p className="page__status">
          Review the authenticated user from context and the server response.
        </p>
      </section>

      <section className="page__section">
        <h4>Auth context user</h4>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </section>

      <section className="page__section">
        <h4>/profile response</h4>
        {profile ? (
          <pre>{JSON.stringify(profile, null, 2)}</pre>
        ) : (
          <p className="page__status">Loading…</p>
        )}
      </section>

      <button className="primary" onClick={logout} type="button">
        Sign out
      </button>
    </div>
  );
}
