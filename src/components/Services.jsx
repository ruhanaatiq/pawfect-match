"use client";

import { FaPaw, FaStethoscope, FaBath, FaBone, FaHome, FaChalkboardTeacher } from "react-icons/fa";

export default function Services() {
  const items = [
    { icon: <FaHome className="text-2xl" />, title: "Adoption Assistance", text: "Browse verified shelters, meet pets, and get guided adoption support." },
    { icon: <FaStethoscope className="text-2xl" />, title: "Vet & Vaccination", text: "Partner clinics for routine checkups, shots, and post-adoption care." },
    { icon: <FaBath className="text-2xl" />, title: "Grooming & Hygiene", text: "Book spa, bathing, nail-trimming, and flea/tick treatments." },
    { icon: <FaChalkboardTeacher className="text-2xl" />, title: "Training & Behavior", text: "Basic obedience, leash manners, socialization, and house-training." },
    { icon: <FaBone className="text-2xl" />, title: "Food & Supplies", text: "Quality food, toys, and accessories curated for age and breed." },
    { icon: <FaPaw className="text-2xl" />, title: "24/7 Help Desk", text: "Emergency guidance and quick answers from our support team." },
  ];

  return (
    <section id="services" className="relative py-16 md:py-20 bg-[#FFF7D4] text-[#4C3D3D]" aria-labelledby="services-heading">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-10 md:mb-14">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 shadow-sm">
            <FaPaw className="text-emerald-600" />
            <span className="text-3xl font-semibold">Our Services</span>
          </p>
          <h2 id="services-heading" className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
            Caring For Every <span className="text-emerald-600">Paw</span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-[15px] text-[#4C3D3D]/80">
            Everything you need to welcome a new best friend—right from discovery to lifelong care.
          </p>
        </div>

        {/* cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {items.map((s, i) => (
            <article key={i} className="group relative rounded-2xl bg-white/80 backdrop-blur p-6 shadow-sm border border-black/5 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-[45%_55%_55%_45%] bg-emerald-100 opacity-70 rotate-12 transition group-hover:rotate-0" />
              <div className="relative z-10">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">{s.icon}</div>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-[15px] text-[#4C3D3D]/80">{s.text}</p>
                <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 focus:outline-none">
                  Learn more <span aria-hidden>→</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 md:mt-14 text-center">
          <a href="/adopt" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-white font-semibold hover:bg-emerald-700 shadow">
            Find Your Best Match
            <FaPaw aria-hidden className="text-base" />
          </a>
        </div>
      </div>
    </section>
  );
}
