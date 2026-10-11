import Navbar from "@/components/Navbar";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24">
        <Services />
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
