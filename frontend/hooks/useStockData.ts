import { useEffect, useState } from "react";

export function useStock(symbol: string) {
  const [data, setData] = useState<any[] | null>(null);

  useEffect(() => {
    if (!symbol) return;

    fetch(`http://127.0.0.1:8000/stocks/${symbol}`)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Stock fetch failed:", err));
  }, [symbol]);

  return data;
}
