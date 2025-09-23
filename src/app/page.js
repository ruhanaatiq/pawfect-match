import PetCategories from "@/components/PetCategories";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/AboutUs";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import BlogSection from "@/components/BlogSection";
import Newsletter from "@/components/Newsletter";
import CalltoAction from "@/components/CalltoAction";


export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <About/>
       <PetCategories/>
       <CalltoAction/>
       <WhyChooseUs/>
       <Testimonials/>
       <BlogSection/>
        <Newsletter/>
       
    </>
  );
}
