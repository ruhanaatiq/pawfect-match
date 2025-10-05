"use client";
import React, { useState, useRef, useEffect } from "react";
// import cares from "../../data/care.json";
import Image from "next/image";
import { Calendar, User ,  ChevronLeft, ChevronRight} from "lucide-react";

// 🧩 Card Component
const PetArticleCard = ({ article }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg shadow-emerald-50 transition-all overflow-hidden w-full max-w-sm duration-500">
      {/* Image Section */}
      <div className="relative h-64 w-full">
        <Image
          src={article.image}
          alt={article.title}
          fill
          unoptimized
          className="object-cover"
        />
        <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          {article.difficulty}
        </span>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col justify-between h-[200px]">
        <div>
          <h3 className="text-lg font-bold  line-clamp-2">
            {article.title}
          </h3>
           <p className="text-gray-600 text-sm mt-2 flex-1 ">
          {article.summary && article.summary.length > 90 
            ? article.summary.slice(0, 90) + '...' 
            : article.summary}
        </p>
        </div>

        {/* Meta Info */}
        <div className="flex justify-between items-center">
          <div className=" flex flex-col gap-2 text-gray-500 text-xs">
          <div className="flex items-center gap-1">
            <User size={14} />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{article.publish_date}</span>
          </div>
        </div>
           <a
            href={`/pet-care/${article._id}`}
            className="text-emerald-600 text-sm font-semibold hover:underline hover:transition-all hover:duration-500 flex items-center gap-1"
          >
            Read More →
          </a>
        </div>
      </div>
    </div>
  );
};

export default function PetCare() {
  const [cares, setCares] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", ...new Set(cares.map((c) => c.category_name))];
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCares = async () => {
      try {
        const res = await fetch("/api/cares")
        const result = await res.json()

        if (result.success) {
          setCares(result.data)
        } else {
          console.error("Error:", result.error)
        }
      } catch (error) {
        console.error("Fetch failed:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCares()
  }, [])

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320; 
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const filteredArticles =
    selectedCategory === "All"
      ? cares
      : cares.filter((article) => article.category_name === selectedCategory);

  if (loading) return <p>Loading...</p>

  return (
    <section className="scroll-">
      {/* 🐾 Hero Section */}
      <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw] h-[400px] bg-[url('/pet-care.jpg')] bg-cover bg-center ">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/60 to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            Learn How to Care for Your Pet
          </h1>
          <p className="md:text-lg lg:text-xl max-w-xl drop-shadow-md">
            Explore essential tips, guides, and routines to keep your furry friend happy and healthy.
          </p>
        </div>
      </div>

      {/* 🟢 Category Section with Arrows */}
      <div className="relative flex items-center justify-center my-20">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 z-10 cursor-pointer bg-white text-emerald-600 rounded-full shadow-md p-2 hover:bg-emerald-100 "
        >
          <ChevronLeft size={22} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-hidden scrollbar-hide px-10  scroll-smooth "
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-medium cursor-pointer transition-all ${
                selectedCategory === category
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                  : "bg-white text-emerald-700 border-emerald-600 hover:bg-emerald-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 z-10 bg-white cursor-pointer text-emerald-600 rounded-full shadow-md p-2 hover:bg-emerald-100 "
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* 🐶 Cards Section */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center px-4 ">
        {filteredArticles.map((article) => (
          <PetArticleCard key={article.article_id} article={article} />
        ))}
      </div>
    </section>
  );
}

