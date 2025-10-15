// app/feedback/create/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaStar } from "react-icons/fa";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function CreateFeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;
  // console.log(session?.user)

  const [formData, setFormData] = useState({
    user_email: "",
    user_name: "",
    user_role: "Pet Adopter",
    user_image: "",
    rating: 5,
    feedback: "",
    location: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        user_email: user.email,
        user_name: user.name,
        user_image: user.image,
      }));
    }
  }, [user]);

  // Check if user is logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If not logged in, don't render form
  if (!session) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast("Feedback submitted successfully!");
        router.push("/give-feedback/success");
      } else {
        toast(result.error || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error:", error);
      toast("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  console.log(formData);
  const renderStarRating = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => setFormData({ ...formData, rating: star })}
            className="text-4xl transition-colors focus:outline-none"
          >
            <FaStar
              className={
                star <= (hoveredStar || formData.rating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">
            Submit Your Feedback
          </h1>
          <p className="text-gray-600 mb-8">Share your experience with us</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="flex flex-col gap-5 justify-between md:flex-row">
              {/* Role */}
              <div className="w-full">
                <label className="block text-sm font-semibold mb-2">
                  You are a *
                </label>
                <select
                  name="user_role"
                  value={formData.user_role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-0"
                >
                  <option value="Pet Adopter">Pet Adopter</option>
                  <option value="Pet Owner">Pet Owner</option>
                  <option value="Happy Adopter">Happy Adopter</option>
                  <option value="Pet Enthusiast">Pet Enthusiast</option>
                  <option value="Satisfied User">Satisfied User</option>
                </select>
              </div>
              {/* Location (Optional) */}
              <div className="w-full">
                <label className="block text-sm font-semibold mb-2">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Dhaka, Bangladesh"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-0"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Rating *
              </label>
              {renderStarRating()}
              <p className="text-sm text-gray-500 mt-2">
                {formData.rating === 5 && "Excellent! ⭐"}
                {formData.rating === 4 && "Very Good! 👍"}
                {formData.rating === 3 && "Good 😊"}
                {formData.rating === 2 && "Fair 😐"}
                {formData.rating === 1 && "Needs Improvement 😔"}
              </p>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Your Feedback *
              </label>
              <textarea
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Share your experience with us..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-0 resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.feedback.length} characters
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-red-400 hover:bg-red-300 rounded-lg font-semibold transition-colors cursor-pointer text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
