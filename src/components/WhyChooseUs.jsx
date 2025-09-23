"use client";

import Image from "next/image";

/** minimalist line icons */
const IPro = (p) => (
  <svg viewBox="0 0 24 24" className={`h-6 w-6 ${p.className || ""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="3" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </svg>
);
const IService = (p) => (
  <svg viewBox="0 0 24 24" className={`h-6 w-6 ${p.className || ""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M7 7h10v10H7z" />
    <path d="M7 12h10M12 7v10" />
  </svg>
);
const IHeartHome = (p) => (
  <svg viewBox="0 0 24 24" className={`h-6 w-6 ${p.className || ""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 11l9-7 9 7" />
    <path d="M5 10v9h5v-5h4v5h5v-9" />
  </svg>
);
const IStar = (p) => (
  <svg viewBox="0 0 24 24" className={`h-6 w-6 ${p.className || ""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3l2.9 5.9L21 10l-4.5 4.3L17.8 21 12 17.8 6.2 21l1.3-6.7L3 10l6.1-1.1L12 3z" />
  </svg>
);

function Pill({ children }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 shadow-sm text-sm font-semibold">
      {children}
    </div>
  );
}

function Feature({ title, text, Icon, accent = false }) {
  return (
    <div className="relative flex items-start gap-3">
      {/* dotted circle behind icon */}
      <div className={`relative grid place-items-center h-12 w-12 rounded-full border-2 ${accent ? "border-[#4C3D3D]" : "border-dashed border-[#4C3D3D]/40"} bg-white`}>
        <Icon className={`${accent ? "text-white" : "text-[#4C3D3D]"} h-5 w-5`} />
        {accent && <div className="absolute inset-0 rounded-full bg-[#4C3D3D]/90 -z-10" />}
      </div>
      <div>
        <h4 className="font-semibold text-[#4C3D3D]">{title}</h4>
        <p className="text-sm text-[#4C3D3D]/70">{text}</p>
      </div>
    </div>
  );
}

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="relative py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <div className="text-center">
          <Pill>
            <span className="text-emerald-600 text-3xl">Why Choose Us</span>
          </Pill>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
            Your Pets Will Be <span className="text-emerald-600">Extremely Happy</span> With Us
          </h2>
        </div>

        {/* Center composition */}
        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_minmax(320px,460px)_1fr] items-center">
          {/* Left features */}
          <div className="space-y-8">
            <Feature
              title="Experienced Professionals"
              text="Certified counselors, trainers, and vets to guide every step."
              Icon={IPro}
            />
            <Feature
              title="Loving Environment"
              text="Shelter partners vetted for safety, enrichment, and care."
              Icon={IHeartHome}
            />
          </div>

          {/* Center image with blob + spark lines */}
          <div className="relative mx-auto">
            {/* spark lines */}
            <div className="absolute -top-6 left-6 text-[#4C3D3D]/40">
              <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
                <path d="M8 24 L24 8 M10 36 L28 30 M18 46 L30 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="absolute -top-4 right-6 text-[#4C3D3D]/40 rotate-12">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <path d="M10 24 L20 14 M24 20 L34 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>

            {/* rounded blob */}
            <div className="absolute inset-0 -z-10 rounded-[40px] bg-emerald-100/70" />
            <div className="relative aspect-[4/5] w-[320px] md:w-[420px] overflow-hidden rounded-[40px] border border-black/5 bg-white/70 shadow-sm">
              <Image
                src="/spitz.jpg"  
                alt="Happy dog"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right features */}
          <div className="space-y-8">
            <Feature
              title="Comprehensive Services"
              text="From adoption to aftercare: training, grooming, and vet partners."
              Icon={IService}
              accent
            />
            <Feature
              title="Customer Satisfaction"
              text="High match success rates with ongoing support and resources."
              Icon={IStar}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
