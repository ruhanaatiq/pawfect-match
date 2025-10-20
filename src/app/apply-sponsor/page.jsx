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
    sponsorshipTier: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    // SweetAlert success
    Swal.fire({
      title: "Application Submitted!",
      text: "Thank you for applying to become a sponsor. We will contact you soon.",
      icon: "success",
      confirmButtonText: "OK",
    });

    // Reset form
    setFormData({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
      logoUrl: "",
      sponsorshipTier: "",
      message: "",
    });
  };

  return (
    <div className=" flex justify-center items-start py-16 px-4">
      <div className="w-full max-w-2xl bg-white p-10 rounded-3xl shadow-xl">
        <h1 className="text-3xl font-bold text-emerald-700 mb-8 text-center">
          Sponsor Application
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Company Name</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              placeholder="Enter your company name"
              className="input input-bordered w-full"
            />
          </div>

          {/* Contact Name */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Contact Name</span>
            </label>
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              required
              placeholder="Enter contact person's name"
              className="input input-bordered w-full"
            />
          </div>

          {/* Email */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="input input-bordered w-full"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Phone</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
              className="input input-bordered w-full"
            />
          </div>

          {/* Website */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Website URL</span>
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="Enter your company website"
              className="input input-bordered w-full"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Company Logo URL</span>
            </label>
            <input
              type="url"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="Enter your logo URL"
              className="input input-bordered w-full"
            />
          </div>

          {/* Sponsorship Tier */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Sponsorship Tier</span>
            </label>
            <select
              name="sponsorshipTier"
              value={formData.sponsorshipTier}
              onChange={handleChange}
              required
              className="select select-bordered w-full"
            >
              <option value="">Select a tier</option>
              <option value="Bronze">Bronze</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Message (Optional)</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Any additional information..."
              rows="4"
              className="textarea textarea-bordered w-full"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-emerald-600 text-white font-bold rounded-full shadow-lg hover:bg-emerald-500 transition-all"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}
