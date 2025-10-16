import PetCategories from "@/components/PetCategories";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/AboutUs";
import WhyChooseUs from "@/components/WhyChooseUs";
// import Testimonials from "@/components/Testimonials";
import BlogSection from "@/components/BlogSection";
import Newsletter from "@/components/Newsletter";
import CalltoAction from "@/components/CalltoAction";
import ContactForm from "@/components/ContactForm";
import FeedbackCards from "@/components/FeedbackCard";

export default async function HomePage() {
   
  return (
    <>
      <Hero />
      <Services />
      <About/>
       <PetCategories/>
       <WhyChooseUs/>
       {/* <Testimonials/> */}
      <LandingPageFeedback />
       <CalltoAction/>
       <BlogSection/>
       <ContactForm/>
        <Newsletter/>
       
    </>
  );
}

const LandingPageFeedback = () =>{
  return (
    <section className="container mx-auto px-4 py-12">
        <FeedbackCards limit={6} showHeader={true} showReviews={false}/>
        
        {/* View All Button */}
        <div className="text-center mt-12">
          <a
            href="/dashboard"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-lg hover:shadow-xl"
          >
            View All Feedback
          </a>
        </div>
    </section>
  )
}