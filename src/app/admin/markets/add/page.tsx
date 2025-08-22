"use client";

import { useEffect, useState } from "react";

export default function MarketList() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");




  // Update API
  const updateMarket = async (id: string, updated: any) => {
    try {
      await fetch(`/api/v1/admin/markets/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
     
        <MarketCard  onUpdate={updateMarket} />
    
    </div>
  );
}

function MarketCard({ market, onUpdate }: any) {
  const [form, setForm] = useState({
    marketName: market.marketName,
    a: market.marketValue?.a || "",
    b: market.marketValue?.b || "",
    c: market.marketValue?.c || "",
    startDate: market.startDate,
    endDate: market.endDate,
  });

  // Auto update when blur
  const handleBlur = (field: string, value: any) => {
    if (value === "") return;

    let updated: any = {};
    if (["a", "b", "c"].includes(field)) {
      updated = { marketValue: { ...market.marketValue, [field]: value } };
    } else {
      updated = { [field]: value };
    }

    onUpdate(market._id, updated);
  };

  // Format time input for IST
  const toTimeInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
  };

  const handleTimeChange = (field: "startDate" | "endDate", value: string) => {
    const date = new Date(form[field]);
    const [h, m] = value.split(":");
    date.setHours(Number(h), Number(m), 0, 0);
    setForm({ ...form, [field]: date.toISOString() });
  };

  return (
    <div className="bg-[#0b1c2c] text-white p-4 rounded-xl shadow-lg flex flex-col space-y-3">
      {/* Market Name */}
      <input
        className="bg-transparent border-b border-gray-400 focus:outline-none text-lg font-bold"
        value={form.marketName}
        onChange={(e) => setForm({ ...form, marketName: e.target.value })}
        onBlur={(e) => handleBlur("marketName", e.target.value)}
      />

      {/* Values */}
      <div className="flex justify-between text-xl font-bold">
        {["a", "b", "c"].map((field) => (
          <input
            key={field}
            className="w-16 text-center bg-transparent border-b border-gray-500 focus:outline-none"
            value={form[field as "a" | "b" | "c"]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            onBlur={(e) => handleBlur(field, form[field as "a" | "b" | "c"])}
          />
        ))}
      </div>

      {/* Start & End Time */}
      <div className="flex justify-between mt-4">
        <input
          type="time"
          className="bg-orange-600 px-3 py-1 rounded-lg text-sm text-black"
          value={toTimeInput(form.startDate)}
          onChange={(e) => handleTimeChange("startDate", e.target.value)}
          onBlur={() => handleBlur("startDate", form.startDate)}
        />

        <input
          type="time"
          className="bg-orange-600 px-3 py-1 rounded-lg text-sm text-black"
          value={toTimeInput(form.endDate)}
          onChange={(e) => handleTimeChange("endDate", e.target.value)}
          onBlur={() => handleBlur("endDate", form.endDate)}
        />
      </div>
    </div>
  );
}
