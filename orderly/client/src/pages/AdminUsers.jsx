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

  if (status === 'loading') return <div style={{ padding: 24 }}>Loading users…</div>;
  if (status === 'error') return <div style={{ padding: 24, color:'crimson' }}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin • Users</h2>
      {list.length === 0 ? <p>No users yet.</p> : <pre>{JSON.stringify(list, null, 2)}</pre>}
    </div>
  );
}