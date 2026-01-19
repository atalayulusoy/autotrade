import React, { useEffect, useMemo, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { apiUrl } from "../../../services/apiBase";

const TF_MAP = {
  "1M": "1m",
  "5M": "5m",
  "15M": "15m",
  "30M": "30m",
  "1H": "1h",
  "4H": "4h",
  "1D": "1d",
  "1W": "1w",
};

export default function CandlestickChart({
  symbol = "BTC/USDT",
  timeframe = "5M",
  height = 320,
}) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  const [err, setErr] = useState("");

  const tf = useMemo(() => TF_MAP[timeframe] || "5m", [timeframe]);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: "solid", color: "transparent" },
        textColor: "#cbd5e1",
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.08)" },
        horzLines: { color: "rgba(148, 163, 184, 0.08)" },
      },
      rightPriceScale: { borderColor: "rgba(148, 163, 184, 0.12)" },
      timeScale: { borderColor: "rgba(148, 163, 184, 0.12)" },
      crosshair: { mode: 0 },
    });

    // v5 API
    const series = chart.addSeries(CandlestickSeries, {});

    chartRef.current = chart;
    seriesRef.current = series;

    const onResize = () => {
      try {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      } catch (e) {}
    };

    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      window.removeEventListener("resize", onResize);
      try {
        chart.remove();
      } catch (e) {}
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setErr("");

      const sym = (symbol || "BTC/USDT").trim();
      const url = apiUrl(
        `/api/public/ohlc?symbol=${encodeURIComponent(sym)}&tf=${encodeURIComponent(tf)}&limit=300`
      );

      try {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`OHLC fetch failed: ${res.status} ${txt}`);
        }

        const json = await res.json();
        const rows = Array.isArray(json) ? json : (json?.data || json?.candles || []);

        const candles = (rows || [])
          .map((c) => {
            if (Array.isArray(c)) {
              const [ts, open, high, low, close] = c;
              let t = ts;
              if (typeof t === "number" && t > 9999999999) t = Math.floor(t / 1000);
              return {
                time: t,
                open: Number(open),
                high: Number(high),
                low: Number(low),
                close: Number(close),
              };
            }

            let t = c.time ?? c.t ?? c.timestamp ?? c.ts;
            if (typeof t === "string") {
              const ms = Date.parse(t);
              if (!Number.isNaN(ms)) t = Math.floor(ms / 1000);
            }
            if (typeof t === "number" && t > 9999999999) t = Math.floor(t / 1000);

            return {
              time: t,
              open: Number(c.open),
              high: Number(c.high),
              low: Number(c.low),
              close: Number(c.close),
            };
          })
          .filter((c) => Number.isFinite(c.time) && c.time > 0)
          .sort((a, b) => a.time - b.time);

        if (!alive) return;

        if (!seriesRef.current) return;
        seriesRef.current.setData(candles);

        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Grafik verisi alinmadi");
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [symbol, tf]);

  return (
    <div className="w-full">
      <div ref={containerRef} className="w-full" style={{ height }} />
      {err ? <div className="mt-2 text-sm text-red-400">{err}</div> : null}
    </div>
  );
}
