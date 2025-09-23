"use client";

import React from "react";
import Image from "next/image";


const Newsletter = () => {
  return (
    <section className=" py-16 md:pb-0 md:pt-10">
      <div className="container mx-auto flex flex-col-reverse md:flex-row items-center justify-center gap-6 px-6">
        {/* Image */}
        <div className="md:w-1/2  justify-center hidden md:flex">
          <Image
            // src={newsletter}
            src='/newsletter.png'
            width={400}
            height={450}
            unoptimized
            className="rounded-lg object-cover"
            alt="Happy person with pet"
          />
        </div>

        {/* Text + Form */}
        <div className="md:w-1/2 text-center md:text-left space-y-5">
          <h2 className="text-3xl lg:text-4xl font-bold ">
            Subscribe to Our <span className="text-emerald-700">Newsletter</span>
          </h2>
          <p className="mt-2 text-gray-600">
            Discover heartwarming stories, adoptable pets, and exclusive offers
            in our Pet Adoption Newsletter!
          </p>

         <form className="mt-4 flex w-full bg-white">
  <input
    type="email"
    placeholder="Your Email" 
    className="flex-1 px-4 py-3 border-2 rounded-l-xl border-emerald-600 focus:outline-0"
  />
  <button
    type="submit"
    className="px-6 py-3 cursor-pointer bg-emerald-600 text-white rounded-r-xl hover:bg-emerald-700 transition"
  >
    Subscribe
  </button>
</form>


          <p >
            We respect your privacy.
            <span className="text-emerald-700 font-medium"> No spam!</span> ever.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
