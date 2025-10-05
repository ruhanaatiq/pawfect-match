"use client";
import React, { useEffect, useState } from "react";
// import cares from "../../../data/care.json";
import Image from "next/image";
import {
  Calendar,
  Clock,
  User,
  PawPrint,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Syringe,
  Droplets,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
// import { } from "lucide-react"

export default function CareDetails({ params }) {
  // const { id } = React.use(params);
  // const article = cares.find((a) => a.article_id === parseInt(id));
  // console.log(id);

  const { id } = useParams();
  const router = useRouter()
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/cares/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError("Article not found");
          return;
        }
        // console.log(data.data)
        setArticle(data.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  // Loading State
  if (loading) {
    return (
      <div className="text-center py-20 text-lg text-gray-500">
        Loading article details...
      </div>
    );
  }

  // Error or Not Found State
  if (error || !article) {
    return (
      <div className="text-center flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-2xl md:text-3xl font-semibold items-start flex gap-3">
          <img src="/paws.png" alt="" className="w-12" /> {error || "Not Found"}
        </h2>
        <p>It seems the article you’re looking for doesn’t exist.</p>
      </div>
    );
  }

  return (
    <div className="my-10">
     <button 
        onClick={() => router.back()} 
        className="mb-4 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer "
      >
        ← Back
      </button>
      <article className="mb-20 py-8 mx-auto px-4 max-w-4xl bg-white rounded-xl">
        <div className="relative w-full h-[450px] lg:h-[500px] rounded-2xl overflow-hidden mb-8 max-w-3xl mx-auto">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <h1 className="absolute left-5 bottom-5 text-white  text-2xl md:text-3xl font-bold drop-shadow-md">
            {article.title}
          </h1>
        </div>

        <div className="mb-4 text-sm md:text-base text-gray-500 flex justify-around items-center">
          <div className="flex items-center gap-1">
            <User size={18} />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={18} />
            <span>{article.publish_date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={18} />
            <span>{article.reading_time}</span>
          </div>
          <div className="flex items-center gap-1">
            <PawPrint size={18} />
            <span>{article.pet_type}</span>
          </div>
        </div>

        <div>
          <h3 className="text-xl md:text-2xl font-bold relative mb-4">
            Article
            <span className="absolute left-0 -bottom-1 w-20 h-[3px] bg-emerald-600 rounded-full"></span>
          </h3>
          <p className="text-gray-700 leading-relaxed px-2 whitespace-pre-line">
            {article.content}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="bg-emerald-100 text-emerald-700 text-sm px-3 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        <FaqSection />
      </article>
      <QuickCareTips />
    </div>
  );
}

//faq section
const faqs = [
  {
    question: "How often should I bathe my pet?",
    answer:
      "It depends on the pet type. Dogs can be bathed once every 3-4 weeks, while cats usually clean themselves and only need a bath occasionally if they get very dirty.",
  },
  {
    question: "What’s the best diet for my pet?",
    answer:
      "A balanced diet includes high-quality protein, healthy fats, vitamins, and minerals. Avoid giving human food like chocolate, onions, or garlic as they can be toxic.",
  },
  {
    question: "How can I tell if my pet is stressed?",
    answer:
      "Look for signs such as loss of appetite, hiding, aggression, or changes in behavior. Reduce stress by providing a calm environment and enough playtime.",
  },
  {
    question: "Should I visit a vet regularly?",
    answer:
      "Yes! Routine checkups (every 6–12 months) help detect health issues early. Regular vaccinations and dental care are also essential for your pet’s well-being.",
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="max-w-4xl mx-auto py-10 pt-20 px-4">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle size={22} />
        <h2 className="text-2xl font-bold ">Frequently Asked Questions</h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-2xl p-4 shadow-xs bg-white transition-all"
          >
            <button
              className="flex justify-between items-center cursor-pointer transition-all duration-500 w-full text-left"
              onClick={() => toggle(index)}
            >
              <span className="font-semibold text-emerald-700">
                {faq.question}
              </span>
              {openIndex === index ? (
                <ChevronUp className="text-primary" size={18} />
              ) : (
                <ChevronDown className="text-primary" size={18} />
              )}
            </button>

            {openIndex === index && (
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

// extra tips section
const tips = [
  {
    icon: <Syringe className="text-emerald-600" size={22} />,
    title: "Keep Vaccinations Up to Date",
    desc: "Regular vaccines protect your pet from serious diseases. Ask your vet for a schedule.",
  },
  {
    icon: <PawPrint className="text-emerald-600" size={22} />,
    title: "Brush Your Pet’s Teeth Weekly",
    desc: "Dental hygiene prevents infections and bad breath. Use pet-safe toothpaste only.",
  },
  {
    icon: <Droplets className="text-emerald-600" size={22} />,
    title: "Always Provide Fresh Water",
    desc: "Ensure your pet has access to clean water at all times to stay hydrated and healthy.",
  },
  {
    icon: <Clock className="text-emerald-600" size={22} />,
    title: "Maintain a Feeding Routine",
    desc: "Feed your pet at consistent times daily to support good digestion and behavior.",
  },
];

const QuickCareTips = () => {
  return (
    <section className="max-w-5xl mx-auto my-12 px-4">
      <h2 className="text-2xl font-bold mb-6 items-center justify-center gap-2 flex">
        Featured Tips & Quick Care Reminders{" "}
        <img src="/paws.png" alt="" className="w-12" />
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="bg-white shadow-emerald-100 shadow-md border border-gray-100 p-5 rounded-2xl hover:shadow-lg transition-all duration-300"
          >
            <div className="flex flex-col items-start gap-3">
              <div className=" p-3 bg-emerald-100 rounded-full">{tip.icon}</div>
              <h3 className="font-semibold">{tip.title}</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                {tip.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
