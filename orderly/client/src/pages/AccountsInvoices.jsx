import { useEffect, useState } from "react";
import api from "../api/api";

export default function AccountsInvoices() {
  const [list, setList] = useState([]);
  const [status, setStatus] = useState("loading");
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

  if (status === "loading") {
    return (
      <div className="page">
        <section className="page__section">
          <h2>Accounts • Invoices</h2>
          <p className="page__status">Loading invoices…</p>
        </section>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page">
        <section className="page__section">
          <h2>Accounts • Invoices</h2>
          <p className="page__status page__status--error">{error}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="page__section">
        <h2>Accounts • Invoices</h2>
        <p className="page__status">
          Explore invoices gated behind the accounts permission set.
        </p>
      </section>

      <section className="page__section">
        {list.length === 0 ? (
          <p className="page__status">No invoices yet.</p>
        ) : (
          <pre>{JSON.stringify(list, null, 2)}</pre>
        )}
      </section>
    </div>
  );
}
