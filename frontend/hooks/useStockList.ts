import { useEffect, useState } from "react";

export function useStockList() {
  const [stocks, setStocks] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/stocks/")
      .then(res => res.json())
      .then(setStocks)
      .catch(err => console.error("Stock list failed:", err));
  }, []);

  return stocks;
}
