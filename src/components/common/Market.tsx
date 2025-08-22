'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Market() {
  const [sseData, setSseData] = useState<any[]>([]);
  const [useSSE, setUseSSE] = useState(true);

  // --- SSE Connection ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!!window.EventSource) {
      const es = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/markets/stream?source=frontend`);

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setSseData(parsed.data || []);
        } catch (err) {
          console.error("SSE parse error:", err);
        }
      };

      es.onerror = () => {
        console.warn("SSE failed → falling back to REST");
        setUseSSE(false);
        es.close();
      };

      return () => es.close();
    } else {
      console.warn("SSE not supported → using REST fallback");
      setUseSSE(false);
    }
  }, []);

  // --- REST Fallback via SWR ---
  const { data, error, isLoading } = useSWR(
    !useSSE ? `${process.env.NEXT_PUBLIC_API_URL}/markets/list?source=frontend` : null,
    fetcher,
    { refreshInterval: 5000 } // poll every 5s
  );

  const markets = useSSE ? sseData : (data?.data ?? []);

  if (!useSSE && isLoading) return <p className="text-center text-white">Loading...</p>;
  if (!useSSE && error) return <p className="text-center text-red-500">Failed to load markets</p>;

  return (
    <section className="py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-center text-2xl font-bold text-white mb-6">
          {process.env.NEXT_PUBLIC_COMPANY_NAME} MAIN MARKET RESULTS
        </h2>
        <p className="text-center text-white mb-8">
          {process.env.NEXT_PUBLIC_COMPANY_NAME} LIVE RESULTS -{" "}
          {new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {markets.map((market: any, index: number) => {
            const start = new Date(market.startDate)
              .toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              .toUpperCase();

            const end = new Date(market.endDate)
              .toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              .toUpperCase();

            return (
              <motion.div
                key={market._id || index}
                className="bg-[#0d1b2a] rounded-lg shadow-md p-5 text-center text-white"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <h3 className="text-orange-500 font-semibold mb-2">
                  {market.marketName.toUpperCase()}
                </h3>

                <div className="flex justify-center space-x-4 text-lg font-bold mb-3">
                  <span>{market.marketValue.a}</span>
                  <span>{market.marketValue.b}</span>
                  <span>{market.marketValue.c}</span>
                </div>

                <div className="flex justify-center space-x-2">
                  <span className="bg-orange-500 text-xs px-3 py-1 rounded">
                    {start}
                  </span>
                  <span className="bg-orange-500 text-xs px-3 py-1 rounded">
                    {end}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
