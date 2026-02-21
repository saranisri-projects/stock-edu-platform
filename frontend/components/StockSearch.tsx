"use client";

import Select from "react-select";

const stocks = [
  { value: "AAPL", label: "Apple (AAPL)" },
  { value: "MSFT", label: "Microsoft (MSFT)" },
  { value: "TSLA", label: "Tesla (TSLA)" },
  { value: "NVDA", label: "Nvidia (NVDA)" },
  { value: "AMZN", label: "Amazon (AMZN)" },
];

export default function StockSearch({
  onSelect,
}: {
  onSelect: (symbol: string) => void;
}) {
  return (
    <Select
      options={stocks}
      placeholder="Search stock..."
      onChange={(option) => option && onSelect(option.value)}
    />
  );
}
