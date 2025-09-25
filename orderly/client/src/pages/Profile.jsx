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

  return <div style={{padding: 24}}>
<h2>Profile</h2>
<section style={{ marginBottom: 20 }}>
    <h4>Auth Context User:</h4>
    <pre>{JSON.stringify(user, null, 2)}</pre>
</section>

<section style={{ marginBottom: 20 }}>
<h4>Backend /profile response:</h4>
{profile ? (<pre>{JSON.stringify(profile, null, 2)}</pre>) : (<p>Loading...</p>)}
</section>
<button onClick={logout}>Logout</button>
  </div>;
}
