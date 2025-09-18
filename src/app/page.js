import PetCategories from "@/components/PetCategories";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PetCategories/>
      <Services />
      <Testimonials></Testimonials>
    </>
  );
}
