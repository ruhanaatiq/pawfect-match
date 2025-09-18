"use client";

export default function BlogSection() {
  const blogs = [
    {
      id: 1,
      title: "How to Take Care of Your Pet",
      desc: "Learn the basics of pet care including food, health, and daily needs.",
      image: "/blog1.jpg",
    },
    {
      id: 2,
      title: "Best Dog Breeds for Families",
      desc: "A quick guide to dog breeds that are perfect for kids and families.",
      image: "/blog2.jpg",
    },
    {
      id: 3,
      title: "Healthy Foods for Cats",
      desc: "Find out what foods are safe and healthy for your cats.",
      image: "/blog3.jpg",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Latest Blogs</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover" />
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{blog.desc}</p>
                <button className="text-blue-600 font-medium hover:underline">
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
