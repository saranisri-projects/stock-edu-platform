"use client";

import { useState } from "react";
import CandleChart from "../charts/CandleChart";
import { useStock } from "../hooks/useStockData";
import { useStockList } from "../hooks/useStockList";

export default function Page() {
  const [symbol, setSymbol] = useState("AAPL");
  const [range, setRange] = useState("1M");

  // dropdown list of tickers
  const stockList = useStockList();

  // actual candle data
  const data = useStock(symbol);

  if (!data || data.length === 0) return <div>Loading...</div>;

  function filterRange(data: any[], range: string) {
    const days =
      range === "1D" ? 1 :
      range === "1W" ? 7 :
      range === "1M" ? 30 :
      range === "1Y" ? 365 :
      data.length;

    return data.slice(-days);
  }

  const filtered = filterRange(data, range);
  const latest = filtered.length > 0 ? filtered[filtered.length - 1] : null;

  console.log("LATEST:", latest);

  return (
    <div style={{ padding: 20 }}>

      {/* ✅ dropdown */}
      <select
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        style={{ padding: 8, fontSize: 16, borderRadius: 6 }}
      >
        {stockList.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <h1>{symbol} Dashboard</h1>

      <p>
        Latest Price: {latest ? `$${latest.Close}` : "Loading..."}
      </p>

      <div style={{ margin: "10px 0" }}>
        {["1D", "1W", "1M", "1Y"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={{
              marginRight: 8,
              padding: "6px 12px",
              background: range === r ? "#2563eb" : "#eee",
              color: range === r ? "white" : "black",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {r}
          </button>
        ))}
      </div>

      <CandleChart data={filtered} />

    </div>
  );
}
