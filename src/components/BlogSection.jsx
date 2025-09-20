import Image from "next/image";
import Link from "next/link"; // <-- import Link

export default function BlogSection() {
  const blogs = [
    {
      id: 1,
      title: "Pet Safety & First Aid",
      description: "Learn how to handle emergencies and keep your pets safe.",
      image: "/blog1.jpg",
    },
    {
      id: 2,
      title: "Understanding Pet Behavior",
      description: "Guide to understanding and improving your pet's behavior.",
      image: "/blog2.jpg",
    },
    {
      id: 3,
      title: "Healthy Diet Plans for Cats",
      description: "Discover nutritious and balanced diet tips to keep your cats strong and playful.",
      image: "/blog3.jpg",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Our Blog & Resource
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <Image
                src={blog.image}
                alt={blog.title}
                width={400}
                height={250}
                className="w-full h-56 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1">{blog.title}</h3>
                <p className="text-gray-600 text-sm mb-3 leading-snug">
                  {blog.description}
                </p>
                <Link href={`/blog/${blog.id}`}>
                  <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">
                    Read More
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
