import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ConsultancyCard from "@/components/ConsultancyCard";
import AboutSection from "@/components/AboutSection";
import AboutDoctor from "@/components/AboutDoctor";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import AppointmentCTA from "@/components/AppointmentCTA";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-grow overflow-x-hidden">
        <Hero />
        <ConsultancyCard />
        <AboutSection />
        <AboutDoctor />
        <Services />
        <Gallery />
        <Testimonials />
        <AppointmentCTA />
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
