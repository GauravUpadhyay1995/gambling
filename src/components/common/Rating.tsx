'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { MdOutlineCurrencyExchange } from "react-icons/md";


const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Rating() {
  const [sseData, setSseData] = useState<any[]>([]);
  const [useSSE, setUseSSE] = useState(true);

  // --- SSE Connection ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!!window.EventSource) {
      const es = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/ratings/stream?source=frontend`);

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
    !useSSE ? `${process.env.NEXT_PUBLIC_API_URL}/ratings/list?source=frontend` : null,
    fetcher,
    { refreshInterval: 5000 } // poll every 5s
  );

  const ratings = useSSE ? sseData : (data?.data ?? []);

  if (!useSSE && isLoading) return <p className="text-center text-white">Loading...</p>;
  if (!useSSE && error) return <p className="text-center text-red-500">Failed to load ratings</p>;

  return (
    <section className="py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-center text-2xl font-bold text-white mb-6">
          {process.env.NEXT_PUBLIC_COMPANY_NAME} Rating Chart
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
          {ratings.map((rating: any, index: number) => { 
            return (
              <motion.div
                key={rating._id || index}
                className="bg-[#0d1b2a] rounded-lg shadow-md p-5 text-center text-white"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <h3 className="text-orange-500 font-semibold mb-2">
                  {rating.ratingName.toUpperCase()}
                </h3>

                <div className="flex justify-center space-x-4 text-lg font-bold mb-3">
                  <span>{rating.convertValue.a}</span>
                  <MdOutlineCurrencyExchange size={20} />
                  <span>{rating.convertValue.b}</span>                 
                </div>


              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
