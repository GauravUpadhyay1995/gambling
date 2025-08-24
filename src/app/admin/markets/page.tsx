"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { FaCodeBranch, FaTimes, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Simple cache mechanism
const apiCache = new Map();

export default function MarketList() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const hasFetchedMarkets = useRef(false);
  const hasFetchedRatings = useRef(false);

  // Fetch market list with caching
  const fetchMarkets = useCallback(async () => {
    if (hasFetchedMarkets.current) return;

    const cacheKey = 'markets-list';
    const cached = apiCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 30000) {
      setMarkets(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/markets/list?source=backend");
      const result = await res.json();
      if (result.success) {
        setMarkets(result.data);
        apiCache.set(cacheKey, {
          data: result.data,
          timestamp: Date.now()
        });
        hasFetchedMarkets.current = true;
      } else {
        setError(result.message || "Failed to load markets");
      }
    } catch (err) {
      setError("Failed to load markets");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch ratings with caching
  const fetchRatings = useCallback(async () => {
    if (hasFetchedRatings.current) return;

    const cacheKey = 'ratings-list';
    const cached = apiCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 30000) {
      setRatings(cached.data);
      return;
    }

    try {
      const res = await fetch("/api/v1/admin/ratings/list?source=backend");
      const result = await res.json();
      if (result.success) {
        setRatings(result.data);
        apiCache.set(cacheKey, {
          data: result.data,
          timestamp: Date.now()
        });
        hasFetchedRatings.current = true;
      }
    } catch (err) {
      console.log("Failed to load ratings");
    }
  }, []);

  // Fetch data on mount only once
  useEffect(() => {
    fetchMarkets();
    fetchRatings();
  }, [fetchMarkets, fetchRatings]);

  // Handle blur effect for modals
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

    return () => {
      if (header) header.classList.remove('blur-sm');
      if (aside) aside.classList.remove('blur-sm');
    };
  }, [showAddModal]);

  // Update API
  const updateMarket = useCallback(async (id: string, updated: any) => {
    try {
      await fetch(`/api/v1/admin/markets/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      // Invalidate cache
      apiCache.delete('markets-list');
      hasFetchedMarkets.current = false;
      fetchMarkets();
    } catch (err) {
      console.error("Update failed", err);
    }
  }, [fetchMarkets]);

  // Status update function
  const updateMarketStatus = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/v1/admin/markets/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      // Invalidate cache
      apiCache.delete('markets-list');
      hasFetchedMarkets.current = false;
      fetchMarkets();
    } catch (err) {
      console.error("Status update failed", err);
    }
  }, [fetchMarkets]);

  // Add new market
  const addMarket = useCallback(async (newMarket: any) => {
    try {
      const response = await fetch("/api/v1/admin/markets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMarket),
      });

      if (response.ok) {
        setShowAddModal(false);
        // Invalidate cache
        apiCache.delete('markets-list');
        hasFetchedMarkets.current = false;
        fetchMarkets();
      } else {
        console.error("Failed to add market");
      }
    } catch (err) {
      console.error("Add market failed", err);
    }
  }, [fetchMarkets]);

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

        {/* Active Markets */}
        <h2 className="text-xl text-center font-semibold mb-4 text-green-500">ACTIVE MARKETS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {markets.filter((m) => m.isActive).map((market) => (
            <MarketCard
              key={market._id}
              market={market}
              ratings={ratings}
              onUpdate={updateMarket}
              onStatusUpdate={updateMarketStatus}
            />
          ))}
        </div>

        {/* Inactive Markets */}
        <h2 className="text-xl text-center font-semibold mb-4 text-red-500">INACTIVE MARKETS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {markets.filter((m) => !m.isActive).map((market) => (
            <MarketCard
              key={market._id}
              market={market}
              ratings={ratings}
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

// MarketCard component - no API calls here
function MarketCard({ market, ratings, onUpdate, onStatusUpdate }: any) {
  const [form, setForm] = useState({
    marketName: market.marketName,
    a: market.marketValue?.a || "",
    b: market.marketValue?.b || "",
    c: market.marketValue?.c || "",
    startDate: market.startDate,
    endDate: market.endDate,
    isActive: market.isActive,
    isExpired: market.isExpired,
  });

  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  // Set selected ratings only once when market changes
  useEffect(() => {
    if (market.ratings) {
      setSelected(market.ratings.map((r: any) => r._id || r));
    }
  }, [market.ratings]);

  // Handle blur with optimization
  const handleBlur = useCallback((field: string, value: any) => {
    if (value === "") return;

    let updated: any = {};

    if (["a", "b", "c"].includes(field)) {
      if (value === market.marketValue?.[field]) return;
      updated = { marketValue: { ...market.marketValue, [field]: value } };
    } else {
      if (value === market[field]) return;
      updated = { [field]: value };
    }

    onUpdate(market._id, updated);
  }, [market, onUpdate]);

  // Handle status update confirmation
  const handleStatusUpdate = useCallback(() => {
    setShowStatusConfirm(true);
  }, []);

  const confirmStatusUpdate = useCallback(() => {
    onStatusUpdate(market._id, form.isActive);
    setShowStatusConfirm(false);
  }, [market._id, form.isActive, onStatusUpdate]);

  const cancelStatusUpdate = useCallback(() => {
    setShowStatusConfirm(false);
  }, []);

  // Format time input for IST
  const toTimeInput = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
  }, []);

  const handleTimeChange = useCallback((field: "startDate" | "endDate", value: string) => {
    const date = new Date(form[field]);
    const [h, m] = value.split(":");
    date.setHours(Number(h), Number(m), 0, 0);
    setForm(prev => ({ ...prev, [field]: date.toISOString() }));
  }, [form.startDate, form.endDate]);

  // Handle modal blur effects
  useEffect(() => {
    const header = document.querySelector('header');
    const aside = document.querySelector('aside');
    const mainDiv = document.getElementById('mainDiv');

    if (showStatusConfirm || showModal) {
      if (header) header.classList.add('blur-sm');
      if (aside) aside.classList.add('blur-sm');
      if (mainDiv) mainDiv.classList.add('blur-sm');
    } else {
      if (header) header.classList.remove('blur-sm');
      if (aside) aside.classList.remove('blur-sm');
      if (mainDiv) mainDiv.classList.remove('blur-sm');
    }

    return () => {
      if (header) header.classList.remove('blur-sm');
      if (aside) aside.classList.remove('blur-sm');
      if (mainDiv) mainDiv.classList.remove('blur-sm');
    };
  }, [showStatusConfirm, showModal]);

  const toggleSelect = useCallback((value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }, []);

  const handleSaveRatings = useCallback(() => {
    const updated = {
      ...market,
      ratings: selected,
    };
    onUpdate(market._id, updated);
    setShowModal(false);
  }, [market, selected, onUpdate]);
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: ["easeOut"] }
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  const ribbonVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, delay: 0.2 }
    }
  };
  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="bg-gradient-to-br from-[#0f2e45] to-[#0a1723] text-white p-5 rounded-2xl shadow-xl flex flex-col space-y-4 relative group border border-gray-700 overflow-hidden"
      >
        {/* Rating Mapping Button */}
        {/* Expired Ribbon */}
        {form.isExpired === "true" ? (
          <div className="absolute top-0 left-0 overflow-hidden w-32 h-32">
            <div className="absolute transform -rotate-45 bg-red-600 text-white text-xs font-bold px-2 py-2 top-2 -left-2 shadow-md rounded-xl">
              Closed
            </div>
          </div>
        ) : (
          <div className="absolute top-0 left-0 overflow-hidden w-32 h-32">
            <div className="absolute transform -rotate-45 bg-green-600 text-white text-xs font-bold px-2 py-2 top-2 -left-2 shadow-md rounded-xl">
              Open
            </div>
          </div>
        )}




        {/* Market Name */}
        <div className="text-center mb-3 pt-2">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            className="bg-transparent text-center border-b-2 border-gray-600 focus:border-blue-500 focus:outline-none text-sm font-bold w-full pb-2 transition-colors"
            value={form.marketName}
            onChange={(e) => setForm(prev => ({ ...prev, marketName: e.target.value }))}
            onBlur={(e) => handleBlur("marketName", e.target.value)}
            disabled={!form.isActive}
          />
        </div>

        {/* Values */}
        <div className="flex justify-center space-x-6 text-sm font-bold mb-4">
          {["a", "b", "c"].map((field) => (
            <motion.div
              key={field}
              className="flex flex-col items-center"
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
            >

              <motion.input
                whileFocus={{ scale: 1.05 }}
                className="w-14 text-center bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 py-2 backdrop-blur-sm"
                value={form[field as "a" | "b" | "c"]}
                onChange={(e) => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                onBlur={() => handleBlur(field, form[field as "a" | "b" | "c"])}
                disabled={!form.isActive}
              />
            </motion.div>
          ))}
        </div>

        {/* Start & End Time */}
        <motion.div
          className="flex justify-between items-center bg-[#132b3f] p-3 rounded-xl border border-gray-600/50"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-center flex-1">
            <div className="text-xs text-gray-400 mb-1">Start</div>
            <div className="text-sm text-white font-medium bg-gray-800/50 py-1 px-2 rounded-lg border border-gray-700">
              <motion.input
                whileFocus={{ scale: 1.05 }}
                type="time"
                className="bg-transparent text-center text-xs text-blue-400 focus:outline-none w-full mt-1"
                value={toTimeInput(form.startDate)}
                onChange={(e) => handleTimeChange("startDate", e.target.value)}
                onBlur={() => handleBlur("startDate", form.startDate)}
                disabled={!form.isActive}
              />
            </div>

          </div>

          <div className="text-gray-500 mx-2 self-center">-</div>

          <div className="text-center flex-1">
            <div className="text-xs text-gray-400 mb-1">End</div>
            <div className="text-sm text-white font-medium bg-gray-800/50 py-1 px-2 rounded-lg border border-gray-700">
              <motion.input
                whileFocus={{ scale: 1.05 }}
                type="time"
                className="bg-transparent text-right text-xs text-blue-400 focus:outline-none w-full mt-1"
                value={toTimeInput(form.endDate)}
                onChange={(e) => handleTimeChange("endDate", e.target.value)}
                onBlur={() => handleBlur("endDate", form.endDate)}
                disabled={!form.isActive}
              />
            </div>
          </div>

        </motion.div>

        <motion.div
          className={`text-xs font-semibold text-center mt-1 py-1 rounded-full ${form.isActive
            ? 'bg-green-900/30 text-green-400'
            : 'bg-red-900/30 text-red-400'
            }`}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: form.isActive ? Infinity : 0,
            repeatType: "reverse"
          }}
        >
          {form.isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}
        </motion.div>

        <motion.div
          className="flex justify-center items-center space-x-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* First button: branch */}
          {(form.isActive && form.isExpired === "false") ? (
            <FaCodeBranch
              size={20}
              className="cursor-pointer text-blue-400 hover:text-blue-300 transition-colors"
              onClick={() => setShowModal(true)}
            />
          ) : (
            <FaCodeBranch size={20} className="text-gray-600" />
          )}

          {/* Second button: status toggle */}
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            type="button"
            onClick={handleStatusUpdate}
            className={`rounded-full p-2 shadow-lg ${form.isActive
              ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              } transition-all duration-200`}
            title={form.isActive ? "Deactivate Market" : "Activate Market"}
          >
            {form.isActive ? (
              <FaCheck size={12} className="text-white" />
            ) : (
              <FaTimes size={12} className="text-white" />
            )}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Rating Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-gradient-to-b from-[#0f2e45] to-[#0a1723] border border-gray-700 p-6 rounded-2xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-5 text-white text-center">Mapping Rating</h2>

              <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2">
                {ratings
                  .filter((opt: any) => opt.isActive)
                  .map((opt: any) => (
                    <motion.label
                      key={opt._id}
                      className="flex items-center gap-3 cursor-pointer p-2 hover:bg-[#132b3f] rounded-lg transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(opt._id)}
                        onChange={() => toggleSelect(opt._id)}
                        className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-700 rounded focus:ring-blue-600 focus:ring-offset-gray-800"
                      />
                      <span className="text-white">{opt.ratingName}</span>
                    </motion.label>
                  ))}
              </div>

              <div className="flex justify-end mt-6 gap-3">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleSaveRatings}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all"
                >
                  Save
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Update Confirmation Modal */}
      <AnimatePresence>
        {showStatusConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-gradient-to-b from-[#0f2e45] to-[#0a1723] border border-gray-700 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-white">Confirm Action</h2>
                <motion.button
                  onClick={cancelStatusUpdate}
                  className="text-gray-400 hover:text-white text-xl"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  ×
                </motion.button>
              </div>

              <p className="text-gray-300 mb-6 text-center">
                {form.isActive
                  ? "Are you sure you want to deactivate this market?"
                  : "Are you sure you want to activate this market?"
                }
              </p>

              <div className="flex justify-center space-x-4">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  type="button"
                  onClick={cancelStatusUpdate}
                  className="px-5 py-2 text-gray-300 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  type="button"
                  onClick={confirmStatusUpdate}
                  className={`px-5 py-2 rounded-lg text-white transition-all ${form.isActive
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    }`}
                >
                  {form.isActive ? "Deactivate" : "Activate"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// AddMarketModal component (same as before)
function AddMarketModal({ onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    marketName: "",
    a: "***",
    b: "**",
    c: "***",
    startTime: "10:00",
    endTime: "14:00"
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

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
  }, [formData, onSave]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

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