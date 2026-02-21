"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CrosshairMode,
  BusinessDay,
  SeriesMarkerPosition,
} from "lightweight-charts";

interface CandleData {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
}

interface CandleChartProps {
  data: CandleData[];
}

function toTS(t: BusinessDay) {
  return new Date(t.year, t.month - 1, t.day).getTime();
}

function addDays(bd: BusinessDay, days: number): BusinessDay {
  const d = new Date(bd.year, bd.month - 1, bd.day);
  d.setDate(d.getDate() + days);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

export default function CandleChart({ data }: CandleChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // added
  const [prediction, setPrediction] = useState<{
    percent: string;
    direction: "BUY" | "SELL";
  } | null>(null);
    
  useEffect(() => {
    if (!chartRef.current || !data?.length) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth || 800,
      height: 500,
      layout: {
        background: { color: "#0f1116" },
        textColor: "#e6e8ec",
      },
      grid: {
        vertLines: { color: "#1c1f26" },
        horzLines: { color: "#1c1f26" },
      },
    });

    const candleSeries = chart.addCandlestickSeries();

    // -------------------------
    // CLEAN + DEDUPE DATA
    // -------------------------
    const map = new Map<number, any>();

    for (const d of data) {
      const date = new Date(d.Date);
      if (isNaN(date.getTime())) continue;

      const time: BusinessDay = {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
      };

      const ts = toTS(time);

      map.set(ts, {
        time,
        open: d.Open,
        high: d.High,
        low: d.Low,
        close: d.Close,
      });
    }

    const candles = Array.from(map.values()).sort(
      (a, b) => toTS(a.time) - toTS(b.time)
    );

    if (!candles.length) return;

    candleSeries.setData(candles);

    const markers: any[] = [];
    const breakoutLookback = 20;

    // -------------------------
    // SMART TREND PREDICTION (Works for Day/Week/Month/Year)
    // -------------------------

    const dynamicLookback = Math.min(10, candles.length - 1);

    if (candles.length > 5) {
      const recent = candles.slice(-dynamicLookback);

      const first = recent[0].close;
      const last = recent[recent.length - 1].close;

      const percentChange = ((last - first) / first) * 100;

      const avgMove = percentChange / dynamicLookback;

      const projectedPercent = avgMove * 3;

      const projectedPrice = last * (1 + projectedPercent / 100);

      const lastTime = candles[candles.length - 1].time;
      const futureTime = addDays(lastTime, 3);

      const predictionSeries = chart.addLineSeries({
        color: projectedPercent >= 0 ? "lime" : "orange",
        lineWidth: 2,
        lineStyle: 2,
      });

      predictionSeries.setData([
        { time: lastTime, value: last },
        { time: futureTime, value: projectedPrice },
      ]);

      setPrediction({
        percent: projectedPercent.toFixed(2),
        direction: projectedPercent >= 0 ? "BUY" : "SELL",
      });
    } else {
      setPrediction(null);
    }

    // -------------------------
    // IDEAL BUY AND SELL LINES
    // -------------------------

    // stop the spamming lines
    let buyLine: any = null;
    let sellLine: any = null;

    // function for lines
    function addIdealLine(price: number, type: "buy" | "sell") {
      const isBuy = type === "buy";

      if (isBuy && buyLine) {
        candleSeries.removePriceLine(buyLine);
      }

      if (!isBuy && sellLine) {
        candleSeries.removePriceLine(sellLine);
      }

      const line = candleSeries.createPriceLine({
        price,
        color: isBuy ? "green" : "red",
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: isBuy ? "Ideal Buy" : "Ideal Sell",
      });

      if (isBuy) buyLine = line;
      else sellLine = line;
    }

    // -------------------------
    // HIGHLIGHT HELPER
    // -------------------------
    function addHighlightZone(
      index: number,
      direction: "bull" | "bear"
    ) {
      // Do NOT allow highlight on last candle
      if (index >= candles.length - 1) return;

      const base = candles[index];

      // Always move forward at least 1
      const forwardIndex = Math.min(index + 3, candles.length - 1);

      if (forwardIndex <= index) return;

      const startTime = base.time;
      const endTime = candles[forwardIndex].time;

      if (toTS(startTime) === toTS(endTime)) return;

      const color =
        direction === "bull"
          ? "rgba(0,200,0,0.25)"
          : "rgba(200,0,0,0.25)";

      const zoneSeries = chart.addAreaSeries({
        lineColor: "transparent",
        topColor: color,
        bottomColor: color,
      });

      zoneSeries.setData([
        { time: startTime, value: base.high },
        { time: endTime, value: base.high },
      ]);
    }

    // -------------------------
    // PATTERN DETECTION
    // -------------------------
    for (let i = 1; i < candles.length; i++) {
      const prev = candles[i - 1];
      const curr = candles[i];

      const isPrevRed = prev.close < prev.open;
      const isPrevGreen = prev.close > prev.open;
      const isCurrGreen = curr.close > curr.open;
      const isCurrRed = curr.close < curr.open;

      // -----------------
      // Bullish Engulfing
      // -----------------
      if (
        isPrevRed &&
        isCurrGreen &&
        curr.open < prev.close &&
        curr.close > prev.open
      ) {
        markers.push({
          time: curr.time,
          position: "belowBar" as SeriesMarkerPosition,
          color: "green",
          shape: "arrowUp",
          text: "BE",
        });

        addHighlightZone(i, "bull");
        addIdealLine(curr.close, "buy");
      }

      // -----------------
      // Bearish Engulfing
      // -----------------
      if (
        isPrevGreen &&
        isCurrRed &&
        curr.open > prev.close &&
        curr.close < prev.open
      ) {
        markers.push({
          time: curr.time,
          position: "aboveBar" as SeriesMarkerPosition,
          color: "red",
          shape: "arrowDown",
          text: "SE",
        });

        addHighlightZone(i, "bear");
        addIdealLine(curr.close, "sell");

      }

      // -----------------
      // Hammer
      // -----------------
      const bodySize = Math.abs(curr.close - curr.open);
      const lowerWick =
        Math.min(curr.open, curr.close) - curr.low;
      const upperWick =
        curr.high - Math.max(curr.open, curr.close);

      if (lowerWick > bodySize * 2 && upperWick < bodySize) {
        markers.push({
          time: curr.time,
          position: "belowBar" as SeriesMarkerPosition,
          color: "blue",
          shape: "circle",
          text: "HAM",
        });

        addHighlightZone(i, "bull");
        addIdealLine(curr.close, "buy");

      }

      // -----------------
      // Breakout Detection
      // -----------------
      if (i > breakoutLookback) {
        const recentSlice = candles.slice(i - breakoutLookback, i);

        const recentHigh = Math.max(...recentSlice.map(c => c.high));
        const recentLow = Math.min(...recentSlice.map(c => c.low));

        if (curr.close > recentHigh) {
          markers.push({
            time: curr.time,
            position: "aboveBar" as SeriesMarkerPosition,
            color: "green",
            shape: "arrowUp",
            text: "RB",
          });

          addHighlightZone(i, "bull");
          addIdealLine(curr.close, "buy");

        }

        if (curr.close < recentLow) {
          markers.push({
            time: curr.time,
            position: "belowBar" as SeriesMarkerPosition,
            color: "red",
            shape: "arrowDown",
            text: "SB",
          });

          addHighlightZone(i, "bear");
          addIdealLine(curr.close, "buy");
        }
      }
    }

    candleSeries.setMarkers(markers);

    chart.timeScale().fitContent();

    const resize = () =>
      chart.applyOptions({ width: chartRef.current!.clientWidth });

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      chart.remove();
    };
  }, [data]);

  // adding legend to clean up UI
  const patternInfo = [
    {
      code: "BE",
      label: "Bullish Engulfing",
      color: "green",
      description:
        "A bullish reversal pattern where a green candle fully engulfs the previous red candle.",
      image: "/patterns/bullish-engulfing.webp",
    },
    {
      code: "SE",
      label: "Bearish Engulfing",
      color: "red",
      description:
        "A bearish reversal pattern where a red candle fully engulfs the previous green candle.",
      image: "/patterns/bearish-engulfing.webp",
    },
    {
      code: "HAM",
      label: "Hammer",
      color: "blue",
      description:
        "A candle with a long lower wick indicating potential bullish reversal.",
      image: "/patterns/hammer-1.webp",
    },
    {
      code: "RB",
      label: "Resistance Breakout",
      color: "green",
      description:
        "Price breaks above recent resistance level signaling upward momentum.",
      image: "/patterns/breakout-strategy.jpeg",
    },
    {
      code: "SB",
      label: "Support Breakdown",
      color: "red",
      description:
        "Price falls below recent support level signaling downward momentum.",
      image: "/patterns/support-breakdown.webp",
    },
  ];

  // legend formatting
  return (
    <div style={{ width: "100%" }}>
      {/* PANEL WRAPPER */}
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "16px",
          overflow: "hidden",   // IMPORTANT
        }}
      >
        {/* PREDICTION DISPLAY */}
        {prediction && (
          <div
            style={{
              marginBottom: "12px",
              fontWeight: 600,
              fontSize: "14px",
              color: prediction.direction === "BUY" ? "lime" : "orange",
            }}
          >
            Predicted Move: {prediction.percent}% — Recommended: {prediction.direction}
          </div>
        )}


        {/* LEGEND */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "16px",
            marginBottom: "12px",
            flexWrap: "wrap",
          }}
        >
          {patternInfo.map((item) => (
            <div
              key={item.code}
              className="legend-item"
              style={{ color: item.color }}
            >
              {item.code}

              <div className="tooltip">
                <strong>{item.label}</strong>
                <p>{item.description}</p>
                <img
                  src={item.image}
                  alt={item.label}
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* CHART CONTAINER */}
        <div
          ref={chartRef}
          style={{
            width: "100%",
            height: 500,
          }}
        />
      </div>
    </div>
  );

}
