import Image from "next/image";

export default function HomePage() {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
     

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-4xl sm:text-5xl font-bold">
          Adopt Love. <span className="text-emerald-400">Give a Home.</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-200">
          Find your next best friend from shelters and foster homes.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href="/adopt"
            className="rounded-xl bg-emerald-500 px-6 py-3 text-white hover:bg-emerald-600"
          >
            Find Pets
          </a>
          <a
            href="/profile"
            className="rounded-xl bg-white/90 px-6 py-3 text-gray-800 hover:bg-gray-200"
          >
            My Profile
          </a>
        </div>
      </div>
    </section>
  );
}
