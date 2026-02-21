export type StockPoint = {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  signal: "BUY" | "SELL" | "HOLD";
};

export async function getStock(symbol: string): Promise<StockPoint[]> {
  try {
    const res = await fetch(`http://127.0.0.1:8000/stocks/${symbol}`);

    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
}

