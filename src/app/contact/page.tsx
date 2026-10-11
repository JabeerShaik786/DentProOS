import Navbar from "@/components/Navbar";
import ContactSection from "@/components/ContactSection";
import ConsultancyCard from "@/components/ConsultancyCard";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24">
        <ContactSection />
        <ConsultancyCard />
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
