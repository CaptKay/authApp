import { useEffect, useState } from "react";
import api from "../api/api";

export default function SalesOrders() {
  const [list, setList] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let on = true;
    api
      .get("/sales/orders")
      .then((res) => {
        if (!on) return;
        setList(res.data || []);
        setStatus("ready");
      })
      .catch((err) => {
        if (!on) return;
        setError(err?.response?.data?.error || "Failed to load orders");
        setStatus("error");
      });

    return () => {
      on = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="page">
        <section className="page__section">
          <h2>Sales • Orders</h2>
          <p className="page__status">Loading orders…</p>
        </section>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page">
        <section className="page__section">
          <h2>Sales • Orders</h2>
          <p className="page__status page__status--error">{error}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="page__section">
        <h2>Sales • Orders</h2>
        <p className="page__status">Orders synced from the protected sales endpoint.</p>
      </section>

      <section className="page__section">
        {list.length === 0 ? (
          <p className="page__status">No orders yet.</p>
        ) : (
          <pre>{JSON.stringify(list, null, 2)}</pre>
        )}
      </section>
    </div>
  );
}
