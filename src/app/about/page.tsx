import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import AboutDoctor from "@/components/AboutDoctor";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24">
        <AboutSection />
        <AboutDoctor />
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
