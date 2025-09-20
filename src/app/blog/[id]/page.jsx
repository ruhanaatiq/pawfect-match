"use client";

import Image from "next/image";

export default function BlogPage({ params }) {
  const { id } = params;

  // Blog data with resources
  const blogs = {
    1: {
      title: "Pet Safety & First Aid",
      image: "/blog1.jpg",
      content: `
Learn how to handle emergencies and keep your pets safe.
This article covers basic first aid, emergency procedures, and prevention tips for pets.
      `,
       resource: "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/cat-health-topics",
      
    },
    2: {
      title: "Understanding Pet Behavior",
      image: "/blog2.jpg",
      content: `
Guide to understanding and improving your pet's behavior.
Learn common behavior patterns, communication cues, and training tips.
      `,
      resource: "https://www.petfinder.com/pet-care/behavior/",
    },
    3: {
      title: "Healthy Diet Plans for Cats",
      image: "/blog3.jpg",
      content: `
Discover nutritious and balanced diet tips to keep your cats strong and playful.
Includes portion control, recommended foods, and treats.
      `,
      resource: "https://www.aspca.org/pet-care/general-pet-care",
     
    },
  };

  const blog = blogs[id];

  if (!blog) return <h1 className="text-center mt-10 text-xl">Blog not found</h1>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">{blog.title}</h1>
      {blog.image && (
        <Image
          src={blog.image}
          alt={blog.title}
          width={900} 
          height={400} 
          className="w-full h-auto rounded-lg mb-6 object-cover"
        />
      )}
      <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
        {blog.content}
      </p>

      {/* Resource button if exists */}
      {blog.resource && (
        <a
          href={blog.resource}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
        >
          Resource
        </a>
      )}
    </div>
  );
}
