"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function MyBookings() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) return;

    (async () => {
      try {
        const res = await fetch(`/api/bookings?email=${session.user.email}`);
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", err.message, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [session?.user?.email]);

  const handleCancel = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to cancel this booking?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json(); // optional: get error message from API
        throw new Error(errorData?.message || "Failed to cancel booking");
      }

      setBookings((prev) => prev.filter((b) => b._id !== id));

      Swal.fire("Cancelled!", "Booking has been cancelled.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    }
  };

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10 animate-pulse">
        Loading your bookings...
      </p>
    );

  if (!bookings.length)
    return (
      <p className="text-center text-gray-500 mt-10 text-lg">
        No bookings yet 😿
      </p>
    );

  return (
    <div className="max-w-5xl">
      {/* Desktop & Tablet Table */}
      <div className="hidden sm:block w-full overflow-x-auto">
        <table className="w-full bg-white rounded-xl shadow overflow-hidden">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="py-3 text-left px-2">Vet</th>
              <th className="py-3 text-left">Specialty</th>
              <th className="py-3 text-left">Fee (BDT)</th>
              <th className="py-3 text-left">Booked On</th>
              <th className="py-3 text-left">Status</th>
              <th className="py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr
                key={b._id}
                className="border-b hover:bg-emerald-50 transition-colors duration-200"
              >
                <td className="py-3 flex items-center gap-3">
                  <img
                    src={b.vetPhoto}
                    alt={b.vetName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span className="font-semibold">{b.vetName}</span>
                </td>
                <td className="py-3 text-gray-600">{b.specialty}</td>
                <td className="py-3 text-gray-600">{b.consultationFee}</td>
                <td className="py-3 text-gray-500">
                  {new Date(b.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-1 rounded-full">
                    {b.status}
                  </span>
                </td>
                <td className="py-3">
                  <button
                    onClick={() => handleCancel(b._id)}
                    className="bg-red-100 text-red-600 text-sm px-3 py-1 rounded hover:bg-red-200 transition"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden flex flex-col gap-4">
        {bookings.map((b) => (
          <div
            key={b._id}
            className="bg-white rounded-xl shadow p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <img
                src={b.vetPhoto}
                alt={b.vetName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <h3 className="font-semibold text-lg">{b.vetName}</h3>
                <p className="text-gray-600 text-sm">{b.specialty}</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Fee: {b.consultationFee} BDT
            </p>
            <p className="text-gray-500 text-sm">
              Booked on: {new Date(b.createdAt).toLocaleDateString()}
            </p>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-1 rounded-full w-max">
              {b.status}
            </span>
            <button
              onClick={() => handleCancel(b._id)}
              className="mt-2 bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition self-start"
            >
              Cancel Booking
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
