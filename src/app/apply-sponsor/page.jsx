"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";

export default function ApplySponsorPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    logoUrl: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // POST request to backend API
      const res = await fetch("/api/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Success message with next-step info
        Swal.fire({
          title: "Application Submitted!",
          html: "Thank you for applying to become a sponsor.<br><br>Our team will review your application and get back to you via email.",
          icon: "success",
          confirmButtonColor: "#059669",
        });

        // Reset form
        setFormData({
          companyName: "",
          contactName: "",
          email: "",
          phone: "",
          website: "",
          logoUrl: "",
          message: "",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Something went wrong. Please try again.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Network Error",
        text: "Unable to connect to server.",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex justify-center items-start py-16 px-4">
      <div className="w-full max-w-2xl bg-white p-12 rounded-3xl shadow-2xl border border-gray-100">
        <h1 className="text-4xl font-bold text-emerald-700 mb-10 text-center">
          Sponsor Application
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Name */}
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">
              Company Name*
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              placeholder="Enter your company name"
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Contact Name */}
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">
              Contact Name*
            </label>
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              required
              placeholder="Enter contact person's name"
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">
              Email*
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email address"
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">
              Phone*
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">
              Website URL*
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="Enter your company website"
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">
              Company Logo URL*
            </label>
            <input
              type="url"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="Enter your logo URL"
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">
              Message (Optional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Any additional information..."
              rows="4"
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>
           {/* Info Note */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-center text-base">
            💡 <b>Note:</b> Sponsorship levels (Bronze, Silver, Gold) will be
            automatically assigned based on your total donation amount over time.
          </div>


          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 text-xl bg-emerald-600 text-white font-semibold rounded-full shadow-md hover:bg-emerald-500 transition-all"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}
