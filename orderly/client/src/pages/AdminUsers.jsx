import { useEffect, useState } from 'react';
import api from '../api/api';

export default function AdminUsers() {
  const [list, setList] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let on = true;
    api.get('/admin/users')
      .then(r => { if (!on) return; setList(r.data || []); setStatus('ready'); })
      .catch(e => { if (!on) return; setError(e?.response?.data?.error || 'Failed to load users'); setStatus('error'); });
    return () => { on = false; };
  }, []);

  if (status === 'loading') {
    return (
      <div className="page">
        <section className="page__section">
          <h2>Admin • Users</h2>
          <p className="page__status">Loading users…</p>
        </section>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="page">
        <section className="page__section">
          <h2>Admin • Users</h2>
          <p className="page__status page__status--error">{error}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="page__section">
        <h2>Admin • Users</h2>
        <p className="page__status">Users pulled from the protected admin surface.</p>
      </section>

      <section className="page__section">
        {list.length === 0 ? <p className="page__status">No users yet.</p> : <pre>{JSON.stringify(list, null, 2)}</pre>}
      </section>
    </div>
  );
}
