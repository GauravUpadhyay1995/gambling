"use client";

import { useEffect, useState } from "react";
import { MdOutlineCurrencyExchange } from "react-icons/md";


export default function MarketList() {
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch rating list
  const fetchRatings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/ratings/list?source=backend");
      const result = await res.json();
      if (result.success) {
        setRatings(result.data);
      } else {
        setError(result.message || "Failed to load Ratings");
      }
    } catch (err) {
      setError("Failed to load Ratings");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchRatings();
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
  const updateRating = async (id: string, updated: any) => {
    try {
      await fetch(`/api/v1/admin/ratings/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      fetchRatings(); // refresh list after update
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  // Status update function (toggle isActive)
  const updateRatingStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/v1/admin/ratings/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchRatings(); // refresh list after update
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  // Add new rating
  const addRating = async (newRating: any) => {
    try {
      const response = await fetch("/api/v1/admin/ratings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRating),
      });

      if (response.ok) {
        setShowAddModal(false);
        fetchRatings(); // Refresh the list
      } else {
        console.error("Failed to add rating");
      }
    } catch (err) {
      console.error("Add rating failed", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen p-6">
      <div className={showAddModal ? "blur-sm" : ""}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Rating Dashboard</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Add Rating
          </button>
        </div>

        {/* ✅ Active Markets */}
        <h2 className="text-xl text-center font-semibold mb-4 text-green-500">ACTIVE RATINGS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {ratings.filter((m) => m.isActive).map((rating) => (
            <RatingCard
              key={rating._id}
              rating={rating}
              onUpdate={updateRating}
              onStatusUpdate={updateRatingStatus}
            />
          ))}
        </div>

        {/* ✅ Inactive Markets */}
        <h2 className="text-xl text-center font-semibold mb-4 text-red-500">INACTIVE RATINGS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ratings.filter((m) => !m.isActive).map((rating) => (
            <RatingCard
              key={rating._id}
              rating={rating}
              onUpdate={updateRating}
              onStatusUpdate={updateRatingStatus}
            />
          ))}
        </div>
      </div>

      {/* Add Rating Modal */}
      {showAddModal && (
        <AddMarketModal onClose={() => setShowAddModal(false)} onSave={addRating} />
      )}
    </div>
  );

}

function RatingCard({ rating, onUpdate, onStatusUpdate }: any) {
  const [form, setForm] = useState({
    ratingName: rating.ratingName,
    a: rating.convertValue?.a || "",
    b: rating.convertValue?.b || "",
    isActive: rating.isActive,
  });

  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  // Auto update when blur
  // Auto update when blur
  const handleBlur = (field: string, value: any) => {
    if (value === "") return;

    let updated: any = {};

    if (["a", "b"].includes(field)) {
      // Only update if the value is different
      if (value === rating.convertValue?.[field]) return;

      updated = { convertValue: { ...rating.convertValue, [field]: value } };
    } else {
      // Only update if the value is different
      if (value === rating[field]) return;

      updated = { [field]: value };
    }

    onUpdate(rating._id, updated);
  };


  // Handle status update confirmation
  const handleStatusUpdate = () => {
    setShowStatusConfirm(true);
  };

  const confirmStatusUpdate = () => {
    onStatusUpdate(rating._id, form.isActive);
    setShowStatusConfirm(false);
  };

  const cancelStatusUpdate = () => {
    setShowStatusConfirm(false);
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
          title={form.isActive ? 'Click To Deactivate Rating' : 'Click To Activate Rating'}
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

        {/* Rating Name */}

        <input
          className="bg-transparent border-b border-gray-400 focus:outline-none text-sm font-bold pr-6"
          value={form.ratingName}
          onChange={(e) => setForm({ ...form, ratingName: e.target.value })}
          onBlur={(e) => handleBlur("ratingName", e.target.value)}
          disabled={!form.isActive}
        />

        {/* Values */}
        <div className="flex items-center justify-between text-sm font-bold gap-2">
          <input
            className="w-16 text-center bg-transparent border-b border-gray-500 focus:outline-none"
            value={form.a}
            onChange={(e) => setForm({ ...form, a: e.target.value })}
            onBlur={(e) => handleBlur("a", form.a)}
            disabled={!form.isActive}
          />

          <MdOutlineCurrencyExchange size={20} />

          <input
            className="w-16 text-center bg-transparent border-b border-gray-500 focus:outline-none"
            value={form.b}
            onChange={(e) => setForm({ ...form, b: e.target.value })}
            onBlur={(e) => handleBlur("b", form.b)}
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
                ? "Are you sure you want to deactivate this rating?"
                : "Are you sure you want to activate this rating?"
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
                className={form.isActive ? "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg" : "bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"}
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
    ratingName: "",
    a: "10",
    b: "90",

  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a proper date object for start and end times



    onSave({
      ratingName: formData.ratingName,
      convertValue: {
        a: formData.a,
        b: formData.b,

      },
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
          <h2 className="text-xl font-bold text-white">Add New Rating</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating Name Input */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Rating Name</label>
            <input
              type="text"
              name="ratingName"
              value={formData.ratingName}
              onChange={handleChange}
              className="w-full bg-[#1e293b] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter rating name"
              required
            />
          </div>

          {/* Values Inputs */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Rating Values</label>
            <div className="flex justify-between">
              {['a', 'b'].map((field) => (
                <div key={field} className="flex flex-col items-center">
                  <span className="text-gray-400 text-sm mb-1">{field.toUpperCase()}</span>
                  <input
                    type="text"
                    name={field}
                    value={formData[field as 'a' | 'b']}
                    onChange={handleChange}
                    className="w-16 h-10 bg-[#1e293b] border border-gray-600 rounded-lg text-center text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              ))}
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
              Add Rating
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}