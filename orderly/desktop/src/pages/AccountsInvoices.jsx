import { useEffect, useState } from "react";
import api from "../api/api";

export default function AccountsInvoices() {
  const [list, setList] = useState([]);
  const [status, setStatus] = useState("loading"); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    api
      .get("/accounts/invoices")
      .then((res) => {
        if (!mounted) return;
        setList(res.data || []);
        setStatus("ready");
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.response?.data?.error || "Failed to load invoices");
        setStatus("error");
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (status === "loading")
    return <div style={{ padding: 24 }}>Loading invoices</div>;
  if (status === "error")
    return <div style={{ padding: 24, color: "crimson" }}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Accounts • Invoices</h2>
      {list.length === 0 ? (
        <p>No invoices yet</p>
      ) : (
        <pre>{JSON.stringify(list, null, 2)}</pre>
      )}
    </div>
  );
}
