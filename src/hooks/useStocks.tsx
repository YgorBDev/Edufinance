import { useQuery } from "@tanstack/react-query";

const POPULAR_STOCKS = [
  "PETR4", "VALE3", "ITUB4", "BBDC4", "ABEV3", "WEGE3", "RENT3", "BBAS3",
  "B3SA3", "SUZB3", "JBSS3", "ELET3", "RADL3", "RAIL3", "VIVT3",
  "MGLU3", "LREN3", "HAPV3", "TOTS3", "ENEV3",
];

export interface StockQuote {
  symbol: string;
  shortName: string;
  longName: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  logourl?: string;
  historicalDataPrice?: Array<{ date: string; close: number }>;
}

async function fetchBrapi(endpoint: string) {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const url = `https://${projectId}.supabase.co/functions/v1/brapi-proxy?endpoint=${encodeURIComponent(endpoint)}`;

  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch stock data");
  return response.json();
}

export function useStockList() {
  return useQuery({
    queryKey: ["stocks-list"],
    queryFn: async () => {
      const tickers = POPULAR_STOCKS.join(",");
      const data = await fetchBrapi(`quote/${tickers}`);
      return (data.results || []) as StockQuote[];
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useStockQuote(ticker: string) {
  return useQuery({
    queryKey: ["stock-quote", ticker],
    queryFn: async () => {
      const data = await fetchBrapi(`quote/${ticker}?interval=1d&range=1mo`);
      return (data.results?.[0] || null) as StockQuote | null;
    },
    enabled: !!ticker,
    staleTime: 60 * 1000,
  });
}
