"use client";
import React from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const icons = [
  { Icon: FaFacebookF, href: "#" },
  { Icon: FaTwitter, href: "#" },
  { Icon: FaInstagram, href: "#" },
];

const ContactForm = () => {
  return (
    <section className="mt-28 bg-emerald-600  rounded-3xl">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-5 relative bg-white rounded-2xl pt-8  rounded-tr-[200px] md:rounded-tr-[250px]">
        {/* Form Section */}
        <div className="col-span-5 lg:col-span-3 p-6">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 mb-2 flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
            Contact Us About Adoption
          </h2>
          <p className="text-gray-500 text-sm md:text-base mb-6">
            Whether you’re looking to adopt or have a query about our pets,
            we’re here to help.
          </p>

          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                placeholder="Phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                rows={4}
                placeholder="Type your question here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer text-white px-6 py-2 rounded-lg transition font-medium"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Contact Info Section */}
        <div className="hidden absolute  top-1/2 -translate-y-1/2 right-10 xl:right-1/14 bg-gray-100 p-5 rounded-tr-[150px] rounded-2xl lg:flex flex-col justify-center items-center">
          <div className="bg-white rounded-2xl rounded-tr-[150px] shadow p-10 py-16 ">
            <h3 className="text-3xl font-bold text-emerald-700 mb-5 flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
              Reach Us
            </h3>
            <ul className="space-y-5 text-gray-500">
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-emerald-600" />
                <span>pawfectmatchofficial11@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-emerald-600" />
                <span>+880 1700 000 000</span>
              </li>
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-emerald-600 mt-1" />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex gap-10 mt-16 text-gray-500">
              {icons.map(({ Icon, href }, i) => 
                <a key={i} href={href} className="hover:text-emerald-500">
                  <Icon />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
