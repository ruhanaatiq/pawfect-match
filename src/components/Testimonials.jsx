import { Quote } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sophia Martinez",
      role: "Pet Owner",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      text: "Adopting through this platform was stress-free and smooth. My cat Luna is now part of the family!",
    },
    {
      name: "James Wilson",
      role: "Pet Enthusiast",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      text: "The support team is very responsive and caring. They truly prioritize the pets' well-being.",
    },
    {
      name: "Olivia Brown",
      role: "Happy Adopter",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
      text: "I found the perfect companion here. The whole adoption journey felt personal and supportive.",
    },
    {
      name: "Daniel Thompson",
      role: "Dog Lover",
      image: "https://randomuser.me/api/portraits/men/41.jpg",
      text: "I was impressed by how organized and trustworthy the process was. Highly recommend this service!",
    },
    {
      name: "Ava Robinson",
      role: "Animal Advocate",
      image: "https://randomuser.me/api/portraits/women/29.jpg",
      text: "Great platform for people who want to give pets a forever home. It’s safe and easy to use.",
    },
    {
      name: "Ethan Clark",
      role: "Satisfied User",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
      text: "The adoption process was seamless. I’m grateful to have found my new furry best friend here.",
    },
  ];

  return (
    <section className="py-16 bg-base-100">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 bg-clip-text text-transparent">
          <Quote className="w-8 h-8 text-emerald-600" />
          What Our Users Say
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="card bg-base-200 shadow-xl p-6 rounded-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-14 h-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
                />
                <div>
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="text-sm opacity-70">{t.role}</p>
                </div>
              </div>
              <p className="text-base opacity-80">{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
