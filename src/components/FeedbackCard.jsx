// components/FeedbackCards.jsx
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaStar, FaMapMarkerAlt, FaQuoteLeft } from "react-icons/fa";
import { IoIosStar, IoIosTrendingUp } from "react-icons/io";
import {motion} from 'framer-motion'

export default function FeedbackCards({
  limit = null,
  showHeader = true,
  showReviews = true,
  grid = 3
}) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ count: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, [limit]);

  const fetchFeedbacks = async () => {
    try {
      const url = limit ? `/api/feedback?limit=${limit}` : "/api/feedback";
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setFeedbacks(result.data);
        setStats({
          count: result.count,
          averageRating: parseFloat(result.averageRating),
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, size = "text-lg") => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = i + 1;
          const diff = rating - starValue;

          if (diff >= 0) {
            return <FaStar key={i} className={`text-yellow-400 ${size}`} />;
          } else if (diff > -1 && diff < 0) {
            return (
              <div key={i} className={`relative ${size}`}>
                <FaStar className="text-gray-300" />
                <FaStar
                  className="text-yellow-400 absolute top-0 left-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${Math.abs(diff) * 100}% 0 0)` }}
                />
              </div>
            );
          } else {
            return <FaStar key={i} className={`text-gray-300 ${size}`} />;
          }
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="mt-4 text-gray-600">Loading feedback...</p>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl">
        <p className="text-gray-600 text-lg">No feedback available yet.</p>
        <p className="text-gray-500 text-sm mt-2">
          Be the first to share your experience!
        </p>
      </div>
    );
  }


  return (
    <div className="w-full">
      {/* Header Section */}
      {showHeader && (
        <motion.div 
         initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{amount : 0.5}}
        className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 flex justify-center items-start gap-2">
            <FaQuoteLeft className="text-emerald-500 -mt-2 opacity-50" />
            What Our Users Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real stories from people who found their perfect companions
          </p>
        </motion.div>
      )}

      {/* Reviews Stats Section */}
      {showReviews && (
        <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}>
          <ReviewsSection 
            feedbacks={feedbacks} 
            renderStars={renderStars}
            averageRating={stats.averageRating}
          />
        </motion.div>
      )}

      {/* Feedback Cards Grid */}
      <motion.div 
       className={`grid grid-cols-1 md:grid-cols-2 ${grid == 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
        {feedbacks.map((feedback) => (
          <motion.div 
            key={feedback._id}
              initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{amount : 0.4}}
            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="border border-emerald-400 rounded-full p-[2px]">
                  {feedback.user_image ? (
                    <Image
                      src={feedback.user_image}
                      alt={feedback.user_name}
                      width={48}
                      height={48}
                      className="w-14 h-14 rounded-full object-cover border-2 border-emerald-100"
                      unoptimized
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center border-2 border-emerald-100">
                      <span className="text-white font-bold text-lg">
                        {feedback.user_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">{feedback.user_name}</h4>
                  <p className="text-sm text-gray-500">{feedback.user_role}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1 justify-end items-end">
                {/* Rating */}
                <div>{renderStars(feedback.rating , 'text-base')}</div>
                {/* Date */}
                <p className="text-xs text-gray-400">
                  {new Date(feedback.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Feedback Text */}
            <p className="text-gray-600 my-6 line-clamp-4 leading-relaxed italic text-sm">
              {feedback.feedback}
            </p>

            {/* Location */}
            {feedback.location && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaMapMarkerAlt className="text-emerald-500" />
                <span>{feedback.location}</span>
              </div>
            )}
          </motion.div >
        ))}
      </motion.div >
    </div>
  );
}

// Reviews Stats Section Component
const ReviewsSection = ({ feedbacks, renderStars, averageRating }) => {
  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="bg-white py-10 px-6 rounded-2xl shadow-md text-center text-gray-500 mb-12">
        No reviews yet.
      </div>
    );
  }

  const totalReviews = feedbacks.length;
  
  // Calculate rating breakdown
  const ratingsCount = feedbacks.reduce((acc, { rating }) => {
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {});

  // Find max count for percentage calculation
  const maxCount = Math.max(...Object.values(ratingsCount), 1);

  // Calculate growth percentage (mock data - you can make it dynamic)
  const growthPercentage = 21;

  return (
    <div className="bg-white py-8 px-6 md:px-10 rounded-2xl shadow-md mb-12 border border-gray-100">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        
        {/* Left: Total Reviews */}
        <div className="flex-shrink-0">
          <h3 className="text-gray-700 text-base font-semibold mb-3">
            Total Reviews
          </h3>
          <div className="flex items-baseline gap-3">
            <p className="text-5xl font-bold ">
              {totalReviews >= 1000
                ? (totalReviews / 1000).toFixed(1) + "k"
                : totalReviews}
            </p>
            {/* <span className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
              {growthPercentage}% <IoIosTrendingUp className="text-xs" />
            </span> */}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Growth in reviews this year
          </p>
        </div>

        {/* Middle: Average Rating */}
        <div className="flex-shrink-0">
          <h3 className="text-gray-700 text-base font-semibold mb-3">
            Average Rating
          </h3>
          <div className="flex items-center gap-3 mb-2">
            <p className="text-5xl font-bold ">
              {averageRating.toFixed(1)}
            </p>
            <div className="flex gap-1">
              {renderStars(averageRating, "text-2xl")}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Average rating this year
          </p>
        </div>

        {/* Right: Rating Breakdown Bars */}
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((rating, index) => {
            const count = ratingsCount[rating] || 0;
            const percentage = (count / maxCount) * 100;
            
            return (
              <div key={rating} className="flex items-center gap-3 mb-3">
                <span className="text-sm text-gray-700 font-medium  text-right flex items-center gap-1 ">
                 <IoIosStar className="text-gray-300" /> {rating}
                </span>
                
                {/* Progress Bar */}
                <div className="flex-1 bg-gray-200 rounded-full h-2.5 relative overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full transition-all duration-500 ${
                      rating === 5
                        ? "bg-emerald-500"
                        : rating === 4
                        ? "bg-emerald-400"
                        : rating === 3
                        ? "bg-yellow-400"
                        : rating === 2
                        ? "bg-orange-400"
                        : "bg-red-400"
                    }`}
                    style={{ width: `${percentage}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ 
                      duration: 0.8,
                      delay: 0.3 + index * 0.1 
                    }}
                  ></motion.div>
                </div>
                
                {/* Count */}
                <span className="text-sm text-gray-600 font-medium w-12 text-right">
                  {count >= 1000 ? (count / 1000).toFixed(1) + "k" : count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

