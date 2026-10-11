"use client";

import { motion } from "framer-motion";
import { Award, Sparkles, Smile, Shield } from "lucide-react";

interface ChooseUsCard {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
}

const CARDS: ChooseUsCard[] = [
  {
    id: 1,
    icon: Award,
    title: "Experienced Staff",
    description: "Our dental professionals bring experience and expertise to every patient interaction.",
  },
  {
    id: 2,
    icon: Sparkles,
    title: "Modern Equipment",
    description: "We use modern dental technology to provide efficient, precise, and comfortable treatments.",
  },
  {
    id: 3,
    icon: Smile,
    title: "Comprehensive Care",
    description: "From routine checkups to advanced dental procedures, we provide a wide range of dental care.",
  },
  {
    id: 4,
    icon: Shield,
    title: "Comfortable Facility",
    description: "Our welcoming clinic environment is designed to make every dental visit comfortable and pleasant.",
  },
];

export default function WhyChooseUs() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section className="py-24 bg-gradient-to-b from-[#F8FAFC] to-[#F1F6FA] relative overflow-hidden">
      {/* Background Decorative Art */}
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-accent/10 blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
        {/* Header */}
        <div className="flex flex-col items-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-bold text-primary uppercase tracking-widest mb-3">
            Why Choose Us
          </span>
          <h2 className="font-heading font-extrabold text-3xl md:text-[48px] text-dark-text tracking-tight leading-tight">
            Setting the Benchmark for Smile Excellence
          </h2>
          <div className="h-[3px] w-12 bg-primary rounded-full mt-6" />
        </div>

        {/* Card Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.01 }}
                className="relative group rounded-3xl p-8 bg-white border border-borders/60 shadow-lg shadow-primary/[0.02] hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col items-start text-left overflow-hidden cursor-pointer"
              >
                {/* Glowing Corner Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.02] to-secondary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Card Icon */}
                <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300 relative z-10 shadow-sm shadow-primary/5">
                  <Icon className="w-6 h-6" />
                </div>

                {/* Card Title */}
                <h3 className="font-heading font-extrabold text-xl text-dark-text tracking-tight mb-3 relative z-10 group-hover:text-primary transition-colors duration-200">
                  {card.title}
                </h3>

                {/* Card Description */}
                <p className="text-gray-text text-sm leading-relaxed font-normal relative z-10">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
