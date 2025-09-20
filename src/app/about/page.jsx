
"use client";

import Image from "next/image";

function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-black/5 p-5 text-center shadow-sm">
      <div className="text-2xl font-extrabold text-emerald-700">{value}</div>
      <div className="mt-1 text-sm text-[#4C3D3D]/80">{label}</div>
    </div>
  );
}

function Step({ num, title, text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 flex-none rounded-full bg-emerald-600 text-white grid place-items-center font-bold">
        {num}
      </div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-[#4C3D3D]/80">{text}</p>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const stats = [
    { value: "500+", label: "Successful Adoptions" },
    { value: "30+", label: "Partner Shelters" },
    { value: "120+", label: "Volunteers & Vets" },
  ];

  const steps = [
    { title: "Browse Pets", text: "Filter by species, size, age, and temperament." },
    { title: "Meet & Match", text: "Schedule visits and meet pets with a counselor." },
    { title: "Adopt Safely", text: "Verified documents, fees, and home-readiness checks." },
    { title: "Aftercare", text: "Vet visits, training tips, and 24/7 help desk." },
  ];

  const faqs = [
    {
      q: "What are the adoption requirements?",
      a: "Valid ID, proof of residence, and a quick lifestyle questionnaire. Some shelters may request a home visit."
    },
    {
      q: "Are there adoption fees?",
      a: "Yes—fees cover vaccinations, microchipping, and spay/neuter. Exact fees vary by shelter and will be shown on each pet."
    },
    {
      q: "Can I return a pet if it doesn't work out?",
      a: "We support responsible adoption. If it doesn’t work, we help with rehoming through our partner shelters."
    },
    {
      q: "Do you offer post-adoption support?",
      a: "Absolutely. We provide training resources, vet partners, and a support line for the first 30 days."
    },
    {
      q: "How do partner shelters join?",
      a: "Fill our partnership form and we’ll verify your shelter’s credentials and onboarding needs."
    },
  ];

  return (
    <main className="relative">
      {/* Page hero */}
      <section className="relative py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6 grid gap-8 md:grid-cols-2 items-center">
          <div>
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 shadow-sm text-sm font-semibold">
              <span className="text-emerald-600">About Us</span>
            </p>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
              We Help Pets <span className="text-emerald-600">Find Homes</span>
            </h1>
            <p className="mt-3 text-[#4C3D3D]/80 leading-relaxed">
              PawfectMatch connects shelters, fosters, and adopters with a guided process
              that prioritizes animal welfare and family fit.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="/adopt" className="rounded-xl bg-emerald-600 px-6 py-3 text-white font-semibold hover:bg-emerald-700">
                View Pets
              </a>
              <a href="/contact" className="rounded-xl bg-white px-6 py-3 text-[#4C3D3D] font-semibold shadow hover:bg-gray-100">
                Contact Us
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 md:-inset-6 rounded-[28px] bg-emerald-100/60 rotate-3" />
            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[28px] border border-black/5 bg-white/70">
              <Image
                src="/about-pet.png" // put an image in /public
                alt="Adopter holding a happy pet"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Impact stats */}
      <section className="py-8">
        <div className="mx-auto max-w-6xl px-6 grid gap-4 sm:grid-cols-3">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      </section>

      {/* Story / Timeline */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <h2 className="text-2xl md:text-3xl font-extrabold">Our Story</h2>
            <p className="mt-3 text-[#4C3D3D]/80">
              Starting as a small volunteer group, we’ve grown into a platform that
              standardizes safe, transparent adoptions across the region.
            </p>
          </div>
          <ol className="md:col-span-7 space-y-6">
            <li className="relative pl-6">
              <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-emerald-600" />
              <p className="font-semibold">2022 — Founded</p>
              <p className="text-sm text-[#4C3D3D]/80">Launched with 4 partner shelters and 120 pets onboarded.</p>
            </li>
            <li className="relative pl-6">
              <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-emerald-600" />
              <p className="font-semibold">2023 — Vet & Training Partners</p>
              <p className="text-sm text-[#4C3D3D]/80">Added aftercare, training resources, and vaccination tracking.</p>
            </li>
            <li className="relative pl-6">
              <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-emerald-600" />
              <p className="font-semibold">2024–Now — Growing Community</p>
              <p className="text-sm text-[#4C3D3D]/80">30+ shelters, 500+ adoptions, and new city rollouts.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => <Step key={i} num={i + 1} {...s} />)}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl md:text-3xl font-extrabold">FAQs</h2>
          <div className="mt-6 divide-y divide-black/5 rounded-2xl bg-white/80 backdrop-blur border border-black/5">
            {faqs.map((f, i) => (
              <details key={i} className="group p-5 open:bg-white/90">
                <summary className="cursor-pointer font-semibold list-none flex justify-between items-center">
                  {f.q}
                  <span className="ml-4 text-emerald-700 group-open:rotate-45 transition">+</span>
                </summary>
                <p className="mt-3 text-sm text-[#4C3D3D]/80">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a href="/contact" className="inline-block rounded-xl bg-[#4C3D3D] px-6 py-3 text-white font-semibold shadow hover:opacity-95">
              Still have questions? Contact us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}