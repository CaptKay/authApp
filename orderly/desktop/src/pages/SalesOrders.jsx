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

  if (status === "loading")
    return <div style={{ padding: 24 }}>Loading orders…</div>;
  if (status === "error")
    return <div style={{ padding: 24, color: "crimson" }}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Sales • Orders</h2>
      {list.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <pre>{JSON.stringify(list, null, 2)}</pre>
      )}
    </div>
  );
}
