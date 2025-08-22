"use client";

import { useEffect, useState } from "react";

export default function MarketList() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch market list
  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/markets/list?source=backend");
      const result = await res.json();
      if (result.success) {
        setMarkets(result.data);
      } else {
        setError(result.message || "Failed to load markets");
      }
    } catch (err) {
      setError("Failed to load markets");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchMarkets();
  }, []);

  // Add this useEffect to handle body class changes
  useEffect(() => {
    const header = document.querySelector('header');
    const aside = document.querySelector('aside');

    if (showAddModal) {
      if (header) header.classList.add('blur-sm');
      if (aside) aside.classList.add('blur-sm');
    } else {
      if (header) header.classList.remove('blur-sm');
      if (aside) aside.classList.remove('blur-sm');
    }

    // Cleanup on component unmount
    return () => {
      if (header) header.classList.remove('blur-sm');
      if (aside) aside.classList.remove('blur-sm');
    };
  }, [showAddModal]);

  // Update API
  const updateMarket = async (id: string, updated: any) => {
    try {
      await fetch(`/api/v1/admin/markets/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      fetchMarkets(); // refresh list after update
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  // Status update function (toggle isActive)
  const updateMarketStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/v1/admin/markets/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchMarkets(); // refresh list after update
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  // Add new market
  const addMarket = async (newMarket: any) => {
    try {
      const response = await fetch("/api/v1/admin/markets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMarket),
      });

      if (response.ok) {
        setShowAddModal(false);
        fetchMarkets(); // Refresh the list
      } else {
        console.error("Failed to add market");
      }
    } catch (err) {
      console.error("Add market failed", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen p-6">
      <div className={showAddModal ? "blur-sm" : ""}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Market Dashboard</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Add Market
          </button>
        </div>

        {/* ✅ Active Markets */}
        <h2 className="text-xl text-center font-semibold mb-4 text-green-500">ACTIVE MARKETS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {markets.filter((m) => m.isActive).map((market) => (
            <MarketCard
              key={market._id}
              market={market}
              onUpdate={updateMarket}
              onStatusUpdate={updateMarketStatus}
            />
          ))}
        </div>

        {/* ✅ Inactive Markets */}
        <h2 className="text-xl text-center font-semibold mb-4 text-red-500">INACTIVE MARKETS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {markets.filter((m) => !m.isActive).map((market) => (
            <MarketCard
              key={market._id}
              market={market}
              onUpdate={updateMarket}
              onStatusUpdate={updateMarketStatus}
            />
          ))}
        </div>
      </div>

      {/* Add Market Modal */}
      {showAddModal && (
        <AddMarketModal onClose={() => setShowAddModal(false)} onSave={addMarket} />
      )}
    </div>
  );

}

function MarketCard({ market, onUpdate, onStatusUpdate }: any) {
  const [form, setForm] = useState({
    marketName: market.marketName,
    a: market.marketValue?.a || "",
    b: market.marketValue?.b || "",
    c: market.marketValue?.c || "",
    startDate: market.startDate,
    endDate: market.endDate,
    isActive: market.isActive,
  });

  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  // Auto update when blur
// Auto update when blur
const handleBlur = (field: string, value: any) => {
  if (value === "") return;

  let updated: any = {};

  if (["a", "b", "c"].includes(field)) {
    // Only update if the value is different
    if (value === market.marketValue?.[field]) return; 

    updated = { marketValue: { ...market.marketValue, [field]: value } };
  } else {
    // Only update if the value is different
    if (value === market[field]) return; 

    updated = { [field]: value };
  }

  onUpdate(market._id, updated);
};


  // Handle status update confirmation
  const handleStatusUpdate = () => {
    setShowStatusConfirm(true);
  };

  const confirmStatusUpdate = () => {
    onStatusUpdate(market._id, form.isActive);
    setShowStatusConfirm(false);
  };

  const cancelStatusUpdate = () => {
    setShowStatusConfirm(false);
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

  useEffect(() => {
    const header = document.querySelector('header');
    const aside = document.querySelector('aside');
    const mainDiv = document.getElementById('mainDiv');

    if (showStatusConfirm) {
      if (header) header.classList.add('blur-sm');
      if (aside) aside.classList.add('blur-sm');
      if (mainDiv) mainDiv.classList.add('blur-sm');
    } else {
      if (header) header.classList.remove('blur-sm');
      if (aside) aside.classList.remove('blur-sm');
      if (mainDiv) mainDiv.classList.remove('blur-sm');
    }

    // Cleanup on component unmount
    return () => {
      if (header) header.classList.remove('blur-sm');
      if (aside) aside.classList.remove('blur-sm');
      if (mainDiv) mainDiv.classList.remove('blur-sm');
    };
  }, [showStatusConfirm]);

  return (
    <>
      <div className=" bg-[#0b1c2c] text-white p-4 rounded-xl shadow-lg flex flex-col space-y-3 relative group">
        {/* Status Update Button */}
        <button
          type="button"
          onClick={handleStatusUpdate}
          className={`absolute top-2 right-2 ${form.isActive ? 'bg-green-600' : 'bg-orange-600'} rounded-full p-1.5 shadow-md opacity-100 transition-opacity duration-200`}
          title={form.isActive ? 'Click To Deactivate Market' : 'Click To Activate Market'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="text-white"
          >
            {form.isActive ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />

            )}
          </svg>
        </button>

        {/* Market Name */}

        <input
          className="bg-transparent border-b border-gray-400 focus:outline-none text-lg font-bold pr-6"
          value={form.marketName}
          onChange={(e) => setForm({ ...form, marketName: e.target.value })}
          onBlur={(e) => handleBlur("marketName", e.target.value)}
          disabled={!form.isActive}
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
              disabled={!form.isActive}
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
            disabled={!form.isActive}
          />

          <input
            type="time"
            className="bg-orange-600 px-3 py-1 rounded-lg text-sm text-black"
            value={toTimeInput(form.endDate)}
            onChange={(e) => handleTimeChange("endDate", e.target.value)}
            onBlur={() => handleBlur("endDate", form.endDate)}
            disabled={!form.isActive}
          />
        </div>
      </div>

      {/* Status Update Confirmation Modal */}
      {showStatusConfirm && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-[#0b1c2c] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Are You Sure?</h2>
              <button onClick={cancelStatusUpdate} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-gray-300 mb-6">
              {form.isActive
                ? "Are you sure you want to deactivate this market?"
                : "Are you sure you want to activate this market?"
              }
            </p>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelStatusUpdate}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmStatusUpdate}
                className={form.isActive ? "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"  : "bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"}
              >
                {form.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AddMarketModal({ onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    marketName: "",
    a: "***",
    b: "**",
    c: "***",
    startTime: "10:00",
    endTime: "14:00"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a proper date object for start and end times
    const now = new Date();
    const [startHours, startMinutes] = formData.startTime.split(':');
    const [endHours, endMinutes] = formData.endTime.split(':');

    const startDate = new Date(now);
    startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

    const endDate = new Date(now);
    endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

    onSave({
      marketName: formData.marketName,
      marketValue: {
        a: formData.a,
        b: formData.b,
        c: formData.c
      },
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-[#0b1c2c] rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Add New Market</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Market Name Input */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Market Name</label>
            <input
              type="text"
              name="marketName"
              value={formData.marketName}
              onChange={handleChange}
              className="w-full bg-[#1e293b] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter market name"
              required
            />
          </div>

          {/* Values Inputs */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Market Values</label>
            <div className="flex justify-between">
              {['a', 'b', 'c'].map((field) => (
                <div key={field} className="flex flex-col items-center">
                  <span className="text-gray-400 text-sm mb-1">{field.toUpperCase()}</span>
                  <input
                    type="text"
                    name={field}
                    value={formData[field as 'a' | 'b' | 'c']}
                    onChange={handleChange}
                    className="w-16 h-10 bg-[#1e293b] border border-gray-600 rounded-lg text-center text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Time Inputs */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Market Hours</label>
            <div className="flex justify-between">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm mb-1">Start Time</span>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="bg-orange-500 px-3 py-2 rounded-lg text-black"
                  required
                />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm mb-1">End Time</span>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="bg-orange-500 px-3 py-2 rounded-lg text-black"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
            >
              Add Market
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}