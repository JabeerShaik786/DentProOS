/**
 * DentPro OS — Clinic Configuration Layer
 * 
 * Centralizes all clinic-specific branding, contact information, operational hours,
 * and clinical defaults. This layer allows DentPro OS to serve as a clean, reusable
 * base for future independent clinic installations without hard-coded clinic details.
 * 
 * Every value can be customized per clinic via environment variables or modified directly
 * in this file for an individual clinic deployment.
 */

export interface TestimonialItem {
  id: number;
  name: string;
  avatar: string;
  quote: string;
  rating?: number;
  objectPosition?: string;
}

export interface ClinicConfig {
  name: string;
  shortName: string;
  subtitle: string;
  tagline: string;
  establishedYear: string;
  experienceYears: string;
  logo: {
    main: string;
    icon: string;
    badge: string;
    alt: string;
  };
  contact: {
    phone: string;
    secondaryPhone: string;
    displayPhone: string;
    whatsapp: string;
    email: string;
    address: {
      line1: string;
      line2: string;
      city: string;
      state: string;
      pincode: string;
      full: string;
      short: string;
      mapsEmbedUrl: string;
      mapsLocationUrl?: string;
    };
  };
  hours: {
    weekdays: string;
    sunday: string;
    fullDisplay: string;
    badgeDisplay: string;
  };
  doctor: {
    name: string;
    title: string;
    specialty: string;
    qualification: string;
    experienceText: string;
  };
  website: {
    bookingUrl: string;
    domain: string;
    googleReviewUrl: string;
  };
  testimonials: TestimonialItem[];
}

export const clinicConfig: ClinicConfig = {
  name: process.env.NEXT_PUBLIC_CLINIC_NAME || "DentPro Dental Care & Dental Implant Centre",
  shortName: process.env.NEXT_PUBLIC_CLINIC_SHORT_NAME || "DentPro Dental Care",
  subtitle: process.env.NEXT_PUBLIC_CLINIC_SUBTITLE || "& Dental Implant Centre",
  tagline: process.env.NEXT_PUBLIC_CLINIC_TAGLINE || "Transforming Smiles, Transforming Lives",
  establishedYear: process.env.NEXT_PUBLIC_CLINIC_ESTD_YEAR || "2011",
  experienceYears: process.env.NEXT_PUBLIC_CLINIC_EXPERIENCE_YEARS || "14",

  logo: {
    main: "/logo.png",
    icon: "/dentpro-icon.png",
    badge: "/figma/logo_badge.png",
    alt: process.env.NEXT_PUBLIC_CLINIC_NAME || "DentPro Dental Care & Dental Implant Centre",
  },

  contact: {
    phone: process.env.NEXT_PUBLIC_CLINIC_PHONE || "098853 49798",
    secondaryPhone: process.env.NEXT_PUBLIC_CLINIC_SECONDARY_PHONE || "8790349798",
    displayPhone: process.env.NEXT_PUBLIC_CLINIC_DISPLAY_PHONE || "9885349798 / 8790349798",
    whatsapp: process.env.NEXT_PUBLIC_CLINIC_WHATSAPP || "919885349798",
    email: process.env.NEXT_PUBLIC_CLINIC_EMAIL || "contact@dentproclinic.com",
    address: {
      line1: process.env.NEXT_PUBLIC_CLINIC_ADDR_LINE1 || "3rd Cross St, opposite GMC Balayogi Stadium",
      line2: process.env.NEXT_PUBLIC_CLINIC_ADDR_LINE2 || "Zicria Nagar",
      city: process.env.NEXT_PUBLIC_CLINIC_CITY || "Yanam",
      state: process.env.NEXT_PUBLIC_CLINIC_STATE || "Andhra Pradesh / Puducherry",
      pincode: process.env.NEXT_PUBLIC_CLINIC_PINCODE || "533464",
      full: process.env.NEXT_PUBLIC_CLINIC_ADDRESS || "3rd Cross St, opposite GMC Balayogi Stadium, Zicria Nagar, Yanam, Andhra Pradesh 533464",
      short: process.env.NEXT_PUBLIC_CLINIC_SHORT_ADDRESS || "Yanam, Puducherry",
      mapsEmbedUrl: process.env.NEXT_PUBLIC_CLINIC_MAPS_EMBED || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.969176378418!2d82.21557007579178!3d16.728224521453205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a381fed6dbf3fbf%3A0xe54e60e86b404d03!2sGMC%20Balayogi%20Stadium!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
      mapsLocationUrl: process.env.NEXT_PUBLIC_CLINIC_MAPS_URL || "https://maps.google.com",
    },
  },

  hours: {
    weekdays: "Monday – Saturday: 9:00 AM – 8:00 PM",
    sunday: "Sunday: Closed",
    fullDisplay: "Monday – Saturday: 9:00 AM – 8:00 PM | Sunday: Closed",
    badgeDisplay: "Hours: Monday – Saturday: 9:00 AM – 8:00 PM (Sunday: Closed)",
  },

  doctor: {
    name: process.env.NEXT_PUBLIC_LEAD_DOCTOR_NAME || "Dr. Durga Praveen",
    title: "Prosthodontist & Implantologist",
    specialty: "Advanced Dental Care & Oral Rehabilitation",
    qualification: "BDS, MDS (Prosthodontics)",
    experienceText: "Experienced. Compassionate. Dedicated to Your Smile.",
  },

  website: {
    bookingUrl: "/book-appointment",
    domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || "https://dentpro.example.com",
    googleReviewUrl: process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "https://google.com/maps",
  },

  testimonials: [
    {
      id: 1,
      name: "Srinivas Rao",
      avatar: "/figma/avatar_srinivas.png",
      quote:
        "The doctors and staff are absolutely fantastic! They always make me feel comfortable during procedures, clearly explain treatment options, and are genuinely friendly. I highly recommend them for anyone looking for a caring and skilled dental practice.",
      rating: 5,
    },
    {
      id: 2,
      name: "Bhargav B.",
      avatar: "/figma/avatar_bhargav.png",
      quote:
        "I had a great experience! The staff was very friendly and professional, and the doctors took the time to explain everything clearly. The clinic is well-maintained, and the treatment was smooth and painless. Highly recommended for quality dental care.",
      rating: 5,
    },
    {
      id: 3,
      name: "Pampana V.",
      avatar: "/figma/avatar_valibaba.png",
      quote:
        "Experienced, skilled doctors working with all latest equipment. Care and treatment are very nice in all aspects. One of the best dental clinics in the region.",
      rating: 5,
    },
    {
      id: 4,
      name: "K. Satyanarayana",
      avatar: "/figma/avatar_satyanarayana.jpg",
      quote:
        "Got dental implant treatment done here. The procedure was completed with utmost precision and care. Very hygienic clinic with state-of-the-art equipment. Truly top-notch care!",
      rating: 5,
    },
    {
      id: 5,
      name: "M. Durga Prasad",
      avatar: "/figma/avatar_durgaprasad.jpg",
      quote:
        "Visited for root canal treatment and crown placement. The doctor explained every step patiently and the treatment was completely painless. Exceptional service and reasonable pricing.",
      rating: 5,
    },
    {
      id: 6,
      name: "V. Lakshmi",
      avatar: "/figma/avatar_lakshmi.jpg",
      quote:
        "Very polite staff and excellent treatment. Clean and modern clinic environment. Best place for all dental and cosmetic teeth alignment needs.",
      rating: 5,
    },
  ],
};
