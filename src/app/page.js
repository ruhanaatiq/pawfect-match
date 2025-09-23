// src/app/page.js
import PetCategories from "@/components/PetCategories";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import About from "@/components/AboutUs";
import BlogSection from "@/components/BlogSection";
import Newsletter from "@/components/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Testimonials />
      <About />
      <PetCategories />
      <BlogSection />
      <Newsletter/>
    </>
  );
}
