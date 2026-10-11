"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Calendar,
  Users,
  Activity,
  Stethoscope,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Building2,
  Menu,
  PanelLeftOpen,
  Search,
  Plus,
  Bell,
  Maximize2,
  Minimize2,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  UserPlus,
  FileText,
  CreditCard,
  Image as ImageIcon,
  X,
  Clock,
  CheckSquare,
  PlusCircle,
  HelpCircle,
  Phone,
  UserCheck,
  TrendingUp,
  Shield,
  Database,
  Trash2,
  DollarSign,
  Printer,
  Pencil,
  Share2,
  Mail,
  Download,
  CalendarPlus,
  MessageSquare,
  MessageCircle,
  SlidersHorizontal,
  Sun,
  Moon,
  Upload,
  Play,
  Pause,
  Camera,
  Mic,
  Video,
  Square,
  Circle,
  RotateCcw,
  Loader2,
  Pill,
  Package,
  Boxes,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DentalLogo } from "@/components/dental-logo";
import { createClient } from "@/lib/supabase/client";
import { clinicConfig } from "@/config/clinic.config";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Interfaces
export interface MedicineItem {
  id: string;
  name: string;
  stock_unit: string;
  opening_stock: number | null;
  available_quantity: number | null;
  low_stock_threshold: number;
  is_active: boolean;
  is_configured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StockTransaction {
  id: string;
  medicine_id: string;
  medicine_name?: string;
  transaction_type: "opening_stock" | "received" | "dispensed" | "adjustment";
  quantity: number;
  previous_quantity: number | null;
  new_quantity: number;
  transaction_date: string;
  reference?: string;
  notes?: string;
  prescription_id?: string;
  created_by?: string;
  created_at?: string;
}

export interface StructuredPrescriptionItem {
  medicine_id?: string;
  medicine_name: string;
  dosage: string;
  freq?: string;
  duration: string;
  instructions: string;
  dispensing_quantity: number;
  stock_unit: string;
  dispensed?: boolean;
  dispensed_at?: string;
}

export interface PatientPrescriptionRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_name: string;
  prescription_date: string;
  diagnosis?: string;
  advice?: string;
  items: StructuredPrescriptionItem[];
  created_at?: string;
}

interface FileAttachment {
  name: string;
  size: string;
  type: string;
}

interface Patient {
  id: string;
  uuid?: string;
  name: string;
  phone: string;
  age: number;
  gender: "Male" | "Female";
  address: string;
  visit: string;
  medicalNotes: string;
  balance: string;
  status: "Active" | "Inactive";
  dentalChart: Record<number, string>;
  prescriptions: string[];
  files: FileAttachment[];
  notes: string[];
  email?: string;
  bloodGroup?: string;
  patientType?: "New" | "Returning";
  firstName?: string;
  lastName?: string;
  dob?: string;
  occupation?: string;
  reference?: string;
  medicalHistory?: string[];
  medicalHistoryOthers?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
  allergies?: string;
  medicalConditions?: string;
  currentMedications?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  firstVisit?: string;
  preferredDentist?: string;
  createdAt?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctor: string;
  treatment: string;
  time: string;
  date: string;
  status: "Scheduled" | "Checked In" | "Waiting" | "In Consultation" | "In Procedure" | "Completed" | "Cancelled" | "No Show";
  notes?: string;
  token?: string;
  avatarColor: string;
}

interface InvoiceItem {
  id: string;
  uuid?: string;
  patientId: string;
  patientName: string;
  doctor: string;
  treatment: string;
  items: { description: string; amount: number }[];
  discount: number; // in percentage
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  tax: number; // in percentage
  subtotal: number;
  total: number;
  paidAmount: number;
  status: "Paid" | "Partially Paid" | "Unpaid" | "Pending";
  paymentDate: string;
  paymentLogs: { method: string; amount: number; date: string }[];
}

interface Doctor {
  id?: string;
  name: string;
  speciality: string;
  status: "Available" | "In Consultation" | "On Break" | "Finished Today";
  avatar?: string;
  phone?: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  status: "Active" | "Inactive" | "On Leave";
}

interface BackupHistoryItem {
  id: string;
  date: string;
  time: string;
  size: string;
  status: string;
}

interface TreatmentItem {
  id: string;
  name: string;
  patient: string;
  doctor: string;
  stage: "In Progress" | "Completed" | "Planned";
  notes: string;
  nextVisit: string;
  prescription: string;
  tooth?: number;
  cost?: number;
  diagnosis?: string;
  date?: string;
  treatmentPlan?: string;
  completedVisits?: number;
  totalVisits?: number;
}

interface ActivityItem {
  id: string;
  type: "Register" | "Appointment" | "Prescription" | "Chart" | "Treatment" | "Billing" | "Payment";
  msg: string;
  time: string;
}

const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM"
];

// Odontogram Component Type Definitions & Config
interface ToothConfig {
  index: number;
  fdi: number;
  x: number;
  y: number;
  rotation: number;
  type: 'molar' | 'premolar' | 'incisor';
  labelX: number;
  labelY: number;
}

const ALL_TEETH: ToothConfig[] = [
  // Upper Right (Quadrant 1)
  { index: 1, fdi: 18, x: 83, y: 226, rotation: -90, type: 'molar', labelX: 51, labelY: 230 },
  { index: 2, fdi: 17, x: 81, y: 192, rotation: -75, type: 'molar', labelX: 51, labelY: 188 },
  { index: 3, fdi: 16, x: 84, y: 158, rotation: -60, type: 'molar', labelX: 56, labelY: 148 },
  { index: 4, fdi: 15, x: 94, y: 128, rotation: -45, type: 'premolar', labelX: 71, labelY: 113 },
  { index: 5, fdi: 14, x: 111, y: 104, rotation: -35, type: 'premolar', labelX: 93, labelY: 85 },
  { index: 6, fdi: 13, x: 133, y: 86, rotation: -25, type: 'incisor', labelX: 120, labelY: 62 },
  { index: 7, fdi: 12, x: 158, y: 74, rotation: -15, type: 'incisor', labelX: 153, labelY: 49 },
  { index: 8, fdi: 11, x: 185, y: 70, rotation: -5, type: 'incisor', labelX: 185, labelY: 45 },

  // Upper Left (Quadrant 2)
  { index: 9, fdi: 21, x: 215, y: 70, rotation: 5, type: 'incisor', labelX: 215, labelY: 45 },
  { index: 10, fdi: 22, x: 242, y: 74, rotation: 15, type: 'incisor', labelX: 247, labelY: 49 },
  { index: 11, fdi: 23, x: 267, y: 86, rotation: 25, type: 'incisor', labelX: 280, labelY: 62 },
  { index: 12, fdi: 24, x: 289, y: 104, rotation: 35, type: 'premolar', labelX: 307, labelY: 85 },
  { index: 13, fdi: 25, x: 306, y: 128, rotation: 45, type: 'premolar', labelX: 329, labelY: 113 },
  { index: 14, fdi: 26, x: 316, y: 158, rotation: 60, type: 'molar', labelX: 344, labelY: 148 },
  { index: 15, fdi: 27, x: 319, y: 192, rotation: 75, type: 'molar', labelX: 349, labelY: 188 },
  { index: 16, fdi: 28, x: 317, y: 226, rotation: 90, type: 'molar', labelX: 349, labelY: 230 },

  // Lower Left (Quadrant 3)
  { index: 24, fdi: 31, x: 215, y: 430, rotation: -5, type: 'incisor', labelX: 215, labelY: 455 },
  { index: 23, fdi: 32, x: 242, y: 426, rotation: -15, type: 'incisor', labelX: 247, labelY: 451 },
  { index: 22, fdi: 33, x: 267, y: 414, rotation: -25, type: 'incisor', labelX: 280, labelY: 438 },
  { index: 21, fdi: 34, x: 289, y: 396, rotation: -35, type: 'premolar', labelX: 307, labelY: 415 },
  { index: 20, fdi: 35, x: 306, y: 372, rotation: -45, type: 'premolar', labelX: 329, labelY: 387 },
  { index: 19, fdi: 36, x: 316, y: 342, rotation: -60, type: 'molar', labelX: 344, labelY: 352 },
  { index: 18, fdi: 37, x: 319, y: 308, rotation: -75, type: 'molar', labelX: 349, labelY: 312 },
  { index: 17, fdi: 38, x: 317, y: 274, rotation: -90, type: 'molar', labelX: 349, labelY: 270 },

  // Lower Right (Quadrant 4)
  { index: 25, fdi: 41, x: 185, y: 430, rotation: 5, type: 'incisor', labelX: 185, labelY: 455 },
  { index: 26, fdi: 42, x: 158, y: 426, rotation: 15, type: 'incisor', labelX: 153, labelY: 451 },
  { index: 27, fdi: 43, x: 133, y: 414, rotation: 25, type: 'incisor', labelX: 120, labelY: 438 },
  { index: 28, fdi: 44, x: 111, y: 396, rotation: 35, type: 'premolar', labelX: 93, labelY: 415 },
  { index: 29, fdi: 45, x: 94, y: 372, rotation: 45, type: 'premolar', labelX: 71, labelY: 387 },
  { index: 30, fdi: 46, x: 84, y: 342, rotation: 60, type: 'molar', labelX: 56, labelY: 352 },
  { index: 31, fdi: 47, x: 81, y: 308, rotation: 75, type: 'molar', labelX: 51, labelY: 312 },
  { index: 32, fdi: 48, x: 83, y: 274, rotation: 90, type: 'molar', labelX: 51, labelY: 270 }
];

export const formatTo12h = (timeStr: string): string => {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    const [_, h, m, p] = ampmMatch;
    const hr = String(parseInt(h, 10)).padStart(2, "0");
    return `${hr}:${m} ${p.toUpperCase()}`;
  }
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const [_, h, m] = match24;
    let hr = parseInt(h, 10);
    const period = hr >= 12 ? "PM" : "AM";
    hr = hr % 12;
    if (hr === 0) hr = 12;
    const hrStr = String(hr).padStart(2, "0");
    return `${hrStr}:${m} ${period}`;
  }
  return timeStr;
};

export interface TreatmentColorConfig {
  name: string;
  dotColor: string;
  badgeBg: string;
  toothFillClass: string;
}

export const TREATMENT_COLORS: Record<string, TreatmentColorConfig> = {
  "Root Canal": {
    name: "Root Canal",
    dotColor: "bg-blue-500 border-blue-600",
    badgeBg: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300",
    toothFillClass: "fill-blue-200/90 dark:fill-blue-900/60 stroke-blue-600 stroke-[1.5]"
  },
  "Scaling": {
    name: "Scaling",
    dotColor: "bg-emerald-500 border-emerald-600",
    badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300",
    toothFillClass: "fill-emerald-200/90 dark:fill-emerald-900/60 stroke-emerald-600 stroke-[1.5]"
  },
  "Extraction": {
    name: "Extraction",
    dotColor: "bg-orange-500 border-orange-600",
    badgeBg: "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300",
    toothFillClass: "fill-orange-200/90 dark:fill-orange-900/60 stroke-orange-600 stroke-[1.5]"
  },
  "Filling": {
    name: "Filling",
    dotColor: "bg-purple-500 border-purple-600",
    badgeBg: "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300",
    toothFillClass: "fill-purple-200/90 dark:fill-purple-900/60 stroke-purple-600 stroke-[1.5]"
  },
  "Crown": {
    name: "Crown",
    dotColor: "bg-rose-500 border-rose-600",
    badgeBg: "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300",
    toothFillClass: "fill-rose-200/90 dark:fill-rose-900/60 stroke-rose-600 stroke-[1.5]"
  },
  "Implant": {
    name: "Implant",
    dotColor: "bg-cyan-500 border-cyan-600",
    badgeBg: "bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-300",
    toothFillClass: "fill-cyan-200/90 dark:fill-cyan-900/60 stroke-cyan-600 stroke-[1.5]"
  },
  "Braces": {
    name: "Braces",
    dotColor: "bg-fuchsia-500 border-fuchsia-600",
    badgeBg: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800 dark:bg-fuchsia-950/40 dark:border-fuchsia-800 dark:text-fuchsia-300",
    toothFillClass: "fill-fuchsia-200/90 dark:fill-fuchsia-900/60 stroke-fuchsia-600 stroke-[1.5]"
  },
  "Consultation": {
    name: "Consultation",
    dotColor: "bg-sky-500 border-sky-600",
    badgeBg: "bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300",
    toothFillClass: "fill-sky-200/90 dark:fill-sky-900/60 stroke-sky-600 stroke-[1.5]"
  }
};

export function getTreatmentColorConfig(statusStr?: string): TreatmentColorConfig | null {
  if (!statusStr || statusStr === "Healthy") return null;
  const mainName = statusStr.split(" (")[0].trim();

  if (TREATMENT_COLORS[mainName]) {
    return TREATMENT_COLORS[mainName];
  }

  for (const [key, config] of Object.entries(TREATMENT_COLORS)) {
    if (mainName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(mainName.toLowerCase())) {
      return config;
    }
  }

  return {
    name: mainName,
    dotColor: "bg-blue-500 border-blue-600",
    badgeBg: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300",
    toothFillClass: "fill-blue-200/90 dark:fill-blue-900/60 stroke-blue-600 stroke-[1.5]"
  };
}

export function numberToWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return "ZERO RUPEES ONLY";
  const num = Math.floor(Math.abs(amount));

  const single = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
  const double = ["TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
  const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];

  function convertChunk(n: number): string {
    let str = "";
    if (n >= 100) {
      str += single[Math.floor(n / 100)] + " HUNDRED ";
      n %= 100;
    }
    if (n >= 10 && n <= 19) {
      str += double[n - 10] + " ";
    } else {
      if (n >= 20) {
        str += tens[Math.floor(n / 10)] + " ";
        n %= 10;
      }
      if (n > 0) {
        str += single[n] + " ";
      }
    }
    return str;
  }

  let words = "";
  const lakh = Math.floor(num / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  if (lakh > 0) {
    words += convertChunk(lakh) + "LAKH ";
  }
  if (thousand > 0) {
    words += convertChunk(thousand) + "THOUSAND ";
  }
  if (remainder > 0) {
    words += convertChunk(remainder);
  }

  return `${words.trim()} RUPEES ONLY`;
}

export interface TreatmentVisitNode {
  num: number;
  title: string;
  date: string;
  stage: "Completed" | "In Progress" | "Planned";
  isCompleted: boolean;
  isCurrent: boolean;
  isUpcoming: boolean;
  subtitle?: string;
}

export function getPatientVisitsList(
  tr: TreatmentItem,
  patientTreatments: TreatmentItem[],
  patientAppointments: Appointment[]
): TreatmentVisitNode[] {
  const targetPatient = (tr.patient || "").trim();
  const pAppts = patientAppointments.filter(
    a => a.patientName && targetPatient && a.patientName.toLowerCase() === targetPatient.toLowerCase() && a.status !== "Cancelled"
  );

  const mainTitle = tr.name || "Consultation";
  const lowerTitle = mainTitle.toLowerCase();

  let phaseNames: string[] = [];

  if (lowerTitle.includes("root") || lowerTitle.includes("rct")) {
    phaseNames = [
      "Consultation & Assessment",
      "Dental X-Ray & Prep",
      "Treatment – Visit 1 (Canal Prep)",
      "Treatment Continued – Visit 2 (Obturation)",
      "Tooth Restoration & Crown",
      "Completed & Follow-up"
    ];
  } else if (lowerTitle.includes("crown") || lowerTitle.includes("bridge")) {
    phaseNames = [
      "Consultation & Assessment",
      "Impression & Prep",
      "Temporary Fit",
      "Crown Fabrication",
      "Permanent Placement",
      "Completed & Final Checkup"
    ];
  } else if (lowerTitle.includes("implant")) {
    phaseNames = [
      "Consultation & Assessment",
      "CBCT Scan & Planning",
      "Implant Surgery",
      "Healing & Osseointegration",
      "Abutment & Crown Placement",
      "Completed & Final Checkup"
    ];
  } else if (lowerTitle.includes("scaling") || lowerTitle.includes("clean")) {
    phaseNames = [
      "Consultation & Assessment",
      "Ultrasonic Scaling",
      "Root Planing & Polishing",
      "Fluoride Treatment",
      "Completed & Maintenance"
    ];
  } else if (lowerTitle.includes("extraction") || lowerTitle.includes("surgery")) {
    phaseNames = [
      "Consultation & Assessment",
      "Pre-op X-Ray & Prep",
      "Surgical Extraction",
      "Post-op Healing Review",
      "Completed"
    ];
  } else {
    phaseNames = [
      "Planned",
      "Consultation",
      "Cleaning / Preparation",
      "Treatment – Visit 1",
      "Treatment Continued – Visit 2",
      "Follow-up",
      "Completed"
    ];
  }

  const currentStageStr = (tr.stage || "").trim();
  const isOverallCompleted = currentStageStr === "Completed";

  let notesPhase = "";
  if (tr.notes && tr.notes.includes("Phase: ")) {
    notesPhase = tr.notes.split("Phase: ")[1].split("\n")[0].trim();
  }

  const completedAppts = pAppts.filter(a => a.status === "Completed");
  const activeAppts = pAppts.filter(a => a.status === "In Procedure" || a.status === "In Consultation" || a.status === "Waiting" || a.status === "Checked In" || a.status === "Scheduled");

  let completedCount = completedAppts.length;

  if (isOverallCompleted) {
    completedCount = phaseNames.length;
  } else {
    if (notesPhase) {
      const notesIdx = phaseNames.findIndex(p => p.toLowerCase() === notesPhase.toLowerCase() || p.toLowerCase().includes(notesPhase.toLowerCase()) || notesPhase.toLowerCase().includes(p.toLowerCase()));
      if (notesIdx >= 0) {
        completedCount = Math.max(completedCount, notesIdx);
      }
    } else {
      const stageIdx = phaseNames.findIndex(p => p.toLowerCase() === currentStageStr.toLowerCase() || p.toLowerCase().includes(currentStageStr.toLowerCase()));
      if (stageIdx >= 0) {
        completedCount = Math.max(completedCount, stageIdx);
      }
    }
  }

  completedCount = Math.min(phaseNames.length, completedCount);

  let activePhaseIdx = completedCount;
  if (activePhaseIdx >= phaseNames.length && !isOverallCompleted) {
    activePhaseIdx = phaseNames.length - 1;
  }

  const nodes: TreatmentVisitNode[] = phaseNames.map((phaseTitle, idx) => {
    const isComp = idx < completedCount || isOverallCompleted;
    const isCurr = !isOverallCompleted && idx === activePhaseIdx;
    const isUpc = !isComp && !isCurr;

    let dateStr = "Upcoming Phase";
    if (isComp) {
      const matchingCompAppt = completedAppts[idx];
      if (matchingCompAppt && matchingCompAppt.date) {
        dateStr = `Completed ${matchingCompAppt.date}`;
      } else if (tr.date) {
        dateStr = `Completed ${tr.date}`;
      } else {
        dateStr = "Completed";
      }
    } else if (isCurr) {
      const matchingActiveAppt = activeAppts[0] || pAppts.find(a => a.status !== "Completed");
      if (matchingActiveAppt && matchingActiveAppt.date) {
        dateStr = `Scheduled: ${matchingActiveAppt.date} (${matchingActiveAppt.time || "10:00 AM"})`;
      } else if (tr.nextVisit) {
        dateStr = `Scheduled: ${tr.nextVisit}`;
      } else {
        dateStr = "Active Session";
      }
    } else {
      const upcomingAppt = pAppts[idx - completedCount];
      if (upcomingAppt && upcomingAppt.date) {
        dateStr = `Scheduled: ${upcomingAppt.date}`;
      }
    }

    return {
      num: idx + 1,
      title: phaseTitle,
      date: dateStr,
      stage: isComp ? "Completed" : isCurr ? "In Progress" : "Planned",
      isCompleted: isComp,
      isCurrent: isCurr,
      isUpcoming: isUpc,
      subtitle: isComp ? "Completed" : isCurr ? "Active Treatment Phase" : "Upcoming Phase"
    };
  });

  return nodes;
}

export interface StructuredDosage {
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  beforeMeals: boolean;
  afterMeals: boolean;
}

export function formatDosageString(dosageObj: StructuredDosage): string {
  const times: string[] = [];
  if (dosageObj.morning) times.push("Morning");
  if (dosageObj.afternoon) times.push("Afternoon");
  if (dosageObj.night) times.push("Night");

  const timeStr = times.join(", ");

  let mealStr = "";
  if (dosageObj.beforeMeals) mealStr = "Before Meals";
  else if (dosageObj.afterMeals) mealStr = "After Meals";

  if (timeStr && mealStr) {
    return `${timeStr} — ${mealStr}`;
  }
  return timeStr || mealStr || "";
}

export function parseDosageString(str: string | undefined | null): StructuredDosage {
  if (!str) {
    return { morning: false, afternoon: false, night: false, beforeMeals: false, afterMeals: false };
  }
  const lower = String(str).toLowerCase();

  const morning = lower.includes("morning");
  const afternoon = lower.includes("afternoon");
  const night = lower.includes("night");

  let beforeMeals = lower.includes("before meal") || lower.includes("before meals");
  let afterMeals = lower.includes("after meal") || lower.includes("after meals");

  if (beforeMeals && afterMeals) {
    if (lower.includes("before meals")) afterMeals = false;
    else beforeMeals = false;
  }

  return { morning, afternoon, night, beforeMeals, afterMeals };
}

export function parseToothTreatments(val: string | string[] | undefined | null): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map(s => String(s).trim()).filter(s => s && s !== "Healthy");
  }
  const str = String(val).trim();
  if (!str || str === "Healthy") return [];
  if (str.includes(" | ")) {
    return str.split(" | ").map(s => s.trim()).filter(s => s && s !== "Healthy");
  }
  return [str];
}

export function formatTreatmentAdvisedFromChart(dentalChart: Record<number, string | string[]> | undefined | null): string {
  if (!dentalChart) return "";

  const activeEntries = Object.entries(dentalChart).filter(([_, val]) => {
    const list = parseToothTreatments(val);
    return list.length > 0;
  });

  if (activeEntries.length === 0) return "";

  const procedureMap: Record<string, { displayProc: string; teeth: Array<{ index: number; fdi: number }> }> = {};

  activeEntries.forEach(([toothIdxStr, val]) => {
    const toothNum = Number(toothIdxStr);
    const toothObj = ALL_TEETH.find(t => t.index === toothNum);
    const fdi = toothObj?.fdi || toothNum;
    const treatmentList = parseToothTreatments(val);

    treatmentList.forEach(statusStr => {
      const colorConfig = getTreatmentColorConfig(statusStr);
      const procedure = colorConfig?.name || statusStr.split(" (")[0].replace(/\s*\([^)]*\)/g, "").trim();
      if (!procedure) return;

      const procKey = procedure.toLowerCase();
      if (!procedureMap[procKey]) {
        procedureMap[procKey] = {
          displayProc: procedure,
          teeth: []
        };
      }
      if (!procedureMap[procKey].teeth.some(t => t.index === toothNum)) {
        procedureMap[procKey].teeth.push({ index: toothNum, fdi });
      }
    });
  });

  const lines: string[] = [];
  Object.values(procedureMap).forEach(group => {
    const sortedTeeth = group.teeth.sort((a, b) => a.fdi - b.fdi);
    if (sortedTeeth.length === 0) return;

    if (sortedTeeth.length >= ALL_TEETH.length) {
      lines.push(`${group.displayProc} — All Teeth`);
    } else if (sortedTeeth.length === 1) {
      lines.push(`${group.displayProc} — Tooth #${sortedTeeth[0].fdi}`);
    } else {
      const teethStr = sortedTeeth.map(t => `#${t.fdi}`).join(", ");
      lines.push(`${group.displayProc} — Teeth ${teethStr}`);
    }
  });

  return lines.join("\n");
}

interface OdontogramProps {
  chartData: Record<number, string | string[]>;
  selectedTooth?: number | null;
  selectedTeeth?: number[];
  onSelectTooth?: (toothNum: number) => void;
  isReadOnly?: boolean;
}

const Odontogram: React.FC<OdontogramProps> = ({
  chartData,
  selectedTooth = null,
  selectedTeeth = [],
  onSelectTooth,
  isReadOnly = false
}) => {
  const getToothPath = (type: 'molar' | 'premolar' | 'incisor') => {
    if (type === 'incisor') {
      return "M -7,-12 C -7,-12 -4,-15 0,-15 C 4,-15 7,-12 7,-12 C 8.5,-6 8.5,4 6.5,9 C 5.5,11.5 3.5,13 0,13 C -3.5,13 -5.5,11.5 -6.5,9 C -8.5,4 -8.5,-6 -7,-12 Z";
    } else if (type === 'premolar') {
      return "M -7,-9 C -7,-11 -4,-11.5 0,-11.5 C 4,-11.5 7,-9 7,-9 C 9.5,-5 9.5,5 7,9 C 7,11 4,11.5 0,11.5 C -4,11.5 -7,11 -7,9 C -9.5,5 -9.5,-5 -7,-9 Z";
    } else {
      return "M -10,-10 C -10,-13 -7,-13.5 0,-13.5 C 7,-13.5 10,-10 10,-10 C 12.5,-5 12.5,5 10,10 C 10,13 7,13.5 0,13.5 C -7,13.5 -10,13 -10,10 C -12.5,5 -12.5,-5 -10,-10 Z";
    }
  };

  const getToothFissures = (type: 'molar' | 'premolar' | 'incisor') => {
    if (type === 'molar') {
      return <path d="M -5,0 L 5,0 M 0,-7 L 0,7 M -3,-4 L 0,0 L -3,4 M 3,-4 L 0,0 L 3,4" className="stroke-slate-200 dark:stroke-slate-800 fill-none stroke-[0.8] transition-colors duration-200" />;
    } else if (type === 'premolar') {
      return <path d="M -3,0 L 3,0 M 0,-4 L 0,4" className="stroke-slate-200 dark:stroke-slate-800 fill-none stroke-[0.8] transition-colors duration-200" />;
    }
    return null;
  };

  return (
    <div className="w-full flex justify-center select-none">
      <div className="relative w-full max-w-[425px] aspect-[4/5] mx-auto">
        <svg viewBox="0 0 400 500" className="w-full h-full">
          {/* Central Guideline Crosshair */}
          <line x1="200" y1="50" x2="200" y2="450" className="stroke-slate-200/60 dark:stroke-slate-800/60 stroke-[1]" strokeDasharray="4 4" />
          <line x1="50" y1="250" x2="350" y2="250" className="stroke-slate-200/60 dark:stroke-slate-800/60 stroke-[1]" strokeDasharray="4 4" />

          {ALL_TEETH.map((tooth) => {
            const rawVal = chartData[tooth.index];
            const treatmentList = parseToothTreatments(rawVal);
            const primaryConfig = treatmentList.length > 0 ? getTreatmentColorConfig(treatmentList[0]) : null;
            const allConfigs = treatmentList.map(t => getTreatmentColorConfig(t)).filter((c): c is TreatmentColorConfig => c !== null);
            const isMultiSelected = selectedTeeth.includes(tooth.index);
            const isSelected = selectedTooth === tooth.index || isMultiSelected;
            const isHighlighted = isSelected || allConfigs.length > 0;

            let pathClass = "fill-white dark:fill-slate-900 hover:fill-blue-50/50 dark:hover:fill-blue-955/40 stroke-slate-300 dark:stroke-slate-700 hover:stroke-blue-400 stroke-[1]";

            if (isMultiSelected) {
              pathClass = primaryConfig
                ? `${primaryConfig.toothFillClass} stroke-blue-600 stroke-[3] filter drop-shadow-md`
                : "fill-blue-100/90 dark:fill-blue-900/60 stroke-blue-600 stroke-[2.5] filter drop-shadow-sm";
            } else if (primaryConfig) {
              pathClass = `${primaryConfig.toothFillClass}${isSelected ? ' stroke-[2.5] filter drop-shadow-sm' : ''}`;
            } else if (isSelected) {
              pathClass = "fill-blue-100/70 dark:fill-blue-900/30 stroke-blue-500 stroke-[2]";
            }

            const titleText = `Tooth #${tooth.fdi}${isMultiSelected ? ' (Selected)' : ''}${treatmentList.length > 0 ? `: ${treatmentList.join(', ')}` : ': Healthy'}`;

            return (
              <g
                key={tooth.fdi}
                className={`cursor-pointer transition-all duration-200 group ${isReadOnly ? 'pointer-events-none' : ''}`}
                onClick={() => onSelectTooth && onSelectTooth(tooth.index)}
              >
                {/* Tooth outline */}
                <g transform={`translate(${tooth.x}, ${tooth.y}) rotate(${tooth.rotation})`}>
                  <path
                    d={getToothPath(tooth.type)}
                    className={`transition-colors duration-200 ${pathClass}`}
                  />
                  {getToothFissures(tooth.type)}
                </g>

                {/* FDI Label */}
                <text
                  x={tooth.labelX}
                  y={tooth.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-[12px] transition-colors duration-200 ${
                    isMultiSelected
                      ? 'fill-blue-600 dark:fill-blue-400 font-extrabold text-[13px]'
                      : isHighlighted
                      ? 'fill-slate-900 dark:fill-white font-bold'
                      : 'fill-slate-400 dark:fill-slate-500 group-hover:fill-blue-500 font-semibold'
                  }`}
                >
                  {tooth.fdi}
                </text>

                {/* Multi-Treatment Color Indicator Circles */}
                {allConfigs.length > 0 && (
                  <g transform={`translate(${tooth.labelX}, ${tooth.y > 250 ? tooth.labelY + 11 : tooth.labelY - 11})`}>
                    {allConfigs.map((cfg, idx) => {
                      const total = allConfigs.length;
                      const offsetX = (idx - (total - 1) / 2) * 6.5;
                      const fillClass = cfg.dotColor.split(" ")[0];
                      return (
                        <circle
                          key={cfg.name + idx}
                          cx={offsetX}
                          cy={0}
                          r={2.5}
                          className={`${fillClass} stroke-white dark:stroke-slate-900 stroke-[0.8]`}
                        />
                      );
                    })}
                  </g>
                )}

                <title>{titleText}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// Predefined treatment procedure names
const ALL_TREATMENTS: string[] = [
  "Consultation",
  "Scaling",
  "Root Canal",
  "Extraction",
  "Filling",
  "Crown",
  "Implant",
  "Braces"
];

const menuItems = [
  { name: "Dashboard", icon: <Home className="h-[22px] w-[22px] shrink-0" strokeWidth={2} />, badge: null },
  { name: "Appointments", icon: <Calendar className="h-[22px] w-[22px] shrink-0" strokeWidth={2} />, badge: null },
  { name: "Patients", icon: <Users className="h-[22px] w-[22px] shrink-0" strokeWidth={2} />, badge: null },
  { name: "Treatments", icon: <Stethoscope className="h-[22px] w-[22px] shrink-0" strokeWidth={2} />, badge: null },
  { name: "Billing", icon: <Receipt className="h-[22px] w-[22px] shrink-0" strokeWidth={2} />, badge: null },
  { name: "Reports", icon: <BarChart3 className="h-[22px] w-[22px] shrink-0" strokeWidth={2} />, badge: null },
  { name: "Settings", icon: <Settings className="h-[22px] w-[22px] shrink-0" strokeWidth={2} />, badge: null }
];

const moduleSubTabs: Record<string, string[]> = {
  Dashboard: ["Overview"],
  Appointments: ["Today", "Queue", "History"],
  Patients: ["All Patients", "Add Patient"],
  Treatments: ["Active Treatments", "Completed", "Treatment Plans"],
  Billing: ["Invoices", "Payments"],
  Reports: ["Revenue", "Patients", "Treatments", "Appointments", "Medicine Stock"],
  Settings: ["Clinic", "Doctors", "Staff", "Stock / Medicine", "Backup"]
};

interface ClinicalMedia {
  id: string;
  patientId: string;
  name: string;
  type: string;
  category: "Clinical Photos" | "Consent Video Recordings";
  url: string;
  uploadDate: string;
  uploadedBy: string;
  toothNumber?: string;
  treatment?: string;
  appointment?: string;
  prescription?: string;
}

const parseClinicalNote = (noteStr: string) => {
  if (noteStr.startsWith("Title: ")) {
    const parts = noteStr.split(" | ");
    const title = parts[0]?.replace("Title: ", "") || "";
    const category = parts[1]?.replace("Category: ", "") || "General";
    const author = parts[2]?.replace("Author: ", "") || "Doctor";
    const content = parts[3]?.replace("Content: ", "") || "";
    const date = parts[4]?.replace("Date: ", "") || "12 Aug 2026";
    return { title, category, author, content, date };
  }
  return {
    title: "Clinical Practitioner Note",
    category: "General",
    author: "Practitioner",
    content: noteStr,
    date: "12 Aug 2026"
  };
};

// Phone number formatting & validation helpers (+91 + 10 digits max)
export function formatPhoneInput(val: string): string {
  if (!val) return "+91 ";
  const trimmed = val.trimStart();
  if (!trimmed) return "+91 ";

  if (trimmed.startsWith("+")) {
    if (trimmed.startsWith("+91")) {
      const rest = trimmed.slice(3).replace(/\D/g, "").slice(0, 10);
      return `+91 ${rest}`;
    } else {
      const match = trimmed.match(/^(\+\d{1,3})\s*(.*)$/);
      if (match) {
        const countryCode = match[1];
        const rest = match[2].replace(/\D/g, "").slice(0, 10);
        return `${countryCode} ${rest}`;
      }
    }
  }

  const digits = trimmed.replace(/\D/g, "").slice(0, 10);
  return `+91 ${digits}`;
}

export function extractPhoneDigits(phoneStr: string): string {
  if (!phoneStr) return "";
  const clean = phoneStr.trim();
  if (clean.startsWith("+91")) {
    return clean.slice(3).replace(/\D/g, "");
  }
  const match = clean.match(/^(\+\d{1,3})\s*(.*)$/);
  if (match) {
    return match[2].replace(/\D/g, "");
  }
  return clean.replace(/\D/g, "");
}

export function validate10DigitPhone(phoneStr: string): boolean {
  const digits = extractPhoneDigits(phoneStr);
  return digits.length === 10;
}

// Sequential 4-digit Patient ID Generator (0001, 0002, ...)
export function getNextSequentialPatientId(patientsList: Array<{ id?: string; patient_id?: string }>): string {
  let maxNum = 0;
  patientsList.forEach(p => {
    const rawId = p.id || p.patient_id || "";
    const matches = rawId.match(/\d+/g);
    if (matches) {
      matches.forEach(m => {
        const num = parseInt(m, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      });
    }
  });
  const nextNum = maxNum + 1;
  return nextNum.toString().padStart(4, "0");
}

const DEFAULT_MOCK_PATIENTS = [
  { id: "DS-1001", name: "Aarav Mehta", phone: "+91 98112 09230", age: 28, gender: "Male", address: "MG Road, Bengaluru", visit: "12 Aug 2026", medicalNotes: "Penicillin Allergy", balance: "₹0", status: "Active", dentalChart: { 16: "Root Canal Completed", 30: "Missing" }, prescriptions: ["Amoxicillin 500mg - 3x daily"], files: [{ name: "panorex_xray_mehta.png", size: "4.2 MB", type: "image/png" }], notes: ["Patient experiences cold sensitivity in lower left molar."] },
  { id: "DS-1002", name: "Priya Patel", phone: "+91 99104 22091", age: 34, gender: "Female", address: "Indiranagar, Bengaluru", visit: "10 Aug 2026", medicalNotes: "None", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
  { id: "DS-1003", name: "Kabir Singh", phone: "+91 98765 43210", age: 45, gender: "Male", address: "Koramangala, Bengaluru", visit: "08 Aug 2026", medicalNotes: "Latex Allergy, Hypertension", balance: "₹0", status: "Active", dentalChart: { 12: "Decayed" }, prescriptions: ["Paracetamol 650mg - as needed"], files: [], notes: ["Hypertension controlled under clinical prescription."] },
  { id: "DS-1004", name: "Ananya Rao", phone: "+91 95400 12044", age: 19, gender: "Female", address: "Whitefield, Bengaluru", visit: "05 Aug 2026", medicalNotes: "None", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
  { id: "DS-1005", name: "Rohan Kumar", phone: "+91 98100 44028", age: 31, gender: "Male", address: "HSR Layout, Bengaluru", visit: "12 Aug 2026", medicalNotes: "Sulfa Drugs Allergy", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
  { id: "DS-1006", name: "Sneha Reddy", phone: "+91 95408 81229", age: 27, gender: "Female", address: "Jayanagar, Bengaluru", visit: "03 Aug 2026", medicalNotes: "None", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
  { id: "DS-1007", name: "Rahul Verma", phone: "+91 98110 22912", age: 40, gender: "Male", address: "Malleshwaram, Bengaluru", visit: "28 Jul 2026", medicalNotes: "None", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
  { id: "DS-1008", name: "Kavya Sharma", phone: "+91 99100 55109", age: 22, gender: "Female", address: "Hebbal, Bengaluru", visit: "25 Jul 2026", medicalNotes: "None", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
  { id: "DS-1009", name: "Arjun Nair", phone: "+91 98760 12345", age: 36, gender: "Male", address: "Bannerghatta, Bengaluru", visit: "20 Jul 2026", medicalNotes: "Aspirin Sensitivity", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
  { id: "DS-1010", name: "Neha Joshi", phone: "+91 95400 98765", age: 29, gender: "Female", address: "Sadashivanagar, Bengaluru", visit: "15 Jul 2026", medicalNotes: "None", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
  { id: "DS-1011", name: "Vikram Malhotra", phone: "+91 98112 34567", age: 50, gender: "Male", address: "Ulsoor, Bengaluru", visit: "10 Jul 2026", medicalNotes: "Diabetes type 2", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
  { id: "DS-1012", name: "Meera Nair", phone: "+91 99104 56789", age: 33, gender: "Female", address: "Cox Town, Bengaluru", visit: "05 Jul 2026", medicalNotes: "None", balance: "₹500", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
  { id: "DS-1013", name: "Siddharth Roy", phone: "+91 98765 89012", age: 42, gender: "Male", address: "Frazer Town, Bengaluru", visit: "01 Jul 2026", medicalNotes: "None", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
  { id: "DS-1014", name: "Aditi Rao", phone: "+91 95400 34567", age: 25, gender: "Female", address: "Kalyan Nagar, Bengaluru", visit: "25 Jun 2026", medicalNotes: "None", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] },
  { id: "DS-1015", name: "Rajesh Khanna", phone: "+91 98100 90123", age: 60, gender: "Male", address: "Richmond Town, Bengaluru", visit: "15 Jun 2026", medicalNotes: "Penicillin Allergy", balance: "₹0", status: "Active", dentalChart: {}, prescriptions: [], files: [], notes: [] }
];

const DEFAULT_MOCK_MEDICINES: MedicineItem[] = [
  { id: "med-1", name: "Roles-D", stock_unit: "tablets", opening_stock: null, available_quantity: null, low_stock_threshold: 5, is_active: true, is_configured: false },
  { id: "med-2", name: "Taxim-O 200", stock_unit: "tablets", opening_stock: null, available_quantity: null, low_stock_threshold: 5, is_active: true, is_configured: false },
  { id: "med-3", name: "Acecloren", stock_unit: "tablets", opening_stock: null, available_quantity: null, low_stock_threshold: 5, is_active: true, is_configured: false },
  { id: "med-4", name: "Zerodol-MR", stock_unit: "tablets", opening_stock: null, available_quantity: null, low_stock_threshold: 5, is_active: true, is_configured: false },
  { id: "med-5", name: "Flagyl 400", stock_unit: "tablets", opening_stock: null, available_quantity: null, low_stock_threshold: 5, is_active: true, is_configured: false },
  { id: "med-6", name: "Zerodol-SP", stock_unit: "tablets", opening_stock: null, available_quantity: null, low_stock_threshold: 5, is_active: true, is_configured: false },
  { id: "med-7", name: "Orahex-DG", stock_unit: "bottles", opening_stock: null, available_quantity: null, low_stock_threshold: 5, is_active: true, is_configured: false },
  { id: "med-8", name: "Sensodent-K", stock_unit: "tubes", opening_stock: null, available_quantity: null, low_stock_threshold: 5, is_active: true, is_configured: false },
  { id: "med-9", name: "Orohealth Toothpaste", stock_unit: "tubes", opening_stock: null, available_quantity: null, low_stock_threshold: 5, is_active: true, is_configured: false },
  { id: "med-10", name: "Ornigreat Gel", stock_unit: "tubes", opening_stock: null, available_quantity: null, low_stock_threshold: 5, is_active: true, is_configured: false },
  { id: "med-11", name: "Flagyl Gel", stock_unit: "tubes", opening_stock: null, available_quantity: null, low_stock_threshold: 5, is_active: true, is_configured: false },
];

export function getMedicineStockStatus(med: MedicineItem): "not_configured" | "out_of_stock" | "low_stock" | "in_stock" {
  if (!med.is_configured || med.available_quantity === null || med.available_quantity === undefined) {
    return "not_configured";
  }
  if (med.available_quantity <= 0) {
    return "out_of_stock";
  }
  if (med.available_quantity <= med.low_stock_threshold) {
    return "low_stock";
  }
  return "in_stock";
}

export function renderStockStatusBadge(status: "not_configured" | "out_of_stock" | "low_stock" | "in_stock") {
  switch (status) {
    case "not_configured":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          Not Configured
        </span>
      );
    case "out_of_stock":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800">
          Out of Stock
        </span>
      );
    case "low_stock":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          Low Stock
        </span>
      );
    case "in_stock":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          In Stock
        </span>
      );
  }
}

export function convertToDbDate(uiDate: string): string {
  if (!uiDate) return new Date().toISOString().split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(uiDate)) return uiDate;

  const parts = uiDate.split(" ");
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const monthStr = parts[1].substring(0, 3);
    const year = parts[2];

    const months: Record<string, string> = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
      Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    };

    const month = months[monthStr] || "01";
    return `${year}-${month}-${day}`;
  }

  try {
    const d = new Date(uiDate);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
  } catch (e) {}

  return uiDate;
}

export function convertToUiDate(dbDate: string): string {
  if (!dbDate) return "12 Aug 2026";
  const parts = dbDate.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const monthNum = parts[1];
    const day = parts[2].padStart(2, "0");

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = parseInt(monthNum, 10) - 1;
    const month = months[monthIndex] || "Jan";

    return `${day} ${month} ${year}`;
  }
  return dbDate;
}

export function formatWhatsAppRecipientNumber(phoneStr: string): string {
  if (!phoneStr) return "";
  const digits = phoneStr.trim().replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function parseToDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const parts = dateStr.split(" ");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1].substring(0, 3);
    const year = parseInt(parts[2], 10);
    const months: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    const month = months[monthStr] ?? 0;
    if (!isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function getMondayOfCurrentWeek(d: Date = new Date()): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function normalizeTimeSlot(timeStr: string): string {
  if (!timeStr) return "09:00 AM";
  let cleaned = timeStr.trim().toUpperCase();

  const standardRegex = /^(\d{2}):(\d{2})\s*(AM|PM)$/;
  if (standardRegex.test(cleaned)) {
    return cleaned;
  }

  const shortRegex = /^(\d{1}):(\d{2})\s*(AM|PM)$/;
  const shortMatch = cleaned.match(shortRegex);
  if (shortMatch) {
    return `${shortMatch[1].padStart(2, "0")}:${shortMatch[2]} ${shortMatch[3]}`;
  }

  const militaryRegex = /^(\d{1,2}):(\d{2})$/;
  const militaryMatch = cleaned.match(militaryRegex);
  if (militaryMatch) {
    let hour = parseInt(militaryMatch[1], 10);
    const min = militaryMatch[2];
    let period = "AM";
    if (hour >= 12) {
      period = "PM";
      if (hour > 12) hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }
    return `${hour.toString().padStart(2, "0")}:${min} ${period}`;
  }

  return cleaned;
};

export default function SaaSMainDashboard({ initialTab = "Dashboard" }: { initialTab?: string } = {}) {
  const router = useRouter();
  const [loadingSession, setLoadingSession] = useState(true);
  const [userRole, setUserRole] = useState<"owner" | "receptionist">("owner");
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const isOwner = userRole === "owner";
  const isReceptionist = userRole === "receptionist";
  const supabase = createClient();

  const seedMockPatients = async () => {
    const insertRows = DEFAULT_MOCK_PATIENTS.map(p => ({
      patient_id: p.id,
      name: p.name,
      phone: p.phone,
      age: p.age,
      gender: p.gender,
      address: p.address,
      visit: p.visit,
      medical_notes: p.medicalNotes,
      balance: p.balance,
      status: p.status,
      dental_chart: p.dentalChart,
      prescriptions: p.prescriptions,
      files: p.files,
      notes: p.notes
    }));

    const { error } = await supabase
      .from("patients")
      .insert(insertRows);

    if (error) {
      console.error("Failed to seed mock patients in database:", error.message, error.code);
    }
  };

  const fetchClinicData = async () => {
    // 1. Fetch patients
    const { data: dbPatients, error: patErr } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (patErr) {
      console.error("Failed to load patients from database:", patErr.message, patErr.code);
      showToast("Error loading patients from database.", "error");
      return;
    }

    if (dbPatients) {
      if (dbPatients.length === 0) {
        await seedMockPatients();
        // Re-fetch data statefully after insert completion
        return fetchClinicData();
      }

      const mappedPatients: Patient[] = dbPatients.map(p => ({
        id: p.patient_id,
        uuid: p.id,
        name: p.name,
        phone: p.phone,
        age: p.age || 0,
        gender: (p.gender === "Male" || p.gender === "Female") ? p.gender : "Male",
        address: p.address || "",
        visit: p.visit || "",
        medicalNotes: p.medical_notes || "None",
        balance: p.balance || "₹0",
        status: (p.status === "Active" || p.status === "Inactive") ? p.status : "Active",
        dentalChart: p.dental_chart || {},
        prescriptions: p.prescriptions || [],
        files: Array.isArray(p.files) ? p.files : [],
        notes: p.notes || [],
        email: p.email || undefined,
        bloodGroup: p.blood_group || undefined,
        patientType: p.patient_type || undefined,
        occupation: p.occupation || undefined,
        reference: p.reference || undefined,
        medicalHistory: Array.isArray(p.medical_history) ? p.medical_history : [],
        medicalHistoryOthers: p.medical_history_others || undefined,
        createdAt: p.created_at || undefined
      }));
      setPatients(mappedPatients);
    }

    // 2. Fetch billing / invoices
    const { data: dbBilling, error: billErr } = await supabase
      .from("billing")
      .select("*")
      .order("created_at", { ascending: false });

    if (billErr) {
      showToast("Error loading invoices from database.", "error");
    } else if (dbBilling) {
      const mappedInvoices: InvoiceItem[] = dbBilling.map(b => ({
        id: b.invoice_id,
        uuid: b.id,
        patientId: dbPatients?.find(p => p.id === b.patient_id)?.patient_id || "",
        patientName: b.patient_name,
        doctor: b.doctor || "",
        treatment: b.treatment || "",
        items: Array.isArray(b.items) ? b.items : [],
        discount: Number(b.discount) || 0,
        discountType: b.discount_type || undefined,
        discountValue: Number(b.discount_value) || undefined,
        tax: Number(b.tax) || 0,
        subtotal: Number(b.subtotal) || 0,
        total: Number(b.total) || 0,
        paidAmount: Number(b.paid_amount) || 0,
        status: b.status || "Pending",
        paymentDate: b.payment_date || "",
        paymentLogs: Array.isArray(b.payment_logs) ? b.payment_logs : []
      }));
      setInvoices(mappedInvoices);
    }

    // 3. Fetch doctors
    const { data: dbDoctors, error: docErr } = await supabase
      .from("doctors")
      .select("*")
      .order("created_at", { ascending: true });

    if (docErr) {
      console.error("Failed to load doctors from database:", docErr.message, docErr.code);
      showToast("Error loading doctors from database.", "error");
    } else if (dbDoctors) {
      const mappedDoctors: Doctor[] = dbDoctors.map(d => ({
        id: d.id,
        name: d.name,
        speciality: d.specialty || "",
        status: (d.status === "Available" || d.status === "In Consultation" || d.status === "On Break" || d.status === "Finished Today") ? d.status : "Available",
        phone: d.phone || ""
      }));
      setDoctors(mappedDoctors);
    }

    // 4. Fetch appointments
    const { data: dbAppointments, error: apptErr } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: true });

    if (apptErr) {
      console.error("Failed to load appointments from database:", apptErr.message, apptErr.code);
      showToast("Error loading appointments from database.", "error");
    } else if (dbAppointments) {
      const mappedAppointments: Appointment[] = dbAppointments.map(a => {
        // Resolve patient details
        const patRecord = dbPatients?.find(p => p.id === a.patient_id);
        const localPatientId = patRecord ? patRecord.patient_id : "Unknown ID";
        const localPatientName = patRecord ? patRecord.name : "Unknown Name";

        // Resolve doctor name
        const docRecord = dbDoctors?.find(d => d.id === a.doctor_id);
        const localDoctorName = docRecord ? docRecord.name : (a.doctor_id ? "Unknown Doctor" : "Unassigned");

        return {
          id: a.id,
          patientId: localPatientId,
          patientName: localPatientName,
          doctor: localDoctorName,
          treatment: a.procedure_name || "Consultation",
          time: a.time_slot || "09:00 AM",
          date: convertToUiDate(a.appointment_date || ""),
          status: a.status as any || "Scheduled",
          notes: a.notes || "",
          token: a.queue_token || undefined,
          avatarColor: a.status === "Waiting" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
        };
      });
      setAppointments(mappedAppointments);
    }

    // 5. Fetch blocked slots
    const { data: dbBlocked } = await supabase.from("blocked_slots").select("*");
    if (dbBlocked) {
      setBlockedSlotsList(dbBlocked);
    }

    // 6. Fetch activities
    const { data: dbActivities } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (dbActivities && dbActivities.length > 0) {
      const mappedAct: ActivityItem[] = dbActivities.map(act => ({
        id: act.id,
        type: (act.entity_type as any) || "Register",
        msg: act.description,
        time: act.created_at ? convertToUiDate(act.created_at.split("T")[0]) : "Today"
      }));
      setActivities(mappedAct);
    }

    // 7. Fetch notifications
    const { data: dbNotifs } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (dbNotifs && dbNotifs.length > 0) {
      setNotifications(dbNotifs.map(n => ({ id: n.id, msg: n.message, unread: !n.is_read })));
    }

    // 8. Fetch treatments
    const { data: dbTreatments, error: treatErr } = await supabase
      .from("treatments")
      .select("*")
      .order("created_at", { ascending: false });

    if (treatErr) {
      console.error("Failed to load treatments from database:", treatErr.message, treatErr.code);
      showToast("Error loading treatments from database.", "error");
    } else if (dbTreatments) {
      const mappedTr: TreatmentItem[] = dbTreatments.map(t => {
        const patRecord = dbPatients?.find(p => p.id === t.patient_id);
        const docRecord = dbDoctors?.find(d => d.id === t.doctor_id);

        return {
          id: t.id,
          name: t.name || "Consultation",
          patient: patRecord ? patRecord.name : "",
          doctor: docRecord ? docRecord.name : "",
          stage: (t.stage === "Completed" || t.stage === "In Progress") ? t.stage : "Planned",
          notes: t.notes || "",
          nextVisit: "19 Aug 2026",
          prescription: "",
          tooth: t.tooth_number || undefined,
          cost: t.cost !== null && t.cost !== undefined ? Number(t.cost) : undefined,
          diagnosis: t.diagnosis || undefined,
          date: t.treatment_date ? convertToUiDate(t.treatment_date) : (t.created_at ? convertToUiDate(t.created_at.split("T")[0]) : undefined)
        };
      });
      setTreatments(mappedTr);
    }

    // 9. Fetch staff profiles
    const { data: dbProfiles } = await supabase
      .from("profiles")
      .select("*");
    if (dbProfiles && dbProfiles.length > 0) {
      const mappedStaff: Staff[] = dbProfiles.map(p => ({
        id: p.id,
        name: p.full_name || "Staff Member",
        role: p.custom_title || (p.role === "owner" ? "Owner / Dentist" : "Receptionist"),
        phone: p.phone || "+91 98765 00000",
        status: (p.status === "Active" || p.status === "Inactive" || p.status === "On Leave") ? p.status : "Active"
      }));
      setStaffList(mappedStaff);

      const receptionistProfile = dbProfiles.find(p => p.role === "receptionist" || p.custom_title?.toLowerCase().includes("reception") || p.custom_title?.toLowerCase().includes("desk"));
      if (receptionistProfile?.full_name) {
        setReceptionistUser(receptionistProfile.full_name);
      }
    }

    // 10. Fetch medicines inventory & transactions
    try {
      const { data: dbMeds, error: medErr } = await supabase
        .from("medicines")
        .select("*")
        .order("name", { ascending: true });

      if (!medErr && dbMeds && dbMeds.length > 0) {
        setMedicines(dbMeds.map(m => ({
          id: m.id,
          name: m.name,
          stock_unit: m.stock_unit,
          opening_stock: m.opening_stock !== null ? Number(m.opening_stock) : null,
          available_quantity: m.available_quantity !== null ? Number(m.available_quantity) : null,
          low_stock_threshold: Number(m.low_stock_threshold || 5),
          is_active: m.is_active ?? true,
          is_configured: m.is_configured ?? false,
          created_at: m.created_at,
          updated_at: m.updated_at
        })));
      }

      const { data: dbTx, error: txErr } = await supabase
        .from("stock_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (!txErr && dbTx) {
        setStockTransactions(dbTx.map(t => ({
          id: t.id,
          medicine_id: t.medicine_id,
          transaction_type: t.transaction_type,
          quantity: Number(t.quantity),
          previous_quantity: t.previous_quantity !== null ? Number(t.previous_quantity) : null,
          new_quantity: Number(t.new_quantity),
          transaction_date: t.transaction_date,
          reference: t.reference,
          notes: t.notes,
          prescription_id: t.prescription_id,
          created_by: t.created_by
        })));
      }

      const { data: dbPrescs, error: prescErr } = await supabase
        .from("patient_prescriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!prescErr && dbPrescs) {
        setPatientPrescriptionsList(dbPrescs.map(pr => ({
          id: pr.id,
          patient_id: pr.patient_id,
          patient_name: pr.patient_name,
          doctor_name: pr.doctor_name,
          prescription_date: pr.prescription_date,
          diagnosis: pr.diagnosis,
          advice: pr.advice,
          items: Array.isArray(pr.items) ? pr.items : [],
          created_at: pr.created_at
        })));
      }
    } catch (err) {
      console.error("Error fetching medicine stock data:", err);
    }
  };

  const insertBillingRecord = async (newInvoice: InvoiceItem) => {
    let dbPatientUuid = patients.find(p => p.id === newInvoice.patientId)?.uuid || null;

    if (!dbPatientUuid) {
      const { data: dbPat } = await supabase
        .from("patients")
        .select("id")
        .eq("patient_id", newInvoice.patientId)
        .maybeSingle();
      if (dbPat) {
        dbPatientUuid = dbPat.id;
      }
    }

    const { data: insertedBill, error } = await supabase
      .from("billing")
      .insert({
        invoice_id: newInvoice.id,
        patient_id: dbPatientUuid,
        patient_name: newInvoice.patientName,
        doctor: newInvoice.doctor,
        treatment: newInvoice.treatment,
        items: newInvoice.items,
        discount: newInvoice.discount,
        discount_type: newInvoice.discountType || null,
        discount_value: newInvoice.discountValue || 0,
        tax: newInvoice.tax,
        subtotal: newInvoice.subtotal,
        total: newInvoice.total,
        paid_amount: newInvoice.paidAmount,
        status: newInvoice.status,
        payment_date: newInvoice.paymentDate || null,
        payment_logs: newInvoice.paymentLogs
      })
      .select()
      .single();

    if (error || !insertedBill) {
      showToast("Failed to save invoice to billing database.", "error");
    } else {
      setInvoices(prev => prev.map(inv => inv.id === newInvoice.id ? { ...inv, uuid: insertedBill.id } : inv));
    }
  };

  useEffect(() => {
    const handleSessionSuccess = async (session: any) => {
      let { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("id, role, full_name, status")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileErr) {
        showToast("Error retrieving user profile.", "error");
        setLoadingSession(false);
        return;
      }

      if (profile?.status === "Inactive") {
        await supabase.auth.signOut();
        showToast("Your account is pending Owner activation or has been deactivated.", "error");
        setLoadingSession(false);
        router.push("/login");
        return;
      }

      if (!profile) {
        const defaultName = session.user?.user_metadata?.full_name || session.user?.email?.split("@")[0] || "Owner / Dentist";
        const { error: insertProfileErr } = await supabase
          .from("profiles")
          .insert({
            id: session.user.id,
            role: "owner",
            full_name: defaultName,
            status: "Active"
          });

        if (insertProfileErr) {
          showToast("Error provisioning user profile.", "error");
          setLoadingSession(false);
          return;
        }
        setUserRole("owner");
        setCurrentUserName(defaultName);
      } else {
        const canonicalRole = profile.role === "receptionist" ? "receptionist" : "owner";
        setUserRole(canonicalRole);
        const resolvedName = profile.full_name || session.user?.user_metadata?.full_name || session.user?.email?.split("@")[0] || (canonicalRole === "owner" ? "Owner / Dentist" : "Receptionist");
        setCurrentUserName(resolvedName);
      }

      await fetchClinicData();
      setLoadingSession(false);
    };

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        await handleSessionSuccess(session);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        router.push("/login");
      } else {
        await handleSessionSuccess(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Layout states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredItemTop, setHoveredItemTop] = useState<number>(0);

  // Navigation states
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeSubTab, setActiveSubTab] = useState(
    initialTab === "Dashboard" ? "Overview" : (moduleSubTabs[initialTab]?.[0] || "")
  );

  // Medicine Stock & Inventory States
  const [medicines, setMedicines] = useState<MedicineItem[]>(DEFAULT_MOCK_MEDICINES);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([]);
  const [patientPrescriptionsList, setPatientPrescriptionsList] = useState<PatientPrescriptionRecord[]>([]);

  // Inventory UI Filters
  const [stockSearchQuery, setStockSearchQuery] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState<"All" | "In Stock" | "Low Stock" | "Not Configured">("All");

  // Medicine Add / Edit Modal State
  const [medicineModalOpen, setMedicineModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineItem | null>(null);
  const [medFormName, setMedFormName] = useState("");
  const [medFormUnit, setMedFormUnit] = useState("tablets");
  const [medFormOpeningStock, setMedFormOpeningStock] = useState("");
  const [medFormThreshold, setMedFormThreshold] = useState("5");
  const [medFormIsActive, setMedFormIsActive] = useState(true);

  // Add Stock Modal State
  const [addStockModalOpen, setAddStockModalOpen] = useState(false);
  const [selectedStockMedicine, setSelectedStockMedicine] = useState<MedicineItem | null>(null);
  const [addStockQty, setAddStockQty] = useState("");
  const [addStockDate, setAddStockDate] = useState(new Date().toISOString().split("T")[0]);
  const [addStockSupplier, setAddStockSupplier] = useState("");
  const [addStockNotes, setAddStockNotes] = useState("");

  // Stock Adjustment Modal State
  const [adjustStockModalOpen, setAdjustStockModalOpen] = useState(false);
  const [adjustStockMedicine, setAdjustStockMedicine] = useState<MedicineItem | null>(null);
  const [adjustStockNewQty, setAdjustStockNewQty] = useState("");
  const [adjustStockReason, setAdjustStockReason] = useState("");
  const [adjustStockDate, setAdjustStockDate] = useState(new Date().toISOString().split("T")[0]);

  // Movement Log / History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyMedicine, setHistoryMedicine] = useState<MedicineItem | null>(null);

  // Dispense Confirmation Modal State
  const [dispenseConfirmModal, setDispenseConfirmModal] = useState<{
    prescriptionId: string;
    itemIndex: number;
    patientName: string;
    medicineName: string;
    medicineId?: string;
    dispensingQty: number;
    stockUnit: string;
    availableStock: number | null;
  } | null>(null);

  // Global Dialog triggers
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const quickAddRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
        setQuickAddOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const [showNotifications, setShowNotifications] = useState(false);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showNotifications]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openTreatmentMenu, setOpenTreatmentMenu] = useState<string | null>(null);

  useEffect(() => {
    function handleClickOutsideMenu(event: MouseEvent | TouchEvent) {
      const target = event.target as HTMLElement | null;
      if (target && !target.closest(".treatment-menu-container")) {
        setOpenTreatmentMenu(null);
      }
    }
    if (openTreatmentMenu) {
      document.addEventListener("mousedown", handleClickOutsideMenu);
      document.addEventListener("touchstart", handleClickOutsideMenu);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
      document.removeEventListener("touchstart", handleClickOutsideMenu);
    };
  }, [openTreatmentMenu]);

  // Workflow tracking states
  const [activeConsultationApptId, setActiveConsultationApptId] = useState<string | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceItem | null>(null);
  const [lastGeneratedReceipt, setLastGeneratedReceipt] = useState<InvoiceItem | null>(null);

  useEffect(() => {
    if (lastGeneratedReceipt) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lastGeneratedReceipt]);

  // Billing Edit Modal states & handlers
  const [editingInvoice, setEditingInvoice] = useState<InvoiceItem | null>(null);
  const [editInvoicePatientName, setEditInvoicePatientName] = useState("");
  const [editInvoiceDoctor, setEditInvoiceDoctor] = useState("");
  const [editInvoiceTreatment, setEditInvoiceTreatment] = useState("");
  const [editInvoiceSubtotal, setEditInvoiceSubtotal] = useState<number>(0);
  const [editInvoiceDiscount, setEditInvoiceDiscount] = useState<number>(0);
  const [editInvoiceTax, setEditInvoiceTax] = useState<number>(0);
  const [editInvoiceTotal, setEditInvoiceTotal] = useState<number>(0);
  const [editInvoicePaidAmount, setEditInvoicePaidAmount] = useState<number>(0);
  const [editInvoiceStatus, setEditInvoiceStatus] = useState<"Paid" | "Partially Paid" | "Unpaid" | "Pending">("Pending");
  const [editInvoicePaymentDate, setEditInvoicePaymentDate] = useState("");
  const [savingInvoice, setSavingInvoice] = useState(false);

  // Update Treatment Phase Modal states & handler
  const [editingPhaseTreatment, setEditingPhaseTreatment] = useState<TreatmentItem | null>(null);
  const [selectedPhaseStage, setSelectedPhaseStage] = useState<string>("In Progress");
  const [savingPhase, setSavingPhase] = useState(false);

  const handleSaveTreatmentPhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhaseTreatment) return;

    setSavingPhase(true);

    // Map UI clinical phase to valid DB stage ("Planned", "In Progress", or "Completed")
    const dbStage: "Planned" | "In Progress" | "Completed" = selectedPhaseStage === "Completed"
      ? "Completed"
      : selectedPhaseStage === "Planned"
      ? "Planned"
      : "In Progress";

    // Encode clinical phase name in notes to persist without violating treatments_stage_check constraint
    const existingNotesClean = (editingPhaseTreatment.notes || "").replace(/Phase: [^\n]+\n?/, "").trim();
    const updatedNotes = selectedPhaseStage !== "Completed" && selectedPhaseStage !== "Planned"
      ? `Phase: ${selectedPhaseStage}${existingNotesClean ? `\n${existingNotesClean}` : ""}`
      : existingNotesClean;

    const { data: updatedDb, error: updateErr } = await supabase
      .from("treatments")
      .update({
        stage: dbStage,
        notes: updatedNotes
      })
      .eq("id", editingPhaseTreatment.id)
      .select()
      .single();

    if (updateErr) {
      console.error("Failed to update treatment phase in database:", updateErr?.message, updateErr?.code);
      showToast(updateErr?.message || "Failed to update treatment phase in database.", "error");
      setSavingPhase(false);
      return;
    }

    const finalStage = (updatedDb?.stage as any) || dbStage;
    const finalNotes = updatedDb?.notes || updatedNotes;

    setTreatments(prev => prev.map(t => t.id === editingPhaseTreatment.id ? { ...t, stage: finalStage, notes: finalNotes } : t));

    if (selectedTreatmentDetail && selectedTreatmentDetail.id === editingPhaseTreatment.id) {
      setSelectedTreatmentDetail(prev => prev ? { ...prev, stage: finalStage, notes: finalNotes } : null);
    }

    setSavingPhase(false);
    setEditingPhaseTreatment(null);
    showToast("Treatment phase updated successfully.", "success");
  };

  const handleEditInvoice = (inv: InvoiceItem) => {
    setEditingInvoice(inv);
    setEditInvoicePatientName(inv.patientName || "");
    setEditInvoiceDoctor(inv.doctor || "");
    setEditInvoiceTreatment(inv.treatment || "");
    setEditInvoiceSubtotal(inv.subtotal || 0);
    setEditInvoiceDiscount(inv.discount || 0);
    setEditInvoiceTax(inv.tax || 0);
    setEditInvoiceTotal(inv.total || 0);
    setEditInvoicePaidAmount(inv.paidAmount || 0);
    setEditInvoiceStatus(inv.status || "Pending");
    setEditInvoicePaymentDate(inv.paymentDate || "12 Aug 2026");
  };

  const handleSaveEditInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    const invoiceUuid = editingInvoice.uuid;
    const invoiceId = editingInvoice.id;

    setSavingInvoice(true);

    const updatedSubtotal = Number(editInvoiceSubtotal) || 0;
    const updatedDiscount = Number(editInvoiceDiscount) || 0;
    const updatedTax = Number(editInvoiceTax) || 0;

    const discountAmt = (updatedSubtotal * updatedDiscount) / 100;
    const afterDiscount = updatedSubtotal - discountAmt;
    const taxAmt = (afterDiscount * updatedTax) / 100;
    const calculatedTotal = Math.round(afterDiscount + taxAmt);
    const finalTotal = Number(editInvoiceTotal) > 0 ? Number(editInvoiceTotal) : calculatedTotal;
    const finalPaid = Number(editInvoicePaidAmount) || 0;

    let finalStatus: "Paid" | "Partially Paid" | "Unpaid" | "Pending" = editInvoiceStatus;
    if (finalPaid >= finalTotal && finalTotal > 0) {
      finalStatus = "Paid";
    } else if (finalPaid > 0 && finalPaid < finalTotal) {
      finalStatus = "Partially Paid";
    }

    const patRecord = patients.find(p => p.name === editInvoicePatientName || p.id === editInvoicePatientName);
    const dbPatId = patRecord ? (patRecord.uuid || patRecord.id) : undefined;

    const updateFields: any = {
      patient_name: editInvoicePatientName.trim(),
      doctor: editInvoiceDoctor.trim(),
      treatment: editInvoiceTreatment.trim(),
      subtotal: updatedSubtotal,
      discount: updatedDiscount,
      tax: updatedTax,
      total: finalTotal,
      paid_amount: finalPaid,
      status: finalStatus,
      payment_date: editInvoicePaymentDate.trim()
    };

    if (dbPatId) {
      updateFields.patient_id = dbPatId;
    }

    let query = supabase.from("billing").update(updateFields);

    if (invoiceUuid) {
      query = query.eq("id", invoiceUuid);
    } else {
      query = query.eq("invoice_id", invoiceId);
    }

    const { data: updatedDb, error: updateErr } = await query.select().single();

    setSavingInvoice(false);

    if (updateErr) {
      console.error("Failed to update billing record in database:", updateErr.message, updateErr.code);
      showToast("Failed to update billing record in database.", "error");
      return;
    }

    setInvoices(prev => prev.map(inv => {
      if ((invoiceUuid && inv.uuid === invoiceUuid) || inv.id === invoiceId) {
        return {
          ...inv,
          patientName: updatedDb?.patient_name || editInvoicePatientName.trim(),
          doctor: updatedDb?.doctor || editInvoiceDoctor.trim(),
          treatment: updatedDb?.treatment || editInvoiceTreatment.trim(),
          subtotal: updatedDb?.subtotal !== undefined ? Number(updatedDb.subtotal) : updatedSubtotal,
          discount: updatedDb?.discount !== undefined ? Number(updatedDb.discount) : updatedDiscount,
          tax: updatedDb?.tax !== undefined ? Number(updatedDb.tax) : updatedTax,
          total: updatedDb?.total !== undefined ? Number(updatedDb.total) : finalTotal,
          paidAmount: updatedDb?.paid_amount !== undefined ? Number(updatedDb.paid_amount) : finalPaid,
          status: updatedDb?.status || finalStatus,
          paymentDate: updatedDb?.payment_date || editInvoicePaymentDate.trim()
        };
      }
      return inv;
    }));

    setEditingInvoice(null);
    showToast(`Billing record ${invoiceId} updated successfully.`, "success");
  };
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [profileSubTab, setProfileSubTab] = useState("Case Sheet");

  // Form input states (Patient / Appt modals)
  const [newPatName, setNewPatName] = useState("");
  const [newPatPhone, setNewPatPhone] = useState("+91 ");
  const [newPatAge, setNewPatAge] = useState<string>("");
  const [newPatGender, setNewPatGender] = useState<"Male" | "Female">("Male");
  const [newPatAddress, setNewPatAddress] = useState("");
  const [newPatAllergies, setNewPatAllergies] = useState("None");

  const [apptPatientId, setApptPatientId] = useState("");
  const [apptDoctor, setApptDoctor] = useState("Dr. Deepa Kodali");
  const [apptTreatment, setApptTreatment] = useState("Consultation");
  const [apptTime, setApptTime] = useState("09:00 AM");
  const [apptDate, setApptDate] = useState("12 Aug 2026");
  const [apptNotes, setApptNotes] = useState("");

  // Consultation clinical workspace inputs
  const [consultNotes, setConsultNotes] = useState("");
  const [consultPrescription, setConsultPrescription] = useState("");
  const [consultSelectedTooth, setConsultSelectedTooth] = useState<number | null>(null);
  const [consultToothStatus, setConsultToothStatus] = useState("Decayed");
  const [consultChart, setConsultChart] = useState<Record<number, string>>({});
  const [consultUploadedXrays, setConsultUploadedXrays] = useState<FileAttachment[]>([]);

  // Billing collect payment splits
  const [payCash, setPayCash] = useState(0);
  const [payUpi, setPayUpi] = useState(0);
  const [payCard, setPayCard] = useState(0);
  const [payDiscountPercent, setPayDiscountPercent] = useState(0);
  const [payDiscountType, setPayDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [payDiscountValue, setPayDiscountValue] = useState(0);
  const [paymentCollectAmt, setPaymentCollectAmt] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [payTaxPercent, setPayTaxPercent] = useState(0);
  const [payCustomItems, setPayCustomItems] = useState<{ description: string; amount: number }[]>([]);
  const [newCustomDesc, setNewCustomDesc] = useState("");
  const [newCustomAmt, setNewCustomAmt] = useState(0);

  // Timeframe filter for reports page
  const [reportsFilter, setReportsFilter] = useState<string>("Today");
  const [customRangeModalOpen, setCustomRangeModalOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("2026-08-01");
  const [customEndDate, setCustomEndDate] = useState("2026-08-14");
  const [appliedCustomLabel, setAppliedCustomLabel] = useState<string | null>(null);
  const [patientsPeriod, setPatientsPeriod] = useState<"Today" | "This Week" | "This Month" | "Last Month" | "This Year" | "Custom Range">("This Month");

  // Redesigned dashboard state variables
  const getTodayLocalDateStr = (): string => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const dynamicTodayUiDate = convertToUiDate(getTodayLocalDateStr());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(dynamicTodayUiDate);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getMondayOfCurrentWeek());
  const [blockedSlots, setBlockedSlots] = useState<Record<string, boolean>>({});
  const [currentHeaderDate, setCurrentHeaderDate] = useState<string>("");

  useEffect(() => {
    const updateHeaderDate = () => {
      const d = new Date();
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      setCurrentHeaderDate(`${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`);
    };
    updateHeaderDate();
  }, []);

  // Add Patient quick panel inputs
  const [quickFirstName, setQuickFirstName] = useState("");
  const [quickLastName, setQuickLastName] = useState("");
  const [quickMobile, setQuickMobile] = useState("+91 ");
  const [quickGender, setQuickGender] = useState<"Male" | "Female">("Male");
  const [quickAge, setQuickAge] = useState<string>("");
  const [quickDOB, setQuickDOB] = useState("");
  const [quickLocation, setQuickLocation] = useState("Bengaluru");
  const [quickEmail, setQuickEmail] = useState("");
  const [quickAddress, setQuickAddress] = useState("");
  const [quickBloodGroup, setQuickBloodGroup] = useState("A+");
  const [quickPatientType, setQuickPatientType] = useState<"New" | "Returning">("New");
  const [quickNotes, setQuickNotes] = useState("");
  const [quickOccupation, setQuickOccupation] = useState("");
  const [quickReference, setQuickReference] = useState("");
  const [quickMedicalHistory, setQuickMedicalHistory] = useState<string[]>([]);
  const [quickMedicalHistoryOthers, setQuickMedicalHistoryOthers] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Recently Added Patient list states
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [patientFilterGender, setPatientFilterGender] = useState("All");
  const [patientSortBy, setPatientSortBy] = useState("Recent");
  const [patientVisibleCount, setPatientVisibleCount] = useState(7);

  // Redesigned Appointments Hub states
  const [apptView, setApptView] = useState<"Month" | "Week" | "Day">("Month");
  const [apptSearchQuery, setApptSearchQuery] = useState("");
  const [apptSelectedDoctor, setApptSelectedDoctor] = useState("All");
  const [apptSelectedLocation, setApptSelectedLocation] = useState("All");
  const [apptSelectedStatus, setApptSelectedStatus] = useState("All");
  const [apptSelectedTreatment, setApptSelectedTreatment] = useState("All");
  const [apptSelectedType, setApptSelectedType] = useState("All");
  const [apptCalendarDate, setApptCalendarDate] = useState<Date>(new Date());
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);

  // Calendar slot selection for detail modal
  const [selectedApptDetail, setSelectedApptDetail] = useState<Appointment | null>(null);
  const [selectedSlotData, setSelectedSlotData] = useState<{ date: string; time: string; appointment?: Appointment } | null>(null);

  // Slot booking form states
  const [slotPatientId, setSlotPatientId] = useState("");
  const [slotPatientDropdownOpen, setSlotPatientDropdownOpen] = useState(false);
  const [slotPatientSearchQuery, setSlotPatientSearchQuery] = useState("");
  const slotPatientDropdownRef = useRef<HTMLDivElement | null>(null);
  const goToDateRef = useRef<HTMLInputElement | null>(null);
  const [slotDoctor, setSlotDoctor] = useState("Dr. Deepa Kodali");
  const [slotTreatment, setSlotTreatment] = useState("Consultation");

  // Hover states for Month View cell popover
  const [hoveredApptDay, setHoveredApptDay] = useState<{
    dateStr: string;
    rect: { top: number; left: number; width: number; height: number };
    appointments: Appointment[];
    isPinned?: boolean;
  } | null>(null);
  const hoverTimeoutRef = useRef<any>(null);
  const hoveredApptDayRef = useRef(hoveredApptDay);

  useEffect(() => {
    hoveredApptDayRef.current = hoveredApptDay;
  }, [hoveredApptDay]);

  // Clinical Notes form states (integrated into Prescriptions)
  const [noteTitle, setNoteTitle] = useState("");
  const [noteCategory, setNoteCategory] = useState("General");
  const [noteContent, setNoteContent] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("Dr. Deepa Kodali");

  // Media Gallery states
  const [patientMedia, setPatientMedia] = useState<ClinicalMedia[]>([
    {
      id: "media-1",
      patientId: "DS-1001",
      name: "intraoral_photo_mehta.png",
      type: "image/png",
      category: "Clinical Photos",
      url: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=600&auto=format&fit=crop",
      uploadDate: "12 Aug 2026",
      uploadedBy: "Dr. Deepa Kodali",
      toothNumber: "16",
      treatment: "Root Canal Therapy",
      appointment: "12 Aug 2026 at 09:00 AM",
      prescription: "Amoxicillin 500mg"
    },
    {
      id: "media-2",
      patientId: "DS-1001",
      name: "patient_consent_recording.mp4",
      type: "video/mp4",
      category: "Consent Video Recordings",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      uploadDate: "10 Aug 2026",
      uploadedBy: "Dr. Deepa Kodali",
      treatment: "Consultation",
      appointment: "10 Aug 2026"
    }
  ]);
  const [mediaFilter, setMediaFilter] = useState("All");
  const [selectedMediaForPreview, setSelectedMediaForPreview] = useState<ClinicalMedia | null>(null);
  const [mediaToEdit, setMediaToEdit] = useState<ClinicalMedia | null>(null);
  const [selectedTreatmentDetail, setSelectedTreatmentDetail] = useState<TreatmentItem | null>(null);

  // Consent Video Recorder states
  const [recorderState, setRecorderState] = useState<"idle" | "recording" | "paused" | "review">("idle");
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWebcam = async (deviceId?: string) => {
    try {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
      }
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: true
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      webcamStreamRef.current = stream;
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setMicActive(true);

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === "videoinput");
      setAvailableCameras(videoInputs);
      if (!selectedCameraId && videoInputs.length > 0) {
        setSelectedCameraId(videoInputs[0].deviceId);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraActive(false);
      setMicActive(false);
    }
  };

  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
      webcamStreamRef.current = null;
    }
    setCameraActive(false);
    setMicActive(false);
  };

  const handleStartRecording = async () => {
    if (!webcamStreamRef.current) {
      await startWebcam(selectedCameraId);
    }
    if (!webcamStreamRef.current) {
      showToast("Camera or microphone permission denied.", "error");
      return;
    }

    recordedChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(webcamStreamRef.current, { mimeType: "video/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedVideoBlob(blob);
        setRecordedVideoUrl(url);
        setRecorderState("review");
        stopWebcam();
      };

      recorder.start(1000);
      setRecorderState("recording");
      setRecordingSeconds(0);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 89) {
            handleStopRecording();
            return 90;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("MediaRecorder start error:", err);
      showToast("Could not start video recorder in browser.", "error");
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setRecorderState("paused");
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setRecorderState("recording");
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 89) {
            handleStopRecording();
            return 90;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleStopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === "recording" || mediaRecorderRef.current.state === "paused")) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleRetakeRecording = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoBlob(null);
    setRecordedVideoUrl(null);
    setRecordingSeconds(0);
    setRecorderState("idle");
    startWebcam(selectedCameraId);
  };

  const handleSaveConsentRecording = async () => {
    if (recordingSeconds < 20) {
      showToast("Please record at least 20 seconds of patient consent.", "error");
      return;
    }
    const currentPat = patients.find(p => p.id === selectedPatientId);
    const docName = prescDoctor || (doctors[0]?.name || "Dr. Deepa Kodali");
    const durationStr = formatTimer(recordingSeconds);

    const newMedia: ClinicalMedia = {
      id: `media-consent-${Date.now()}`,
      patientId: selectedPatientId || "",
      name: `Consent_Video_${currentPat?.name.replace(/\s+/g, '_') || 'Patient'}_${durationStr.replace(':', 'm')}s.webm`,
      type: "video/webm",
      category: "Consent Video Recordings",
      url: recordedVideoUrl || "https://www.w3schools.com/html/mov_bbb.mp4",
      uploadDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      uploadedBy: docName,
      prescription: `Duration: ${durationStr}`
    };

    if (currentPat && selectedPatientId) {
      const updatedFiles = [...(currentPat.files || []), { name: newMedia.name, size: `${durationStr}`, type: newMedia.type }];
      const { error: fileErr } = await supabase
        .from("patients")
        .update({ files: updatedFiles })
        .eq("patient_id", selectedPatientId);

      if (fileErr) {
        showToast("Failed to save consent recording metadata to database.", "error");
        return;
      }
      setPatients(prev => prev.map(p => p.id === selectedPatientId ? { ...p, files: updatedFiles } : p));
    }

    setPatientMedia(prev => [newMedia, ...prev]);
    showToast(`Patient consent video (${durationStr}) saved to clinical records.`, "success");
    setRecorderState("idle");
    setRecordedVideoBlob(null);
    setRecordedVideoUrl(null);
    setRecordingSeconds(0);
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Edit/Rename media form fields
  const [editMediaName, setEditMediaName] = useState("");
  const [editMediaCategory, setEditMediaCategory] = useState("Clinical Photos");
  const [editMediaTooth, setEditMediaTooth] = useState("");
  const [editMediaTreatment, setEditMediaTreatment] = useState("");
  const [editMediaAppointment, setEditMediaAppointment] = useState("");
  const [editMediaPrescription, setEditMediaPrescription] = useState("");
  const [editMediaUploadedBy, setEditMediaUploadedBy] = useState("Dr. Deepa Kodali");

  useEffect(() => {
    if (mediaToEdit) {
      setEditMediaName(mediaToEdit.name);
      setEditMediaCategory(mediaToEdit.category);
      setEditMediaTooth(mediaToEdit.toothNumber || "");
      setEditMediaTreatment(mediaToEdit.treatment || "");
      setEditMediaAppointment(mediaToEdit.appointment || "");
      setEditMediaPrescription(mediaToEdit.prescription || "");
      setEditMediaUploadedBy(mediaToEdit.uploadedBy);
    }
  }, [mediaToEdit]);

  const handleSaveMediaMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaToEdit) return;
    if (!editMediaName.trim()) {
      showToast("File name cannot be empty.", "error");
      return;
    }
    setPatientMedia(prev => prev.map(m => {
      if (m.id === mediaToEdit.id) {
        return {
          ...m,
          name: editMediaName.trim(),
          category: editMediaCategory as any,
          toothNumber: editMediaTooth.trim() || undefined,
          treatment: editMediaTreatment.trim() || undefined,
          appointment: editMediaAppointment.trim() || undefined,
          prescription: editMediaPrescription.trim() || undefined,
          uploadedBy: editMediaUploadedBy
        };
      }
      return m;
    }));
    setMediaToEdit(null);
    showToast("Clinical media file updated.", "success");
  };

  const handleMockMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    const currentPat = patients.find(p => p.id === selectedPatientId);

    const newMediaItems: ClinicalMedia[] = filesArray.map((file, idx) => {
      const isVideo = file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".mov") || file.name.endsWith(".avi");
      const cat: "Clinical Photos" | "Consent Video Recordings" = isVideo ? "Consent Video Recordings" : "Clinical Photos";

      return {
        id: `media-${Date.now()}-${idx}`,
        patientId: selectedPatientId || "",
        name: file.name,
        type: isVideo ? (file.type || "video/mp4") : (file.type || "image/png"),
        category: cat,
        url: isVideo
          ? "https://www.w3schools.com/html/mov_bbb.mp4"
          : "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=600&auto=format&fit=crop",
        uploadDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        uploadedBy: prescDoctor || (doctors[0]?.name || "Dr. Deepa Kodali")
      };
    });

    if (currentPat && selectedPatientId) {
      const newFiles = filesArray.map(f => ({ name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`, type: f.type }));
      const updatedFiles = [...(currentPat.files || []), ...newFiles];
      const { error: fileErr } = await supabase
        .from("patients")
        .update({ files: updatedFiles })
        .eq("patient_id", selectedPatientId);

      if (fileErr) {
        showToast("Failed to save uploaded files metadata to database.", "error");
        return;
      }
      setPatients(prev => prev.map(p => p.id === selectedPatientId ? { ...p, files: updatedFiles } : p));
    }

    setPatientMedia(prev => [...newMediaItems, ...prev]);
    showToast(`${filesArray.length} clinical media files uploaded.`, "success");
  };

  useEffect(() => {
    function handleDropdownClickOutside(event: MouseEvent) {
      if (
        slotPatientDropdownRef.current &&
        !slotPatientDropdownRef.current.contains(event.target as Node)
      ) {
        setSlotPatientDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleDropdownClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleDropdownClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedSlotData) {
      setSlotPatientSearchQuery("");
      setSlotPatientDropdownOpen(false);
    }
  }, [selectedSlotData]);

  const handleCellClick = (e: React.MouseEvent<HTMLElement>, dateStr: string, appointments: Appointment[]) => {
    e.stopPropagation();
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredApptDay({
      dateStr,
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      },
      appointments,
      isPinned: true
    });
  };

  const handleCellMouseEnter = (rect: DOMRect, dateStr: string, appointments: Appointment[]) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredApptDay(prev => {
      if (prev && prev.isPinned && prev.dateStr === dateStr) {
        return prev;
      }
      return {
        dateStr,
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        },
        appointments,
        isPinned: false
      };
    });
  };

  const handleCellMouseLeave = () => {
    if (hoveredApptDayRef.current?.isPinned || (typeof window !== "undefined" && window.innerWidth < 640)) {
      return;
    }
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      if (!hoveredApptDayRef.current?.isPinned) {
        setHoveredApptDay(null);
      }
    }, 200);
  };

  const handlePopoverMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handlePopoverMouseLeave = () => {
    if (hoveredApptDayRef.current?.isPinned || (typeof window !== "undefined" && window.innerWidth < 640)) {
      return;
    }
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      if (!hoveredApptDayRef.current?.isPinned) {
        setHoveredApptDay(null);
      }
    }, 200);
  };

  // --- BOOKED CALENDAR SLOT HOVER POPOVER STATE ---
  interface HoveredSlotPopover {
    appointment: Appointment;
    rect: { top: number; left: number; width: number; height: number };
  }

  const [hoveredSlotPopover, setHoveredSlotPopover] = useState<HoveredSlotPopover | null>(null);
  const slotHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSlotMouseEnter = (rect: DOMRect, appt: Appointment) => {
    if (slotHoverTimeoutRef.current) {
      clearTimeout(slotHoverTimeoutRef.current);
      slotHoverTimeoutRef.current = null;
    }
    setHoveredSlotPopover({
      appointment: appt,
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      }
    });
  };

  const handleSlotMouseLeave = () => {
    if (slotHoverTimeoutRef.current) clearTimeout(slotHoverTimeoutRef.current);
    slotHoverTimeoutRef.current = setTimeout(() => {
      setHoveredSlotPopover(null);
    }, 200);
  };

  // Custom toast notifications and directory queries
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [patientsDirectoryQuery, setPatientsDirectoryQuery] = useState("");

  // --- PATIENT PROFILE FORM EDIT STATES ---
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editMobile, setEditMobile] = useState("+91 ");
  const [editEmail, setEditEmail] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editAge, setEditAge] = useState(0);
  const [editGender, setEditGender] = useState<"Male" | "Female">("Male");
  const [editBloodGroup, setEditBloodGroup] = useState("");
  const [editOccupation, setEditOccupation] = useState("");
  const [editAddressLine, setEditAddressLine] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [editAllergies, setEditAllergies] = useState("");
  const [editMedicalConditions, setEditMedicalConditions] = useState("");
  const [editCurrentMedications, setEditCurrentMedications] = useState("");
  const [editEmergencyContactName, setEditEmergencyContactName] = useState("");
  const [editEmergencyContactPhone, setEditEmergencyContactPhone] = useState("+91 ");
  const [editFirstVisit, setEditFirstVisit] = useState("");
  const [editLastVisit, setEditLastVisit] = useState("");
  const [editPreferredDentist, setEditPreferredDentist] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isEditingCaseSheet, setIsEditingCaseSheet] = useState(false);
  const [editAgeStr, setEditAgeStr] = useState<string>("");
  const [editRefDoctor, setEditRefDoctor] = useState("");
  const [editMedicalHistoryConditions, setEditMedicalHistoryConditions] = useState<string[]>([]);
  const [editMedicalHistoryOthers, setEditMedicalHistoryOthers] = useState("");
  const [editChiefComplaint, setEditChiefComplaint] = useState("");
  const [editIntraOralExam, setEditIntraOralExam] = useState("");
  const [editProvisionalDiagnosis, setEditProvisionalDiagnosis] = useState("");
  const [editTreatmentAdvised, setEditTreatmentAdvised] = useState("");

  // --- TOOTH TREATMENT FORM STATE ---
  const [chartSelectedTooth, setChartSelectedTooth] = useState<number | null>(null);
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [activeTreatment, setActiveTreatment] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [chartTreatmentName, setChartTreatmentName] = useState("");
  const [chartDiagnosis, setChartDiagnosis] = useState("");
  const [chartStatus, setChartStatus] = useState<"Planned" | "In Progress" | "Completed">("Planned");
  const [chartDoctor, setChartDoctor] = useState("");
  const [chartDate, setChartDate] = useState("");
  const [chartCost, setChartCost] = useState("");
  const [chartNotes, setChartNotes] = useState("");

  // --- TREATMENTS FORM STATE ---
  const [showAddTreatmentModal, setShowAddTreatmentModal] = useState(false);
  const [newTrName, setNewTrName] = useState("");
  const [newTrTooth, setNewTrTooth] = useState("");
  const [newTrDoctor, setNewTrDoctor] = useState("");
  const [newTrCost, setNewTrCost] = useState("");
  const [newTrDiagnosis, setNewTrDiagnosis] = useState("");
  const [newTrNotes, setNewTrNotes] = useState("");
  const [newTrStatus, setNewTrStatus] = useState<"Planned" | "In Progress" | "Completed">("Planned");
  const [newTrApptLink, setNewTrApptLink] = useState("");

  // --- APPOINTMENTS FORM STATES ---
  const [showAddApptForm, setShowAddApptForm] = useState(false);
  const [patApptDoctor, setPatApptDoctor] = useState("");
  const [patApptTreatment, setPatApptTreatment] = useState("");
  const [patApptDate, setPatApptDate] = useState("");
  const [patApptTime, setPatApptTime] = useState("");
  const [patApptNotes, setPatApptNotes] = useState("");

  const [reschedulingApptId, setReschedulingApptId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const [rescheduleModalAppt, setRescheduleModalAppt] = useState<Appointment | null>(null);
  const [reschedulePickerDate, setReschedulePickerDate] = useState("");
  const [reschedulePickerTime, setReschedulePickerTime] = useState("");
  const [rescheduleHour, setRescheduleHour] = useState("09");
  const [rescheduleMinute, setRescheduleMinute] = useState("30");
  const [rescheduleAmPm, setRescheduleAmPm] = useState("AM");

  const parseTimeString = (timeStr: string) => {
    if (!timeStr) return { hour: "09", minute: "30", ampm: "AM" };
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      return {
        hour: match[1].padStart(2, "0"),
        minute: match[2],
        ampm: match[3].toUpperCase(),
      };
    }
    return { hour: "09", minute: "30", ampm: "AM" };
  };

  // --- PRESCRIPTION BUILDER STATES ---
  const [prescDoctor, setPrescDoctor] = useState("");
  const [prescDate, setPrescDate] = useState("");
  const [prescDiagnosis, setPrescDiagnosis] = useState("");
  const [prescAdvice, setPrescAdvice] = useState("");
  const [prescMeds, setPrescMeds] = useState<{ name: string; dosage: string; freq: string; duration: string; instructions: string }[]>([
    { name: "", dosage: "", freq: "", duration: "", instructions: "" }
  ]);

  // --- INVOICE FORM STATES ---
  const [invProcedure, setInvProcedure] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invDiscount, setInvDiscount] = useState("0");
  const [invTax, setInvTax] = useState("0");
  const [invPaid, setInvPaid] = useState("0");

  const getPatientBalance = (patientId: string): number => {
    const patInvoices = invoices.filter(inv => inv.patientId === patientId || inv.patientName === patientId);
    return patInvoices.reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0);
  };

  const checkAppointmentConflict = (
    doctorId: string | null,
    date: string,
    time: string,
    excludeApptId?: string
  ): { hasConflict: boolean; reason: string } => {
    const normTime = normalizeTimeSlot(time);
    const dbDate = convertToDbDate(date);

    // 1. Check if the slot is blocked
    const isBlocked = blockedSlotsList.some(block => {
      const blockDate = convertToDbDate(convertToUiDate(block.blocked_date));
      const blockTime = normalizeTimeSlot(block.time_slot);
      return blockDate === dbDate &&
             blockTime === normTime &&
             (block.doctor_id === null || block.doctor_id === doctorId);
    });

    if (isBlocked) {
      return { hasConflict: true, reason: "The selected appointment slot is blocked." };
    }

    // 2. Check doctor assignment
    if (!doctorId) {
      return { hasConflict: false, reason: "" };
    }

    // 3. Check doctor appointment conflict
    const conflictingAppt = appointments.find(a => {
      if (excludeApptId && a.id === excludeApptId) return false;
      if (a.status === "Cancelled" || a.status === "Completed") return false;
      const apptDbDate = convertToDbDate(a.date);
      const apptDoctorMatch = a.doctor === doctorId || doctors.find(d => d.name === a.doctor)?.id === doctorId;
      return apptDbDate === dbDate && normalizeTimeSlot(a.time) === normTime && apptDoctorMatch;
    });

    if (conflictingAppt) {
      return { hasConflict: true, reason: `Doctor already has an active appointment with ${conflictingAppt.patientName} at ${normTime}.` };
    }

    return { hasConflict: false, reason: "" };
  };
  const [invMode, setInvMode] = useState("UPI GPay");

  // --- FILES UPLOAD FORM STATE ---
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState("X-Ray Scan");
  const [newFileUploadedBy, setNewFileUploadedBy] = useState("");



  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // --- MOCK DATABASE DATABASE STATES ---

  const [patients, setPatients] = useState<Patient[]>([]);

  const MOCK_APPOINTMENTS: Appointment[] = [
    { id: "appt-1", patientId: "DS-1001", patientName: "Aarav Mehta", doctor: "Dr. Deepa Kodali", treatment: "Root Canal", time: "09:00 AM", date: "12 Aug 2026", status: "Scheduled", notes: "Lower left molar treatment.", avatarColor: "bg-blue-100 text-blue-600" },
    { id: "appt-2", patientId: "DS-1002", patientName: "Priya Patel", doctor: "Dr. Raghuram", treatment: "Scaling", time: "09:30 AM", date: "12 Aug 2026", status: "Scheduled", notes: "Routine scale and polish.", avatarColor: "bg-cyan-100 text-cyan-600" },
    { id: "appt-3", patientId: "DS-1003", patientName: "Kabir Singh", doctor: "Dr. Deepa Kodali", treatment: "Root Canal", time: "10:00 AM", date: "12 Aug 2026", status: "Scheduled", notes: "Penicillin allergy precaution.", avatarColor: "bg-purple-100 text-purple-600" },
    { id: "appt-4", patientId: "DS-1004", patientName: "Ananya Rao", doctor: "Dr. Srinivasa", treatment: "Implant", time: "10:30 AM", date: "12 Aug 2026", status: "Scheduled", notes: "Surgical post review.", avatarColor: "bg-emerald-100 text-emerald-600" },
    { id: "appt-5", patientId: "DS-1005", patientName: "Rohan Kumar", doctor: "Dr. Priyanka Mane Pado", treatment: "Crown", time: "11:00 AM", date: "12 Aug 2026", status: "Scheduled", notes: "Crown margins assessment.", avatarColor: "bg-indigo-100 text-indigo-600" }
  ];

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedSlotsList, setBlockedSlotsList] = useState<any[]>([]);

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [staffList, setStaffList] = useState<Staff[]>([
    { id: "st-1", name: "Sneha Rao", role: "Senior Nurse / Hygienist", phone: "+91 98765 11223", status: "Active" },
    { id: "st-2", name: "Amit Kumar", role: "Desk Operations & Billing", phone: "+91 98765 44556", status: "Active" }
  ]);

  const [clinicName, setClinicName] = useState(clinicConfig.shortName || clinicConfig.name);
  const [receptionistUser, setReceptionistUser] = useState("Anjali");
  const [clinicAddress, setClinicAddress] = useState(clinicConfig.contact.address.full);

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupHistory, setBackupHistory] = useState<BackupHistoryItem[]>([]);

  const fetchBackupHistory = React.useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("backup_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const formattedItems: BackupHistoryItem[] = data.map((row: any) => {
          const d = new Date(row.created_at);
          const dateStr = d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
          const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          let formattedSize = "--";
          if (row.backup_size !== null && row.backup_size !== undefined && row.backup_size !== "") {
            const bytes = Number(row.backup_size);
            if (!isNaN(bytes) && bytes > 0) {
              const oneMB = 1024 * 1024;
              if (bytes < oneMB) {
                formattedSize = `${(bytes / 1024).toFixed(2)} KB`;
              } else {
                formattedSize = `${(bytes / oneMB).toFixed(2)} MB`;
              }
            }
          }

          const statusStr = row.status
            ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
            : "Triggered";

          return {
            id: row.id,
            date: dateStr,
            time: timeStr,
            size: formattedSize,
            status: statusStr,
          };
        });

        setBackupHistory(formattedItems);
      }
    } catch (err) {
      console.error("Error fetching backup history:", err);
    }
  }, []);

  useEffect(() => {
    fetchBackupHistory();
  }, [fetchBackupHistory]);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("clinic_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.clinicName) setClinicName(parsed.clinicName);
        if (parsed.receptionistUser) setReceptionistUser(parsed.receptionistUser);
        if (parsed.clinicAddress) setClinicAddress(parsed.clinicAddress);
      }
    } catch (e) {}
  }, []);

  // Doctor & Staff Modal states
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deleteDoctorConfirm, setDeleteDoctorConfirm] = useState<Doctor | null>(null);

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deleteStaffConfirm, setDeleteStaffConfirm] = useState<Staff | null>(null);

  // Form states for adding/editing doctor
  const [docFormName, setDocFormName] = useState("");
  const [docFormSpeciality, setDocFormSpeciality] = useState("General Dentist");
  const [docFormPhone, setDocFormPhone] = useState("+91 ");
  const [docFormStatus, setDocFormStatus] = useState<"Available" | "In Consultation" | "On Break" | "Finished Today">("Available");

  // Form states for adding/editing staff
  const [staffFormName, setStaffFormName] = useState("");
  const [staffFormEmail, setStaffFormEmail] = useState("");
  const [staffFormRole, setStaffFormRole] = useState("Desk Operations");
  const [staffFormPhone, setStaffFormPhone] = useState("+91 ");
  const [staffFormStatus, setStaffFormStatus] = useState<"Active" | "Inactive" | "On Leave">("Active");
  const [createdCredentials, setCreatedCredentials] = useState<{ name: string; email: string; pass: string } | null>(null);

  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: "act-1", type: "Register", msg: "Apex Dental database initialized with 15 intake files.", time: "1 hour ago" },
    { id: "act-2", type: "Appointment", msg: "Aarav Mehta scheduled for Root Canal at 09:00 AM.", time: "45 mins ago" }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, msg: "Follow-up due tomorrow for Priya Patel.", unread: true },
    { id: 2, msg: "Stock Alert: Lidocaine cartridge stock is below 15%.", unread: false }
  ]);

  const [treatments, setTreatments] = useState<TreatmentItem[]>([]);

  // --- PATIENT PROFILE FORM SYNC & HANDLERS ---
  useEffect(() => {
    if (selectedPatientId) {
      const p = patients.find(pat => pat.id === selectedPatientId);
      if (p) {
        const names = p.name.split(" ");
        setEditFirstName(p.firstName || names[0] || "");
        setEditLastName(p.lastName || names.slice(1).join(" ") || "");
        setEditMobile(formatPhoneInput(p.phone || ""));
        setEditEmail(p.email || "");
        setEditDob(p.dob || "");
        setEditAge(p.age || 0);
        setEditGender(p.gender || "Male");
        setEditBloodGroup(p.bloodGroup || "");
        setEditOccupation(p.occupation || "");
        setEditRefDoctor(p.reference || p.preferredDentist || "");

        const addrParts = p.address ? p.address.split(",") : [];
        setEditAddressLine(p.addressLine || addrParts[0]?.trim() || p.address || "");
        setEditCity(p.city || addrParts[1]?.trim() || "");
        setEditState(p.state || addrParts[2]?.split("-")[0]?.trim() || "");
        setEditPincode(p.pincode || addrParts[2]?.split("-")[1]?.trim() || "");

        setEditAllergies(p.allergies || "");
        setEditMedicalConditions(p.medicalConditions || "");
        setEditCurrentMedications(p.currentMedications || "");
        setEditEmergencyContactName(p.emergencyContactName || "");
        setEditEmergencyContactPhone(p.emergencyContactPhone ? formatPhoneInput(p.emergencyContactPhone) : "+91 ");
        setEditFirstVisit(p.firstVisit || p.visit || "");
        setEditLastVisit(p.visit || "");
        setEditPreferredDentist(p.preferredDentist || "");
        setEditNotes(p.notes?.join("\n") || "");

        // Medical History conditions checkboxes
        if (p.medicalHistory && p.medicalHistory.length > 0) {
          setEditMedicalHistoryConditions(p.medicalHistory);
          setEditMedicalHistoryOthers(p.medicalHistoryOthers || "");
        } else {
          const medNotesStr = (p.medicalConditions || p.medicalNotes || "").toLowerCase();
          const initialConds: string[] = [];
          if (medNotesStr.includes("diabetes")) initialConds.push("Diabetes");
          if (medNotesStr.includes("b.p.") || medNotesStr.includes("bp") || medNotesStr.includes("hypertension")) initialConds.push("B.P.");
          if (medNotesStr.includes("heart")) initialConds.push("Heart Complaint");
          if (medNotesStr.includes("allergies") || (p.allergies && p.allergies !== "None")) initialConds.push("Allergies");
          if (medNotesStr.includes("bleeding")) initialConds.push("Bleeding Disorders");
          if (medNotesStr.includes("pregnancy")) initialConds.push("Pregnancy");
          if (medNotesStr.includes("thyroid")) initialConds.push("Thyroid");
          setEditMedicalHistoryConditions(initialConds);
          setEditMedicalHistoryOthers("");
        }

        // Clinical Case Details (CC, IOE, PD from p.notes)
        let cc = "";
        let io = "";
        let pd = "";

        if (p.notes && Array.isArray(p.notes)) {
          p.notes.forEach(n => {
            if (n.startsWith("CC:")) cc = n.replace("CC:", "").trim();
            else if (n.startsWith("IOE:")) io = n.replace("IOE:", "").trim();
            else if (n.startsWith("PD:")) pd = n.replace("PD:", "").trim();
          });
        }
        setEditChiefComplaint(cc);
        setEditIntraOralExam(io);
        setEditProvisionalDiagnosis(pd);

        // Treatment Advised synchronized from Dental Chart (or fallback to Treatments module)
        const chartAdvised = formatTreatmentAdvisedFromChart(p.dentalChart);
        if (chartAdvised) {
          setEditTreatmentAdvised(chartAdvised);
        } else {
          const patTreatments = treatments.filter(t => t.patient === p.name);
          const taLines: string[] = [];
          if (patTreatments.length > 0) {
            patTreatments.forEach(t => {
              const toothInfo = t.tooth ? ` — Tooth #${t.tooth}` : "";
              taLines.push(`${t.name}${toothInfo}`);
            });
          }
          setEditTreatmentAdvised(taLines.join("\n"));
        }
      }
    }
  }, [selectedPatientId, patients, treatments]);

  const handleDobChange = (dobStr: string) => {
    setEditDob(dobStr);
    if (dobStr) {
      const birthDate = new Date(dobStr);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setEditAge(calculatedAge >= 0 ? calculatedAge : 0);
    }
  };

  const handleSavePatientProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFirstName.trim() || !editMobile.trim()) {
      showToast("First name and mobile number are required.", "error");
      return;
    }
    if (!validate10DigitPhone(editMobile)) {
      showToast("Mobile number must contain exactly 10 digits after +91.", "error");
      return;
    }
    if (editEmergencyContactPhone && editEmergencyContactPhone.trim() !== "" && editEmergencyContactPhone.trim() !== "+91" && !validate10DigitPhone(editEmergencyContactPhone)) {
      showToast("Emergency contact phone number must contain exactly 10 digits after +91.", "error");
      return;
    }

    const fullName = `${editFirstName.trim()} ${editLastName.trim()}`.trim();
    const fullAddress = editAddressLine.trim() ? `${editAddressLine.trim()}${editCity ? ', ' + editCity.trim() : ''}${editState ? ', ' + editState.trim() : ''}${editPincode ? ' - ' + editPincode.trim() : ''}` : editAddressLine;

    // Save medical history
    const selectedCondsStr = editMedicalHistoryConditions.join(", ");
    const fullMedConds = editMedicalHistoryOthers ? `${selectedCondsStr}${selectedCondsStr ? ', ' : ''}Others: ${editMedicalHistoryOthers}` : selectedCondsStr;

    const mergedMedicalNotes = [
      editAllergies ? `Allergies: ${editAllergies}` : "",
      fullMedConds ? `Conditions: ${fullMedConds}` : "",
      editCurrentMedications ? `Meds: ${editCurrentMedications}` : ""
    ].filter(Boolean).join(" | ") || "None";

    // Build clinical case notes array (Chief Complaint, Intra Oral Exam, Provisional Diagnosis)
    const clinicalNotes: string[] = [];
    if (editChiefComplaint.trim()) clinicalNotes.push(`CC: ${editChiefComplaint.trim()}`);
    if (editIntraOralExam.trim()) clinicalNotes.push(`IOE: ${editIntraOralExam.trim()}`);
    if (editProvisionalDiagnosis.trim()) clinicalNotes.push(`PD: ${editProvisionalDiagnosis.trim()}`);
    if (editNotes && editNotes.trim()) {
      editNotes.split("\n").filter(n => !n.startsWith("CC:") && !n.startsWith("IOE:") && !n.startsWith("PD:") && !n.startsWith("TA:") && n.trim()).forEach(n => clinicalNotes.push(n.trim()));
    }

    const oldPatientItem = patients.find(p => p.id === selectedPatientId);

    const { error } = await supabase
      .from("patients")
      .update({
        name: fullName,
        phone: editMobile.trim(),
        age: editAge,
        gender: editGender,
        address: fullAddress,
        medical_notes: mergedMedicalNotes,
        email: editEmail.trim() || null,
        blood_group: editBloodGroup.trim() || null,
        notes: clinicalNotes,
        occupation: editOccupation.trim() || null,
        reference: editRefDoctor.trim() || null,
        medical_history: editMedicalHistoryConditions,
        medical_history_others: editMedicalHistoryOthers.trim() || null
      })
      .eq("patient_id", selectedPatientId);

    if (error) {
      console.error("Patient profile update failed:", error.message, error.code);
      showToast("Failed to update patient profile in database.", "error");
      return;
    }

    // Save Treatment Advised directly to Treatments module data source
    const patTreatments = treatments.filter(t => t.patient === fullName || t.patient === oldPatientItem?.name);
    if (patTreatments.length > 0) {
      const primaryTreat = patTreatments[0];
      const { error: treatUpdateErr } = await supabase
        .from("treatments")
        .update({
          notes: editTreatmentAdvised.trim(),
          name: editTreatmentAdvised.trim().split("\n")[0]?.replace(/^[•\-\*\s]+/, "").split("—")[0]?.trim() || primaryTreat.name
        })
        .eq("id", primaryTreat.id);

      if (!treatUpdateErr) {
        setTreatments(prev => prev.map(tr => tr.id === primaryTreat.id ? {
          ...tr,
          notes: editTreatmentAdvised.trim(),
          name: editTreatmentAdvised.trim().split("\n")[0]?.replace(/^[•\-\*\s]+/, "").split("—")[0]?.trim() || tr.name
        } : tr));
      }
    } else if (editTreatmentAdvised.trim()) {
      const dbInsertRow = {
        patient_id: oldPatientItem?.uuid || selectedPatientId,
        name: editTreatmentAdvised.trim().split("\n")[0]?.replace(/^[•\-\*\s]+/, "").split("—")[0]?.trim() || "Consultation & Treatment Plan",
        stage: "Planned",
        notes: editTreatmentAdvised.trim()
      };
      const { data: insertedTreat, error: treatInsErr } = await supabase
        .from("treatments")
        .insert(dbInsertRow)
        .select()
        .single();

      if (insertedTreat && !treatInsErr) {
        const newTreatObj: TreatmentItem = {
          id: insertedTreat.id,
          name: insertedTreat.name,
          patient: fullName,
          doctor: editPreferredDentist || "Dr. Deepa Kodali",
          stage: "Planned",
          notes: editTreatmentAdvised.trim(),
          nextVisit: "",
          prescription: "",
          date: new Date().toISOString().split("T")[0]
        };
        setTreatments(prev => [...prev, newTreatObj]);
      }
    }

    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          name: fullName,
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
          phone: editMobile.trim(),
          email: editEmail.trim(),
          dob: editDob,
          age: editAge,
          gender: editGender,
          bloodGroup: editBloodGroup.trim(),
          occupation: editOccupation.trim(),
          address: fullAddress,
          addressLine: editAddressLine.trim(),
          city: editCity.trim(),
          state: editState.trim(),
          pincode: editPincode.trim(),
          allergies: editAllergies.trim(),
          medicalConditions: editMedicalConditions.trim(),
          currentMedications: editCurrentMedications.trim(),
          emergencyContactName: editEmergencyContactName.trim(),
          emergencyContactPhone: editEmergencyContactPhone.trim(),
          firstVisit: editFirstVisit,
          visit: editLastVisit || p.visit,
          preferredDentist: editPreferredDentist,
          reference: editRefDoctor.trim(),
          medicalHistory: editMedicalHistoryConditions,
          medicalHistoryOthers: editMedicalHistoryOthers.trim(),
          medicalNotes: mergedMedicalNotes,
          notes: clinicalNotes
        };
      }
      return p;
    }));

    // Update patient name in appointments, invoices, treatments, etc.
    if (oldPatientItem && oldPatientItem.name !== fullName) {
      setAppointments(prev => prev.map(a => a.patientId === selectedPatientId ? { ...a, patientName: fullName } : a));
      setInvoices(prev => prev.map(inv => inv.patientId === selectedPatientId ? { ...inv, patientName: fullName } : inv));
      setTreatments(prev => prev.map(tr => tr.patient === oldPatientItem.name ? { ...tr, patient: fullName } : tr));
    }

    setIsEditingCaseSheet(false);
    showToast("Patient case sheet updated successfully.", "success");
  };

  const handleChartToothSelect = async (toothIndex: number) => {
    if (activeTreatment) {
      const patientItem = patients.find(p => p.id === selectedPatientId);
      if (!patientItem) return;

      const currentChart = { ...(patientItem.dentalChart || {}) };
      const rawVal = currentChart[toothIndex];
      const existingList = parseToothTreatments(rawVal);
      const toothObj = ALL_TEETH.find(t => t.index === toothIndex);
      const fdi = toothObj?.fdi || toothIndex;

      const activeItemStr = `${activeTreatment} (Planned)`;
      const existingIdx = existingList.findIndex(t => t.toLowerCase().startsWith(activeTreatment.toLowerCase()));

      let newList: string[];
      if (existingIdx !== -1) {
        newList = existingList.filter((_, i) => i !== existingIdx);
        showToast(`Removed ${activeTreatment} from Tooth #${fdi}.`, "success");
      } else {
        newList = [...existingList, activeItemStr];
        showToast(`Added ${activeTreatment} to Tooth #${fdi}.`, "success");
      }

      let updatedChart: Record<number, string>;
      if (newList.length === 0) {
        updatedChart = { ...currentChart };
        delete updatedChart[toothIndex];
      } else {
        updatedChart = {
          ...currentChart,
          [toothIndex]: newList.join(" | ")
        };
      }

      // Persist to Supabase
      const { error: patChartErr } = await supabase
        .from("patients")
        .update({ dental_chart: updatedChart })
        .eq("patient_id", selectedPatientId);

      if (patChartErr) {
        console.error("Failed to update dental chart in database:", patChartErr.message);
        showToast("Failed to save tooth treatment to database.", "error");
        return;
      }

      // Update state immediately
      setPatients(prev => prev.map(p => {
        if (p.id === selectedPatientId) {
          return {
            ...p,
            dentalChart: updatedChart
          };
        }
        return p;
      }));
      setEditTreatmentAdvised(formatTreatmentAdvisedFromChart(updatedChart));
      return;
    }

    setChartSelectedTooth(toothIndex);
    if (!chartDoctor && doctors.length > 0) {
      setChartDoctor(doctors[0].name);
    }
    if (!chartDate) {
      setChartDate(new Date().toISOString().split("T")[0]);
    }
  };

  const handleSelectAllTeeth = async (treatmentName: "Scaling" | "Braces") => {
    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) return;

    const currentChart = { ...(patientItem.dentalChart || {}) };
    const targetItemStr = `${treatmentName} (Planned)`;

    ALL_TEETH.forEach(tooth => {
      const rawVal = currentChart[tooth.index];
      const existingList = parseToothTreatments(rawVal);
      const hasTreatment = existingList.some(t => t.toLowerCase().startsWith(treatmentName.toLowerCase()));

      if (!hasTreatment) {
        const newList = [...existingList, targetItemStr];
        currentChart[tooth.index] = newList.join(" | ");
      }
    });

    const { error: patChartErr } = await supabase
      .from("patients")
      .update({ dental_chart: currentChart })
      .eq("patient_id", selectedPatientId);

    if (patChartErr) {
      console.error("Failed to update dental chart in database:", patChartErr.message);
      showToast(`Failed to save ${treatmentName} for all teeth to database.`, "error");
      return;
    }

    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          dentalChart: currentChart
        };
      }
      return p;
    }));
    setEditTreatmentAdvised(formatTreatmentAdvisedFromChart(currentChart));

    setActiveTreatment(treatmentName);
    showToast(`Added ${treatmentName} to all 32 teeth.`, "success");
  };

  const handleClearAllTeeth = async () => {
    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) return;

    const { error: patChartErr } = await supabase
      .from("patients")
      .update({ dental_chart: {} })
      .eq("patient_id", selectedPatientId);

    if (patChartErr) {
      console.error("Failed to clear dental chart in database:", patChartErr.message);
      showToast("Failed to clear dental chart in database.", "error");
      return;
    }

    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          dentalChart: {}
        };
      }
      return p;
    }));
    setEditTreatmentAdvised("");

    setShowClearAllConfirm(false);
    setActiveTreatment(null);
    showToast("All dental chart treatment assignments cleared.", "success");
  };

  const handleSaveToothTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chartTreatmentName.trim()) {
      showToast("Treatment name is required.", "error");
      return;
    }
    if (!chartSelectedTooth) return;

    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) return;

    const toothObj = ALL_TEETH.find(t => t.index === chartSelectedTooth);
    const toothDisplay = toothObj ? `#${toothObj.fdi}` : `#${chartSelectedTooth}`;

    const updatedChart = {
      ...(patientItem.dentalChart || {}),
      [chartSelectedTooth]: `${chartTreatmentName.trim()} (${chartStatus})`
    };

    const { error: patChartErr } = await supabase
      .from("patients")
      .update({ dental_chart: updatedChart })
      .eq("patient_id", selectedPatientId);

    if (patChartErr) {
      showToast("Failed to save tooth treatment to database.", "error");
      return;
    }

    // Resolve patient database UUID
    let patientUuid = patientItem.uuid;
    if (!patientUuid) {
      const { data: dbPat } = await supabase
        .from("patients")
        .select("id")
        .eq("patient_id", selectedPatientId)
        .maybeSingle();
      if (dbPat) {
        patientUuid = dbPat.id;
      }
    }

    if (!patientUuid) {
      showToast("Failed to resolve patient database record.", "error");
      return;
    }

    // Resolve doctor database UUID
    const doctorObj = doctors.find(d => d.name === chartDoctor);
    const doctorUuid = doctorObj?.id || null;

    const dbInsertRow = {
      patient_id: patientUuid,
      doctor_id: doctorUuid,
      name: chartTreatmentName.trim(),
      stage: chartStatus,
      tooth_number: chartSelectedTooth,
      cost: Number(chartCost) || 0,
      diagnosis: chartDiagnosis.trim() || null,
      notes: chartNotes.trim() || null,
      treatment_date: convertToDbDate(chartDate)
    };

    const { data: insertedTreatment, error: treatInsErr } = await supabase
      .from("treatments")
      .insert(dbInsertRow)
      .select()
      .single();

    if (treatInsErr || !insertedTreatment) {
      console.error("Failed to insert treatment into database:", treatInsErr?.message, treatInsErr?.code);
      showToast(treatInsErr?.message || "Failed to save treatment to database.", "error");
      return;
    }

    const newTreatment: TreatmentItem = {
      id: insertedTreatment.id,
      name: insertedTreatment.name,
      patient: patientItem.name,
      doctor: chartDoctor,
      stage: (insertedTreatment.stage as any) || chartStatus,
      notes: insertedTreatment.notes || "",
      nextVisit: "",
      prescription: "",
      tooth: insertedTreatment.tooth_number || undefined,
      cost: Number(insertedTreatment.cost) || 0,
      diagnosis: insertedTreatment.diagnosis || undefined,
      date: chartDate
    };

    setTreatments(prev => [...prev, newTreatment]);

    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          dentalChart: updatedChart
        };
      }
      return p;
    }));

    const newActId = `act-${Date.now()}`;
    const newAct: ActivityItem = {
      id: newActId,
      type: "Chart",
      msg: `Tooth ${toothDisplay} treatment "${chartTreatmentName.trim()}" saved for ${patientItem.name} (${chartStatus}).`,
      time: "Just now"
    };
    setActivities(prev => [newAct, ...prev]);

    if (chartStatus === "Completed") {
      const newInvId = `INV-${Date.now().toString().slice(-4)}`;
      const costAmount = Number(chartCost) || 0;
      const subtotal = costAmount;
      const total = subtotal;

      const newInvoice: InvoiceItem = {
        id: newInvId,
        patientId: patientItem.id,
        patientName: patientItem.name,
        doctor: chartDoctor,
        treatment: chartTreatmentName.trim(),
        items: [{ description: `${chartTreatmentName.trim()} on Tooth ${toothDisplay}`, amount: costAmount }],
        discount: 0,
        tax: 0,
        subtotal,
        total,
        paidAmount: 0,
        status: "Pending",
        paymentDate: "",
        paymentLogs: []
      };
      setInvoices(prev => [...prev, newInvoice]);
      await insertBillingRecord(newInvoice);
    }

    setChartSelectedTooth(null);
    setChartTreatmentName("");
    setChartDiagnosis("");
    setChartStatus("Planned");
    setChartNotes("");
    setChartCost("");

    showToast("Tooth treatment override saved.", "success");
  };

  const handleSaveCustomTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrName.trim()) {
      showToast("Treatment name is required.", "error");
      return;
    }
    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) return;

    const toothNum = Number(newTrTooth) || undefined;
    const costAmt = Number(newTrCost) || 0;

    if (toothNum) {
      const updatedChart = {
        ...(patientItem.dentalChart || {}),
        [toothNum]: `${newTrName.trim()} (${newTrStatus})`
      };

      const { error: patChartErr } = await supabase
        .from("patients")
        .update({ dental_chart: updatedChart })
        .eq("patient_id", selectedPatientId);

      if (patChartErr) {
        showToast("Failed to save custom treatment to database.", "error");
        return;
      }

      setPatients(prev => prev.map(p => {
        if (p.id === selectedPatientId) {
          return {
            ...p,
            dentalChart: updatedChart
          };
        }
        return p;
      }));
    }

    // Resolve patient database UUID
    let patientUuid = patientItem.uuid;
    if (!patientUuid) {
      const { data: dbPat } = await supabase
        .from("patients")
        .select("id")
        .eq("patient_id", selectedPatientId)
        .maybeSingle();
      if (dbPat) {
        patientUuid = dbPat.id;
      }
    }

    if (!patientUuid) {
      showToast("Failed to resolve patient database record.", "error");
      return;
    }

    const doctorName = newTrDoctor || (doctors[0]?.name || "");
    const doctorObj = doctors.find(d => d.name === doctorName);
    const doctorUuid = doctorObj?.id || null;

    const dbInsertRow = {
      patient_id: patientUuid,
      doctor_id: doctorUuid,
      name: newTrName.trim(),
      stage: newTrStatus,
      tooth_number: toothNum || null,
      cost: costAmt,
      diagnosis: newTrDiagnosis.trim() || null,
      notes: newTrNotes.trim() || null,
      treatment_date: new Date().toISOString().split("T")[0]
    };

    const { data: insertedTreatment, error: treatInsErr } = await supabase
      .from("treatments")
      .insert(dbInsertRow)
      .select()
      .single();

    if (treatInsErr || !insertedTreatment) {
      console.error("Failed to insert custom treatment into database:", treatInsErr?.message, treatInsErr?.code);
      showToast(treatInsErr?.message || "Failed to save treatment to database.", "error");
      return;
    }

    const newTreatment: TreatmentItem = {
      id: insertedTreatment.id,
      name: insertedTreatment.name,
      patient: patientItem.name,
      doctor: doctorName,
      stage: (insertedTreatment.stage as any) || newTrStatus,
      notes: insertedTreatment.notes || "",
      nextVisit: "",
      prescription: "",
      tooth: insertedTreatment.tooth_number || undefined,
      cost: Number(insertedTreatment.cost) || 0,
      diagnosis: insertedTreatment.diagnosis || undefined,
      date: convertToUiDate(insertedTreatment.treatment_date)
    };

    setTreatments(prev => [...prev, newTreatment]);

    if (newTrStatus === "Completed") {
      const newInvId = `INV-${Date.now().toString().slice(-4)}`;
      const subtotal = costAmt;
      const total = subtotal;

      const newInvoice: InvoiceItem = {
        id: newInvId,
        patientId: patientItem.id,
        patientName: patientItem.name,
        doctor: newTrDoctor || (doctors[0]?.name || ""),
        treatment: newTrName.trim(),
        items: [{ description: `${newTrName.trim()}${toothNum ? ' on Tooth #' + toothNum : ''}`, amount: costAmt }],
        discount: 0,
        tax: 0,
        subtotal,
        total,
        paidAmount: 0,
        status: "Pending",
        paymentDate: "",
        paymentLogs: []
      };
      setInvoices(prev => [...prev, newInvoice]);
      await insertBillingRecord(newInvoice);
    }

    setActivities(prev => [{
      id: `act-${Date.now()}`,
      type: "Treatment",
      msg: `New treatment "${newTrName.trim()}" logged for ${patientItem.name}.`,
      time: "Just now"
    }, ...prev]);

    setShowAddTreatmentModal(false);
    setNewTrName("");
    setNewTrTooth("");
    setNewTrCost("");
    setNewTrDiagnosis("");
    setNewTrNotes("");
    setNewTrStatus("Planned");
    setNewTrApptLink("");

    showToast("Treatment added successfully.", "success");
  };

  const handleSavePatientAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patApptTreatment.trim() || !patApptDate || !patApptTime) {
      showToast("Treatment, date, and time are required.", "error");
      return;
    }
    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) {
      showToast("Selected patient record not found.", "error");
      return;
    }

    let patientUuid = patientItem.uuid;
    if (!patientUuid) {
      const { data: dbPat } = await supabase
        .from("patients")
        .select("id")
        .eq("patient_id", selectedPatientId)
        .maybeSingle();
      if (dbPat) {
        patientUuid = dbPat.id;
      }
    }

    if (!patientUuid) {
      showToast("Selected patient record has no database UUID associated.", "error");
      return;
    }

    const selectedDoctorName = patApptDoctor || (doctors[0]?.name || "");
    const doctorRecord = doctors.find(d => d.name === selectedDoctorName);
    const doctorId = doctorRecord?.id || null;

    const { data: dbAppt, error: apptErr } = await supabase
      .from("appointments")
      .insert({
        patient_id: patientUuid,
        doctor_id: doctorId,
        appointment_date: convertToDbDate(patApptDate),
        time_slot: patApptTime,
        procedure_name: patApptTreatment,
        status: "Scheduled",
        notes: patApptNotes.trim()
      })
      .select()
      .single();

    if (apptErr || !dbAppt) {
      console.error("Appointment operation failed:", apptErr?.message, apptErr?.code);
      showToast("Failed to book appointment in database.", "error");
      return;
    }

    const newAppt: Appointment = {
      id: dbAppt.id,
      patientId: patientItem.id,
      patientName: patientItem.name,
      doctor: selectedDoctorName,
      treatment: dbAppt.procedure_name || "Consultation",
      time: dbAppt.time_slot || "09:00 AM",
      date: convertToUiDate(dbAppt.appointment_date || ""),
      status: dbAppt.status as any || "Scheduled",
      notes: dbAppt.notes || "",
      avatarColor: "bg-blue-100 text-blue-600"
    };

    setAppointments(prev => [...prev, newAppt]);

    setActivities(prev => [{
      id: `act-${Date.now()}`,
      type: "Appointment",
      msg: `New appointment scheduled for ${patientItem.name} with ${newAppt.doctor}.`,
      time: "Just now"
    }, ...prev]);

    setShowAddApptForm(false);
    setPatApptTreatment("");
    setPatApptDate("");
    setPatApptTime("");
    setPatApptNotes("");

    showToast("Appointment scheduled successfully.", "success");
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prescMeds.some(m => !m.name.trim())) {
      showToast("All medicines must have a name.", "error");
      return;
    }

    const missingDosageTime = prescMeds.some(m => {
      const parsed = parseDosageString(m.dosage);
      return !parsed.morning && !parsed.afternoon && !parsed.night;
    });

    if (missingDosageTime) {
      showToast("Please select at least one dosage time (Morning, Afternoon, or Night) for all medicines.", "error");
      return;
    }

    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) return;

    const formattedList = prescMeds.map(m => {
      const nameStr = m.name.trim();
      const dosageStr = m.dosage.trim();
      const durationStr = m.duration.trim() ? ` for ${m.duration.trim()}` : "";
      const instructionsStr = m.instructions.trim() ? ` [${m.instructions.trim()}]` : "";
      return `${nameStr} (${dosageStr})${durationStr}${instructionsStr}`;
    });

    let updatedNotes = [...(patientItem.notes || [])];
    if (noteTitle.trim() && noteContent.trim()) {
      const dateStr = prescDate ? new Date(prescDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      const formattedNote = `Title: ${noteTitle.trim()} | Category: ${noteCategory} | Author: ${noteAuthor} | Content: ${noteContent.trim()} | Date: ${dateStr}`;
      updatedNotes = [...updatedNotes, formattedNote];
    }

    const docName = prescDoctor || (doctors[0]?.name || "");

    const newFile = {
      name: `prescription_${new Date(prescDate || Date.now()).toISOString().slice(0,10)}.pdf`,
      size: "1.5 KB",
      type: "application/pdf"
    };

    const updatedPrescriptions = [...(patientItem.prescriptions || []), ...formattedList];
    const updatedFiles = [...(patientItem.files || []), newFile];

    const { error: prescErr } = await supabase
      .from("patients")
      .update({
        prescriptions: updatedPrescriptions,
        notes: updatedNotes,
        files: updatedFiles
      })
      .eq("patient_id", selectedPatientId);

    if (prescErr) {
      showToast("Failed to save prescription to database.", "error");
      return;
    }

    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          prescriptions: updatedPrescriptions,
          notes: updatedNotes,
          files: updatedFiles
        };
      }
      return p;
    }));

    setPrescMeds([{ name: "", dosage: "", freq: "", duration: "", instructions: "" }]);
    setPrescAdvice("");
    setPrescDiagnosis("");

    setNoteTitle("");
    setNoteContent("");
    setNoteCategory("General");

    showToast("Prescription generated and saved.", "success");
  };

  const handlePrintPrescription = () => {
    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) {
      showToast("Please select a patient before printing a prescription.", "error");
      return;
    }

    if (prescMeds.length === 0 || prescMeds.some(m => !m.name.trim())) {
      showToast("All medicines must have a name.", "error");
      return;
    }

    const missingDosageTime = prescMeds.some(m => {
      const parsed = parseDosageString(m.dosage);
      return !parsed.morning && !parsed.afternoon && !parsed.night;
    });

    if (missingDosageTime) {
      showToast("Please select at least one dosage time (Morning, Afternoon, or Night) for all medicines.", "error");
      return;
    }

    window.print();
  };

  const handleSaveClinicalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) {
      showToast("Note title and content are required.", "error");
      return;
    }
    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) return;

    const dateStr = prescDate ? new Date(prescDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const formattedNote = `Title: ${noteTitle.trim()} | Category: ${noteCategory} | Author: ${noteAuthor} | Content: ${noteContent.trim()} | Date: ${dateStr}`;

    const updatedNotes = [...(patientItem.notes || []), formattedNote];

    const { error: noteErr } = await supabase
      .from("patients")
      .update({ notes: updatedNotes })
      .eq("patient_id", selectedPatientId);

    if (noteErr) {
      showToast("Failed to save clinical note to database.", "error");
      return;
    }

    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          notes: updatedNotes
        };
      }
      return p;
    }));

    setNoteTitle("");
    setNoteContent("");
    setNoteCategory("General");
    showToast("Clinical note saved successfully.", "success");
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invProcedure.trim() || !invAmount) {
      showToast("Procedure and Amount are required.", "error");
      return;
    }
    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) return;

    const amt = Number(invAmount) || 0;
    const disc = Number(invDiscount) || 0;
    const paid = Number(invPaid) || 0;

    const discountAmount = amt * (disc / 100);
    const subtotal = amt - discountAmount;
    const total = subtotal;
    const pending = Math.max(0, total - paid);

    const newInvId = `INV-${Date.now().toString().slice(-4)}`;
    const newInvoice: InvoiceItem = {
      id: newInvId,
      patientId: patientItem.id,
      patientName: patientItem.name,
      doctor: doctors[0]?.name || "Dr. Deepa Kodali",
      treatment: invProcedure.trim(),
      items: [{ description: invProcedure.trim(), amount: amt }],
      discount: disc,
      tax: 0,
      subtotal,
      total,
      paidAmount: paid,
      status: pending === 0 ? "Paid" : paid > 0 ? "Partially Paid" : "Pending",
      paymentDate: paid > 0 ? new Date().toISOString().split("T")[0] : "",
      paymentLogs: paid > 0 ? [{ method: invMode, amount: paid, date: new Date().toISOString().split("T")[0] }] : []
    };

    setInvoices(prev => [...prev, newInvoice]);
    await insertBillingRecord(newInvoice);

    setActivities(prev => [{
      id: `act-${Date.now()}`,
      type: "Billing",
      msg: `Invoice ${newInvId} generated for ${patientItem.name} (${newInvoice.status}).`,
      time: "Just now"
    }, ...prev]);

    setInvProcedure("");
    setInvAmount("");
    setInvDiscount("0");
    setInvTax("0");
    setInvPaid("0");

    showToast("Invoice saved successfully.", "success");
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      showToast("File name is required.", "error");
      return;
    }
    const patientItem = patients.find(p => p.id === selectedPatientId);
    if (!patientItem) return;

    const newFile = {
      name: newFileName.trim(),
      size: "2.4 MB",
      type: newFileType
    };

    const updatedFiles = [...(patientItem.files || []), newFile];

    const { error: fileErr } = await supabase
      .from("patients")
      .update({ files: updatedFiles })
      .eq("patient_id", selectedPatientId);

    if (fileErr) {
      showToast("Failed to save file attachment to database.", "error");
      return;
    }

    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          files: updatedFiles
        };
      }
      return p;
    }));

    setNewFileName("");
    showToast("File uploaded and linked successfully.", "success");
  };

  // --- MEDICINE INVENTORY ACTION HANDLERS ---
  const handleOpenAddMedicine = () => {
    setEditingMedicine(null);
    setMedFormName("");
    setMedFormUnit("tablets");
    setMedFormOpeningStock("");
    setMedFormThreshold("5");
    setMedFormIsActive(true);
    setMedicineModalOpen(true);
  };

  const handleOpenEditMedicine = (med: MedicineItem) => {
    setEditingMedicine(med);
    setMedFormName(med.name);
    setMedFormUnit(med.stock_unit);
    setMedFormOpeningStock(med.opening_stock !== null && med.opening_stock !== undefined ? String(med.opening_stock) : "");
    setMedFormThreshold(String(med.low_stock_threshold || 5));
    setMedFormIsActive(med.is_active);
    setMedicineModalOpen(true);
  };

  const handleSaveMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      showToast("Unauthorized: Only clinic owners can manage medicine stock.", "error");
      return;
    }
    const cleanName = medFormName.trim();
    if (!cleanName) {
      showToast("Medicine name is required.", "error");
      return;
    }

    const thresholdVal = Number(medFormThreshold);
    if (isNaN(thresholdVal) || thresholdVal <= 0) {
      showToast("Low-stock threshold must be greater than zero.", "error");
      return;
    }

    let openingQtyNum: number | null = null;
    if (medFormOpeningStock.trim() !== "") {
      const parsed = Number(medFormOpeningStock.trim());
      if (isNaN(parsed) || parsed < 0) {
        showToast("Opening stock quantity cannot be negative.", "error");
        return;
      }
      openingQtyNum = parsed;
    }

    if (editingMedicine) {
      const hasTx = stockTransactions.some(t => t.medicine_id === editingMedicine.id);
      if (hasTx && editingMedicine.stock_unit !== medFormUnit) {
        showToast(`Cannot change unit of "${editingMedicine.name}" while stock transactions exist. Make a stock adjustment instead.`, "error");
        return;
      }

      const isNewlyConfigured = !editingMedicine.is_configured && openingQtyNum !== null;
      const newAvailQty = isNewlyConfigured ? openingQtyNum : (openingQtyNum !== null && editingMedicine.available_quantity === null ? openingQtyNum : editingMedicine.available_quantity);
      const isConfig = editingMedicine.is_configured || openingQtyNum !== null;

      const { error } = await supabase
        .from("medicines")
        .update({
          name: cleanName,
          stock_unit: medFormUnit,
          opening_stock: openingQtyNum !== null ? openingQtyNum : editingMedicine.opening_stock,
          available_quantity: newAvailQty,
          low_stock_threshold: thresholdVal,
          is_active: medFormIsActive,
          is_configured: isConfig
        })
        .eq("id", editingMedicine.id);

      if (error) {
        console.error("Failed to update medicine in database:", error.message);
      }

      setMedicines(prev => prev.map(m => m.id === editingMedicine.id ? {
        ...m,
        name: cleanName,
        stock_unit: medFormUnit,
        opening_stock: openingQtyNum !== null ? openingQtyNum : m.opening_stock,
        available_quantity: newAvailQty,
        low_stock_threshold: thresholdVal,
        is_active: medFormIsActive,
        is_configured: isConfig
      } : m));

      if (isNewlyConfigured && openingQtyNum !== null) {
        const txRecord: StockTransaction = {
          id: `tx-${Date.now()}`,
          medicine_id: editingMedicine.id,
          transaction_type: "opening_stock",
          quantity: openingQtyNum,
          previous_quantity: 0,
          new_quantity: openingQtyNum,
          transaction_date: new Date().toISOString(),
          reference: "INITIAL_SETUP",
          notes: "Opening stock configured"
        };
        await supabase.from("stock_transactions").insert({
          medicine_id: editingMedicine.id,
          transaction_type: "opening_stock",
          quantity: openingQtyNum,
          previous_quantity: 0,
          new_quantity: openingQtyNum,
          reference: "INITIAL_SETUP",
          notes: "Opening stock configured"
        });
        setStockTransactions(prev => [txRecord, ...prev]);
      }

      showToast(`Medicine "${cleanName}" updated successfully.`, "success");
    } else {
      const existing = medicines.find(m => m.name.toLowerCase() === cleanName.toLowerCase());
      if (existing) {
        showToast(`A medicine named "${cleanName}" already exists in catalogue.`, "error");
        return;
      }

      const isConfig = openingQtyNum !== null;
      const newMedId = `med-${Date.now()}`;
      const newMedItem: MedicineItem = {
        id: newMedId,
        name: cleanName,
        stock_unit: medFormUnit,
        opening_stock: openingQtyNum,
        available_quantity: openingQtyNum,
        low_stock_threshold: thresholdVal,
        is_active: medFormIsActive,
        is_configured: isConfig
      };

      const { data: dbIns, error } = await supabase
        .from("medicines")
        .insert({
          name: cleanName,
          stock_unit: medFormUnit,
          opening_stock: openingQtyNum,
          available_quantity: openingQtyNum,
          low_stock_threshold: thresholdVal,
          is_active: medFormIsActive,
          is_configured: isConfig
        })
        .select()
        .maybeSingle();

      const createdMed = dbIns ? {
        id: dbIns.id,
        name: dbIns.name,
        stock_unit: dbIns.stock_unit,
        opening_stock: dbIns.opening_stock !== null ? Number(dbIns.opening_stock) : null,
        available_quantity: dbIns.available_quantity !== null ? Number(dbIns.available_quantity) : null,
        low_stock_threshold: Number(dbIns.low_stock_threshold),
        is_active: dbIns.is_active,
        is_configured: dbIns.is_configured
      } : newMedItem;

      setMedicines(prev => [...prev, createdMed]);

      if (isConfig && openingQtyNum !== null) {
        const txRecord: StockTransaction = {
          id: `tx-${Date.now()}`,
          medicine_id: createdMed.id,
          transaction_type: "opening_stock",
          quantity: openingQtyNum,
          previous_quantity: 0,
          new_quantity: openingQtyNum,
          transaction_date: new Date().toISOString(),
          reference: "INITIAL_SETUP",
          notes: "Opening stock configured"
        };
        await supabase.from("stock_transactions").insert({
          medicine_id: createdMed.id,
          transaction_type: "opening_stock",
          quantity: openingQtyNum,
          previous_quantity: 0,
          new_quantity: openingQtyNum,
          reference: "INITIAL_SETUP",
          notes: "Opening stock configured"
        });
        setStockTransactions(prev => [txRecord, ...prev]);
      }

      showToast(`Medicine "${cleanName}" added to inventory catalogue.`, "success");
    }

    setMedicineModalOpen(false);
  };

  const handleOpenAddStock = (med: MedicineItem) => {
    setSelectedStockMedicine(med);
    setAddStockQty("");
    setAddStockDate(new Date().toISOString().split("T")[0]);
    setAddStockSupplier("");
    setAddStockNotes("");
    setAddStockModalOpen(true);
  };

  const handleAddStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      showToast("Unauthorized: Only clinic owners can add medicine stock.", "error");
      return;
    }
    if (!selectedStockMedicine) return;

    const qtyNum = Number(addStockQty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      showToast("Quantity received must be greater than zero.", "error");
      return;
    }

    const currentQty = selectedStockMedicine.available_quantity !== null ? selectedStockMedicine.available_quantity : 0;
    const newQty = currentQty + qtyNum;

    const { data: rpcRes, error: rpcErr } = await supabase.rpc("add_medicine_stock", {
      p_medicine_id: selectedStockMedicine.id,
      p_quantity: qtyNum,
      p_transaction_date: addStockDate ? new Date(addStockDate).toISOString() : new Date().toISOString(),
      p_reference: addStockSupplier.trim() || null,
      p_notes: addStockNotes.trim() || null
    });

    if (rpcErr) {
      await supabase
        .from("medicines")
        .update({ available_quantity: newQty, is_configured: true })
        .eq("id", selectedStockMedicine.id);

      await supabase.from("stock_transactions").insert({
        medicine_id: selectedStockMedicine.id,
        transaction_type: "received",
        quantity: qtyNum,
        previous_quantity: currentQty,
        new_quantity: newQty,
        transaction_date: addStockDate ? new Date(addStockDate).toISOString() : new Date().toISOString(),
        reference: addStockSupplier.trim() || null,
        notes: addStockNotes.trim() || null
      });
    }

    setMedicines(prev => prev.map(m => m.id === selectedStockMedicine.id ? {
      ...m,
      available_quantity: newQty,
      is_configured: true
    } : m));

    setStockTransactions(prev => [{
      id: `tx-${Date.now()}`,
      medicine_id: selectedStockMedicine.id,
      transaction_type: "received",
      quantity: qtyNum,
      previous_quantity: currentQty,
      new_quantity: newQty,
      transaction_date: addStockDate || new Date().toISOString(),
      reference: addStockSupplier.trim() || undefined,
      notes: addStockNotes.trim() || undefined
    }, ...prev]);

    showToast(`Added ${qtyNum} ${selectedStockMedicine.stock_unit} to "${selectedStockMedicine.name}" stock.`, "success");
    setAddStockModalOpen(false);
  };

  const handleOpenAdjustStock = (med: MedicineItem) => {
    setAdjustStockMedicine(med);
    setAdjustStockNewQty(med.available_quantity !== null ? String(med.available_quantity) : "");
    setAdjustStockReason("");
    setAdjustStockDate(new Date().toISOString().split("T")[0]);
    setAdjustStockModalOpen(true);
  };

  const handleAdjustStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      showToast("Unauthorized: Only clinic owners can make stock adjustments.", "error");
      return;
    }
    if (!adjustStockMedicine) return;

    if (!adjustStockReason.trim()) {
      showToast("Reason for stock adjustment is required.", "error");
      return;
    }

    const newQtyNum = Number(adjustStockNewQty);
    if (isNaN(newQtyNum) || newQtyNum < 0) {
      showToast("Adjusted stock quantity cannot be negative.", "error");
      return;
    }

    const currentQty = adjustStockMedicine.available_quantity !== null ? adjustStockMedicine.available_quantity : 0;
    const delta = newQtyNum - currentQty;

    const { data: rpcRes, error: rpcErr } = await supabase.rpc("adjust_medicine_stock", {
      p_medicine_id: adjustStockMedicine.id,
      p_new_quantity: newQtyNum,
      p_reason: adjustStockReason.trim(),
      p_transaction_date: adjustStockDate ? new Date(adjustStockDate).toISOString() : new Date().toISOString()
    });

    if (rpcErr) {
      await supabase
        .from("medicines")
        .update({ available_quantity: newQtyNum, is_configured: true })
        .eq("id", adjustStockMedicine.id);

      await supabase.from("stock_transactions").insert({
        medicine_id: adjustStockMedicine.id,
        transaction_type: "adjustment",
        quantity: delta,
        previous_quantity: currentQty,
        new_quantity: newQtyNum,
        transaction_date: adjustStockDate ? new Date(adjustStockDate).toISOString() : new Date().toISOString(),
        reference: "ADJUSTMENT",
        notes: adjustStockReason.trim()
      });
    }

    setMedicines(prev => prev.map(m => m.id === adjustStockMedicine.id ? {
      ...m,
      available_quantity: newQtyNum,
      is_configured: true
    } : m));

    setStockTransactions(prev => [{
      id: `tx-${Date.now()}`,
      medicine_id: adjustStockMedicine.id,
      transaction_type: "adjustment",
      quantity: delta,
      previous_quantity: currentQty,
      new_quantity: newQtyNum,
      transaction_date: adjustStockDate || new Date().toISOString(),
      reference: "ADJUSTMENT",
      notes: adjustStockReason.trim()
    }, ...prev]);

    showToast(`Stock for "${adjustStockMedicine.name}" adjusted to ${newQtyNum} ${adjustStockMedicine.stock_unit}.`, "success");
    setAdjustStockModalOpen(false);
  };

  const handleOpenMedicineHistory = (med: MedicineItem) => {
    setHistoryMedicine(med);
    setHistoryModalOpen(true);
  };

  const handleConfirmDispenseItem = async () => {
    if (!isOwner) {
      showToast("Unauthorized: Only clinic owners can dispense medicines.", "error");
      return;
    }
    if (!dispenseConfirmModal) return;

    const { prescriptionId, itemIndex, medicineName, medicineId, dispensingQty, stockUnit, availableStock } = dispenseConfirmModal;

    if (availableStock === null || availableStock === undefined) {
      showToast(`Opening stock for "${medicineName}" has not been configured.`, "error");
      return;
    }

    if (availableStock < dispensingQty) {
      showToast(`Insufficient stock for "${medicineName}". Available: ${availableStock} ${stockUnit}, Requested: ${dispensingQty} ${stockUnit}.`, "error");
      return;
    }

    const targetMed = medicines.find(m => m.id === medicineId || m.name.toLowerCase() === medicineName.toLowerCase());
    if (targetMed && !targetMed.is_active) {
      showToast(`Medicine "${medicineName}" is currently inactive and cannot be dispensed.`, "error");
      return;
    }

    let rpcSuccess = false;
    if (prescriptionId && !prescriptionId.startsWith("presc-")) {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc("dispense_prescription_item", {
        p_prescription_id: prescriptionId,
        p_item_index: itemIndex,
        p_dispensing_qty: dispensingQty
      });
      if (!rpcErr && rpcRes?.success) {
        rpcSuccess = true;
      }
    }

    if (targetMed) {
      const oldQty = targetMed.available_quantity !== null ? targetMed.available_quantity : 0;
      const newQty = Math.max(0, oldQty - dispensingQty);

      await supabase.from("medicines").update({ available_quantity: newQty }).eq("id", targetMed.id);

      await supabase.from("stock_transactions").insert({
        medicine_id: targetMed.id,
        transaction_type: "dispensed",
        quantity: -dispensingQty,
        previous_quantity: oldQty,
        new_quantity: newQty,
        reference: `DISPENSE_${prescriptionId}`,
        notes: `Dispensed for patient ${dispenseConfirmModal.patientName}`
      });

      setMedicines(prev => prev.map(m => m.id === targetMed.id ? { ...m, available_quantity: newQty } : m));

      setStockTransactions(prev => [{
        id: `tx-${Date.now()}`,
        medicine_id: targetMed.id,
        transaction_type: "dispensed",
        quantity: -dispensingQty,
        previous_quantity: oldQty,
        new_quantity: newQty,
        transaction_date: new Date().toISOString(),
        reference: `DISPENSE_${prescriptionId}`,
        notes: `Dispensed for patient ${dispenseConfirmModal.patientName}`
      }, ...prev]);
    }

    setPatientPrescriptionsList(prev => prev.map(pr => {
      if (pr.id === prescriptionId) {
        const updatedItems = [...pr.items];
        if (updatedItems[itemIndex]) {
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            dispensed: true,
            dispensed_at: new Date().toISOString()
          };
        }
        return { ...pr, items: updatedItems };
      }
      return pr;
    }));

    showToast(`Dispensed ${dispensingQty} ${stockUnit} of ${medicineName} successfully.`, "success");
    setDispenseConfirmModal(null);
  };



  // --- HELPER DYNAMIC CALCULATIONS ---

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

  const getReportsDateRange = (filter: string, customStart?: string, customEnd?: string) => {
    const now = new Date();
    let start: Date;
    let end: Date;

    if (filter === "Today") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (filter === "Week") {
      const dayOfWeek = now.getDay();
      const startOfWeekDay = now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
      start = new Date(now.getFullYear(), now.getMonth(), startOfWeekDay, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), startOfWeekDay + 6, 23, 59, 59, 999);
    } else if (filter === "Month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (filter === "Year") {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (filter === "Custom" && customStart && customEnd) {
      const sParts = customStart.split("-").map(Number);
      const eParts = customEnd.split("-").map(Number);
      start = new Date(sParts[0], sParts[1] - 1, sParts[2], 0, 0, 0, 0);
      end = new Date(eParts[0], eParts[1] - 1, eParts[2], 23, 59, 59, 999);
    } else {
      start = new Date(2000, 0, 1);
      end = new Date(2099, 11, 31);
    }

    return { start, end };
  };

  const parseToDate = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    const dbFmt = convertToDbDate(dateStr);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dbFmt)) {
      const [y, m, d] = dbFmt.split("-").map(Number);
      return new Date(y, m - 1, d, 12, 0, 0);
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const isDateInRange = (dateStr: string | undefined, start: Date, end: Date): boolean => {
    if (!dateStr) return false;
    const d = parseToDate(dateStr);
    if (!d) return false;
    return d >= start && d <= end;
  };

  const getReportBuckets = (filter: string, start: Date, end: Date) => {
    if (filter === "Today") {
      const d = new Date(start);
      const y = d.getFullYear();
      const m = d.getMonth();
      const dt = d.getDate();
      return [
        { label: "9 AM", start: new Date(y, m, dt, 0, 0, 0), end: new Date(y, m, dt, 9, 0, 0) },
        { label: "12 PM", start: new Date(y, m, dt, 9, 0, 1), end: new Date(y, m, dt, 12, 0, 0) },
        { label: "3 PM", start: new Date(y, m, dt, 12, 0, 1), end: new Date(y, m, dt, 15, 0, 0) },
        { label: "6 PM", start: new Date(y, m, dt, 15, 0, 1), end: new Date(y, m, dt, 18, 0, 0) },
        { label: "9 PM", start: new Date(y, m, dt, 18, 0, 1), end: new Date(y, m, dt, 23, 59, 59) }
      ];
    }

    if (filter === "Week") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const curr = new Date(start);
      return days.map((dayLabel, idx) => {
        const dayStart = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + idx, 0, 0, 0, 0);
        const dayEnd = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + idx, 23, 59, 59, 999);
        return { label: dayLabel, start: dayStart, end: dayEnd };
      });
    }

    if (filter === "Month") {
      const y = start.getFullYear();
      const m = start.getMonth();
      const lastDayOfMonth = new Date(y, m + 1, 0).getDate();
      return [
        { label: "W1 (1-7)", start: new Date(y, m, 1, 0, 0, 0), end: new Date(y, m, 7, 23, 59, 59) },
        { label: "W2 (8-14)", start: new Date(y, m, 8, 0, 0, 0), end: new Date(y, m, 14, 23, 59, 59) },
        { label: "W3 (15-21)", start: new Date(y, m, 15, 0, 0, 0), end: new Date(y, m, 21, 23, 59, 59) },
        { label: "W4 (22+)", start: new Date(y, m, 22, 0, 0, 0), end: new Date(y, m, lastDayOfMonth, 23, 59, 59) }
      ];
    }

    if (filter === "Year") {
      const y = start.getFullYear();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months.map((mLabel, idx) => {
        const mStart = new Date(y, idx, 1, 0, 0, 0, 0);
        const mEnd = new Date(y, idx + 1, 0, 23, 59, 59, 999);
        return { label: mLabel, start: mStart, end: mEnd };
      });
    }

    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    if (diffDays <= 7) {
      const buckets = [];
      const curr = new Date(start);
      for (let i = 0; i < diffDays; i++) {
        const dStart = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + i, 0, 0, 0);
        const dEnd = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + i, 23, 59, 59);
        const dLabel = dStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        buckets.push({ label: dLabel, start: dStart, end: dEnd });
      }
      return buckets;
    } else {
      const chunkMs = (end.getTime() - start.getTime()) / 4;
      return [0, 1, 2, 3].map(i => {
        const bStart = new Date(start.getTime() + i * chunkMs);
        const bEnd = new Date(start.getTime() + (i + 1) * chunkMs);
        const bLabel = `${bStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
        return { label: bLabel, start: bStart, end: bEnd };
      });
    }
  };

  const getFilteredReportStats = () => {
    const { start, end } = getReportsDateRange(reportsFilter, customStartDate, customEndDate);

    const filteredInvoices = invoices.filter(inv => isDateInRange(inv.paymentDate || (inv.paymentLogs && inv.paymentLogs[0]?.date), start, end));
    const filteredPatients = patients.filter(p => isDateInRange(p.visit, start, end));
    const filteredTreatments = treatments.filter(t => isDateInRange(t.date, start, end));
    const filteredAppts = appointments.filter(a => isDateInRange(a.date, start, end));

    const totalRev = filteredInvoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || Number(inv.total) || 0), 0);

    return {
      revenue: totalRev,
      patients: filteredPatients.length,
      treatments: filteredTreatments.length,
      appointments: filteredAppts.length
    };
  };

  const reportStats = getFilteredReportStats();

  const activeDashboardDate = selectedCalendarDay || dynamicTodayUiDate;

  const kpiCounts = {
    todayAppointments: appointments.filter(a => a.date === activeDashboardDate && a.status !== "Cancelled").length,
    walkins: appointments.filter(a => a.date === activeDashboardDate && (a.notes?.toLowerCase().includes("walk-in") || a.patientName?.toLowerCase().includes("walk-in"))).length,
    waiting: appointments.filter(a => a.date === activeDashboardDate && (a.status === "Waiting" || a.status === "Checked In")).length,
    inTreatment: appointments.filter(a => a.date === activeDashboardDate && (a.status === "In Procedure" || a.status === "In Consultation")).length,
    completedToday: appointments.filter(a => a.date === activeDashboardDate && a.status === "Completed").length,
    pendingBills: invoices.filter(i => i.status !== "Paid").length,
    revenueToday: invoices.reduce((sum, inv) => sum + (inv.paymentLogs || []).filter(log => log.date === activeDashboardDate).reduce((s, l) => s + (l.amount || 0), 0), 0)
  };

  const pushActivity = async (type: ActivityItem["type"], msg: string) => {
    const newAct: ActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      msg,
      time: "Just now"
    };
    setActivities(prev => [newAct, ...prev]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from("activities").insert({
        user_id: session?.user?.id || null,
        action: type,
        entity_type: type,
        description: msg
      });
    } catch (e) {}
  };

  // --- WORKFLOW EVENT HANDLERS ---

  // 1. Patient Check-In
  const handleCheckIn = async (apptId: string) => {
    const activeApptsCount = appointments.filter(a => a.status === "Waiting" || a.status === "Checked In" || a.status === "In Procedure" || a.status === "Completed").length;
    const tokenStr = `T-0${activeApptsCount + 1}`;

    const { error } = await supabase
      .from("appointments")
      .update({
        status: "Waiting",
        queue_token: tokenStr
      })
      .eq("id", apptId);

    if (error) {
      console.error("Appointment operation failed:", error.message, error.code);
      showToast("Failed to update appointment check-in in database.", "error");
      return;
    }

    setAppointments(prev =>
      prev.map(app => (app.id === apptId ? { ...app, status: "Waiting", token: tokenStr } : app))
    );

    const appt = appointments.find(a => a.id === apptId);
    if (appt) {
      pushActivity("Appointment", `Patient ${appt.patientName} checked in. Token ${tokenStr} assigned.`);
      // Add notification
      const newNotif = {
        id: Date.now() + Math.floor(Math.random() * 100000),
        msg: `Token ${tokenStr} (${appt.patientName}) is waiting in the queue.`,
        unread: true
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  // 2. Start Consultation
  const handleStartConsultation = async (apptId: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({
        status: "In Consultation"
      })
      .eq("id", apptId);

    if (error) {
      console.error("Appointment operation failed:", error.message, error.code);
      showToast("Failed to start consultation in database.", "error");
      return;
    }

    setAppointments(prev =>
      prev.map(app => (app.id === apptId ? { ...app, status: "In Consultation" } : app))
    );

    const appt = appointments.find(a => a.id === apptId);
    if (appt) {
      setDoctors(prev =>
        prev.map(d => (d.name === appt.doctor ? { ...d, status: "In Consultation" } : d))
      );

      // Initialize active consultation workspace configurations
      setActiveConsultationApptId(apptId);
      setConsultNotes(appt.notes || "");
      setConsultPrescription("");
      setConsultSelectedTooth(null);

      // Get patient's existing dental chart
      const patientItem = patients.find(p => p.id === appt.patientId);
      if (patientItem) {
        setConsultChart(patientItem.dentalChart || {});
      } else {
        setConsultChart({});
      }
      setConsultUploadedXrays([]);

      pushActivity("Treatment", `Dr. started consultation with ${appt.patientName} for ${appt.treatment}.`);
    }
  };

  // 3. Complete Consultation and Auto-Generate Invoice
  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConsultationApptId) return;

    const appt = appointments.find(a => a.id === activeConsultationApptId);
    if (!appt) return;

    const patientItem = patients.find(p => p.id === appt.patientId);
    if (!patientItem) return;

    const updatedChart = { ...patientItem.dentalChart, ...consultChart };
    const updatedPrescriptions = consultPrescription ? [...patientItem.prescriptions, consultPrescription] : patientItem.prescriptions;
    const updatedFiles = [...patientItem.files, ...consultUploadedXrays];
    const updatedNotes = consultNotes ? [...patientItem.notes, consultNotes] : patientItem.notes;

    const { error: completeErr } = await supabase
      .from("patients")
      .update({
        dental_chart: updatedChart,
        prescriptions: updatedPrescriptions,
        files: updatedFiles,
        notes: updatedNotes,
        visit: "12 Aug 2026"
      })
      .eq("patient_id", appt.patientId);

    if (completeErr) {
      showToast("Failed to save consultation details to database.", "error");
      return;
    }

    // Change status in appointment table
    const { error: apptStatusErr } = await supabase
      .from("appointments")
      .update({ status: "Completed" })
      .eq("id", activeConsultationApptId);

    if (apptStatusErr) {
      console.error("Appointment operation failed:", apptStatusErr.message, apptStatusErr.code);
      showToast("Failed to update appointment status in database.", "error");
      return;
    }

    setAppointments(prev =>
      prev.map(app => (app.id === activeConsultationApptId ? { ...app, status: "Completed" } : app))
    );

    // Free the doctor
    setDoctors(prev =>
      prev.map(d => (d.name === appt.doctor ? { ...d, status: "Available" } : d))
    );

    // Save treatment log into patient database
    const treatmentCost = 0;
    const medicineCost = consultPrescription ? 800 : 0; // Simulate medicine cost flat ₹800

    let consultPatientUuid = patientItem.uuid;
    if (!consultPatientUuid) {
      const { data: dbPat } = await supabase
        .from("patients")
        .select("id")
        .eq("patient_id", appt.patientId)
        .maybeSingle();
      if (dbPat) {
        consultPatientUuid = dbPat.id;
      }
    }

    const consultDocObj = doctors.find(d => d.name === appt.doctor);
    const consultDocUuid = consultDocObj?.id || null;

    if (consultPatientUuid) {
      const dbInsertRow = {
        patient_id: consultPatientUuid,
        doctor_id: consultDocUuid,
        name: appt.treatment,
        stage: "Completed",
        tooth_number: consultSelectedTooth || null,
        cost: treatmentCost,
        notes: consultNotes.trim() || null,
        treatment_date: new Date().toISOString().split("T")[0]
      };

      const { data: insertedTreatment, error: treatInsErr } = await supabase
        .from("treatments")
        .insert(dbInsertRow)
        .select()
        .single();

      if (treatInsErr) {
        console.error("Failed to persist consultation treatment to database:", treatInsErr.message);
        showToast(treatInsErr.message || "Failed to persist consultation treatment to database.", "error");
      } else if (insertedTreatment) {
        const newTreatmentLog: TreatmentItem = {
          id: insertedTreatment.id,
          name: insertedTreatment.name,
          patient: appt.patientName,
          doctor: appt.doctor,
          stage: "Completed",
          notes: consultNotes,
          nextVisit: "10 Sep 2026",
          prescription: consultPrescription || "None",
          tooth: insertedTreatment.tooth_number || undefined,
          cost: Number(insertedTreatment.cost) || undefined
        };
        setTreatments(prev => [newTreatmentLog, ...prev]);
      }
    } else {
      const newTreatmentLog: TreatmentItem = {
        id: `tr-${Date.now()}`,
        name: appt.treatment,
        patient: appt.patientName,
        doctor: appt.doctor,
        stage: "Completed",
        notes: consultNotes,
        nextVisit: "10 Sep 2026",
        prescription: consultPrescription || "None"
      };
      setTreatments(prev => [newTreatmentLog, ...prev]);
    }

    // Update patient record: notes, prescriptions, chart, attachments
    setPatients(prev =>
      prev.map(p => {
        if (p.id === appt.patientId) {
          return {
            ...p,
            dentalChart: updatedChart,
            prescriptions: updatedPrescriptions,
            files: updatedFiles,
            notes: updatedNotes,
            visit: "12 Aug 2026"
          };
        }
        return p;
      })
    );

    // Auto-generate invoice
    const invoiceNum = `INV-${1000 + invoices.length + 1}`;
    const invoiceItems = [{ description: `${appt.treatment} Fee`, amount: treatmentCost }];
    if (consultPrescription) {
      invoiceItems.push({ description: "Prescribed Medications", amount: medicineCost });
    }

    const sub = invoiceItems.reduce((acc, item) => acc + item.amount, 0);
    const tot = sub;

    const newInvoice: InvoiceItem = {
      id: invoiceNum,
      patientId: appt.patientId,
      patientName: appt.patientName,
      doctor: appt.doctor,
      treatment: appt.treatment,
      items: invoiceItems,
      discount: 0,
      tax: 0,
      subtotal: sub,
      total: tot,
      paidAmount: 0,
      status: "Pending",
      paymentDate: "12 Aug 2026",
      paymentLogs: []
    };

    setInvoices(prev => [newInvoice, ...prev]);
    await insertBillingRecord(newInvoice);
    pushActivity("Treatment", `Consultation completed for ${appt.patientName}. Invoice ${invoiceNum} generated.`);

    // Reset workspace and redirect receptionist to Billing module
    setActiveConsultationApptId(null);
    setActiveTab("Billing");
    setActiveSubTab("Invoices");
  };

  // 4. Collect SPLIT/FULL Payment
  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    const collectedTotal = paymentCollectAmt;
    const finalInvoiceTotal = calculateInvoiceTotal();

    const paymentLogs = [...selectedInvoiceForPayment.paymentLogs];
    const logDate = "12 Aug 2026";
    if (paymentCollectAmt > 0) {
      paymentLogs.push({ method: paymentMethod, amount: paymentCollectAmt, date: logDate });
    }

    const totalPaidAmount = selectedInvoiceForPayment.paidAmount + collectedTotal;
    let finalStatus: InvoiceItem["status"] = "Unpaid";
    if (totalPaidAmount >= finalInvoiceTotal) {
      finalStatus = "Paid";
    } else if (totalPaidAmount > 0) {
      finalStatus = "Partially Paid";
    }

    const calculatedDiscountAmt = calculateInvoiceDiscountAmount();
    const calculatedSubtotal = calculateInvoiceSubtotal();
    const calculatedDiscountPct = calculatedSubtotal > 0 ? Math.round((calculatedDiscountAmt / calculatedSubtotal) * 100) : 0;

    // Write update to Supabase
    const { error: billErr } = await supabase
      .from("billing")
      .update({
        items: [...selectedInvoiceForPayment.items, ...payCustomItems],
        discount: calculatedDiscountPct,
        discount_type: payDiscountType || null,
        discount_value: payDiscountValue || 0,
        subtotal: calculatedSubtotal,
        total: finalInvoiceTotal,
        paid_amount: totalPaidAmount,
        status: finalStatus,
        payment_logs: paymentLogs,
        payment_date: logDate
      })
      .eq("invoice_id", selectedInvoiceForPayment.id);

    if (billErr) {
      showToast("Failed to update billing details in database.", "error");
      return;
    }

    // Apply balance update to patient directory record
    const remainingBalance = Math.max(0, finalInvoiceTotal - totalPaidAmount);
    const { error: patErr } = await supabase
      .from("patients")
      .update({ balance: remainingBalance > 0 ? `₹${remainingBalance.toLocaleString()}` : "₹0" })
      .eq("patient_id", selectedInvoiceForPayment.patientId);

    // Update in invoices state
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === selectedInvoiceForPayment.id) {
          return {
            ...inv,
            items: [...inv.items, ...payCustomItems],
            discount: calculatedDiscountPct,
            discountType: payDiscountType,
            discountValue: payDiscountValue,
            tax: 0,
            subtotal: calculatedSubtotal,
            total: finalInvoiceTotal,
            paidAmount: totalPaidAmount,
            status: finalStatus,
            paymentLogs: paymentLogs,
            paymentDate: logDate
          };
        }
        return inv;
      })
    );

    setPatients(prev =>
      prev.map(p => {
        if (p.id === selectedInvoiceForPayment.patientId) {
          return { ...p, balance: remainingBalance > 0 ? `₹${remainingBalance.toLocaleString()}` : "₹0" };
        }
        return p;
      })
    );

    pushActivity("Payment", `Collected ₹${collectedTotal.toLocaleString()} for Invoice ${selectedInvoiceForPayment.id}.`);

    // Launch Receipt dialog overlay
    const receiptSnapshot: InvoiceItem = {
      ...selectedInvoiceForPayment,
      items: [...selectedInvoiceForPayment.items, ...payCustomItems],
      discount: calculatedDiscountPct,
      discountType: payDiscountType,
      discountValue: payDiscountValue,
      tax: 0,
      subtotal: calculatedSubtotal,
      total: finalInvoiceTotal,
      paidAmount: totalPaidAmount,
      status: finalStatus,
      paymentLogs: paymentLogs,
      paymentDate: logDate
    };

    setLastGeneratedReceipt(receiptSnapshot);
    setSelectedInvoiceForPayment(null);
  };

  // Add customized item directly inside payment collections
  const addCustomBillingItem = () => {
    if (!newCustomDesc || newCustomAmt <= 0) return;
    setPayCustomItems(prev => [...prev, { description: newCustomDesc, amount: newCustomAmt }]);
    setNewCustomDesc("");
    setNewCustomAmt(0);
  };

  const removeCustomBillingItem = (idx: number) => {
    setPayCustomItems(prev => prev.filter((_, i) => i !== idx));
  };

  const calculateInvoiceDiscountAmount = () => {
    const sub = calculateInvoiceSubtotal();
    if (payDiscountType === "percentage") {
      return Math.round(sub * (payDiscountValue / 100));
    }
    return Math.min(sub, payDiscountValue);
  };

  const calculateInvoiceSubtotal = () => {
    if (!selectedInvoiceForPayment) return 0;
    const baseSub = selectedInvoiceForPayment.items.reduce((sum, item) => sum + item.amount, 0);
    const customSub = payCustomItems.reduce((sum, item) => sum + item.amount, 0);
    return baseSub + customSub;
  };

  const calculateInvoiceTotal = () => {
    const sub = calculateInvoiceSubtotal();
    const discountAmt = calculateInvoiceDiscountAmount();
    return sub - discountAmt;
  };

  // Quick register walk-in patient flow
  const handleRegisterWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatName) return;

    // Retrieve currently authenticated Supabase user
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      console.error("Walk-in registration failed: user not authenticated", userErr?.message, userErr?.code);
      showToast("You must be logged in to register a walk-in patient.", "error");
      return;
    }

    // Check for duplicate mobile number in database
    const trimmedPhone = (newPatPhone || "").trim();
    if (trimmedPhone) {
      const { data: duplicatePat, error: checkErr } = await supabase
        .from("patients")
        .select("id")
        .eq("phone", trimmedPhone)
        .maybeSingle();

      if (checkErr) {
        console.error("Walk-in registration failed: duplicate phone check error", checkErr.message, checkErr.code);
      } else if (duplicatePat) {
        showToast(`A patient with mobile number ${trimmedPhone} is already registered.`, "error");
        return;
      }
    }

    // Generate unique Patient ID by counting rows in the database
    const { count, error: countErr } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true });

    if (countErr) {
      console.error("Walk-in ID generation failed: count query error", countErr.message, countErr.code);
      showToast("Failed to generate patient ID.", "error");
      return;
    }

    const patientId = `DS-${1000 + (count || 0) + 1}`;

    const { data: insertedPat, error } = await supabase
      .from("patients")
      .insert({
        patient_id: patientId,
        name: newPatName,
        phone: newPatPhone || "+91 99000 11000",
        age: newPatAge,
        gender: newPatGender,
        address: newPatAddress || "Bengaluru",
        visit: "12 Aug 2026",
        medical_notes: newPatAllergies || "None",
        balance: "₹0",
        status: "Active",
        notes: []
      })
      .select()
      .single();

    if (error || !insertedPat) {
      console.error("Walk-in patient insert failed:", error?.message, error?.code);
      showToast("Failed to register walk-in patient in database.", "error");
      return;
    }

    const newPatientRecord: Patient = {
      id: insertedPat.patient_id,
      uuid: insertedPat.id,
      name: insertedPat.name,
      phone: insertedPat.phone,
      age: insertedPat.age,
      gender: insertedPat.gender,
      address: insertedPat.address || "Bengaluru",
      visit: insertedPat.visit || "12 Aug 2026",
      medicalNotes: insertedPat.medical_notes || "None",
      balance: insertedPat.balance || "₹0",
      status: insertedPat.status || "Active",
      dentalChart: {},
      prescriptions: [],
      files: [],
      notes: [],
      createdAt: insertedPat.created_at || new Date().toISOString()
    };

    // Book and check in instantly
    const tokenStr = `T-0${appointments.filter(a => a.status === "Waiting" || a.status === "Checked In" || a.status === "In Procedure" || a.status === "Completed").length + 1}`;

    const docRecord = doctors.find(d => d.name.toLowerCase().includes("sharma"));
    const doctorId = docRecord?.id || null;

    const { data: dbAppt, error: apptErr } = await supabase
      .from("appointments")
      .insert({
        patient_id: insertedPat.id,
        doctor_id: doctorId,
        appointment_date: new Date().toISOString().split("T")[0],
        time_slot: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        procedure_name: "Consultation",
        status: "Waiting",
        queue_token: tokenStr,
        notes: "Walk-in patient check-in."
      })
      .select()
      .single();

    if (apptErr || !dbAppt) {
      console.error("Walk-in appointment insert failed:", apptErr?.message, apptErr?.code);
      showToast("Walk-in registration succeeded, but failed to create queue appointment.", "error");
      setPatients(prev => [newPatientRecord, ...prev]);
      return;
    }

    const walkinAppt: Appointment = {
      id: dbAppt.id,
      patientId: insertedPat.patient_id,
      patientName: insertedPat.name,
      doctor: docRecord ? docRecord.name : "Dr. Sharma",
      treatment: dbAppt.procedure_name || "Consultation",
      time: dbAppt.time_slot || "12:00 PM",
      date: convertToUiDate(dbAppt.appointment_date || ""),
      status: "Waiting",
      notes: dbAppt.notes || "Walk-in patient check-in.",
      token: dbAppt.queue_token || undefined,
      avatarColor: "bg-amber-100 text-amber-600"
    };

    setPatients(prev => [newPatientRecord, ...prev]);
    setAppointments(prev => [...prev, walkinAppt]);

    pushActivity("Register", `Walk-in patient ${newPatName} registered and checked in as Token ${tokenStr}.`);

    // Clear walk-in inputs
    setNewPatName("");
    setNewPatPhone("+91 ");
    setNewPatAddress("");
    setNewPatAllergies("None");
    setActiveModal(null);
  };

  const handleGlobalBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === apptPatientId);
    if (!pat) {
      showToast("Selected patient not found.", "error");
      return;
    }

    let patUuid = pat.uuid;
    if (!patUuid) {
      const { data: dbPat } = await supabase
        .from("patients")
        .select("id")
        .eq("patient_id", apptPatientId)
        .maybeSingle();
      if (dbPat) {
        patUuid = dbPat.id;
      }
    }

    if (!patUuid) {
      showToast("Selected patient has no database UUID associated.", "error");
      return;
    }

    const doctorRecord = doctors.find(d => d.name === apptDoctor);
    const doctorId = doctorRecord?.id || null;

    const { data: dbAppt, error: apptErr } = await supabase
      .from("appointments")
      .insert({
        patient_id: patUuid,
        doctor_id: doctorId,
        appointment_date: convertToDbDate(apptDate),
        time_slot: apptTime,
        procedure_name: apptTreatment,
        status: "Scheduled",
        notes: apptNotes
      })
      .select()
      .single();

    if (apptErr || !dbAppt) {
      console.error("Appointment operation failed:", apptErr?.message, apptErr?.code);
      showToast("Failed to book appointment in database.", "error");
      return;
    }

    const newAppt: Appointment = {
      id: dbAppt.id,
      patientId: pat.id,
      patientName: pat.name,
      doctor: apptDoctor,
      treatment: dbAppt.procedure_name || "Consultation",
      time: dbAppt.time_slot || "09:00 AM",
      date: convertToUiDate(dbAppt.appointment_date || ""),
      status: dbAppt.status as any || "Scheduled",
      notes: dbAppt.notes || "",
      avatarColor: "bg-indigo-100 text-indigo-600"
    };

    setAppointments(prev => [...prev, newAppt]);
    pushActivity("Appointment", `Appointment booked for ${pat.name} at ${apptTime}.`);
    setApptNotes("");
    setActiveModal(null);
  };

  // --- REDESIGNED DASHBOARD WORKFLOW HANDLERS ---
  const handleClearPatientForm = () => {
    setQuickFirstName("");
    setQuickLastName("");
    setQuickMobile("+91 ");
    setQuickGender("Male");
    setQuickAge("");
    setQuickDOB("");
    setQuickLocation("Bengaluru");
    setQuickEmail("");
    setQuickAddress("");
    setQuickBloodGroup("A+");
    setQuickPatientType("New");
    setQuickNotes("");
    setQuickOccupation("");
    setQuickReference("");
    setQuickMedicalHistory([]);
    setQuickMedicalHistoryOthers("");
  };

  const registerPatient = async (patientData: {
    name: string;
    phone: string;
    age: number | string;
    gender: "Male" | "Female";
    address: string;
    medicalNotes: string;
    email?: string;
    bloodGroup?: string;
    patientType?: "New" | "Returning";
    notes?: string[];
    occupation?: string;
    reference?: string;
    medicalHistory?: string[];
    medicalHistoryOthers?: string;
  }) => {
    const trimmedName = patientData.name.trim();
    const trimmedPhone = patientData.phone.trim();
    const parsedAge = typeof patientData.age === "string" ? (parseInt(patientData.age, 10) || 0) : patientData.age;

    if (!trimmedName) {
      showToast("Patient name is required.", "error");
      return false;
    }
    if (!trimmedPhone || trimmedPhone === "+91") {
      showToast("Mobile number is required.", "error");
      return false;
    }
    if (!validate10DigitPhone(trimmedPhone)) {
      showToast("Mobile number must contain exactly 10 digits after +91.", "error");
      return false;
    }

    // Retrieve currently authenticated Supabase user
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      console.error("Patient insert failed: user not authenticated", userErr?.message, userErr?.code);
      showToast("You must be logged in to register a patient.", "error");
      return false;
    }

    // Check for duplicate mobile number in database
    const { data: duplicatePat, error: checkErr } = await supabase
      .from("patients")
      .select("id")
      .eq("phone", trimmedPhone)
      .maybeSingle();

    if (checkErr) {
      console.error("Patient insert failed: duplicate phone check error", checkErr.message, checkErr.code);
    } else if (duplicatePat) {
      showToast(`A patient with mobile number ${trimmedPhone} is already registered.`, "error");
      return false;
    }

    // Generate continuous 4-digit sequential Patient ID (0001, 0002, ...)
    const { data: dbAllPats } = await supabase
      .from("patients")
      .select("patient_id");

    const combinedList = dbAllPats && dbAllPats.length > 0 ? dbAllPats.map(p => ({ id: p.patient_id })) : patients;
    const patientId = getNextSequentialPatientId(combinedList);

    // Perform database insertion
    const { data: insertedPat, error } = await supabase
      .from("patients")
      .insert({
        patient_id: patientId,
        name: trimmedName,
        phone: trimmedPhone,
        age: parsedAge,
        gender: patientData.gender,
        address: patientData.address || "Bengaluru",
        visit: "12 Aug 2026",
        medical_notes: patientData.medicalNotes || "None",
        balance: "₹0",
        status: "Active",
        notes: patientData.notes || [],
        email: patientData.email || null,
        blood_group: patientData.bloodGroup || null,
        patient_type: patientData.patientType || null,
        occupation: patientData.occupation?.trim() || null,
        reference: patientData.reference?.trim() || null,
        medical_history: patientData.medicalHistory || [],
        medical_history_others: patientData.medicalHistoryOthers?.trim() || null
      })
      .select()
      .single();

    if (error || !insertedPat) {
      console.error("Patient insert failed:", error?.message, error?.code);
      showToast("Failed to register patient in database.", "error");
      return false;
    }

    const newPat: Patient = {
      id: insertedPat.patient_id,
      uuid: insertedPat.id,
      name: insertedPat.name,
      phone: insertedPat.phone,
      age: insertedPat.age,
      gender: insertedPat.gender,
      address: insertedPat.address || "Bengaluru",
      visit: insertedPat.visit || "12 Aug 2026",
      medicalNotes: insertedPat.medical_notes || "None",
      balance: insertedPat.balance || "₹0",
      status: insertedPat.status || "Active",
      dentalChart: {},
      prescriptions: [],
      files: [],
      notes: insertedPat.notes || [],
      email: insertedPat.email || undefined,
      bloodGroup: insertedPat.blood_group || undefined,
      patientType: insertedPat.patient_type || undefined,
      occupation: insertedPat.occupation || undefined,
      reference: insertedPat.reference || undefined,
      medicalHistory: Array.isArray(insertedPat.medical_history) ? insertedPat.medical_history : [],
      medicalHistoryOthers: insertedPat.medical_history_others || undefined,
      createdAt: insertedPat.created_at || new Date().toISOString()
    };

    // Update state safely without duplicating
    setPatients(prev => {
      if (prev.some(p => p.id === newPat.id || p.uuid === newPat.uuid)) {
        return prev;
      }
      return [newPat, ...prev];
    });
    pushActivity("Register", `Registered patient ${trimmedName} (${patientId}).`);

    // Add notification
    setNotifications(prev => [
      {
        id: Date.now() + Math.floor(Math.random() * 100000),
        msg: `New Patient ${trimmedName} registered successfully.`,
        unread: true
      },
      ...prev
    ]);

    showToast("Patient registered successfully.", "success");
    return true;
  };

  const handleSavePatientQuick = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${quickFirstName.trim()} ${quickLastName.trim()}`;
    const saved = await registerPatient({
      name: fullName,
      phone: quickMobile,
      age: quickAge,
      gender: quickGender,
      address: quickAddress.trim() || quickLocation,
      medicalNotes: "None",
      email: quickEmail.trim() || undefined,
      bloodGroup: quickBloodGroup,
      patientType: quickPatientType,
      notes: quickNotes.trim() ? [quickNotes.trim()] : [],
      occupation: quickOccupation,
      reference: quickReference,
      medicalHistory: quickMedicalHistory,
      medicalHistoryOthers: quickMedicalHistoryOthers
    });
    if (saved) {
      handleClearPatientForm();
      // Keep focus on first field for next registration
      setTimeout(() => {
        const firstField = document.getElementById("qMobile");
        if (firstField) firstField.focus();
      }, 50);
    }
  };

  const handleSlotBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotData || !slotPatientId) return;

    const pat = patients.find(p => p.id === slotPatientId);
    if (!pat) {
      showToast("Selected patient record not found.", "error");
      return;
    }

    let patUuid = pat.uuid;
    if (!patUuid) {
      const { data: dbPat } = await supabase
        .from("patients")
        .select("id")
        .eq("patient_id", slotPatientId)
        .maybeSingle();
      if (dbPat) {
        patUuid = dbPat.id;
      }
    }

    if (!patUuid) {
      showToast("Selected patient record has no database UUID associated.", "error");
      return;
    }

    const doctorRecord = doctors.find(d => d.name === slotDoctor);
    const doctorId = doctorRecord?.id || null;

    const { data: dbAppt, error: apptErr } = await supabase
      .from("appointments")
      .insert({
        patient_id: patUuid,
        doctor_id: doctorId,
        appointment_date: convertToDbDate(selectedSlotData.date),
        time_slot: selectedSlotData.time,
        procedure_name: slotTreatment,
        status: "Scheduled"
      })
      .select()
      .single();

    if (apptErr || !dbAppt) {
      console.error("Appointment operation failed:", apptErr?.message, apptErr?.code);
      showToast("Failed to book slot appointment in database.", "error");
      return;
    }

    const newAppt: Appointment = {
      id: dbAppt.id,
      patientId: pat.id,
      patientName: pat.name,
      doctor: slotDoctor,
      treatment: dbAppt.procedure_name || "Consultation",
      time: dbAppt.time_slot || "09:00 AM",
      date: convertToUiDate(dbAppt.appointment_date || ""),
      status: dbAppt.status as any || "Scheduled",
      avatarColor: "bg-indigo-100 text-indigo-600"
    };

    setAppointments(prev => [...prev, newAppt]);
    pushActivity("Appointment", `Booked appointment for ${pat.name} on ${selectedSlotData.date} at ${selectedSlotData.time}.`);

    // Clear and close
    setSlotPatientId("");
    setSelectedSlotData(null);
  };

  const handleBlockSlotToggle = async (date: string, time: string, doctorId: string | null = null) => {
    const dbDate = convertToDbDate(date);
    const normalizedTime = normalizeTimeSlot(time);
    const existingBlock = blockedSlotsList.find(b => {
      const bDate = convertToDbDate(convertToUiDate(b.blocked_date));
      const bTime = normalizeTimeSlot(b.time_slot);
      return bDate === dbDate && bTime === normalizedTime;
    });

    if (existingBlock) {
      const { error } = await supabase.from("blocked_slots").delete().eq("id", existingBlock.id);
      if (!error) {
        setBlockedSlotsList(prev => prev.filter(b => b.id !== existingBlock.id));
        setBlockedSlots(prev => {
          const copy = { ...prev };
          delete copy[`${date}_${time}`];
          return copy;
        });
        pushActivity("Appointment", `Unblocked slot on ${date} at ${normalizedTime}.`);
      }
    } else {
      const { data: dbBlock, error } = await supabase
        .from("blocked_slots")
        .insert({
          blocked_date: dbDate,
          time_slot: normalizedTime,
          doctor_id: doctorId
        })
        .select()
        .single();
      if (!error && dbBlock) {
        setBlockedSlotsList(prev => [...prev, dbBlock]);
        setBlockedSlots(prev => ({ ...prev, [`${date}_${time}`]: true }));
        pushActivity("Appointment", `Blocked slot on ${date} at ${normalizedTime}.`);
      }
    }
    setSelectedSlotData(null);
  };

  // Today's appointments custom transitions
  const handleApptCheckIn = async (apptId: string) => {
    const activeApptsCount = appointments.filter(a => a.status === "Waiting" || a.status === "Checked In" || a.status === "In Procedure" || a.status === "Completed").length;
    const tokenStr = `T-0${activeApptsCount + 1}`;

    const { error } = await supabase
      .from("appointments")
      .update({ status: "Checked In", queue_token: tokenStr })
      .eq("id", apptId);

    if (error) {
      console.error("Appointment operation failed:", error.message, error.code);
      showToast("Failed to update status in database.", "error");
      return;
    }

    setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: "Checked In", token: tokenStr } : a));

    const app = appointments.find(a => a.id === apptId);
    if (app) {
      pushActivity("Appointment", `${app.patientName} checked in. Token ${tokenStr} assigned.`);
      setNotifications(prev => [{ id: Date.now() + Math.floor(Math.random() * 100000), msg: `Token ${tokenStr} (${app.patientName}) arrived.`, unread: true }, ...prev]);
    }
    if (selectedSlotData && selectedSlotData.appointment?.id === apptId) {
      setSelectedSlotData(null);
    }
  };

  const handleApptStartProcedure = async (apptId: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "In Procedure" })
      .eq("id", apptId);

    if (error) {
      console.error("Appointment operation failed:", error.message, error.code);
      showToast("Failed to update status in database.", "error");
      return;
    }

    setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: "In Procedure" } : a));
    const app = appointments.find(a => a.id === apptId);
    if (app) {
      setDoctors(prev => prev.map(d => d.name === app.doctor ? { ...d, status: "In Consultation" } : d));
      pushActivity("Treatment", `Procedure started for ${app.patientName} with ${app.doctor}.`);
    }
    if (selectedSlotData && selectedSlotData.appointment?.id === apptId) {
      setSelectedSlotData(null);
    }
  };

  const handleApptCompleteProcedure = async (apptId: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "Completed" })
      .eq("id", apptId);

    if (error) {
      console.error("Appointment operation failed:", error.message, error.code);
      showToast("Failed to complete appointment in database.", "error");
      return;
    }

    setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: "Completed" } : a));
    const app = appointments.find(a => a.id === apptId);
    if (app) {
      setDoctors(prev => prev.map(d => d.name === app.doctor ? { ...d, status: "Available" } : d));
      pushActivity("Treatment", `Procedure completed for ${app.patientName} for ${app.treatment}.`);

      // Auto-generate invoice
      const invoiceNum = `INV-${1000 + invoices.length + 1}`;
      const treatmentCost = 0;
      const invoiceItems = [{ description: `${app.treatment} Fee`, amount: treatmentCost }];
      const sub = treatmentCost;
      const tot = sub;

      const newInvoice: InvoiceItem = {
        id: invoiceNum,
        patientId: app.patientId,
        patientName: app.patientName,
        doctor: app.doctor,
        treatment: app.treatment,
        items: invoiceItems,
        discount: 0,
        tax: 0,
        subtotal: sub,
        total: tot,
        paidAmount: 0,
        status: "Pending",
        paymentDate: "12 Aug 2026",
        paymentLogs: []
      };

      setInvoices(prev => [newInvoice, ...prev]);
      await insertBillingRecord(newInvoice);
      pushActivity("Billing", `Invoice ${invoiceNum} generated for ${app.patientName}.`);
    }
    if (selectedSlotData && selectedSlotData.appointment?.id === apptId) {
      setSelectedSlotData(null);
    }
  };

  const handleApptGenerateBill = async (apptId: string) => {
    const app = appointments.find(a => a.id === apptId);
    if (app) {
      const inv = invoices.find(i => i.patientId === app.patientId && i.status === "Pending");
      if (inv) {
        setSelectedInvoiceForPayment(inv);
        setPayCash(0);
        setPayUpi(0);
        setPayCard(0);
        setPayDiscountPercent(inv.discount);
        setPayTaxPercent(0);
        setPayCustomItems([]);
      } else {
        // Create quick invoice if not already created
        const invoiceNum = `INV-${1000 + invoices.length + 1}`;
        const treatmentCost = 0;
        const invoiceItems = [{ description: `${app.treatment} Fee`, amount: treatmentCost }];
        const sub = treatmentCost;
        const tot = sub;

        const newInvoice: InvoiceItem = {
          id: invoiceNum,
          patientId: app.patientId,
          patientName: app.patientName,
          doctor: app.doctor,
          treatment: app.treatment,
          items: invoiceItems,
          discount: 0,
          tax: 0,
          subtotal: sub,
          total: tot,
          paidAmount: 0,
          status: "Pending",
          paymentDate: "12 Aug 2026",
          paymentLogs: []
        };
        setInvoices(prev => [newInvoice, ...prev]);
        await insertBillingRecord(newInvoice);
        setSelectedInvoiceForPayment(newInvoice);
        setPayCash(0);
        setPayUpi(0);
        setPayCard(0);
        setPayDiscountPercent(0);
        setPayTaxPercent(0);
        setPayCustomItems([]);
      }
    }
    if (selectedSlotData && selectedSlotData.appointment?.id === apptId) {
      setSelectedSlotData(null);
    }
  };

  const selectTab = (tabName: string) => {
    if (isReceptionist && (tabName === "Reports" || tabName === "Settings")) {
      showToast("Access Restricted: Reports and Settings require Owner / Dentist access.", "error");
      setActiveTab("Dashboard");
      setActiveSubTab("Overview");
      setSelectedPatientId(null);
      return;
    }
    setActiveTab(tabName);
    setActiveSubTab(moduleSubTabs[tabName]?.[0] || "");
    setSelectedPatientId(null);
  };

  // --- RENDER MODULE SCREENS ---

  const renderScheduleTimeline = () => (
    <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <span className="font-semibold text-[18px] text-slate-800 dark:text-white">Today's Schedule</span>
        <span className="text-[12px] bg-slate-100 text-slate-655 px-2 py-0.5 rounded-full font-normal">{activeDashboardDate}</span>
      </div>

      <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
        {appointments.filter(a => a.date === activeDashboardDate).map((app) => (
          <div key={app.id} className="flex gap-4 relative items-start group">
            <div className={`h-9 w-9 rounded-full shrink-0 flex items-center justify-center font-bold text-xs border-2 border-white dark:border-slate-955 shadow-xs z-10 ${
              app.status === "Completed" ? "bg-emerald-500 text-white" :
              app.status === "In Consultation" ? "bg-blue-600 text-white animate-pulse" :
              app.status === "Waiting" ? "bg-amber-500 text-white animate-pulse" :
              app.status === "Cancelled" ? "bg-slate-200 text-slate-500" : "bg-slate-400 text-white"
            }`}>
              {app.token ? app.token : "S"}
            </div>

            <div className="flex-grow py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100/50 dark:border-slate-900/40 last:border-0 hover:bg-slate-50/10 transition-all duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-semibold text-slate-900 dark:text-white">{app.patientName}</span>
                  <span className="text-[14px] font-normal text-slate-450">• {app.treatment}</span>
                </div>
                {(() => {
                  const patPhone = patients.find(p => p.id === app.patientId)?.phone || "";
                  return (
                    <div className="text-[14px] font-normal text-slate-500 dark:text-slate-400">
                      <span>Doctor: <span className="font-normal text-slate-700 dark:text-slate-350">{app.doctor}</span></span>
                      <span className="mx-2">•</span>
                      <span>Time: <span className="text-[16px] font-medium text-slate-700 dark:text-slate-305">{app.time}</span></span>
                      {patPhone && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Phone: <span className="font-normal text-slate-655">{patPhone}</span></span>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="flex gap-2 shrink-0">
                {app.status === "Scheduled" && (
                  <button onClick={() => handleCheckIn(app.id)} className="h-8 px-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs">Check In</button>
                )}
                {app.status === "Waiting" && (
                  <button onClick={() => handleStartConsultation(app.id)} className="h-8 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs">Start Consult</button>
                )}
                {app.status === "In Consultation" && (
                  <button onClick={() => handleStartConsultation(app.id)} className="h-8 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs">In Consult</button>
                )}
                {app.status !== "Completed" && app.status !== "Cancelled" && (
                  <button onClick={async () => {
                    const { error } = await supabase
                      .from("appointments")
                      .update({ status: "Cancelled" })
                      .eq("id", app.id);
                    if (error) {
                      console.error("Appointment operation failed:", error.message, error.code);
                      showToast("Failed to cancel appointment in database.", "error");
                      return;
                    }
                    setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, status: "Cancelled" } : a));
                  }} className="h-8 px-2.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold">Cancel</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWaitingRoom = () => (
    <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <span className="font-bold text-xs text-slate-400 uppercase tracking-wider block mb-3">Appointments Waiting Queue</span>
      <div className="space-y-3">
        {appointments.filter(a => a.status === "Waiting").length > 0 ? (
          appointments.filter(a => a.status === "Waiting").map((item) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between text-xs font-semibold border-b border-slate-100/50 dark:border-slate-900/40 last:border-0">
              <div>
                <span className="font-bold block">{item.patientName} ({item.token})</span>
                <p className="text-[10px] text-slate-500 mt-1">Doctor: {item.doctor} • {item.treatment}</p>
              </div>
              <button
                onClick={() => handleStartConsultation(item.id)}
                className="h-7 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-bold text-[10px]"
              >
                Call In
              </button>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 py-3 text-center">No patients currently waiting.</p>
        )}
      </div>
    </div>
  );

  const renderDashboardModule = () => {
    const CALENDAR_DAYS = Array.from({ length: 7 }, (_, idx) => {
      const dateObj = new Date(currentWeekStart.getTime());
      dateObj.setDate(currentWeekStart.getDate() + idx);

      const dayNum = dateObj.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthStr = monthNames[dateObj.getMonth()];
      const yearStr = dateObj.getFullYear();

      const dateString = `${dayNum < 10 ? '0' + dayNum : dayNum} ${monthStr} ${yearStr}`;
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const name = dayNames[dateObj.getDay()];
      const fullName = fullDayNames[dateObj.getDay()];
      return {
        name,
        fullName,
        date: dateString,
        isToday: dateString === dynamicTodayUiDate
      };
    });

    const firstDay = new Date(currentWeekStart.getTime());
    const lastDay = new Date(currentWeekStart.getTime());
    lastDay.setDate(firstDay.getDate() + 6);

    const firstMonthStr = firstDay.toLocaleDateString("en-US", { month: "short" });
    const lastMonthStr = lastDay.toLocaleDateString("en-US", { month: "short" });
    const firstYear = firstDay.getFullYear();
    const lastYear = lastDay.getFullYear();

    let monthYearDisplay = "";
    if (firstMonthStr === lastMonthStr && firstYear === lastYear) {
      const fullMonth = firstDay.toLocaleDateString("en-US", { month: "long" });
      monthYearDisplay = `${fullMonth} ${firstYear}`;
    } else if (firstYear === lastYear) {
      monthYearDisplay = `${firstMonthStr} / ${lastMonthStr} ${firstYear}`;
    } else {
      monthYearDisplay = `${firstMonthStr} ${firstYear} / ${lastMonthStr} ${lastYear}`;
    }

    const handlePrevWeek = () => {
      const newStart = new Date(currentWeekStart.getTime());
      newStart.setDate(currentWeekStart.getDate() - 7);
      setCurrentWeekStart(newStart);
    };

    const handleNextWeek = () => {
      const newStart = new Date(currentWeekStart.getTime());
      newStart.setDate(currentWeekStart.getDate() + 7);
      setCurrentWeekStart(newStart);
    };

    const MORNING_SLOTS = [
      "09:00 AM", "09:15 AM", "09:30 AM", "09:45 AM",
      "10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM",
      "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM",
      "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM"
    ];

    const EVENING_SLOTS = [
      "04:30 PM", "04:45 PM",
      "05:00 PM", "05:15 PM", "05:30 PM", "05:45 PM",
      "06:00 PM", "06:15 PM", "06:30 PM", "06:45 PM",
      "07:00 PM", "07:15 PM", "07:30 PM", "07:45 PM",
      "08:00 PM", "08:15 PM"
    ];

    // Slot matcher helper
    const getApptForSlot = (date: string, timeSlot: string) => {
      const cleanT = (t: string) => t.trim().toLowerCase().replace(/^0/, "");
      return appointments.find(a => a.date === date && cleanT(a.time) === cleanT(timeSlot) && a.status !== "Cancelled");
    };

    // Counters mapping
    const counters = [
      { title: "Today's Appointments", count: kpiCounts.todayAppointments, desc: "Active today", color: "text-blue-600", bg: "bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30" },
      { title: "Walk-ins", count: kpiCounts.walkins, desc: "Walk-ins today", color: "text-cyan-600", bg: "bg-cyan-50/40 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/30" },
      { title: "Patients Waiting", count: kpiCounts.waiting, desc: "Waiting room", color: "text-amber-600 animate-pulse", bg: "bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30" },
      { title: "In Procedure", count: kpiCounts.inTreatment, desc: "Active chairs", color: "text-orange-600", bg: "bg-orange-50/40 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30" },
      { title: "Completed Today", count: kpiCounts.completedToday, desc: "Finished sessions", color: "text-emerald-600", bg: "bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30" },
      { title: "Pending Bills", count: kpiCounts.pendingBills, desc: "Unpaid checkouts", color: "text-red-600", bg: "bg-red-50/40 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30" },
      { title: "Revenue Today", count: `₹${kpiCounts.revenueToday.toLocaleString()}`, desc: "Collected", color: "text-indigo-600", bg: "bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30" }
    ];

    // Recently added filter & sort computations
    const filteredPatients = patients
      .filter(p => {
        if (!patientSearchQuery.trim()) return true;
        const q = patientSearchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.phone.includes(q);
      })
      .filter(p => {
        if (patientFilterGender === "All") return true;
        return p.gender === patientFilterGender;
      })
      .sort((a, b) => {
        if (patientSortBy === "Name-ASC") return a.name.localeCompare(b.name);
        if (patientSortBy === "Name-DESC") return b.name.localeCompare(a.name);
        if (patientSortBy === "ID-ASC") return a.id.localeCompare(b.id);
        if (patientSortBy === "ID-DESC") return b.id.localeCompare(a.id);

        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return 0;
      });

    const displayedPatients = filteredPatients.slice(0, patientVisibleCount);

    // Get next scheduled appointment for alert strip
    const nextScheduled = appointments
      .filter(a => a.date === activeDashboardDate && a.status === "Scheduled")
      .sort((a, b) => a.time.localeCompare(b.time))[0];

    // Today's appointments filtered list
    const todayApptsList = appointments.filter(a => a.date === activeDashboardDate && a.status !== "Cancelled");

    // 15-Day Performance Tracker Data
    const performanceData = [
      { date: "29 Jul", fullDate: "Jul 29, 2026", consultations: 12, appointments: 8, newPatients: 2 },
      { date: "30 Jul", fullDate: "Jul 30, 2026", consultations: 15, appointments: 10, newPatients: 3 },
      { date: "31 Jul", fullDate: "Jul 31, 2026", consultations: 18, appointments: 12, newPatients: 4 },
      { date: "1 Aug", fullDate: "Aug 1, 2026", consultations: 14, appointments: 11, newPatients: 3 },
      { date: "2 Aug", fullDate: "Aug 2, 2026", consultations: 8, appointments: 6, newPatients: 1 },
      { date: "3 Aug", fullDate: "Aug 3, 2026", consultations: 10, appointments: 8, newPatients: 2 },
      { date: "4 Aug", fullDate: "Aug 4, 2026", consultations: 16, appointments: 11, newPatients: 4 },
      { date: "5 Aug", fullDate: "Aug 5, 2026", consultations: 20, appointments: 14, newPatients: 5 },
      { date: "6 Aug", fullDate: "Aug 6, 2026", consultations: 15, appointments: 12, newPatients: 3 },
      { date: "7 Aug", fullDate: "Aug 7, 2026", consultations: 12, appointments: 9, newPatients: 2 },
      { date: "8 Aug", fullDate: "Aug 8, 2026", consultations: 9, appointments: 7, newPatients: 1 },
      { date: "9 Aug", fullDate: "Aug 9, 2026", consultations: 14, appointments: 10, newPatients: 3 },
      { date: "10 Aug", fullDate: "Aug 10, 2026", consultations: 18, appointments: 13, newPatients: 4 },
      { date: "11 Aug", fullDate: "Aug 11, 2026", consultations: 22, appointments: 16, newPatients: 6 },
      { date: "12 Aug", fullDate: "Aug 12, 2026", consultations: 19, appointments: 14, newPatients: 5 }
    ];

    const consultationsPoints = performanceData.map((d, i) => ({ x: 40 + i * 67.14, y: 210 - d.consultations * 7.6 }));
    const appointmentsPoints = performanceData.map((d, i) => ({ x: 40 + i * 67.14, y: 210 - d.appointments * 7.6 }));
    const newPatientsPoints = performanceData.map((d, i) => ({ x: 40 + i * 67.14, y: 210 - d.newPatients * 7.6 }));

    const getBezierPath = (pts: { x: number; y: number }[]) => {
      if (pts.length === 0) return "";
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 3;
        const cpY1 = p0.y;
        const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
        const cpY2 = p1.y;
        d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }
      return d;
    };

    const bezierConsultations = getBezierPath(consultationsPoints);
    const bezierAppointments = getBezierPath(appointmentsPoints);
    const bezierNewPatients = getBezierPath(newPatientsPoints);

    // Dynamic Chair Status Helper
    const activeProcedures = appointments.filter(a => a.date === activeDashboardDate && a.status === "In Procedure");
    const chairMap = [
      { id: "Chair 1", doc: "Dr. Sharma", status: activeProcedures[0] ? `Occupied by ${activeProcedures[0].patientName}` : "Available", color: activeProcedures[0] ? "bg-orange-100 text-orange-700" : "bg-emerald-50 text-emerald-700" },
      { id: "Chair 2", doc: "Dr. Priya", status: activeProcedures[1] ? `Occupied by ${activeProcedures[1].patientName}` : "Available", color: activeProcedures[1] ? "bg-orange-100 text-orange-700" : "bg-emerald-50 text-emerald-700" },
      { id: "Chair 3", doc: "Dr. Rahul", status: activeProcedures[2] ? `Occupied by ${activeProcedures[2].patientName}` : "Available", color: activeProcedures[2] ? "bg-orange-100 text-orange-700" : "bg-emerald-50 text-emerald-700" }
    ];

    // Collections by method today
    const collectionsToday = invoices
      .flatMap(inv => inv.paymentLogs || [])
      .filter(log => log.date === activeDashboardDate);
    const cashTotal = collectionsToday.filter(l => l.method === "Cash").reduce((s, l) => s + l.amount, 0);
    const upiTotal = collectionsToday.filter(l => l.method.includes("UPI") || l.method.includes("GPay")).reduce((s, l) => s + l.amount, 0);
    const cardTotal = collectionsToday.filter(l => l.method === "Card").reduce((s, l) => s + l.amount, 0);

    const handleQuickEditPatient = async (pat: Patient) => {
      const newPhone = prompt(`Edit Mobile Number for ${pat.name}:`, pat.phone);
      if (newPhone !== null) {
        const { error } = await supabase
          .from("patients")
          .update({ phone: newPhone })
          .eq("patient_id", pat.id);

        if (error) {
          console.error("Patient quick edit phone failed:", error.message, error.code);
          showToast("Failed to update patient phone in database.", "error");
          return;
        }

        setPatients(prev => prev.map(p => p.id === pat.id ? { ...p, phone: newPhone } : p));
        pushActivity("Register", `Updated phone number for ${pat.name} to ${newPhone}.`);
      }
    };

    const handleQuickGenerateBill = async (pat: Patient) => {
      const invoiceNum = `INV-${1000 + invoices.length + 1}`;
      const newInvoice: InvoiceItem = {
        id: invoiceNum,
        patientId: pat.id,
        patientName: pat.name,
        doctor: "Dr. Sharma",
        treatment: "Consultation",
        items: [{ description: "Consultation Fee", amount: 500 }],
        discount: 0,
        tax: 0,
        subtotal: 500,
        total: 500,
        paidAmount: 0,
        status: "Pending",
        paymentDate: "12 Aug 2026",
        paymentLogs: []
      };
      setInvoices(prev => [newInvoice, ...prev]);
      await insertBillingRecord(newInvoice);
      setSelectedInvoiceForPayment(newInvoice);
      setPayCash(0);
      setPayUpi(0);
      setPayCard(0);
      setPayDiscountPercent(0);
      setPayTaxPercent(0);
      setPayCustomItems([]);
      pushActivity("Billing", `Invoice ${invoiceNum} generated for ${pat.name}.`);
    };

    return (
      <div className="dashboard-container space-y-4 animate-fadeIn text-slate-700">
        {/* TOP ROW: Weekly Appointment Calendar (LEFT) + Today's Schedule (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* SECTION 1 - Weekly Appointment Calendar */}
          <div className="calendar-card lg:col-span-8 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-semibold text-[18px] text-slate-900 dark:text-white">Weekly Appointment Calendar</span>
                <span className="bg-blue-50 text-blue-755 dark:bg-blue-955/40 dark:text-blue-400 px-2.5 py-0.5 rounded-full text-[13px] font-semibold">
                  Total Appointments Today: {kpiCounts.todayAppointments}
                </span>
              </div>
              <div className="text-xs font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg">
                {monthYearDisplay}
              </div>
            </div>

            {/* Day Selector Navigation Row */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">
              <button
                type="button"
                onClick={handlePrevWeek}
                className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-455 flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 shrink-0"
                title="Previous Week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex-1 min-w-0 overflow-x-auto scrollbar-none sm:overflow-visible py-0.5 px-0.5">
                <div className="flex sm:grid sm:grid-cols-7 gap-2">
                  {CALENDAR_DAYS.map((d) => {
                    const isActive = selectedCalendarDay === d.date;
                    const hasAppts = appointments.some(a => a.date === d.date && a.status !== "Cancelled");
                    return (
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => setSelectedCalendarDay(d.date)}
                        className={`day-btn flex-shrink-0 min-w-[56px] sm:min-w-0 flex-1 flex flex-col items-center justify-center py-2 sm:py-2.5 px-1.5 rounded-xl transition-all border outline-none cursor-pointer select-none ${
                          isActive
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm scale-100 sm:scale-105"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <span className="text-[10px] sm:text-[12px] font-normal uppercase tracking-wider opacity-70 mb-0.5 whitespace-nowrap">{d.name}</span>
                        <span className="text-[14px] font-medium flex items-center gap-1 leading-none">
                          {parseInt(d.date.split(" ")[0])}
                        </span>
                        {hasAppts && (
                          <span className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${isActive ? "bg-white" : "bg-blue-600"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextWeek}
                className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-455 flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 shrink-0"
                title="Next Week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Split Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 relative">
              {/* Vertical Column Separator Line */}
              <div className="hidden md:block absolute left-1/2 top-1 bottom-1 w-px bg-slate-100 dark:bg-slate-800/80 -translate-x-1/2 pointer-events-none" />

              {/* MORNING SLOTS */}
              <div className="space-y-3 md:pr-2">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Sun className="h-4 w-4 text-slate-700 dark:text-slate-300 shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white text-sm">Morning Sessions</span>
                  <span className="text-[11px] text-slate-400 font-medium ml-auto">09:00 AM - 01:00 PM</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MORNING_SLOTS.map((time) => {
                    const appt = getApptForSlot(selectedCalendarDay, time);
                    const isBlocked = blockedSlots[`${selectedCalendarDay}_${time}`];

                    let statusText = "Open Slot";
                    let statusBadge = "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400";
                    let btnStyle = "border-slate-200 hover:border-blue-300 dark:border-slate-800 hover:bg-blue-50/20";

                    if (appt) {
                      statusText = appt.patientName;
                      if (appt.status === "Scheduled") {
                        statusBadge = "bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-bold";
                        btnStyle = "border-blue-300 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20";
                      } else if (appt.status === "Checked In" || appt.status === "Waiting") {
                        statusBadge = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300";
                        btnStyle = "border-emerald-300 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-955/20";
                      } else if (appt.status === "In Procedure") {
                        statusBadge = "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300";
                        btnStyle = "border-orange-300 bg-orange-50/30 dark:border-orange-900 dark:bg-orange-955/20";
                      } else if (appt.status === "Completed") {
                        statusBadge = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                        btnStyle = "border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/30";
                      }
                    } else if (isBlocked) {
                      statusText = "Blocked";
                      statusBadge = "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
                      btnStyle = "border-slate-200 bg-slate-100/50 dark:border-slate-800 dark:bg-slate-900/50 opacity-60";
                    }

                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setHoveredSlotPopover(null);
                          setSlotPatientId("");
                          setSelectedSlotData({ date: selectedCalendarDay, time, appointment: appt });
                        }}
                        onMouseEnter={(e) => {
                          if (appt) {
                            handleSlotMouseEnter(e.currentTarget.getBoundingClientRect(), appt);
                          }
                        }}
                        onMouseLeave={() => {
                          if (appt) {
                            handleSlotMouseLeave();
                          }
                        }}
                        className={`slot-btn ${!appt && !isBlocked ? "slot-btn-empty" : ""} p-2.5 rounded-xl border text-[10px] transition-all ${
                          appt
                            ? "bg-white shadow-xs border-slate-200/80 dark:bg-slate-955 dark:border-slate-800 flex flex-col justify-between items-start text-left"
                            : isBlocked
                              ? "bg-slate-100/30 dark:bg-slate-900/20 border-slate-100 dark:border-slate-900 flex flex-col justify-between items-start text-left"
                              : "bg-slate-50/20 border-dashed border-slate-200/60 dark:bg-slate-900/10 dark:border-slate-800/40 opacity-75 flex items-center justify-center text-center"
                        } h-20 ${btnStyle}`}
                      >
                        {appt ? (
                          <>
                            <span className="slot-time font-bold">{formatTo12h(time)}</span>
                            <div className="w-full mt-1">
                              <span className={`slot-badge px-1.5 py-0.5 rounded text-[8px] font-bold inline-block uppercase tracking-wider ${statusBadge}`}>
                                {appt?.status === "In Consultation" ? "Consult" : appt?.status === "In Procedure" ? "Procedure" : appt?.status}
                              </span>
                            </div>
                          </>
                        ) : isBlocked ? (
                          <>
                            <span className="slot-time font-bold">{formatTo12h(time)}</span>
                            <span className="slot-open-label text-[9px] font-bold flex items-center gap-1 mt-1 text-slate-400">
                              🔒 Blocked
                            </span>
                          </>
                        ) : (
                          <span className="slot-time">{formatTo12h(time)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* EVENING SLOTS */}
              <div className="space-y-3 md:pl-2">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300 shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white text-sm">Evening Sessions</span>
                  <span className="text-[11px] text-slate-400 font-medium ml-auto">04:30 PM - 08:30 PM</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EVENING_SLOTS.map((time) => {
                    const appt = getApptForSlot(selectedCalendarDay, time);
                    const isBlocked = blockedSlots[`${selectedCalendarDay}_${time}`];

                    let statusText = "Open Slot";
                    let statusBadge = "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400";
                    let btnStyle = "border-slate-200 hover:border-blue-300 dark:border-slate-800 hover:bg-blue-50/20";

                    if (appt) {
                      statusText = appt.patientName;
                      if (appt.status === "Scheduled") {
                        statusBadge = "bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-bold";
                        btnStyle = "border-blue-300 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-955/20";
                      } else if (appt.status === "Checked In" || appt.status === "Waiting") {
                        statusBadge = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300";
                        btnStyle = "border-emerald-300 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-955/20";
                      } else if (appt.status === "In Procedure") {
                        statusBadge = "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300";
                        btnStyle = "border-orange-300 bg-orange-50/30 dark:border-orange-900 dark:bg-orange-955/20";
                      } else if (appt.status === "Completed") {
                        statusBadge = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                        btnStyle = "border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/30";
                      }
                    } else if (isBlocked) {
                      statusText = "Blocked";
                      statusBadge = "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
                      btnStyle = "border-slate-200 bg-slate-100/50 dark:border-slate-800 dark:bg-slate-900/50 opacity-60";
                    }

                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setHoveredSlotPopover(null);
                          setSlotPatientId("");
                          setSelectedSlotData({ date: selectedCalendarDay, time, appointment: appt });
                        }}
                        onMouseEnter={(e) => {
                          if (appt) {
                            handleSlotMouseEnter(e.currentTarget.getBoundingClientRect(), appt);
                          }
                        }}
                        onMouseLeave={() => {
                          if (appt) {
                            handleSlotMouseLeave();
                          }
                        }}
                        className={`slot-btn ${!appt && !isBlocked ? "slot-btn-empty" : ""} p-2.5 rounded-xl border text-[10px] transition-all ${
                          appt
                            ? "bg-white shadow-xs border-slate-200/80 dark:bg-slate-955 dark:border-slate-800 flex flex-col justify-between items-start text-left"
                            : isBlocked
                              ? "bg-slate-100/30 dark:bg-slate-900/20 border-slate-100 dark:border-slate-900 flex flex-col justify-between items-start text-left"
                              : "bg-slate-50/20 border-dashed border-slate-200/60 dark:bg-slate-900/10 dark:border-slate-800/40 opacity-75 flex items-center justify-center text-center"
                        } h-20 ${btnStyle}`}
                      >
                        {appt ? (
                          <>
                            <span className="slot-time font-bold">{formatTo12h(time)}</span>
                            <div className="w-full mt-1">
                              <span className={`slot-badge px-1.5 py-0.5 rounded text-[8px] font-bold inline-block uppercase tracking-wider ${statusBadge}`}>
                                {appt?.status === "In Consultation" ? "Consult" : appt?.status === "In Procedure" ? "Procedure" : appt?.status}
                              </span>
                            </div>
                          </>
                        ) : isBlocked ? (
                          <>
                            <span className="slot-time font-bold">{formatTo12h(time)}</span>
                            <span className="slot-open-label text-[9px] font-bold flex items-center gap-1 mt-1 text-slate-400">
                              🔒 Blocked
                            </span>
                          </>
                        ) : (
                          <span className="slot-time">{formatTo12h(time)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4 - Today's Schedule (RIGHT) */}
          <div className="list-card lg:col-span-4 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col h-[530px]">
            <div className="flex justify-between items-center mb-3 shrink-0">
              <span className="font-semibold text-[18px] block">Today's Schedule</span>
              <span className="text-[12px] bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-bold">
                {todayApptsList.length} {todayApptsList.length === 1 ? "Appointment" : "Appointments"}
              </span>
            </div>

            <div className="flex-grow overflow-y-auto pr-1 scrollbar-thin flex flex-col">
              {todayApptsList.length > 0 ? (
                <div className="space-y-3 flex-grow">
                  {todayApptsList.map((app) => {
                    const patientPhone = patients.find((p) => p.id === app.patientId)?.phone || "+91 99000 11000";

                    return (
                      <div
                        key={app.id}
                        className="p-3.5 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/20 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-all shadow-2xs space-y-2 flex flex-col justify-between"
                      >
                        {/* First Line: Patient Name & Appt Time */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center min-w-0 pr-2">
                            {/* Status Indicator Dot */}
                            {app.status === "Scheduled" && <span className="h-2 w-2 rounded-full bg-blue-500 mr-2 shrink-0" title="Scheduled" />}
                            {(app.status === "Checked In" || app.status === "Waiting") && <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 shrink-0" title="Checked In" />}
                            {app.status === "In Procedure" && <span className="h-2 w-2 rounded-full bg-orange-500 mr-2 shrink-0 animate-pulse" title="In Procedure" />}
                            {app.status === "Completed" && <span className="h-2 w-2 rounded-full bg-slate-400 mr-2 shrink-0" title="Completed" />}
                            <span className="font-semibold text-[16px] text-slate-800 dark:text-slate-200 truncate leading-none">{app.patientName}</span>
                          </div>
                          <span className="text-[13px] font-semibold text-slate-650 dark:text-slate-400 shrink-0 leading-none">{formatTo12h(app.time)}</span>
                        </div>

                        {/* Second Line: Doctor Name */}
                        <p className="text-[12px] text-slate-455 dark:text-slate-400 font-normal leading-none pl-4">
                          {app.doctor}
                        </p>

                        {/* Third Line: Treatment */}
                        <p className="text-[12px] text-slate-455 dark:text-slate-400 font-normal leading-none pl-4">
                          {app.treatment}
                        </p>

                        {/* Fourth Line: Phone Number */}
                        <p className="text-[12px] text-slate-455 dark:text-slate-400 font-normal leading-none pl-4">
                          {patientPhone}
                        </p>

                        {/* Bottom Row: Actions */}
                        <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100/60 dark:border-slate-800/65">
                          {/* ✓ Check In / Action Button */}
                          {app.status === "Scheduled" ? (
                            <button
                              type="button"
                              onClick={() => handleApptCheckIn(app.id)}
                              className="flex-grow h-[34px] rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11.5px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              ✓ Check In
                            </button>
                          ) : app.status === "Checked In" || app.status === "Waiting" ? (
                            <button
                              type="button"
                              onClick={() => handleApptStartProcedure(app.id)}
                              className="flex-grow h-[34px] rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11.5px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              ✓ Start
                            </button>
                          ) : app.status === "In Procedure" ? (
                            <button
                              type="button"
                              onClick={() => handleApptCompleteProcedure(app.id)}
                              className="flex-grow h-[34px] rounded-lg bg-orange-500 hover:bg-orange-455 text-white font-medium text-[11.5px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              ✓ Complete
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="flex-grow h-[34px] rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-400 font-medium text-[11.5px] flex items-center justify-center gap-1 cursor-not-allowed"
                            >
                              ✓ Completed
                            </button>
                          )}

                          {/* Reschedule Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setRescheduleModalAppt(app);
                              setReschedulePickerDate(convertToDbDate(app.date));
                              const tObj = parseTimeString(app.time);
                              setRescheduleHour(tObj.hour);
                              setRescheduleMinute(tObj.minute);
                              setRescheduleAmPm(tObj.ampm);
                            }}
                            className="px-3.5 h-[34px] rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-900 font-medium text-[11.5px] transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
                          >
                            Reschedule
                          </button>

                          {/* Billing Icon Button */}
                          <button
                            type="button"
                            onClick={() => handleApptGenerateBill(app.id)}
                            className="h-[34px] w-[34px] rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center transition-colors shrink-0 cursor-pointer duration-200"
                            title="Generate Bill"
                          >
                            <Receipt className="h-[18px] w-[18px]" />
                          </button>

                          {/* WhatsApp Communication Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const rawPhone = patients.find((p) => p.id === app.patientId)?.phone || patientPhone || "";
                              const whatsappNumber = formatWhatsAppRecipientNumber(rawPhone);
                              const message = `Hello ${app.patientName},

This is a reminder from ${clinicName} regarding your dental appointment.

🦷 Treatment: ${app.treatment}
📅 Date: ${app.date}
🕒 Time: ${app.time}

Please arrive 10 minutes before your scheduled appointment.

If you need to reschedule, please reply to this message.

Thank you,
${clinicName}`;
                              const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                              window.open(whatsappUrl, "_blank", "noopener,noreferrer");
                            }}
                            className="h-[34px] w-[34px] rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-355 hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/20 flex items-center justify-center transition-colors shrink-0 cursor-pointer duration-200"
                            title="WhatsApp Communication"
                          >
                            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" xmlns="http://www.w3.org/2000/svg">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.426-.003 9.84-4.42 9.843-9.848.002-2.63-1.02-5.101-2.879-6.963-1.859-1.862-4.332-2.887-6.965-2.888-5.432 0-9.85 4.417-9.853 9.848-.001 1.554.385 3.078 1.121 4.426l-.995 3.636 3.728-.977zm11.391-7.054c-.302-.152-1.792-.884-2.07-.984-.277-.101-.48-.152-.68.152-.2.302-.777.983-.952 1.185-.176.202-.351.227-.653.076-.302-.152-1.275-.47-2.428-1.499-.896-.8-1.5-.189-1.782-.416-.282-.227-.302-.352-.453-.503-.151-.152-.227-.253-.34-.48-.113-.227-.057-.428.028-.58.085-.152.68-.783.82-.983.14-.202.188-.34.283-.567.094-.227.047-.428-.028-.58-.076-.152-.68-1.638-.932-2.247-.246-.59-.496-.51-.68-.518-.176-.008-.377-.01-.58-.01-.202 0-.53.076-.807.38-.277.302-1.057 1.033-1.057 2.52 0 1.488 1.082 2.923 1.232 3.125.151.202 2.13 3.253 5.16 4.561.72.311 1.282.497 1.72.637.723.23 1.381.197 1.901.12.58-.087 1.792-.733 2.046-1.439.253-.706.253-1.312.176-1.439-.076-.126-.277-.202-.58-.352z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-slate-400 py-8 text-center">No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Patient Registration (LEFT) + Recently Added Patients (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SECTION 2 - Add Patient Panel (LEFT) */}
          <div className="form-card lg:col-span-8 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col h-[530px]">
            <span className="font-semibold text-[18px] block mb-[22px] shrink-0">Patient Registration</span>

            <form onSubmit={handleSavePatientQuick} className="flex-grow flex flex-col justify-between overflow-hidden">
              {/* Form Content Wrapper */}
              <div className="flex-1 overflow-y-auto pr-1.5 scrollbar-thin space-y-4 pb-2.5">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="qPatID" className="form-label-custom">Patient ID</Label>
                    <Input id="qPatID" value={getNextSequentialPatientId(patients)} disabled className="form-field-custom bg-slate-50 dark:bg-slate-900 opacity-60 cursor-not-allowed font-bold" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="qMobile" className="form-label-custom">Mobile Number</Label>
                    <Input id="qMobile" placeholder="e.g. +91 99000 11000" value={quickMobile} onChange={e => setQuickMobile(formatPhoneInput(e.target.value))} required className="form-field-custom" />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="qFirstName" className="form-label-custom">First Name</Label>
                    <Input id="qFirstName" placeholder="e.g. Rahul" value={quickFirstName} onChange={e => setQuickFirstName(e.target.value)} required className="form-field-custom" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="qLastName" className="form-label-custom">Last Name</Label>
                    <Input id="qLastName" placeholder="e.g. Verma" value={quickLastName} onChange={e => setQuickLastName(e.target.value)} required className="form-field-custom" />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="qAge" className="form-label-custom">Age</Label>
                    <Input
                      id="qAge"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="e.g. 30"
                      value={quickAge}
                      onChange={e => setQuickAge(e.target.value.replace(/[^0-9]/g, ""))}
                      onKeyDown={e => { if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault(); }}
                      className="form-field-custom"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="qGender" className="form-label-custom">Gender</Label>
                    <select
                      id="qGender"
                      className="form-field-custom flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                      value={quickGender}
                      onChange={e => setQuickGender(e.target.value as "Male" | "Female")}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="qLocation" className="form-label-custom">Location</Label>
                    <Input id="qLocation" placeholder="e.g. Jayanagar" value={quickLocation} onChange={e => setQuickLocation(e.target.value)} className="form-field-custom" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="qBloodGroup" className="form-label-custom">Blood Group (Optional)</Label>
                    <select
                      id="qBloodGroup"
                      className="form-field-custom flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                      value={quickBloodGroup}
                      onChange={e => setQuickBloodGroup(e.target.value)}
                    >
                      <option value="">-- Choose Blood Group --</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                {/* Row 5 - Full Width Email */}
                <div className="space-y-1">
                  <Label htmlFor="qEmail" className="form-label-custom">Email (Optional)</Label>
                  <Input id="qEmail" type="email" placeholder="e.g. patient@example.com" value={quickEmail} onChange={e => setQuickEmail(e.target.value)} className="form-field-custom" />
                </div>

                {/* Occupation & Reference Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="qOccupation" className="form-label-custom">Occupation (Optional)</Label>
                    <Input
                      id="qOccupation"
                      placeholder="e.g. Software Engineer, Teacher"
                      value={quickOccupation}
                      onChange={e => setQuickOccupation(e.target.value)}
                      className="form-field-custom"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="qReference" className="form-label-custom">Reference (Optional)</Label>
                    <select
                      id="qReference"
                      className="form-field-custom flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                      value={quickReference}
                      onChange={e => setQuickReference(e.target.value)}
                    >
                      <option value="">-- Select Reference --</option>
                      <option value="Self">Self</option>
                      <option value="Friend">Friend</option>
                      <option value="Google">Google</option>
                      <option value="Marketing">Marketing</option>
                      {quickReference && !["Self", "Friend", "Google", "Marketing"].includes(quickReference) && (
                        <option value={quickReference}>{quickReference}</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Medical History Section */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <Label className="form-label-custom font-bold text-slate-800 dark:text-slate-200">
                    Medical History
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    {[
                      "Diabetes",
                      "B.P.",
                      "Heart Complaint",
                      "Allergies",
                      "Bleeding Disorders",
                      "Pregnancy",
                      "Thyroid",
                      "Others"
                    ].map((cond) => {
                      const checked = quickMedicalHistory.includes(cond);
                      return (
                        <div key={cond} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`q-med-cond-${cond}`}
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setQuickMedicalHistory([...quickMedicalHistory, cond]);
                              } else {
                                setQuickMedicalHistory(quickMedicalHistory.filter(c => c !== cond));
                              }
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <label htmlFor={`q-med-cond-${cond}`} className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer text-xs">
                            {cond}
                          </label>
                          {cond === "Others" && checked && (
                            <input
                              type="text"
                              value={quickMedicalHistoryOthers}
                              onChange={e => setQuickMedicalHistoryOthers(e.target.value)}
                              placeholder="Specify..."
                              className="h-7 w-24 text-[11px] px-1.5 rounded border border-slate-200 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Row 6 - Full Width Multiline Notes */}
                <div className="space-y-1">
                  <Label htmlFor="qNotes" className="form-label-custom">Notes / Remarks (Optional)</Label>
                  <textarea
                    id="qNotes"
                    rows={2}
                    placeholder="Add clinical observations, allergies, or reception notes..."
                    value={quickNotes}
                    onChange={e => setQuickNotes(e.target.value)}
                    className="form-field-custom flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-200 resize-none"
                  />
                </div>
              </div>

              {/* Fixed Bottom Actions Footer */}
              <div className="flex gap-2.5 pt-3 mt-1 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <Button type="submit" className="flex-1 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-[13px] shadow-xs cursor-pointer">
                  Save & Register
                </Button>
                <Button
                  type="button"
                  onClick={handleClearPatientForm}
                  className="h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[13px] transition-colors cursor-pointer"
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </div>

          {/* SECTION 3 - Recently Added Patients (RIGHT) */}
          <div className="list-card lg:col-span-4 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col h-[530px]">
            {/* Title Row */}
            <div className="flex justify-between items-center mb-3 shrink-0">
              <span className="font-semibold text-[18px] block">Recently Added Patients</span>
              <span className="text-[12px] bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-bold">
                Total: {patients.length}
              </span>
            </div>

            {/* Filter & Sort Control Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-3.5 shrink-0">
              {/* Search Field */}
              <div className="sm:col-span-4 relative">
                <Input
                  type="text"
                  placeholder="Search"
                  value={patientSearchQuery}
                  onChange={e => setPatientSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-2 text-[13px] font-medium border-slate-100 bg-white dark:bg-slate-900 dark:border-slate-900/60"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Gender Filter */}
              <div className="sm:col-span-4 relative">
                <select
                  value={patientFilterGender}
                  onChange={e => setPatientFilterGender(e.target.value)}
                  className="h-8 w-full appearance-none rounded-lg border border-slate-100 bg-white pl-2.5 pr-7 text-[13px] font-medium focus:outline-none dark:bg-slate-900 dark:border-slate-900/60 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-slate-400" />
              </div>

              {/* Sort By */}
              <div className="sm:col-span-4 relative">
                <select
                  value={patientSortBy}
                  onChange={e => setPatientSortBy(e.target.value)}
                  className="h-8 w-full appearance-none rounded-lg border border-slate-100 bg-white pl-2.5 pr-7 text-[13px] font-medium focus:outline-none dark:bg-slate-900 dark:border-slate-900/60 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <option value="Recent">Most Recent</option>
                  <option value="Name-ASC">Name (A-Z)</option>
                  <option value="Name-DESC">Name (Z-A)</option>
                  <option value="ID-DESC">ID (Desc)</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-slate-400" />
              </div>
            </div>

            {/* Patient List container */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col">
              {displayedPatients.length > 0 ? (
                <div className="space-y-2.5 flex-1">
                  {displayedPatients.map((pat) => (
                    <div key={pat.id} className="patient-row py-2.5 flex justify-between items-center transition-all group border-b border-slate-100/50 dark:border-slate-900/40 last:border-0">
                      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => { setSelectedPatientId(pat.id); setActiveTab("Patients"); }}>
                        <span className="patient-name-txt text-[16px] font-semibold text-slate-808 dark:text-slate-200 hover:text-blue-600 block truncate">{pat.name}</span>
                        <p className="patient-sub-txt text-[12px] font-normal text-slate-455 mt-0.5">{pat.id} • {pat.phone}</p>
                      </div>
                      {/* Action Icons */}
                      <div className="flex gap-1.5 ml-2">
                        <button
                          type="button"
                          title="Book Appointment"
                          onClick={() => {
                            setSlotPatientId(pat.id);
                            setSelectedSlotData({ date: selectedCalendarDay, time: "09:00 AM" });
                          }}
                          className="h-6 w-6 rounded-md bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-blue-650 hover:bg-blue-50/50 dark:hover:bg-blue-955/30 transition-colors"
                        >
                          <CalendarDays className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Dental Chart"
                          onClick={() => {
                            setSelectedPatientId(pat.id);
                            setProfileSubTab("Dental Chart");
                            setActiveTab("Patients");
                          }}
                          className="h-6 w-6 rounded-md bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-purple-605 hover:bg-purple-50/50 dark:hover:bg-purple-955/30"
                        >
                          <Activity className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Generate Bill"
                          onClick={() => handleQuickGenerateBill(pat)}
                          className="h-6 w-6 rounded-md bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-emerald-605 hover:bg-emerald-50/50 dark:hover:bg-emerald-955/30"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-slate-400 py-6 text-center">No patients found</p>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {filteredPatients.length > patientVisibleCount && (
              <button
                type="button"
                onClick={() => setPatientVisibleCount(prev => prev + 5)}
                className="w-full h-8 mt-3 rounded-lg border border-dashed border-slate-300 text-slate-455 hover:bg-slate-50 text-[14px] font-bold shrink-0"
              >
                Load More Patients
              </button>
            )}
          </div>
        </div>

        {/* 15-DAY PERFORMANCE TRACKER */}
        <div className="hidden md:block mt-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col h-[340px] relative">
            {/* Header */}
            <div className="flex justify-between items-start mb-3 shrink-0">
              <div>
                <span className="font-semibold text-[18px] block">15-Day Performance Tracker</span>
                <span className="text-[12px] text-slate-400 dark:text-slate-550 mt-0.5 block">Clinic activity over the last 15 days</span>
              </div>
              <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Last 15 Days
              </span>
            </div>

            {/* Statistics Row */}
            <div className="flex flex-wrap gap-2.5 mb-3.5 shrink-0">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 px-3 py-1 rounded-full text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="text-slate-455">Total Consultations:</span>
                <span className="font-bold text-slate-808 dark:text-slate-200">228</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 px-3 py-1 rounded-full text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-slate-455">Total Appointments:</span>
                <span className="font-bold text-slate-808 dark:text-slate-200">169</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 px-3 py-1 rounded-full text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <span className="text-slate-455">New Patients:</span>
                <span className="font-bold text-slate-808 dark:text-slate-200">57</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-3 py-1 rounded-full text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Appointment Growth:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">+14.8%</span>
              </div>
            </div>

            {/* Chart Container */}
            <div className="flex-1 min-h-0 flex flex-col justify-between relative">
              {/* Inline Legend */}
              <div className="flex justify-end gap-4 text-[11px] mb-2 shrink-0 pr-2">
                <div className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="text-slate-455 dark:text-slate-350 font-medium">Consultations</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-455 dark:text-slate-350 font-medium">Appointments</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  <span className="text-slate-455 dark:text-slate-350 font-medium">New Patients</span>
                </div>
              </div>

              {/* Chart SVG wrapper */}
              <div className="flex-1 min-h-0 relative">
                <svg className="w-full h-full" viewBox="0 0 1000 240" preserveAspectRatio="none">
                  {/* Style for animation */}
                  <style>{`
                    @keyframes lineDraw {
                      to { stroke-dashoffset: 0; }
                    }
                    .chart-path-anim {
                      stroke-dasharray: 1500;
                      stroke-dashoffset: 1500;
                      animation: lineDraw 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    }
                  `}</style>

                  {/* Horizontal grid lines */}
                  {[0, 5, 10, 15, 20, 25].map((yVal, idx) => {
                    const y = 210 - yVal * 7.6;
                    return (
                      <g key={idx}>
                        <line x1="40" y1={y} x2="980" y2={y} stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
                        <text x="30" y={y + 3} textAnchor="end" className="text-[9px] font-medium fill-slate-400 dark:fill-slate-500">{yVal}</text>
                      </g>
                    );
                  })}

                  {/* Bezier paths for metrics */}
                  <path
                    d={bezierConsultations}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="chart-path-anim"
                  />
                  <path
                    d={bezierAppointments}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="chart-path-anim"
                  />
                  <path
                    d={bezierNewPatients}
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="chart-path-anim"
                  />

                  {/* Data Point Circles */}
                  {performanceData.map((d, i) => {
                    const x = 40 + i * 67.14;
                    const yC = 210 - d.consultations * 7.6;
                    const yA = 210 - d.appointments * 7.6;
                    const yN = 210 - d.newPatients * 7.6;
                    const isHovered = hoveredIndex === i;

                    return (
                      <g key={i}>
                        {/* Consultation Circle */}
                        <circle
                          cx={x}
                          cy={yC}
                          r={isHovered ? 5.5 : 3.5}
                          fill={isHovered ? "#3B82F6" : "#ffffff"}
                          stroke="#3B82F6"
                          strokeWidth={isHovered ? 2.5 : 1.5}
                          className="transition-all duration-100"
                        />
                        {/* Appointment Circle */}
                        <circle
                          cx={x}
                          cy={yA}
                          r={isHovered ? 5.5 : 3.5}
                          fill={isHovered ? "#10B981" : "#ffffff"}
                          stroke="#10B981"
                          strokeWidth={isHovered ? 2.5 : 1.5}
                          className="transition-all duration-100"
                        />
                        {/* New Patient Circle */}
                        <circle
                          cx={x}
                          cy={yN}
                          r={isHovered ? 5.5 : 3.5}
                          fill={isHovered ? "#6366F1" : "#ffffff"}
                          stroke="#6366F1"
                          strokeWidth={isHovered ? 2.5 : 1.5}
                          className="transition-all duration-100"
                        />
                      </g>
                    );
                  })}

                  {/* X Axis Day ticks and labels */}
                  {performanceData.map((d, i) => {
                    const x = 40 + i * 67.14;
                    // Render alternate labels to prevent overlap
                    const showLabel = i % 2 === 0;

                    return (
                      <g key={i}>
                        <line x1={x} y1="210" x2={x} y2="214" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" />
                        {showLabel && (
                          <text x={x} y="228" textAnchor="middle" className="text-[9.5px] font-medium fill-slate-400 dark:fill-slate-500">
                            {d.date}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Vertical Hover Line Guide */}
                  {hoveredIndex !== null && (
                    <line
                      x1={40 + hoveredIndex * 67.14}
                      y1="20"
                      x2={40 + hoveredIndex * 67.14}
                      y2="210"
                      stroke="rgba(99, 102, 241, 0.2)"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                  )}

                  {/* Interactive Transparent Hover rect areas */}
                  {performanceData.map((d, i) => {
                    const x = 40 + i * 67.14;
                    return (
                      <rect
                        key={i}
                        x={x - 33.5}
                        y={0}
                        width={67}
                        height={240}
                        fill="transparent"
                        className="cursor-crosshair"
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    );
                  })}
                </svg>

                {/* Floating Interactive Tooltip */}
                {hoveredIndex !== null && (
                  <div
                    className="absolute bg-slate-900/95 dark:bg-slate-955/95 text-white p-3 rounded-lg shadow-xl border border-slate-800 dark:border-slate-800 text-[11px] pointer-events-none z-10 space-y-1 transition-all duration-100"
                    style={{
                      left: `${((40 + hoveredIndex * 67.14) / 1000) * 100}%`,
                      transform: 'translateX(-50%)',
                      top: '20px'
                    }}
                  >
                    <p className="font-bold text-slate-300 dark:text-slate-300 border-b border-slate-800 pb-0.5 mb-1">{performanceData[hoveredIndex].fullDate}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>Consultations: <span className="font-bold">{performanceData[hoveredIndex].consultations}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>Appointments: <span className="font-bold">{performanceData[hoveredIndex].appointments}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      <span>New Patients: <span className="font-bold">{performanceData[hoveredIndex].newPatients}</span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAppointmentsModule = () => {
    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDayIndex = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();
      const prevMonthTotalDays = new Date(year, month, 0).getDate();

      const days: { date: Date; isCurrentMonth: boolean }[] = [];
      let firstDayOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

      for (let i = firstDayOffset - 1; i >= 0; i--) {
        days.push({
          date: new Date(year, month - 1, prevMonthTotalDays - i),
          isCurrentMonth: false
        });
      }

      for (let i = 1; i <= totalDays; i++) {
        days.push({
          date: new Date(year, month, i),
          isCurrentMonth: true
        });
      }

      const remainingSlots = 42 - days.length;
      for (let i = 1; i <= remainingSlots; i++) {
        days.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false
        });
      }

      return days;
    };

    const getWeekDays = (baseDate: Date) => {
      const currentDay = baseDate.getDay();
      const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(baseDate);
      monday.setDate(baseDate.getDate() + distanceToMonday);

      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
      });
    };

    const formatDateString = (d: Date) => {
      const day = d.getDate();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day < 10 ? '0' + day : day} ${month} ${year}`;
    };

    // Filter appointments dynamically (removed location filter check)
    const filteredAppts = appointments.filter(a => {
      if (apptSearchQuery.trim()) {
        const q = apptSearchQuery.toLowerCase();
        const matches = a.patientName?.toLowerCase().includes(q) ||
                        a.patientId?.toLowerCase().includes(q) ||
                        a.doctor?.toLowerCase().includes(q) ||
                        a.treatment?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (apptSelectedDoctor !== "All" && a.doctor !== apptSelectedDoctor) return false;
      if (apptSelectedStatus !== "All" && a.status !== apptSelectedStatus) return false;
      if (apptSelectedTreatment !== "All" && a.treatment !== apptSelectedTreatment) return false;
      if (apptSelectedType !== "All") {
        const isWalkin = a.notes?.toLowerCase().includes("walk-in") || a.patientName?.toLowerCase().includes("walk-in");
        if (apptSelectedType === "Walk-In" && !isWalkin) return false;
        if (apptSelectedType === "Scheduled" && isWalkin) return false;
      }
      return true;
    });

    const handlePrevDate = () => {
      const prev = new Date(apptCalendarDate);
      if (activeSubTab === "Queue") {
        prev.setDate(prev.getDate() - 1);
      } else if (activeSubTab === "History") {
        prev.setMonth(prev.getMonth() - 1);
      } else { // activeSubTab === "Today"
        if (apptView === "Month") {
          prev.setMonth(prev.getMonth() - 1);
        } else if (apptView === "Week") {
          prev.setDate(prev.getDate() - 7);
        } else if (apptView === "Day") {
          prev.setDate(prev.getDate() - 1);
        }
      }
      setApptCalendarDate(prev);
    };

    const handleNextDate = () => {
      const next = new Date(apptCalendarDate);
      if (activeSubTab === "Queue") {
        next.setDate(next.getDate() + 1);
      } else if (activeSubTab === "History") {
        next.setMonth(next.getMonth() + 1);
      } else { // activeSubTab === "Today"
        if (apptView === "Month") {
          next.setMonth(next.getMonth() + 1);
        } else if (apptView === "Week") {
          next.setDate(next.getDate() + 7);
        } else if (apptView === "Day") {
          next.setDate(next.getDate() + 1);
        }
      }
      setApptCalendarDate(next);
    };

    const dateStr = formatDateString(apptCalendarDate);

    // Queue Filtered List (for selected date)
    const queueAppts = filteredAppts.filter(a => a.date === dateStr && a.status !== "Completed" && a.status !== "Cancelled");

    // History Filtered List (by selected month/year of apptCalendarDate)
    const historyAppts = filteredAppts.filter(a => {
      const apptDateObj = parseToDate(a.date);
      return apptDateObj &&
             apptDateObj.getMonth() === apptCalendarDate.getMonth() &&
             apptDateObj.getFullYear() === apptCalendarDate.getFullYear() &&
             (a.status === "Completed" || a.status === "Cancelled");
    });

    return (
      <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs font-semibold text-slate-700">

        {/* LEFT SIDEBAR PANEL (col-span-2 ~16.6%) */}
        {!isCalendarExpanded && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
              <Button
                onClick={() => setActiveModal("addAppointment")}
                className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs"
              >
                <CalendarPlus className="h-4 w-4" /> Book Appointment
              </Button>

              <div className="relative w-full">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-10 border-slate-200 hover:bg-slate-50 dark:border-slate-800 text-blue-600 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="h-4 w-4" /> Go to Date
                </Button>
                <input
                  ref={goToDateRef}
                  type="date"
                  value={`${apptCalendarDate.getFullYear()}-${String(apptCalendarDate.getMonth() + 1).padStart(2, '0')}-${String(apptCalendarDate.getDate()).padStart(2, '0')}`}
                  onChange={(e) => {
                    if (e.target.value) {
                      const rawVal = e.target.value;
                      const [year, month, day] = rawVal.split("-").map(Number);
                      if (year && month && day) {
                        const selectedDate = new Date(year, month - 1, day);
                        setApptCalendarDate(selectedDate);

                        const normalizedDateStr = convertToUiDate(rawVal);
                        const matchedAppts = appointments.filter(a => a.date === normalizedDateStr);

                        setHoveredApptDay({
                          dateStr: normalizedDateStr,
                          rect: {
                            top: typeof window !== "undefined" ? window.innerHeight / 2 - 170 : 200,
                            left: typeof window !== "undefined" ? window.innerWidth / 2 - 160 : 200,
                            width: 320,
                            height: 340
                          },
                          appointments: matchedAppts,
                          isPinned: true
                        });
                      }
                    }
                  }}
                  onClick={(e) => {
                    if ("showPicker" in e.currentTarget && typeof (e.currentTarget as any).showPicker === "function") {
                      try {
                        (e.currentTarget as any).showPicker();
                      } catch (err) {
                        // ignore fallback
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="Go to Date"
                  aria-label="Go to Date"
                />
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Doctor Filter Header */}
              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Doctors Directory</span>

              {/* Vertical Doctor List (No internal scrollbar) */}
              <div className="space-y-1.5 pt-0.5">
                {/* All Doctors Pinned Row */}
                <div
                  onClick={() => setApptSelectedDoctor("All")}
                  className={`h-[48px] px-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    apptSelectedDoctor === "All"
                      ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                      : "bg-slate-50/60 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 border-slate-100 dark:border-slate-800/70 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className={`h-9 w-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                    apptSelectedDoctor === "All"
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  }`}>
                    <Users className="h-4 w-4" />
                  </div>
                  <span className={`font-bold text-[13px] truncate leading-none ${apptSelectedDoctor === "All" ? "text-white" : "text-slate-900 dark:text-white"}`}>
                    All Doctors
                  </span>
                </div>

                {/* Doctor Directory Rows */}
                {doctors.map((doc, idx) => {
                  const isActive = apptSelectedDoctor === doc.name;
                  const firstName = doc.name.replace(/^Dr\.\s*/i, "").split(" ")[0];
                  const initials = doc.name.replace(/^Dr\.\s*/i, "").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                  const colors = [
                    "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
                    "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300",
                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
                    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300",
                    "bg-pink-100 text-pink-700 dark:bg-pink-900/60 dark:text-pink-300"
                  ];
                  const avatarColor = colors[idx % colors.length];

                  return (
                    <div
                      key={doc.name}
                      onClick={() => setApptSelectedDoctor(isActive ? "All" : doc.name)}
                      className={`h-[48px] px-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                        isActive
                          ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                          : "bg-slate-50/60 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 border-slate-100 dark:border-slate-800/70 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {doc.avatar ? (
                        <img src={doc.avatar} alt={doc.name} className="h-9 w-9 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className={`h-9 w-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                          isActive ? "bg-white/20 text-white" : avatarColor
                        }`}>
                          {initials}
                        </div>
                      )}

                      <span className={`font-bold text-[13px] truncate leading-none ${isActive ? "text-white" : "text-slate-900 dark:text-white"}`}>
                        {firstName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* RIGHT PANEL (col-span-10 ~83.3% or col-span-12 ~100% when expanded) */}
        <div className={isCalendarExpanded ? "lg:col-span-12 space-y-4" : "lg:col-span-10 space-y-4"}>

          {/* Filters Row */}
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-semibold text-slate-605">
            <div className="hidden sm:flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Filters:</span>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-3">
              <select
                value={apptSelectedStatus}
                onChange={(e) => setApptSelectedStatus(e.target.value)}
                className="h-8.5 sm:h-8 w-full sm:w-auto px-2 sm:px-2.5 rounded-lg border border-slate-200 bg-white text-[11.5px] sm:text-[12px] font-medium focus:outline-none dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 truncate"
              >
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Waiting">Waiting</option>
                <option value="In Procedure">In Procedure</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                value={apptSelectedTreatment}
                onChange={(e) => setApptSelectedTreatment(e.target.value)}
                className="h-8.5 sm:h-8 w-full sm:w-auto px-2 sm:px-2.5 rounded-lg border border-slate-200 bg-white text-[11.5px] sm:text-[12px] font-medium focus:outline-none dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 truncate"
              >
                <option value="All">All Treatments</option>
                <option value="Root Canal">Root Canal</option>
                <option value="Scaling">Scaling</option>
                <option value="Implant">Implant</option>
                <option value="Crown">Crown</option>
                <option value="Consultation">Consultation</option>
              </select>
            </div>
          </div>

          {/* Unified Calendar/Queue/History Card */}
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">

            {/* Redesigned 3-Column Top Navigation Layout */}
            <div className="flex items-center justify-between border-b border-slate-105 dark:border-slate-800 pb-3 mb-1">

              {/* Left Section: Compact Arrows together */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevDate}
                  className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextDate}
                  className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Center Section: Month/Year title */}
              <span className="font-semibold text-[18px] text-slate-800 dark:text-white text-center">
                {activeSubTab === "Queue"
                  ? `Queue for ${dateStr}`
                  : activeSubTab === "History"
                  ? `History for ${apptCalendarDate.toLocaleString("default", { month: "long", year: "numeric" })}`
                  : apptCalendarDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </span>

              {/* Right Section: View Switcher & Expand Symbol Control */}
              <div className="flex items-center gap-2">
                {activeSubTab === "Today" ? (
                  <div className="bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg flex items-center">
                    {(["Month", "Week", "Day"] as const).map((view) => (
                      <button
                        key={view}
                        onClick={() => setApptView(view)}
                        className={`px-3 py-1.5 rounded-md text-[12px] font-bold transition-all ${
                          apptView === view
                            ? "bg-white text-blue-600 shadow-sm dark:bg-slate-955"
                            : "text-slate-550 hover:text-slate-888 dark:text-slate-400"
                        }`}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {activeSubTab}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                  className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 text-slate-600 dark:text-slate-300 dark:hover:bg-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title={isCalendarExpanded ? "Restore View" : "Expand Calendar"}
                >
                  {isCalendarExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* TODAY - MONTH VIEW */}
            {activeSubTab === "Today" && apptView === "Month" && (
              <div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-bold text-slate-400 mb-2 sm:mb-3 border-b pb-1.5 sm:pb-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                    <div key={d} className="py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {getDaysInMonth(apptCalendarDate).map((dayObj, index) => {
                    const dayDateStr = formatDateString(dayObj.date);
                    const dayAppts = filteredAppts.filter(a => a.date === dayDateStr);
                    const isToday = dayObj.date.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={index}
                        className={`min-h-[50px] sm:min-h-[110px] p-1 sm:p-2 border rounded-lg sm:rounded-xl flex flex-col justify-between transition-colors overflow-hidden relative cursor-pointer ${
                          dayObj.isCurrentMonth
                            ? "bg-white border-slate-200 dark:bg-slate-955 dark:border-slate-800"
                            : "bg-slate-50/50 border-slate-100 text-slate-400 dark:bg-slate-900/10 dark:border-slate-900"
                        }`}
                        onClick={(e) => {
                          if (dayAppts.length > 0) {
                            handleCellClick(e, dayDateStr, dayAppts);
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (dayAppts.length > 0) {
                            handleCellMouseEnter(e.currentTarget.getBoundingClientRect(), dayDateStr, dayAppts);
                          }
                        }}
                        onMouseLeave={handleCellMouseLeave}
                      >
                        <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                          <span className={`text-[9px] sm:text-[10px] font-extrabold h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center ${
                            isToday ? "bg-blue-600 text-white shadow-xs" : "text-slate-808 dark:text-slate-202"
                          }`}>
                            {dayObj.date.getDate()}
                          </span>
                        </div>

                        <div className="flex flex-col items-center justify-center flex-1 h-full pb-0.5 sm:pb-2">
                          {dayAppts.length > 0 && (
                            <div
                              className="px-1 sm:px-2.5 py-0.5 sm:py-1.5 rounded-md sm:rounded-lg bg-blue-50/70 border border-blue-100 text-blue-700 dark:bg-blue-955/20 dark:border-blue-900/30 dark:text-blue-400 text-[8.5px] sm:text-[10px] font-extrabold text-center flex items-center justify-center whitespace-nowrap transition-all hover:scale-105"
                            >
                              <span className="hidden sm:inline">{dayAppts.length} {dayAppts.length === 1 ? "Appointment" : "Appointments"}</span>
                              <span className="sm:hidden">{dayAppts.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TODAY - WEEK VIEW */}
            {activeSubTab === "Today" && apptView === "Week" && (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-8 gap-2 text-center text-[12px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                    <div className="text-left py-1">Time</div>
                    {getWeekDays(apptCalendarDate).map((day, idx) => {
                      const daysName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                      const isToday = day.toDateString() === new Date().toDateString();
                      return (
                        <div key={idx} className="py-1">
                          <span className="block text-[10px] uppercase">{daysName[day.getDay()]}</span>
                          <span className={`block text-[13px] font-bold mt-0.5 ${isToday ? "text-blue-600" : "text-slate-808 dark:text-slate-202"}`}>{day.getDate()}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-900">
                    {["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"].map((hourSlot) => (
                      <div key={hourSlot} className="grid grid-cols-8 gap-2 py-3 items-stretch min-h-[70px]">
                        <div className="text-[10px] text-slate-400 font-bold self-start mt-1">{hourSlot}</div>

                        {getWeekDays(apptCalendarDate).map((day, idx) => {
                          const dayDateStr = formatDateString(day);
                          const slotAppts = filteredAppts.filter(a => {
                            if (a.date !== dayDateStr) return false;
                            const matchHour = a.time.split(":")[0];
                            const matchAmPm = a.time.split(" ")[1];
                            const slotHour = hourSlot.split(":")[0];
                            const slotAmPm = hourSlot.split(" ")[1];
                            return parseInt(matchHour) === parseInt(slotHour) && matchAmPm === slotAmPm;
                          });

                          return (
                            <div key={idx} className="rounded-lg bg-slate-50/20 border border-dashed border-slate-105 dark:border-slate-850 p-1.5 flex flex-col gap-1.5 overflow-hidden">
                              {slotAppts.map(appt => {
                                let docBorderColor = "border-l-blue-500 bg-blue-50/25";
                                if (appt.doctor.includes("Raghuram")) docBorderColor = "border-l-cyan-500 bg-cyan-50/25";
                                else if (appt.doctor.includes("Srinivasa")) docBorderColor = "border-l-purple-500 bg-purple-50/25";
                                else if (appt.doctor.includes("Priyanka")) docBorderColor = "border-l-emerald-505 bg-emerald-55/25";
                                else if (appt.doctor.includes("Krishna")) docBorderColor = "border-l-indigo-500 bg-indigo-55/25";

                                return (
                                  <div
                                    key={appt.id}
                                    onClick={() => setSelectedApptDetail(appt)}
                                    className={`p-1 border-l-2 rounded text-[9px] cursor-pointer hover:shadow-xs transition-shadow flex flex-col gap-0.5 leading-tight ${docBorderColor}`}
                                  >
                                    <span className="font-bold text-slate-550 dark:text-slate-400 text-[7.5px]">{appt.time}</span>
                                    <span className="font-extrabold text-slate-900 dark:text-white truncate">{appt.patientName}</span>
                                    <span className="text-slate-505 text-[8px] truncate">{appt.patientId}</span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TODAY - DAY VIEW */}
            {activeSubTab === "Today" && apptView === "Day" && (
              <div className="space-y-4">
                <div className="divide-y divide-slate-100 dark:divide-slate-900 max-h-[600px] overflow-y-auto pr-2">
                  {Array.from({ length: 45 }, (_, idx) => {
                    const totalMinutes = 9 * 60 + idx * 15;
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    const ampm = hours >= 12 ? "PM" : "AM";
                    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
                    const slotTimeStr = `${displayHours < 10 ? '0' + displayHours : displayHours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;

                    const slotAppt = filteredAppts.find(a => {
                      if (a.date !== dateStr) return false;
                      const cleanT = (t: string) => t.trim().toLowerCase().replace(/^0/, "");
                      return cleanT(a.time) === cleanT(slotTimeStr);
                    });

                    return (
                      <div key={idx} className="py-2.5 flex items-center justify-between gap-4 text-xs font-semibold">
                        <span className="text-[10px] font-bold text-slate-400 w-16">{slotTimeStr}</span>

                        {slotAppt ? (
                          (() => {
                            let docColor = "border-l-blue-500 bg-blue-50/15";
                            if (slotAppt.doctor.includes("Raghuram")) docColor = "border-l-cyan-500 bg-cyan-50/15";
                            else if (slotAppt.doctor.includes("Srinivasa")) docColor = "border-l-purple-500 bg-purple-50/15";
                            else if (slotAppt.doctor.includes("Priyanka")) docColor = "border-l-emerald-500 bg-emerald-50/15";
                            else if (slotAppt.doctor.includes("Krishna")) docColor = "border-l-indigo-500 bg-indigo-50/15";

                            return (
                              <div
                                onClick={() => setSelectedApptDetail(slotAppt)}
                                className={`flex-1 p-3 border-l-3 rounded-xl flex items-center justify-between cursor-pointer hover:shadow-xs transition-shadow ${docColor}`}
                              >
                                <div>
                                  <span className="font-bold text-slate-850 dark:text-slate-202 block">{slotAppt.patientName}</span>
                                  <p className="text-[10px] text-slate-450 mt-0.5">{slotAppt.patientId} • Doctor: {slotAppt.doctor}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold uppercase">{slotAppt.treatment}</span>
                                  <p className="text-[9px] text-slate-400 mt-1">{slotAppt.status}</p>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedSlotData({ date: dateStr, time: slotTimeStr });
                            }}
                            className="flex-1 py-3 border border-dashed border-slate-100 hover:border-blue-300 rounded-xl text-[10px] text-slate-400 font-bold text-left px-4 hover:bg-slate-50/20"
                          >
                            + Block / Open Appointment Slot
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUEUE MODULE VIEW */}
            {activeSubTab === "Queue" && (
              <div className="space-y-4">
                {queueAppts.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto scrollbar-thin">
                    <table className="w-full min-w-[760px] text-left border-collapse text-xs font-semibold">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                          <th className="p-3 whitespace-nowrap min-w-[100px]">Time</th>
                          <th className="p-3 whitespace-nowrap min-w-[160px]">Patient</th>
                          <th className="p-3 whitespace-nowrap min-w-[160px]">Doctor</th>
                          <th className="p-3 whitespace-nowrap min-w-[130px]">Treatment</th>
                          <th className="p-3 whitespace-nowrap min-w-[110px]">Status</th>
                          <th className="p-3 text-right whitespace-nowrap min-w-[160px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-700 dark:text-slate-300">
                        {queueAppts.map(appt => {
                          const docInitials = appt.doctor.replace("Dr. ", "").split(" ").map(n => n[0]).join("").toUpperCase();
                          return (
                            <tr key={appt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                              <td className="p-3 font-bold text-slate-808 dark:text-white">{appt.time}</td>
                              <td className="p-3">
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block">{appt.patientName}</span>
                                  <span className="text-[10px] text-slate-400 block">{appt.patientId}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-755 font-bold text-[10px] flex items-center justify-center shrink-0">
                                    {docInitials}
                                  </div>
                                  <span className="font-semibold text-slate-755 dark:text-slate-250">{appt.doctor}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="bg-blue-50 text-blue-700 dark:bg-blue-955/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                  {appt.treatment}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  appt.status === "Waiting" || appt.status === "Checked In"
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-955/20"
                                    : appt.status === "In Procedure"
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-955/20"
                                    : "bg-slate-50 text-slate-500"
                                }`}>
                                  {appt.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex justify-end gap-1.5">
                                  {appt.status === "Scheduled" && (
                                    <button
                                      onClick={() => handleApptCheckIn(appt.id)}
                                      className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px]"
                                    >
                                      Check In
                                    </button>
                                  )}
                                  {(appt.status === "Waiting" || appt.status === "Checked In") && (
                                    <button
                                      onClick={() => handleApptStartProcedure(appt.id)}
                                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px]"
                                    >
                                      Start
                                    </button>
                                  )}
                                  {appt.status === "In Procedure" && (
                                    <button
                                      onClick={() => {
                                        setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: "Completed" } : a));
                                        pushActivity("Treatment", `Completed ${appt.treatment} for ${appt.patientName}.`);
                                      }}
                                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                                    >
                                      Complete
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setSelectedApptDetail(appt)}
                                    className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-500 text-[10px]"
                                  >
                                    Details
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center bg-slate-50/20 border border-dashed rounded-xl border-slate-200">
                    <p className="text-slate-400 text-xs">No active queue patients for this date.</p>
                  </div>
                )}
              </div>
            )}

            {/* HISTORY MODULE VIEW */}
            {activeSubTab === "History" && (
              <div className="space-y-4">
                {historyAppts.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto scrollbar-thin">
                    <table className="w-full min-w-[760px] text-left border-collapse text-xs font-semibold">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                          <th className="py-3.5 px-3 whitespace-nowrap min-w-[130px]">Date & Time</th>
                          <th className="py-3.5 px-3 whitespace-nowrap min-w-[160px]">Patient</th>
                          <th className="py-3.5 px-3 whitespace-nowrap min-w-[160px]">Doctor</th>
                          <th className="py-3.5 px-3 whitespace-nowrap min-w-[130px]">Treatment</th>
                          <th className="py-3.5 px-3 whitespace-nowrap min-w-[110px]">Status</th>
                          <th className="py-3.5 px-3 whitespace-nowrap min-w-[170px]">Clinical Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-700 dark:text-slate-300">
                        {historyAppts.map(appt => {
                          const docInitials = appt.doctor.replace("Dr. ", "").split(" ").map(n => n[0]).join("").toUpperCase();
                          return (
                            <tr key={appt.id} onClick={() => setSelectedApptDetail(appt)} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 cursor-pointer transition-colors">
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <div>
                                  <span className="font-bold text-slate-808 dark:text-white block">{appt.date}</span>
                                  <span className="text-[10px] text-slate-400 block">{appt.time}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block">{appt.patientName}</span>
                                  <span className="text-[10px] text-slate-405 block">{appt.patientId}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-blue-105 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                    {docInitials}
                                  </div>
                                  <span className="font-semibold text-slate-750 dark:text-slate-250">{appt.doctor}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <span className="bg-blue-50 text-blue-700 dark:bg-blue-955/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                  {appt.treatment}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  appt.status === "Completed"
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-955/20"
                                    : "bg-red-50 text-red-700 dark:bg-red-955/20"
                                }`}>
                                  {appt.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-slate-500 font-medium max-w-[200px] truncate">
                                {appt.notes || "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center bg-slate-50/20 border border-dashed rounded-xl border-slate-200">
                    <p className="text-slate-400 text-xs">No completed or cancelled appointments for this month.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* SIDE DRAWER FOR DETAILS */}
        {selectedApptDetail && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
            <div className="w-full max-w-md bg-white dark:bg-slate-955 h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between animate-slideLeft">
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-105 dark:border-slate-900">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Appointment Details</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">{selectedApptDetail.patientName}</span>
                  </div>
                  <button
                    onClick={() => setSelectedApptDetail(null)}
                    className="h-8 w-8 rounded-full border hover:bg-slate-50 flex items-center justify-center text-slate-500"
                  >
                    <Plus className="h-4 w-4 rotate-45" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Patient ID</span>
                      <strong className="text-slate-808 dark:text-slate-202 font-bold">{selectedApptDetail.patientId}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Phone Number</span>
                      <strong className="text-slate-808 dark:text-slate-202 font-bold">
                        {patients.find(p => p.id === selectedApptDetail.patientId)?.phone || "+91 99000 11000"}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Assigned Doctor</span>
                      <strong className="text-slate-808 dark:text-slate-202 font-bold">{selectedApptDetail.doctor}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Date & Time</span>
                      <strong className="text-slate-888 dark:text-slate-202 font-bold">{selectedApptDetail.date} at {selectedApptDetail.time}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Treatment</span>
                      <span className="bg-blue-50 text-blue-700 dark:bg-blue-955/20 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] inline-block mt-1">
                        {selectedApptDetail.treatment}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Status</span>
                      <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-955/20 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] inline-block mt-1">
                        {selectedApptDetail.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Notes</span>
                    <p className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-slate-700 dark:text-slate-350 mt-1 leading-normal font-medium">
                      {selectedApptDetail.notes || "No clinical notes configured for this appointment slot."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="space-y-3 pt-6 border-t border-slate-105 dark:border-slate-900">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Workflow Actions</span>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      handleApptCheckIn(selectedApptDetail.id);
                      setSelectedApptDetail(null);
                    }}
                    disabled={selectedApptDetail.status !== "Scheduled"}
                    className="h-10 text-[11px] font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg"
                  >
                    Check In
                  </Button>
                  <Button
                    onClick={() => {
                      handleApptStartProcedure(selectedApptDetail.id);
                      setSelectedApptDetail(null);
                    }}
                    disabled={selectedApptDetail.status !== "Checked In" && selectedApptDetail.status !== "Waiting"}
                    className="h-10 text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                  >
                    Start Procedure
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRescheduleModalAppt(selectedApptDetail);
                      setReschedulePickerDate(convertToDbDate(selectedApptDetail.date));
                      const tObj = parseTimeString(selectedApptDetail.time);
                      setRescheduleHour(tObj.hour);
                      setRescheduleMinute(tObj.minute);
                      setRescheduleAmPm(tObj.ampm);
                      setSelectedApptDetail(null);
                    }}
                    className="h-10 text-[11px] font-bold rounded-lg"
                  >
                    Reschedule
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSlotData({ date: selectedApptDetail.date, time: selectedApptDetail.time, appointment: selectedApptDetail });
                      setSelectedApptDetail(null);
                    }}
                    className="h-10 text-[11px] font-bold rounded-lg"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={async () => {
                      const { error } = await supabase
                        .from("appointments")
                        .update({ status: "Cancelled" })
                        .eq("id", selectedApptDetail.id);
                      if (error) {
                        console.error("Appointment operation failed:", error.message, error.code);
                        showToast("Failed to cancel appointment in database.", "error");
                        return;
                      }
                      setAppointments(prev => prev.map(a => a.id === selectedApptDetail.id ? { ...a, status: "Cancelled" } : a));
                      pushActivity("Appointment", `Cancelled appointment for ${selectedApptDetail.patientName}.`);
                      setSelectedApptDetail(null);
                    }}
                    disabled={selectedApptDetail.status === "Cancelled" || selectedApptDetail.status === "Completed"}
                    className="h-10 text-[11px] font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg col-span-2"
                  >
                    Cancel Appointment
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => alert(`Token printed for ${selectedApptDetail.patientName}.`)}
                    className="py-2 text-[10px] font-bold border rounded-lg bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-1 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print Token
                  </button>
                  <button
                    onClick={() => alert(`SMS reminder sent successfully to ${selectedApptDetail.patientName}.`)}
                    className="py-2 text-[10px] font-bold border rounded-lg bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-1 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Send SMS
                  </button>
                  <button
                    onClick={() => {
                      const rawPhone = patients.find((p) => p.id === selectedApptDetail.patientId)?.phone || (selectedApptDetail as any).phone || "";
                      const whatsappNumber = formatWhatsAppRecipientNumber(rawPhone);
                      const message = `Hello ${selectedApptDetail.patientName},

This is a reminder from ${clinicName} regarding your dental appointment.

🦷 Treatment: ${selectedApptDetail.treatment}
📅 Date: ${selectedApptDetail.date}
🕒 Time: ${selectedApptDetail.time}

Please arrive 10 minutes before your scheduled appointment.

If you need to reschedule, please reply to this message.

Thank you,
${clinicName}`;
                      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
                    }}
                    className="py-2 text-[10px] font-bold border rounded-lg bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-1 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-355"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPatientsModule = () => {
    if (selectedPatientId) {
      const patientItem = patients.find(p => p.id === selectedPatientId);
      if (!patientItem) return null;

      const pAppts = appointments.filter(a => a.patientId === patientItem.id);
      const pInvoices = invoices.filter(i => i.patientId === patientItem.id);

      const handleChartToothSelect = (toothIndex: number) => {
        if (activeTreatment) {
          const currentChart = { ...(patientItem.dentalChart || {}) };
          const existingList = parseToothTreatments(currentChart[toothIndex]);
          const entryStr = `${activeTreatment} (Planned)`;
          let updatedList: string[];
          if (existingList.some(item => item.toLowerCase().startsWith(activeTreatment.toLowerCase()))) {
            updatedList = existingList.filter(item => !item.toLowerCase().startsWith(activeTreatment.toLowerCase()));
          } else {
            updatedList = [...existingList, entryStr];
          }
          if (updatedList.length === 0) {
            delete currentChart[toothIndex];
          } else {
            currentChart[toothIndex] = updatedList.join(" | ");
          }
          supabase.from("patients").update({ dental_chart: currentChart }).eq("patient_id", patientItem.id).then(({ error }) => {
            if (error) console.error("Database error saving dental chart:", error);
          });
          setPatients(prev => prev.map(p => p.id === patientItem.id ? { ...p, dentalChart: currentChart } : p));
          showToast(`Updated ${activeTreatment} for Tooth #${ALL_TEETH.find(t => t.index === toothIndex)?.fdi || toothIndex}.`, "success");
          return;
        }

        setSelectedTeeth(prev => {
          let next: number[];
          if (prev.includes(toothIndex)) {
            next = prev.filter(t => t !== toothIndex);
          } else {
            next = [...prev, toothIndex];
          }
          if (next.length > 0) {
            setChartSelectedTooth(next[next.length - 1]);
          } else {
            setChartSelectedTooth(null);
          }
          return next;
        });
      };

      const handleSelectAllTeeth = (specificTreatment?: "Scaling" | "Braces") => {
        if (specificTreatment) {
          const currentChart = { ...(patientItem.dentalChart || {}) };
          const entryStr = `${specificTreatment} (Planned)`;
          ALL_TEETH.forEach(t => {
            const existingList = parseToothTreatments(currentChart[t.index]);
            if (!existingList.some(item => item.toLowerCase().startsWith(specificTreatment.toLowerCase()))) {
              currentChart[t.index] = [...existingList, entryStr].join(" | ");
            }
          });
          supabase.from("patients").update({ dental_chart: currentChart }).eq("patient_id", patientItem.id).then(({ error }) => {
            if (error) console.error("Database error saving dental chart:", error);
          });
          setPatients(prev => prev.map(p => p.id === patientItem.id ? { ...p, dentalChart: currentChart } : p));
          showToast(`Assigned ${specificTreatment} to All Teeth.`, "success");
          return;
        }
        const allIndices = ALL_TEETH.map(t => t.index);
        setSelectedTeeth(allIndices);
        setChartSelectedTooth(allIndices[0]);
        showToast("All 32 teeth selected.", "success");
      };

      const handleClearSelection = () => {
        setSelectedTeeth([]);
        setChartSelectedTooth(null);
      };

      const handleSaveToothTreatment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientItem) return;
        if (!chartTreatmentName.trim()) {
          showToast("Please choose a treatment procedure.", "error");
          return;
        }

        const targetTeeth = selectedTeeth.length > 0
          ? selectedTeeth
          : (chartSelectedTooth !== null ? [chartSelectedTooth] : []);

        if (targetTeeth.length === 0) {
          showToast("Please select at least one tooth to assign treatment.", "error");
          return;
        }

        const currentChart = { ...(patientItem.dentalChart || {}) };
        const newEntryStr = `${chartTreatmentName.trim()} (${chartStatus})`;

        targetTeeth.forEach(toothIdx => {
          const existingList = parseToothTreatments(currentChart[toothIdx]);
          if (!existingList.some(item => item.toLowerCase() === newEntryStr.toLowerCase())) {
            const updatedList = [...existingList, newEntryStr];
            currentChart[toothIdx] = updatedList.join(" | ");
          }
        });

        const { error: updateErr } = await supabase
          .from("patients")
          .update({ dental_chart: currentChart })
          .eq("patient_id", patientItem.id);

        if (updateErr) {
          console.error("Failed to save dental chart in database:", updateErr.message, updateErr.code);
          showToast("Failed to save dental chart in database.", "error");
          return;
        }

        setPatients(prev => prev.map(p => {
          if (p.id === patientItem.id) {
            return { ...p, dentalChart: currentChart };
          }
          return p;
        }));
        setEditTreatmentAdvised(formatTreatmentAdvisedFromChart(currentChart));

        // Synchronize with Treatments History Log
        const doctorObj = doctors.find(d => d.name === chartDoctor);
        const treatCostVal = Number(chartCost) || 0;
        const treatDateVal = chartDate || new Date().toISOString().split("T")[0];

        const dbInsertRows = targetTeeth.map(tIdx => {
          const toothObj = ALL_TEETH.find(t => t.index === tIdx);
          const fdi = toothObj?.fdi || tIdx;
          return {
            patient_id: patientItem.uuid || patientItem.id,
            doctor_id: doctorObj?.id || null,
            name: chartTreatmentName.trim(),
            stage: chartStatus,
            notes: chartNotes.trim() || undefined,
            diagnosis: chartDiagnosis.trim() || undefined,
            tooth_number: fdi,
            cost: treatCostVal,
            treatment_date: treatDateVal
          };
        });

        const { data: insertedTreats } = await supabase
          .from("treatments")
          .insert(dbInsertRows)
          .select();

        if (insertedTreats && insertedTreats.length > 0) {
          const newTreatItems: TreatmentItem[] = insertedTreats.map(row => ({
            id: row.id,
            name: row.name,
            patient: patientItem.name,
            doctor: chartDoctor || doctors[0]?.name || "Dr. Deepa Kodali",
            stage: (row.stage === "Completed" || row.stage === "In Progress") ? row.stage : "Planned",
            notes: row.notes || "",
            nextVisit: "",
            prescription: "",
            tooth: row.tooth_number || undefined,
            cost: Number(row.cost) || treatCostVal,
            diagnosis: row.diagnosis || undefined,
            date: row.treatment_date ? convertToUiDate(row.treatment_date) : convertToUiDate(treatDateVal)
          }));
          setTreatments(prev => [...newTreatItems, ...prev]);
        } else {
          const fallbackItems: TreatmentItem[] = targetTeeth.map((tIdx, idx) => {
            const toothObj = ALL_TEETH.find(t => t.index === tIdx);
            const fdi = toothObj?.fdi || tIdx;
            return {
              id: `tr-${Date.now()}-${idx}`,
              name: chartTreatmentName.trim(),
              patient: patientItem.name,
              doctor: chartDoctor || doctors[0]?.name || "Dr. Deepa Kodali",
              stage: (chartStatus === "Completed" || chartStatus === "In Progress") ? chartStatus : "Planned",
              notes: chartNotes.trim() || "",
              nextVisit: "",
              prescription: "",
              tooth: fdi,
              cost: treatCostVal,
              diagnosis: chartDiagnosis.trim() || undefined,
              date: convertToUiDate(treatDateVal)
            };
          });
          setTreatments(prev => [...fallbackItems, ...prev]);
        }

        const teethLabel = targetTeeth.map(tIdx => {
          const toothObj = ALL_TEETH.find(t => t.index === tIdx);
          return `#${toothObj?.fdi || tIdx}`;
        }).join(", ");

        showToast(`Assigned ${chartTreatmentName} (${chartStatus}) to Tooth ${teethLabel}.`, "success");

        setSelectedTeeth([]);
        setChartSelectedTooth(null);
        setChartTreatmentName("");
        setChartDiagnosis("");
        setChartNotes("");
      };

      const handleClearAllTeeth = async () => {
        if (!patientItem) return;

        const { error: updateErr } = await supabase
          .from("patients")
          .update({ dental_chart: {} })
          .eq("patient_id", patientItem.id);

        if (updateErr) {
          showToast("Failed to clear dental chart in database.", "error");
          return;
        }

        await supabase
          .from("treatments")
          .delete()
          .eq("patient_id", patientItem.uuid || patientItem.id);

        setPatients(prev => prev.map(p => p.id === patientItem.id ? { ...p, dentalChart: {} } : p));
        setTreatments(prev => prev.filter(t => t.patient !== patientItem.name));
        setEditTreatmentAdvised("");
        setSelectedTeeth([]);
        setChartSelectedTooth(null);
        setShowClearAllConfirm(false);
        showToast("Cleared all tooth assignments for this patient.", "success");
      };

      return (
        <div className="space-y-6 animate-fadeIn">
          {/* Back button and profile header */}
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setSelectedPatientId(null); setProfileSubTab("Case Sheet"); }}
                className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div>
                <span className="text-xs text-slate-400 font-bold block">PATIENT FILE: {patientItem.id}</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">{patientItem.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 border-l sm:border-l-0 pl-4 sm:pl-0">
              <div>
                <span className="text-[11px] font-bold text-slate-405 block uppercase">Phone</span>
                <span className="text-slate-800 dark:text-slate-200 text-[13px] sm:text-[14px] font-semibold">{patientItem.phone}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-405 block uppercase">Gender / Age</span>
                <span className="text-slate-800 dark:text-slate-200 text-[13px] sm:text-[14px] font-semibold">{patientItem.gender} • {patientItem.age} Years</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-405 block uppercase">Status</span>
                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold text-[11px] inline-block">{patientItem.status}</span>
              </div>
            </div>
          </div>

          {/* Sub-tabs inside profile */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-slate-200 dark:border-slate-800 pb-1.5 shrink-0">
            {["Case Sheet", "Treatments", "Invoices", "Appointments", "Prescriptions", "Files"].map((t) => {
              const active = profileSubTab === t;
              return (
                <button
                  key={t}
                  onClick={() => setProfileSubTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    active ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-850 hover:bg-slate-100"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div className="space-y-6">
            {profileSubTab === "Case Sheet" && (
              <div className="space-y-6">
                {/* Case Sheet Actions Header */}
                <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                      <span>Patients</span>
                      <ChevronRight className="h-3 w-3" />
                      <span className="text-blue-600 font-bold">Case Sheet</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Case Sheet</h2>
                    <p className="text-xs text-slate-500">View and manage the patient's dental case sheet.</p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 no-print">
                    <Button
                      type="button"
                      onClick={() => window.print()}
                      variant="outline"
                      className="h-9 px-3.5 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <Printer className="h-4 w-4 text-slate-500" />
                      Print
                    </Button>
                    {!isReceptionist && (
                      <Button
                        type="button"
                        onClick={() => setIsEditingCaseSheet(!isEditingCaseSheet)}
                        variant="outline"
                        className={`h-9 px-3.5 text-xs font-semibold flex items-center gap-1.5 ${
                          isEditingCaseSheet
                            ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {isEditingCaseSheet ? "Editing Mode" : "Edit"}
                      </Button>
                    )}
                    {isEditingCaseSheet && !isReceptionist && (
                      <Button
                        type="button"
                        onClick={handleSavePatientProfile}
                        className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-xs"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Save
                      </Button>
                    )}
                  </div>
                </div>

                {/* Digital Dental Case Sheet Container */}
                <div id="print-area" className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-7 shadow-xs space-y-6 print:space-y-3 print:p-2 print:border-none print:shadow-none text-xs animate-fadeIn">
                  {/* PRINT-ONLY CLINIC HEADER */}
                  <div className="hidden print:block border-b-2 border-slate-800 pb-3 mb-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <DentalLogo showText={false} iconClassName="h-10 w-10" />
                        <div>
                          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{clinicName || clinicConfig.name}</h1>
                          <p className="text-xs font-semibold text-slate-600">Dental Clinic / Comprehensive Dental Care</p>
                          <p className="text-[11px] text-slate-500 font-medium">Phone: {clinicConfig.contact.phone}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-sm font-extrabold text-blue-700 block tracking-wider uppercase">DENTAL CASE SHEET</span>
                        <p className="text-xs font-bold text-slate-800">ID: {patientItem.id}</p>
                        <p className="text-xs text-slate-600">Date: {patientItem.visit || patientItem.firstVisit || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Top Header Row with Date (Screen Only) */}
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 print:hidden">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="font-bold text-sm tracking-wide text-slate-900 dark:text-white uppercase">DENTAL CASE SHEET</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span className="text-slate-400 font-medium">Date: </span>
                      <strong>{patientItem.visit || patientItem.firstVisit || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</strong>
                    </div>
                  </div>

                  {/* SECTION 1 — PATIENT / CONTACT INFORMATION */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <div className="bg-sky-50/80 dark:bg-slate-900 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <h3 className="font-bold text-xs text-slate-900 dark:text-blue-300 uppercase tracking-wider">
                        PATIENT / CONTACT INFORMATION
                      </h3>
                      <span className="text-[11px] font-bold text-slate-500">ID: {patientItem.id}</span>
                    </div>

                    <div className="p-4 sm:p-5 print:p-3 grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-x-8 gap-y-4 print:gap-y-2">
                      {/* LEFT COLUMN */}
                      <div className="space-y-3.5 print:space-y-2">
                        <div className="grid grid-cols-3 items-center gap-2">
                          <Label className="font-bold text-slate-800 dark:text-slate-200">Name:</Label>
                          <div className="col-span-2">
                            {isEditingCaseSheet ? (
                              <div className="flex gap-2">
                                <Input value={editFirstName} onChange={e => setEditFirstName(e.target.value)} placeholder="First Name" className="h-8 text-xs" />
                                <Input value={editLastName} onChange={e => setEditLastName(e.target.value)} placeholder="Last Name" className="h-8 text-xs" />
                              </div>
                            ) : (
                              <span className="font-bold text-slate-900 dark:text-white text-sm">{patientItem.name}</span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-2">
                          <Label className="font-bold text-slate-800 dark:text-slate-200">Age:</Label>
                          <div className="col-span-2">
                            {isEditingCaseSheet ? (
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={editAge === 0 && !editAgeStr ? "" : (editAgeStr !== undefined ? editAgeStr : String(editAge))}
                                onChange={e => {
                                  const val = e.target.value.replace(/[^0-9]/g, "");
                                  setEditAgeStr(val);
                                  setEditAge(val ? parseInt(val, 10) : 0);
                                }}
                                onKeyDown={e => { if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault(); }}
                                placeholder="e.g. 30"
                                className="h-8 text-xs"
                              />
                            ) : (
                              <span className="font-semibold text-slate-900 dark:text-white">{patientItem.age} Years</span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-2">
                          <Label className="font-bold text-slate-800 dark:text-slate-200">Gender:</Label>
                          <div className="col-span-2">
                            {isEditingCaseSheet ? (
                              <select
                                value={editGender}
                                onChange={e => setEditGender(e.target.value as "Male" | "Female")}
                                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            ) : (
                              <span className="font-semibold text-slate-900 dark:text-white">{patientItem.gender}</span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-2">
                          <Label className="font-bold text-slate-800 dark:text-slate-200">Tel No.:</Label>
                          <div className="col-span-2">
                            {isEditingCaseSheet ? (
                              <Input
                                value={editMobile}
                                onChange={e => setEditMobile(formatPhoneInput(e.target.value))}
                                className="h-8 text-xs"
                              />
                            ) : (
                              <span className="font-semibold text-slate-900 dark:text-white">{patientItem.phone}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* RIGHT COLUMN */}
                      <div className="space-y-3.5 print:space-y-2">
                        <div className="grid grid-cols-3 items-start gap-2">
                          <Label className="font-bold text-slate-800 dark:text-slate-200 pt-1.5">Ref.:</Label>
                          <div className="col-span-2">
                            {isEditingCaseSheet ? (
                              <Input
                                value={editRefDoctor}
                                onChange={e => setEditRefDoctor(e.target.value)}
                                placeholder="e.g. Doctor Name / Patient Name"
                                className="h-8 text-xs"
                              />
                            ) : (
                              <span className="font-semibold text-slate-900 dark:text-white">{editRefDoctor || "N/A"}</span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 items-start gap-2">
                          <Label className="font-bold text-slate-800 dark:text-slate-200 pt-1.5">Address:</Label>
                          <div className="col-span-2">
                            {isEditingCaseSheet ? (
                              <textarea
                                value={editAddressLine}
                                onChange={e => setEditAddressLine(e.target.value)}
                                placeholder="Enter address..."
                                rows={2}
                                className="w-full rounded-md border border-slate-200 p-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                              />
                            ) : (
                              <span className="font-semibold text-slate-900 dark:text-white leading-relaxed">{patientItem.address || "N/A"}</span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-2">
                          <Label className="font-bold text-slate-800 dark:text-slate-200">Email:</Label>
                          <div className="col-span-2">
                            {isEditingCaseSheet ? (
                              <Input
                                type="email"
                                value={editEmail}
                                onChange={e => setEditEmail(e.target.value)}
                                placeholder="Optional email..."
                                className="h-8 text-xs"
                              />
                            ) : (
                              <span className="font-semibold text-slate-900 dark:text-white">{patientItem.email || "N/A"}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2 — MEDICAL HISTORY */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <div className="bg-sky-50/80 dark:bg-slate-900 px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold text-xs text-slate-900 dark:text-blue-300 uppercase tracking-wider">
                        MEDICAL HISTORY
                      </h3>
                    </div>

                    <div className="p-4 sm:p-5 print:p-3 space-y-4 print:space-y-2">
                      {/* Multi-column Checkbox Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-3.5 print:gap-2">
                        {[
                          "Diabetes",
                          "B.P.",
                          "Heart Complaint",
                          "Allergies",
                          "Bleeding Disorders",
                          "Pregnancy",
                          "Thyroid",
                          "Others"
                        ].map((cond) => {
                          const checked = editMedicalHistoryConditions.includes(cond);
                          return (
                            <div key={cond} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`med-cond-${cond}`}
                                checked={checked}
                                disabled={!isEditingCaseSheet}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditMedicalHistoryConditions([...editMedicalHistoryConditions, cond]);
                                  } else {
                                    setEditMedicalHistoryConditions(editMedicalHistoryConditions.filter(c => c !== cond));
                                  }
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-70"
                              />
                              <label htmlFor={`med-cond-${cond}`} className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer text-xs">
                                {cond}
                              </label>
                              {cond === "Others" && (checked || isEditingCaseSheet) && (
                                <input
                                  type="text"
                                  value={editMedicalHistoryOthers}
                                  disabled={!isEditingCaseSheet}
                                  onChange={e => setEditMedicalHistoryOthers(e.target.value)}
                                  placeholder="Specify..."
                                  className="h-7 w-24 text-[11px] px-1.5 rounded border border-slate-200 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Medications if any */}
                      <div className="pt-3 print:pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center print:flex-row print:items-center gap-2">
                        <Label className="font-bold text-slate-800 dark:text-slate-200 shrink-0">Medications if any:</Label>
                        {isEditingCaseSheet ? (
                          <Input
                            value={editCurrentMedications}
                            onChange={e => setEditCurrentMedications(e.target.value)}
                            placeholder="e.g. Aspirin, Metformin..."
                            className="h-8 text-xs flex-1"
                          />
                        ) : (
                          <span className="font-semibold text-slate-800 dark:text-slate-200 italic">{editCurrentMedications || "None"}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3 — CLINICAL CASE DETAILS */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <div className="bg-sky-50/80 dark:bg-slate-900 px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold text-xs text-slate-900 dark:text-blue-300 uppercase tracking-wider">
                        CLINICAL CASE DETAILS
                      </h3>
                    </div>

                    <div className="p-4 sm:p-5 print:p-3 space-y-4 print:space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
                      {/* ROW 1: Chief Complaint & Past Dental History */}
                      <div className="pt-3 print:pt-1.5 first:pt-0 space-y-1.5 print:space-y-1">
                        <Label className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                          Chief Complaint & Past Dental History
                        </Label>
                        {isEditingCaseSheet ? (
                          <textarea
                            value={editChiefComplaint}
                            onChange={e => setEditChiefComplaint(e.target.value)}
                            placeholder="Enter chief complaint and past dental history..."
                            rows={3}
                            className="w-full rounded-md border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900"
                          />
                        ) : (
                          <div className="min-h-[48px] print:min-h-0 p-2.5 print:p-2 bg-slate-50/60 dark:bg-slate-900/60 rounded border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-normal">
                            {editChiefComplaint || <span className="text-slate-400 italic">No chief complaint recorded.</span>}
                          </div>
                        )}
                      </div>

                      {/* ROW 2: Intra Oral Examination */}
                      <div className="pt-3 print:pt-1.5 space-y-3 print:space-y-1">
                        <Label className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                          Intra Oral Examination
                        </Label>
                        {isEditingCaseSheet ? (
                          <textarea
                            value={editIntraOralExam}
                            onChange={e => setEditIntraOralExam(e.target.value)}
                            placeholder="Enter intra oral examination findings..."
                            rows={3}
                            className="w-full rounded-md border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900"
                          />
                        ) : (
                          <div className="min-h-[48px] print:min-h-0 p-2.5 print:p-2 bg-slate-50/60 dark:bg-slate-900/60 rounded border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-normal">
                            {editIntraOralExam || <span className="text-slate-400 italic">No intra oral examination notes recorded.</span>}
                          </div>
                        )}

                        {/* Interactive Dental Chart */}
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 print:hidden">
                          {/* Clear All Confirmation Modal */}
                          {showClearAllConfirm && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
                              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-sm w-full shadow-lg space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                                    <Trash2 className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Clear All Tooth Assignments?</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                      Clear all tooth treatment selections for this patient?
                                    </p>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                  <Button
                                    type="button"
                                    onClick={() => setShowClearAllConfirm(false)}
                                    className="h-8 px-3 text-xs border border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={handleClearAllTeeth}
                                    className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs cursor-pointer"
                                  >
                                    Clear All
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                            {/* Left Panel: Dental Chart */}
                            <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
                              <div className="border-b pb-3 mb-4 shrink-0 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <div>
                                  <span className="text-[18px] font-semibold text-slate-900 dark:text-white block">Dental Chart</span>
                                  {selectedTeeth.length > 0 ? (
                                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block mt-0.5">
                                      {selectedTeeth.length} {selectedTeeth.length === 1 ? 'Tooth' : 'Teeth'} Selected ({selectedTeeth.map(tIdx => `#${ALL_TEETH.find(t => t.index === tIdx)?.fdi || tIdx}`).join(', ')})
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                                      Click teeth to select for treatment assignment
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {selectedTeeth.length > 0 ? (
                                    <button
                                      type="button"
                                      onClick={handleClearSelection}
                                      className="text-[11px] font-bold text-slate-600 hover:text-slate-800 dark:text-slate-300 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    >
                                      Clear Selection
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSelectAllTeeth()}
                                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                                    >
                                      Select All
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setShowClearAllConfirm(true)}
                                    className="text-[11px] font-bold text-red-600 dark:text-red-400 px-2 py-1 rounded-md border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                    title="Clear all saved tooth assignments"
                                  >
                                    Clear All
                                  </button>
                                </div>
                              </div>
                              <div className="flex-1 flex items-center justify-center py-2">
                                <div className="w-full">
                                  <Odontogram
                                    chartData={patientItem.dentalChart || {}}
                                    selectedTooth={chartSelectedTooth}
                                    selectedTeeth={selectedTeeth}
                                    onSelectTooth={handleChartToothSelect}
                                    isReadOnly={isReceptionist}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Right Panel: Treatment Details */}
                            <div className="lg:col-span-7 flex flex-col bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs font-semibold">
                              {selectedTeeth.length > 0 || chartSelectedTooth !== null ? (
                                <form onSubmit={handleSaveToothTreatment} className="flex-grow flex flex-col justify-between h-full space-y-4">
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-start border-b pb-3">
                                      <div className="flex flex-col">
                                        <span className="text-[18px] font-semibold text-slate-900 dark:text-white">
                                          Assign Treatment
                                        </span>
                                        <span className="text-[14px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                                          {selectedTeeth.length > 0
                                            ? `Selected Teeth: ${selectedTeeth.map(tIdx => `#${ALL_TEETH.find(t => t.index === tIdx)?.fdi || tIdx}`).join(', ')} (${selectedTeeth.length})`
                                            : `Tooth #${ALL_TEETH.find(t => t.index === chartSelectedTooth)?.fdi || chartSelectedTooth}`
                                          }
                                        </span>
                                      </div>
                                      <button type="button" onClick={handleClearSelection} className="text-slate-400 hover:text-slate-700 font-medium text-lg leading-none cursor-pointer">×</button>
                                    </div>

                                    <div className="space-y-4">
                                      {/* Row 1 */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Treatment Procedure</label>
                                          <select
                                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-[13px] font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
                                            value={chartTreatmentName}
                                            onChange={e => setChartTreatmentName(e.target.value)}
                                            required
                                          >
                                            <option value="">-- Choose Procedure --</option>
                                            {ALL_TREATMENTS.map(t => (
                                              <option key={t} value={t}>{t}</option>
                                            ))}
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Treatment Status</label>
                                          <select
                                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-[13px] font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
                                            value={chartStatus}
                                            onChange={e => setChartStatus(e.target.value as any)}
                                          >
                                            <option value="Planned">Planned</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                          </select>
                                        </div>
                                      </div>

                                      {/* Row 2 */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Doctor Assigned</label>
                                          <select
                                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-[13px] font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
                                            value={chartDoctor}
                                            onChange={e => setChartDoctor(e.target.value)}
                                          >
                                            {doctors.map(d => (
                                              <option key={d.name} value={d.name}>{d.name}</option>
                                            ))}
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Treatment Date</label>
                                          <Input type="date" value={chartDate} onChange={e => setChartDate(e.target.value)} className="text-[13px] font-semibold" />
                                        </div>
                                      </div>

                                      {/* Row 3 */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Estimated Procedure Cost (₹)</label>
                                          <Input type="number" value={chartCost} onChange={e => setChartCost(e.target.value)} className="text-[13px] font-semibold" />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Diagnosis Notes</label>
                                          <Input value={chartDiagnosis} onChange={e => setChartDiagnosis(e.target.value)} placeholder="e.g. Deep cavity, pulpal involvement" className="text-[13px] font-semibold" />
                                        </div>
                                      </div>

                                      {/* Row 4 */}
                                      <div className="space-y-1">
                                        <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Procedure Notes</label>
                                        <Input value={chartNotes} onChange={e => setChartNotes(e.target.value)} placeholder="Enter details..." className="text-[13px] font-semibold" />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-3 justify-end pt-4 border-t border-slate-105 dark:border-slate-800 mt-auto">
                                    <Button type="button" onClick={handleClearSelection} className="h-9 px-4 rounded border font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                                      Cancel
                                    </Button>
                                    <Button type="submit" className="h-9 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer shadow-xs">
                                      Assign Treatment
                                    </Button>
                                  </div>
                                </form>
                              ) : (
                                <div className="flex-grow flex flex-col space-y-5 h-full overflow-y-auto pr-1">
                                  {/* Header */}
                                  <div className="border-b pb-3 flex justify-between items-center">
                                    <div>
                                      <span className="text-[18px] font-semibold text-slate-900 dark:text-white block">
                                        Clinical Chart & Legend
                                      </span>
                                    </div>
                                  </div>

                                  {/* Color Legend Section */}
                                  <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 block uppercase tracking-wider">
                                        Tooth Treatment Indications
                                      </span>
                                      {activeTreatment && (
                                        <button
                                          type="button"
                                          onClick={() => setActiveTreatment(null)}
                                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                        >
                                          Clear Selection Mode
                                        </button>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                      {Object.entries(TREATMENT_COLORS).map(([tKey, cfg]) => {
                                        const isActive = activeTreatment === cfg.name;
                                        const isHoverMenuAvailable = cfg.name === "Scaling" || cfg.name === "Braces";
                                        const isMenuOpen = openTreatmentMenu === cfg.name;

                                        return (
                                          <div
                                            key={tKey}
                                            onClick={(e) => {
                                              if (isHoverMenuAvailable) {
                                                e.stopPropagation();
                                                setOpenTreatmentMenu(prev => prev === cfg.name ? null : cfg.name);
                                              } else {
                                                setActiveTreatment(isActive ? null : cfg.name);
                                              }
                                            }}
                                            className={`group relative flex items-center justify-between p-2.5 rounded-lg transition-all duration-150 cursor-pointer treatment-menu-container ${
                                              isActive
                                                ? 'bg-blue-50/90 dark:bg-blue-950/60 border-2 border-blue-500 shadow-xs ring-1 ring-blue-400/40 scale-[1.01]'
                                                : 'bg-white dark:bg-slate-955 border border-slate-200/60 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2 min-w-0">
                                              <span className={`w-3.5 h-3.5 rounded-full ${cfg.dotColor} shrink-0`}></span>
                                              <span className={`text-[12px] truncate ${isActive ? 'font-bold text-blue-900 dark:text-blue-200' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                                                {cfg.name}
                                              </span>
                                              {isActive && (
                                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-600 text-white tracking-wider shrink-0">
                                                  Active
                                                </span>
                                              )}
                                            </div>

                                            {isHoverMenuAvailable && (
                                              <div
                                                onClick={(e) => e.stopPropagation()}
                                                className={`items-center gap-1 shrink-0 ml-1 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 p-1 rounded-md shadow-xs transition-all ${
                                                  isMenuOpen ? 'flex' : 'hidden group-hover:flex'
                                                }`}
                                              >
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectAllTeeth(cfg.name as "Scaling" | "Braces");
                                                    setOpenTreatmentMenu(null);
                                                  }}
                                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-955/60 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                                                >
                                                  Select All
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveTreatment(cfg.name);
                                                    setOpenTreatmentMenu(null);
                                                    showToast(`Activated ${cfg.name} Custom Select mode. Click teeth to add/remove.`, "success");
                                                  }}
                                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-955/60 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                                                >
                                                  Custom Select
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Active Tooth Diagnoses Summary */}
                                  <div className="space-y-3 flex-grow flex flex-col">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                        CLINICAL LOG
                                      </span>
                                    </div>

                                    {(() => {
                                      const chartMap = patientItem.dentalChart || {};
                                      const activeEntries = Object.entries(chartMap).filter(([_, val]) => {
                                        const list = parseToothTreatments(val);
                                        return list.length > 0;
                                      });

                                      if (activeEntries.length === 0) {
                                        return (
                                          <div className="flex-grow flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-550 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl min-h-[160px]">
                                            <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-full mb-2 text-slate-400 dark:text-slate-550 shrink-0">
                                              <Activity className="h-5 w-5" />
                                            </div>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs mb-0.5">No Active Conditions</span>
                                            <p className="max-w-[240px] text-[11px] font-medium leading-normal text-slate-450 dark:text-slate-400">
                                              Select a treatment procedure above, then click teeth on the Odontogram to assign records.
                                            </p>
                                          </div>
                                        );
                                      }

                                      // Group entries by procedure name and status
                                      interface TreatmentGroup {
                                        key: string;
                                        procedure: string;
                                        status: string;
                                        teeth: Array<{ index: number; fdi: number }>;
                                      }

                                      const groupMap: Record<string, TreatmentGroup> = {};

                                      activeEntries.forEach(([toothIdxStr, val]) => {
                                        const toothNum = Number(toothIdxStr);
                                        const toothObj = ALL_TEETH.find(t => t.index === toothNum);
                                        const fdi = toothObj?.fdi || toothNum;
                                        const treatmentList = parseToothTreatments(val);

                                        treatmentList.forEach(statusStr => {
                                          const colorConfig = getTreatmentColorConfig(statusStr);
                                          const procedure = colorConfig?.name || statusStr.split(" (")[0].trim();

                                          let status = "Planned";
                                          if (String(statusStr).includes("Completed")) status = "Completed";
                                          else if (String(statusStr).includes("In Progress")) status = "In Progress";
                                          else if (String(statusStr).includes("Planned")) status = "Planned";

                                          const groupKey = `${procedure}__${status}`;

                                          if (!groupMap[groupKey]) {
                                            groupMap[groupKey] = {
                                              key: groupKey,
                                              procedure,
                                              status,
                                              teeth: []
                                            };
                                          }
                                          if (!groupMap[groupKey].teeth.some(t => t.index === toothNum)) {
                                            groupMap[groupKey].teeth.push({ index: toothNum, fdi });
                                          }
                                        });
                                      });

                                      const groups = Object.values(groupMap).map(g => ({
                                        ...g,
                                        teeth: g.teeth.sort((a, b) => a.fdi - b.fdi)
                                      }));

                                      return (
                                        <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                                          {groups.map((group) => {
                                            const colorConfig = TREATMENT_COLORS[group.procedure] || {
                                              dotColor: "bg-blue-500 border-blue-600",
                                              badgeBg: "bg-blue-50 border-blue-200 text-blue-800"
                                            };

                                            const isCompleted = group.status === "Completed";
                                            const isInProgress = group.status === "In Progress";
                                            const isPlanned = group.status === "Planned";

                                            let badgeStyle = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400";
                                            if (isCompleted) badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400";
                                            else if (isInProgress) badgeStyle = "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400";
                                            else if (isPlanned) badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400";

                                            return (
                                              <div
                                                key={group.key}
                                                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-955 space-y-2 group transition-all duration-150"
                                              >
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-2">
                                                    <span className={`w-3.5 h-3.5 rounded-full ${colorConfig.dotColor} shrink-0`}></span>
                                                    <span className="text-[13px] font-bold text-slate-900 dark:text-white tracking-wide uppercase">
                                                      {group.procedure}
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyle}`}>
                                                      {group.status}
                                                    </span>
                                                    <button
                                                      type="button"
                                                      onClick={async () => {
                                                        const patientItem = patients.find(p => p.id === selectedPatientId);
                                                        if (!patientItem) return;

                                                        const currentChart = { ...(patientItem.dentalChart || {}) };
                                                        group.teeth.forEach(t => {
                                                          const list = parseToothTreatments(currentChart[t.index]);
                                                          const filtered = list.filter(item => !item.toLowerCase().startsWith(group.procedure.toLowerCase()));
                                                          if (filtered.length === 0) {
                                                            delete currentChart[t.index];
                                                          } else {
                                                            currentChart[t.index] = filtered.join(" | ");
                                                          }
                                                        });

                                                        await supabase
                                                          .from("patients")
                                                          .update({ dental_chart: currentChart })
                                                          .eq("patient_id", selectedPatientId);

                                                        setPatients(prev => prev.map(p => {
                                                          if (p.id === selectedPatientId) {
                                                            return { ...p, dentalChart: currentChart };
                                                          }
                                                          return p;
                                                        }));
                                                        setEditTreatmentAdvised(formatTreatmentAdvisedFromChart(currentChart));
                                                        setTreatments(prev => prev.filter(t => !(t.patient === patientItem.name && t.name.toLowerCase() === group.procedure.toLowerCase())));
                                                        showToast(`Removed ${group.procedure} record.`, "success");
                                                      }}
                                                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                                      title="Remove this treatment group"
                                                    >
                                                      <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                  </div>
                                                </div>

                                                {/* Teeth List */}
                                                {group.teeth.length >= ALL_TEETH.length ? (
                                                  <div className="pt-0.5">
                                                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                                      All Teeth
                                                    </span>
                                                  </div>
                                                ) : (
                                                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Teeth:</span>
                                                    {group.teeth.map((t, idx) => (
                                                      <span key={t.index} className="inline-flex items-center">
                                                        <span
                                                          onClick={() => handleChartToothSelect(t.index)}
                                                          className="text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors"
                                                          title={`Tooth #${t.fdi} — Click to toggle/edit`}
                                                        >
                                                          #{t.fdi}
                                                        </span>
                                                        {idx < group.teeth.length - 1 && (
                                                          <span className="text-slate-300 dark:text-slate-700 mx-0.5 font-bold">·</span>
                                                        )}
                                                      </span>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ROW 3: Provisional Diagnosis */}
                      <div className="pt-3 print:pt-1.5 space-y-1.5 print:space-y-1">
                        <Label className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                          Provisional Diagnosis
                        </Label>
                        {isEditingCaseSheet ? (
                          <textarea
                            value={editProvisionalDiagnosis}
                            onChange={e => setEditProvisionalDiagnosis(e.target.value)}
                            placeholder="Enter provisional diagnosis..."
                            rows={3}
                            className="w-full rounded-md border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900"
                          />
                        ) : (
                          <div className="min-h-[48px] print:min-h-0 p-2.5 print:p-2 bg-slate-50/60 dark:bg-slate-900/60 rounded border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-normal">
                            {editProvisionalDiagnosis || <span className="text-slate-400 italic">No provisional diagnosis recorded.</span>}
                          </div>
                        )}
                      </div>

                      {/* ROW 4: Treatment Advised */}
                      <div className="pt-3 print:pt-1.5 space-y-1.5 print:space-y-1">
                        <Label className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                          Treatment Advised
                        </Label>
                        {isEditingCaseSheet ? (
                          <textarea
                            value={editTreatmentAdvised}
                            onChange={e => setEditTreatmentAdvised(e.target.value)}
                            placeholder="Enter treatment advised..."
                            rows={3}
                            className="w-full rounded-md border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900"
                          />
                        ) : (
                          <div className="min-h-[48px] print:min-h-0 p-2.5 print:p-2 bg-slate-50/60 dark:bg-slate-900/60 rounded border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-normal">
                            {formatTreatmentAdvisedFromChart(patientItem.dentalChart) || editTreatmentAdvised || <span className="text-slate-400 italic">No treatment advised recorded.</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {profileSubTab === "Treatments" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs font-semibold space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b pb-4">
                    <span className="font-bold text-sm">Patient Treatment History Log</span>
                    {!isReceptionist && (
                      <Button
                        onClick={() => {
                          setShowAddTreatmentModal(true);
                          setNewTrDoctor(doctors[0]?.name || "");
                        }}
                        className="h-8 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px]"
                      >
                        Add Treatment
                      </Button>
                    )}
                  </div>

                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full min-w-[680px] text-left border-collapse">
                      <thead>
                        <tr className="border-b text-slate-400 font-bold uppercase text-[10px]">
                          <th className="py-2.5 whitespace-nowrap min-w-[110px]">Date</th>
                          <th className="py-2.5 whitespace-nowrap min-w-[150px]">Procedure</th>
                          <th className="py-2.5 whitespace-nowrap min-w-[80px]">Tooth</th>
                          <th className="py-2.5 whitespace-nowrap min-w-[140px]">Doctor</th>
                          <th className="py-2.5 whitespace-nowrap min-w-[110px]">Stage</th>
                          <th className="py-2.5 whitespace-nowrap min-w-[90px]">Cost</th>
                          <th className="py-2.5 text-right whitespace-nowrap min-w-[90px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {treatments.filter(t => t.patient === patientItem.name).length > 0 ? (
                          treatments.filter(t => t.patient === patientItem.name).map((tr) => (
                            <tr key={tr.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                              <td className="py-3 text-slate-500 font-normal">{tr.date || "12 Aug 2026"}</td>
                              <td className="py-3 font-bold text-slate-900 dark:text-white">{tr.name}</td>
                              <td className="py-3 text-slate-600 dark:text-slate-400 font-medium">{tr.tooth ? `#${tr.tooth}` : "-"}</td>
                              <td className="py-3 text-slate-600 dark:text-slate-400 font-medium">{tr.doctor || "Doctor"}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  tr.stage === "Completed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40" :
                                  tr.stage === "In Progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-955/40" :
                                  "bg-slate-100 text-slate-800 dark:bg-slate-900/40"
                                }`}>
                                  {tr.stage}
                                </span>
                              </td>
                              <td className="py-3 font-bold">₹{(tr.cost || 0).toLocaleString()}</td>
                              <td className="py-3 text-right">
                                {!isReceptionist && (
                                  <button
                                    onClick={async () => {
                                      if (tr.id && !tr.id.startsWith("tr-")) {
                                        const { error: delErr } = await supabase
                                          .from("treatments")
                                          .delete()
                                          .eq("id", tr.id);
                                        if (delErr) {
                                          showToast(delErr.message || "Failed to delete treatment from database.", "error");
                                          return;
                                        }
                                      }
                                      if (tr.tooth) {
                                        const toothObj = ALL_TEETH.find(t => t.fdi === tr.tooth);
                                        const toothIdx = toothObj?.index;
                                        if (toothIdx !== undefined && patientItem.dentalChart && patientItem.dentalChart[toothIdx]) {
                                          const currentChart = { ...patientItem.dentalChart };
                                          const list = parseToothTreatments(currentChart[toothIdx]);
                                          const filtered = list.filter(item => !item.toLowerCase().startsWith(tr.name.toLowerCase()));
                                          if (filtered.length === 0) {
                                            delete currentChart[toothIdx];
                                          } else {
                                            currentChart[toothIdx] = filtered.join(" | ");
                                          }
                                          await supabase
                                            .from("patients")
                                            .update({ dental_chart: currentChart })
                                            .eq("patient_id", selectedPatientId);

                                          setPatients(prev => prev.map(p => p.id === selectedPatientId ? { ...p, dentalChart: currentChart } : p));
                                          setEditTreatmentAdvised(formatTreatmentAdvisedFromChart(currentChart));
                                        }
                                      }
                                      setTreatments(prev => prev.filter(t => t.id !== tr.id));
                                      showToast("Treatment history log removed.", "success");
                                    }}
                                    className="text-red-500 hover:text-red-750 font-bold"
                                  >
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-4 text-slate-400 text-center">No treatment history logged.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add Treatment Modal */}
                {showAddTreatmentModal && (
                  <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden text-xs font-semibold">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-[14px]">Add New Patient Treatment Log</span>
                        <button onClick={() => setShowAddTreatmentModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
                      </div>
                      <form onSubmit={handleSaveCustomTreatment} className="p-5 space-y-4">
                        <div>
                          <Label>Treatment Name</Label>
                          <select
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            value={newTrName}
                            onChange={e => setNewTrName(e.target.value)}
                            required
                          >
                            <option value="">-- Choose Procedure --</option>
                            {ALL_TREATMENTS.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Tooth Index (Optional)</Label>
                            <select
                              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                              value={newTrTooth}
                              onChange={e => setNewTrTooth(e.target.value)}
                            >
                              <option value="">-- General / None --</option>
                              {ALL_TEETH.map(t => (
                                <option key={t.fdi} value={t.index}>Tooth #{t.fdi}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label>Doctor Assigned</Label>
                            <select
                              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                              value={newTrDoctor}
                              onChange={e => setNewTrDoctor(e.target.value)}
                            >
                              {doctors.map(d => (
                                <option key={d.name} value={d.name}>{d.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Procedure Cost (₹)</Label>
                            <Input type="number" value={newTrCost} onChange={e => setNewTrCost(e.target.value)} />
                          </div>
                          <div>
                            <Label>Treatment Status</Label>
                            <select
                              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                              value={newTrStatus}
                              onChange={e => setNewTrStatus(e.target.value as any)}
                            >
                              <option value="Planned">Planned</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <Label>Diagnosis Notes</Label>
                          <Input value={newTrDiagnosis} onChange={e => setNewTrDiagnosis(e.target.value)} placeholder="e.g. Tooth sensitivity" />
                        </div>
                        <div>
                          <Label>Procedure Notes</Label>
                          <Input value={newTrNotes} onChange={e => setNewTrNotes(e.target.value)} placeholder="Procedure steps..." />
                        </div>
                        <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                          <Button type="button" onClick={() => setShowAddTreatmentModal(false)} className="h-9 px-4 rounded border font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
                            Cancel
                          </Button>
                          <Button type="submit" className="h-9 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                            Save
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}



            {profileSubTab === "Appointments" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs font-semibold space-y-4">
                  <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <span className="font-bold text-sm">Appointments Log & Intake schedule</span>
                    <Button
                      onClick={() => {
                        setShowAddApptForm(prev => !prev);
                        setApptDoctor(doctors[0]?.name || "");
                      }}
                      className="h-8 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px]"
                    >
                      {showAddApptForm ? "Close Form" : "Book Appointment"}
                    </Button>
                  </div>

                  {showAddApptForm && (
                    <form onSubmit={handleSavePatientAppt} className="p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                      <span className="font-bold block text-blue-605">Schedule New Slot</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <Label>Doctor</Label>
                          <select
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            value={patApptDoctor}
                            onChange={e => setPatApptDoctor(e.target.value)}
                          >
                            {doctors.map(d => (
                              <option key={d.name} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Treatment</Label>
                          <select
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            value={patApptTreatment}
                            onChange={e => setPatApptTreatment(e.target.value)}
                            required
                          >
                            <option value="">-- Select --</option>
                            {ALL_TREATMENTS.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input type="date" value={patApptDate} onChange={e => setPatApptDate(e.target.value)} required />
                        </div>
                        <div>
                          <Label>Time Slot</Label>
                          <select
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            value={patApptTime}
                            onChange={e => setPatApptTime(e.target.value)}
                            required
                          >
                            <option value="">-- Select Time Slot --</option>
                            {TIME_SLOTS.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label>Reason / Notes</Label>
                        <Input value={patApptNotes} onChange={e => setPatApptNotes(e.target.value)} placeholder="Intake reason..." />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" onClick={() => setShowAddApptForm(false)} className="h-8 px-3 rounded border text-[11px]">Cancel</Button>
                        <Button type="submit" className="h-8 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px]">Book Slot</Button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4">
                    {/* Log tables partitioned by state status */}
                    {["Scheduled", "Checked In", "Waiting", "Completed", "Cancelled"].map(group => {
                      const list = pAppts.filter(a => {
                        if (group === "Scheduled") return a.status === "Scheduled";
                        if (group === "Checked In") return a.status === "Checked In" || a.status === "Waiting";
                        if (group === "Completed") return a.status === "Completed";
                        return a.status === "Cancelled";
                      });

                      if (list.length === 0) return null;

                      return (
                        <div key={group} className="space-y-2">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-400 block border-b pb-1 mt-2">{group} appointments</span>
                          <div className="divide-y divide-slate-100 dark:divide-slate-900">
                            {list.map(app => (
                              <div key={app.id} className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div>
                                  <span className="font-bold text-[13px] text-slate-900 dark:text-white">{app.time} on {app.date} • {app.treatment}</span>
                                  <p className="text-slate-500 text-[11px] mt-0.5">Doctor: {app.doctor} {app.notes ? `• Notes: ${app.notes}` : ''}</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {reschedulingApptId === app.id ? (
                                    <div className="flex gap-1.5 items-center">
                                      <Input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} className="h-7 w-28 text-[10px] p-1" />
                                      <Input value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} placeholder="09:00 AM" className="h-7 w-20 text-[10px] p-1" />
                                      <button
                                        onClick={async () => {
                                          if (!rescheduleDate || !rescheduleTime) return;
                                          const { error } = await supabase
                                            .from("appointments")
                                            .update({ appointment_date: convertToDbDate(rescheduleDate), time_slot: rescheduleTime })
                                            .eq("id", app.id);
                                          if (error) {
                                            console.error("Appointment operation failed:", error.message, error.code);
                                            showToast("Failed to reschedule appointment in database.", "error");
                                            return;
                                          }
                                          setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, date: convertToUiDate(rescheduleDate), time: rescheduleTime } : a));
                                          setReschedulingApptId(null);
                                          showToast("Appointment rescheduled.", "success");
                                        }}
                                        className="h-7 px-2 bg-emerald-600 text-white rounded text-[10px] font-bold"
                                      >
                                        Save
                                      </button>
                                      <button onClick={() => setReschedulingApptId(null)} className="text-slate-400 font-bold px-1">×</button>
                                    </div>
                                  ) : (
                                    <>
                                      {app.status === "Scheduled" && (
                                        <>
                                          <button
                                            onClick={async () => {
                                              const { error } = await supabase
                                                .from("appointments")
                                                .update({ status: "Checked In" })
                                                .eq("id", app.id);
                                              if (error) {
                                                console.error("Appointment operation failed:", error.message, error.code);
                                                showToast("Failed to update status in database.", "error");
                                                return;
                                              }
                                              setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, status: "Checked In" } : a));
                                              showToast("Patient checked in.", "success");
                                            }}
                                            className="h-7 px-2.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[10px] transition-colors"
                                          >
                                            Check In
                                          </button>
                                          <button
                                            onClick={() => {
                                              setReschedulingApptId(app.id);
                                              setRescheduleDate(app.date);
                                              setRescheduleTime(app.time);
                                            }}
                                            className="h-7 px-2.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[10px]"
                                          >
                                            Reschedule
                                          </button>
                                        </>
                                      )}

                                      {(app.status === "Checked In" || app.status === "Waiting") && (
                                        <button
                                          onClick={async () => {
                                            const { error } = await supabase
                                              .from("appointments")
                                              .update({ status: "Completed" })
                                              .eq("id", app.id);
                                            if (error) {
                                              console.error("Appointment operation failed:", error.message, error.code);
                                              showToast("Failed to complete appointment in database.", "error");
                                              return;
                                            }
                                            setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, status: "Completed" } : a));
                                            showToast("Appointment completed.", "success");
                                          }}
                                          className="h-7 px-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px]"
                                        >
                                          Complete
                                        </button>
                                      )}

                                      {app.status !== "Cancelled" && app.status !== "Completed" && (
                                        <button
                                          onClick={async () => {
                                            const { error } = await supabase
                                              .from("appointments")
                                              .update({ status: "Cancelled" })
                                              .eq("id", app.id);
                                            if (error) {
                                              console.error("Appointment operation failed:", error.message, error.code);
                                              showToast("Failed to cancel appointment in database.", "error");
                                              return;
                                            }
                                            setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, status: "Cancelled" } : a));
                                            showToast("Appointment cancelled.", "success");
                                          }}
                                          className="h-7 px-2.5 rounded border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold text-[10px]"
                                        >
                                          Cancel
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {pAppts.length === 0 && (
                      <p className="text-slate-400 py-4 text-center">No appointment logs for this patient file.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {profileSubTab === "Invoices" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Billing invoice creation form */}
                <form onSubmit={handleSaveInvoice} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 text-xs">
                  <span className="font-bold text-sm block border-b pb-2 mb-2">Create New Billing Invoice</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Procedure / Item</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                        value={invProcedure}
                        onChange={e => setInvProcedure(e.target.value)}
                        required
                      >
                        <option value="">-- Choose Procedure --</option>
                        {ALL_TREATMENTS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Procedure Amount (₹)</Label>
                      <Input type="number" value={invAmount} onChange={e => setInvAmount(e.target.value)} required />
                    </div>
                    <div>
                      <Label>Discount (%)</Label>
                      <Input type="number" min="0" max="100" value={invDiscount} onChange={e => setInvDiscount(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Paid Amount (₹)</Label>
                      <Input type="number" min="0" value={invPaid} onChange={e => setInvPaid(e.target.value)} />
                    </div>
                    <div>
                      <Label>Payment Mode</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                        value={invMode}
                        onChange={e => setInvMode(e.target.value)}
                      >
                        <option value="UPI GPay">UPI / GPay</option>
                        <option value="Cash">Cash</option>
                        <option value="Card Swipe">Card</option>
                        <option value="Bank Transfer">Net Banking</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="submit" className="h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded">Save Invoice</Button>
                  </div>
                </form>

                {/* Invoices List */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs space-y-3">
                  <span className="font-bold text-sm block border-b pb-2">Billing Statements</span>
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full min-w-[650px] text-left border-collapse font-semibold">
                      <thead>
                        <tr className="border-b text-[10px] text-slate-405 uppercase">
                          <th className="pb-2 whitespace-nowrap min-w-[110px]">Invoice #</th>
                          <th className="pb-2 whitespace-nowrap min-w-[150px]">Procedure</th>
                          <th className="pb-2 whitespace-nowrap min-w-[110px]">Total Amount</th>
                          <th className="pb-2 whitespace-nowrap min-w-[110px]">Paid Amount</th>
                          <th className="pb-2 whitespace-nowrap min-w-[100px]">Status</th>
                          <th className="pb-2 text-right whitespace-nowrap min-w-[90px]">Actions</th>
                        </tr>
                      </thead>
                    <tbody>
                      {pInvoices.length > 0 ? (
                        pInvoices.map((inv) => (
                          <tr key={inv.id} className="border-b last:border-b-0">
                            <td className="py-2.5 font-bold">
                              <button type="button" onClick={() => setLastGeneratedReceipt(inv)} className="text-blue-600 hover:underline">{inv.id}</button>
                            </td>
                            <td className="py-2.5">{inv.treatment}</td>
                            <td className="py-2.5 font-bold">₹{inv.total.toLocaleString()}</td>
                            <td className="py-2.5 text-slate-500">₹{inv.paidAmount.toLocaleString()}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                inv.status === "Paid" ? "bg-emerald-55 text-emerald-800" :
                                inv.status === "Partially Paid" ? "bg-yellow-50 text-yellow-800" :
                                "bg-red-50 text-red-700"
                              }`}>{inv.status}</span>
                            </td>
                            <td className="py-2.5 text-right space-x-2">
                              {inv.status !== "Paid" && (
                                <button
                                  onClick={async () => {
                                    const { error } = await supabase
                                      .from("billing")
                                      .update({ status: "Paid", paid_amount: inv.total, payment_date: new Date().toISOString().split("T")[0] })
                                      .eq("invoice_id", inv.id);

                                    if (error) {
                                      showToast("Failed to update payment status in database.", "error");
                                      return;
                                    }

                                    await supabase
                                      .from("patients")
                                      .update({ balance: "₹0" })
                                      .eq("patient_id", inv.patientId);

                                    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: "Paid", paidAmount: i.total } : i));
                                    setPatients(prev => prev.map(p => p.id === inv.patientId ? { ...p, balance: "₹0" } : p));
                                    showToast("Invoice marked as Paid.", "success");
                                  }}
                                  className="text-emerald-600 hover:underline font-bold"
                                >
                                  Mark Paid
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  alert(`Print layout prepared for receipt ${inv.id}.`);
                                  setLastGeneratedReceipt(inv);
                                }}
                                className="text-blue-600 hover:underline font-bold"
                              >
                                Print
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-4 text-slate-400 text-center">No billing statements generated.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              </div>
            )}

            {profileSubTab === "Prescriptions" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Prescription Builder */}
                <form onSubmit={handleSavePrescription} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 text-xs">
                  <span className="font-bold text-sm block border-b pb-2 mb-2">Prescription Builder</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label>Practitioner / Doctor</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                        value={prescDoctor}
                        onChange={e => setPrescDoctor(e.target.value)}
                      >
                        {doctors.map(d => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Prescription Date</Label>
                      <Input type="date" value={prescDate} onChange={e => setPrescDate(e.target.value)} />
                    </div>
                    <div>
                      <Label>Diagnosis Notes</Label>
                      <Input value={prescDiagnosis} onChange={e => setPrescDiagnosis(e.target.value)} placeholder="e.g. Acute apical periodontitis" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="font-bold text-[11px] text-blue-605 block">Medicines Directory</span>
                    {prescMeds.map((med, idx) => {
                      const parsedDosage = parseDosageString(med.dosage);

                      const handleToggleTime = (timeKey: "morning" | "afternoon" | "night") => {
                        const updated = {
                          ...parsedDosage,
                          [timeKey]: !parsedDosage[timeKey]
                        };
                        const newDosageStr = formatDosageString(updated);
                        const copy = [...prescMeds];
                        copy[idx].dosage = newDosageStr;
                        setPrescMeds(copy);
                      };

                      const handleToggleMeal = (mealKey: "beforeMeals" | "afterMeals") => {
                        const isCurrentlyChecked = parsedDosage[mealKey];
                        const updated = {
                          ...parsedDosage,
                          beforeMeals: mealKey === "beforeMeals" ? !isCurrentlyChecked : false,
                          afterMeals: mealKey === "afterMeals" ? !isCurrentlyChecked : false
                        };
                        const newDosageStr = formatDosageString(updated);
                        const copy = [...prescMeds];
                        copy[idx].dosage = newDosageStr;
                        setPrescMeds(copy);
                      };

                      return (
                        <div key={idx} className="p-3 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                            {/* Medicine Name & Catalogue Selection */}
                            <div className="md:col-span-4 space-y-1">
                              <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Medicine Name</Label>
                              <select
                                value={med.name}
                                onChange={e => {
                                  const selectedVal = e.target.value;
                                  const copy = [...prescMeds];
                                  copy[idx].name = selectedVal;
                                  const matched = medicines.find(m => m.name === selectedVal);
                                  if (matched) {
                                    (copy[idx] as any).medicine_id = matched.id;
                                    (copy[idx] as any).stock_unit = matched.stock_unit;
                                    (copy[idx] as any).dispensing_quantity = 10;
                                  }
                                  setPrescMeds(copy);
                                }}
                                className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-white dark:bg-slate-900 px-3 py-1 text-xs focus:outline-none dark:border-slate-800 text-slate-900 dark:text-white"
                              >
                                <option value="">-- Select from Inventory Catalogue --</option>
                                {medicines.filter(m => m.is_active).map(m => {
                                  const status = getMedicineStockStatus(m);
                                  const availStr = m.available_quantity !== null && m.available_quantity !== undefined ? `${m.available_quantity} ${m.stock_unit}` : "Unset";
                                  const label = `${m.name} — Available: ${availStr} (${status.replace("_", " ")})`;
                                  const isSelectable = status === "in_stock" || status === "low_stock";
                                  return (
                                    <option key={m.id} value={m.name} disabled={!isSelectable}>
                                      {label} {!isSelectable ? " [Unavailable]" : ""}
                                    </option>
                                  );
                                })}
                              </select>
                              {(() => {
                                const matched = medicines.find(m => m.name === med.name);
                                if (!matched) return null;
                                const status = getMedicineStockStatus(matched);
                                return (
                                  <div className="flex items-center gap-2 pt-0.5">
                                    <span className="text-[10px] text-slate-500 font-medium">Unit: {matched.stock_unit}</span>
                                    {renderStockStatusBadge(status)}
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Dosage / Frequency Checkboxes */}
                            <div className="md:col-span-5 bg-white dark:bg-slate-955 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block leading-none">
                                Dosage / Frequency
                              </span>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                                <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">Time:</span>
                                <label className="inline-flex items-center gap-1 cursor-pointer select-none text-slate-800 dark:text-slate-200 font-medium hover:text-blue-600 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={parsedDosage.morning}
                                    onChange={() => handleToggleTime("morning")}
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                                  />
                                  Morning
                                </label>

                                <label className="inline-flex items-center gap-1 cursor-pointer select-none text-slate-800 dark:text-slate-200 font-medium hover:text-blue-600 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={parsedDosage.afternoon}
                                    onChange={() => handleToggleTime("afternoon")}
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                                  />
                                  Afternoon
                                </label>

                                <label className="inline-flex items-center gap-1 cursor-pointer select-none text-slate-800 dark:text-slate-200 font-medium hover:text-blue-600 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={parsedDosage.night}
                                    onChange={() => handleToggleTime("night")}
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                                  />
                                  Night
                                </label>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] border-t border-slate-100 dark:border-slate-800 pt-1">
                                <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">Meal:</span>
                                <label className="inline-flex items-center gap-1 cursor-pointer select-none text-slate-800 dark:text-slate-200 font-medium hover:text-blue-600 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={parsedDosage.beforeMeals}
                                    onChange={() => handleToggleMeal("beforeMeals")}
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                                  />
                                  Before Meals
                                </label>

                                <label className="inline-flex items-center gap-1 cursor-pointer select-none text-slate-800 dark:text-slate-200 font-medium hover:text-blue-600 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={parsedDosage.afterMeals}
                                    onChange={() => handleToggleMeal("afterMeals")}
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                                  />
                                  After Meals
                                </label>
                              </div>
                            </div>

                            {/* Duration & Special Advice */}
                            <div className="md:col-span-3 space-y-2">
                              <div>
                                <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Duration</Label>
                                <Input
                                  value={med.duration}
                                  onChange={e => {
                                    const copy = [...prescMeds];
                                    copy[idx].duration = e.target.value;
                                    setPrescMeds(copy);
                                  }}
                                  placeholder="e.g. 5 days, 1 week"
                                  className="mt-1 bg-white dark:bg-slate-955"
                                />
                              </div>

                              <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Special Advice</Label>
                                  <Input
                                    value={med.instructions}
                                    onChange={e => {
                                      const copy = [...prescMeds];
                                      copy[idx].instructions = e.target.value;
                                      setPrescMeds(copy);
                                    }}
                                    placeholder="e.g. Take with water"
                                    className="mt-1 bg-white dark:bg-slate-955"
                                  />
                                </div>
                                {prescMeds.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setPrescMeds(prev => prev.filter((_, i) => i !== idx))}
                                    className="h-9 px-2 text-red-500 hover:text-red-700 font-bold border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer shrink-0"
                                    title="Remove this medicine"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => prescMeds.length < 10 && setPrescMeds(prev => [...prev, { name: "", dosage: "", freq: "", duration: "", instructions: "" }])}
                      className="text-xs text-blue-650 hover:underline font-bold mt-1 inline-block"
                    >
                      + Add Medicine Row
                    </button>
                  </div>

                  <div>
                    <Label>Doctor Advice / Instructions</Label>
                    <Input value={prescAdvice} onChange={e => setPrescAdvice(e.target.value)} placeholder="Follow-up warnings..." />
                  </div>

                  <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      type="button"
                      onClick={handlePrintPrescription}
                      className="h-9 px-4 rounded border border-slate-900 bg-slate-900 text-white hover:bg-[#333333] hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:text-white active:bg-black active:text-white dark:bg-slate-900 dark:text-white dark:hover:bg-[#333333] dark:hover:text-white font-semibold transition-colors duration-200 flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Printer className="h-4 w-4 text-white" />
                      Print Prescription
                    </Button>
                    <Button type="submit" className="h-9 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                      Save Prescription
                    </Button>
                  </div>
                </form>

                {/* Integrated Clinical Notes Section */}
                <form onSubmit={handleSaveClinicalNote} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 text-xs">
                  <span className="font-bold text-sm block border-b pb-2 mb-2 text-slate-800 dark:text-white">Clinical Notes</span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label>Note Title</Label>
                      <Input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="e.g. Follow-up observations" required />
                    </div>

                    <div>
                      <Label>Note Category</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-805 dark:bg-slate-900"
                        value={noteCategory}
                        onChange={e => setNoteCategory(e.target.value)}
                      >
                        <option value="General">General</option>
                        <option value="Clinical">Clinical</option>
                        <option value="Treatment Progress">Treatment Progress</option>
                        <option value="X-Ray Analysis">X-Ray Analysis</option>
                        <option value="Intake Assessment">Intake Assessment</option>
                      </select>
                    </div>

                    <div>
                      <Label>Author (Doctor/Staff)</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-805 dark:bg-slate-900"
                        value={noteAuthor}
                        onChange={e => setNoteAuthor(e.target.value)}
                      >
                        {doctors.map(d => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>Rich Text / Multiline Notes field</Label>
                    <textarea
                      rows={4}
                      className="flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      value={noteContent}
                      onChange={e => setNoteContent(e.target.value)}
                      placeholder="Write clinical practitioner observations, treatment logs, or notes here..."
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button type="submit" className="h-9 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                      Save Clinical Note
                    </Button>
                  </div>
                </form>

                {/* Clinical Notes History list */}
                <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs font-semibold space-y-4">
                  <span className="font-bold text-sm block border-b pb-2 mb-2 text-slate-800 dark:text-white">Clinical Notes History</span>
                  {patientItem.notes.length > 0 ? (
                    <div className="space-y-3">
                      {patientItem.notes.slice().reverse().map((noteStr, idx) => {
                        const noteIndex = patientItem.notes.length - 1 - idx;
                        const parsed = parseClinicalNote(noteStr);
                        return (
                          <div key={idx} className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col gap-2">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900 dark:text-white text-xs">{parsed.title}</span>
                                  <span className="px-2 py-0.5 rounded-[4px] bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-extrabold uppercase tracking-wide">
                                    {parsed.category}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                  Logged by <strong className="text-slate-600 dark:text-slate-400">{parsed.author}</strong> on {parsed.date}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setPatients(prev => prev.map(p => p.id === selectedPatientId ? { ...p, notes: p.notes.filter((_, i) => i !== noteIndex) } : p));
                                  showToast("Clinical note deleted.", "success");
                                }}
                                className="text-red-500 hover:underline text-[11px]"
                              >
                                Delete
                              </button>
                            </div>

                            <p className="text-slate-700 dark:text-slate-300 text-xs font-normal leading-relaxed whitespace-pre-wrap">
                              {parsed.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-405 text-center py-2">No clinical practitioner notes logged.</p>
                  )}
                </div>

                {/* Prescriptions History list */}
                <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs font-semibold space-y-4">
                  <span className="font-bold text-sm block border-b pb-2 mb-2 text-slate-800 dark:text-white">Prescriptions Issued</span>
                  {patientItem.prescriptions.length > 0 ? (
                    patientItem.prescriptions.map((pr, idx) => {
                      const medNameMatch = medicines.find(m => pr.toLowerCase().includes(m.name.toLowerCase()));
                      const prescRec = patientPrescriptionsList.find(p => p.patient_id === selectedPatientId);
                      const structItem = prescRec?.items?.[idx];
                      const isDispensed = structItem?.dispensed ?? false;

                      return (
                        <div key={idx} className="p-3 border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <span className="font-semibold text-slate-900 dark:text-white block">{pr}</span>
                            {medNameMatch && (
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className="text-slate-500 font-medium">Matched: {medNameMatch.name}</span>
                                {renderStockStatusBadge(getMedicineStockStatus(medNameMatch))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isDispensed ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200">
                                Dispensed
                              </span>
                            ) : (
                              isOwner && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const medName = medNameMatch?.name || pr.split("(")[0].trim();
                                    const matched = medNameMatch || medicines.find(m => m.name.toLowerCase() === medName.toLowerCase());
                                    setDispenseConfirmModal({
                                      prescriptionId: prescRec?.id || `presc-${selectedPatientId}`,
                                      itemIndex: idx,
                                      patientName: patientItem.name,
                                      medicineName: medName,
                                      medicineId: matched?.id,
                                      dispensingQty: structItem?.dispensing_quantity || 10,
                                      stockUnit: matched?.stock_unit || "tablets",
                                      availableStock: matched?.available_quantity ?? null
                                    });
                                  }}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Pill className="h-3.5 w-3.5" /> Dispense Medicine
                                </button>
                              )
                            )}

                            <button
                              onClick={() => {
                                setPatients(prev => prev.map(p => p.id === selectedPatientId ? { ...p, prescriptions: p.prescriptions.filter((_, i) => i !== idx) } : p));
                                showToast("Prescription deleted.", "success");
                              }}
                              className="text-red-500 hover:underline text-[11px]"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-400 py-2 text-center">No prescriptions logged.</p>
                  )}
                </div>

                {/* Printable Prescription Document Layout (Visible ONLY during print) */}
                {selectedPatientId && (
                  <div id="print-area" className="hidden print:block bg-white text-slate-900 p-8 max-w-[210mm] mx-auto text-xs space-y-6 font-sans">
                    {/* Clinic Header */}
                    <div className="border-b-2 border-slate-800 pb-4 mb-4 flex justify-between items-start print:break-inside-avoid">
                      <div className="space-y-1">
                        <h1 className="text-xl font-bold text-blue-900 tracking-tight">{clinicName || clinicConfig.name}</h1>
                        <p className="text-xs text-slate-600 font-medium">{clinicAddress || clinicConfig.contact.address.full}</p>
                        <p className="text-xs text-slate-800 font-bold">PH: {clinicConfig.contact.phone}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="text-lg font-black text-blue-900 uppercase tracking-wider block">PRESCRIPTION</span>
                        <p className="text-xs text-slate-600 font-medium">Date: {prescDate || new Date().toISOString().split("T")[0]}</p>
                      </div>
                    </div>

                    {/* Patient & Doctor Details Card */}
                    {(() => {
                      const pItem = patients.find(p => p.id === selectedPatientId);
                      if (!pItem) return null;
                      const ageGender = `${pItem.age || ""} ${pItem.gender || ""}`.trim();
                      const docName = prescDoctor || (doctors[0]?.name || clinicConfig.doctor.name);
                      const medNotes = pItem.medicalNotes || (pItem as any).medicalConditions || "None";

                      return (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-2 gap-x-6 gap-y-2 text-xs print:break-inside-avoid">
                          <div>
                            <span className="font-bold text-slate-700">Patient Name: </span>
                            <span className="font-semibold text-slate-900">{pItem.name}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700">Doctor: </span>
                            <span className="font-semibold text-slate-900">{docName}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700">Patient ID: </span>
                            <span className="font-semibold text-slate-900">{pItem.id}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700">Prescription Date: </span>
                            <span className="font-semibold text-slate-900">{prescDate || new Date().toISOString().split("T")[0]}</span>
                          </div>
                          {ageGender && (
                            <div>
                              <span className="font-bold text-slate-700">Age / Gender: </span>
                              <span className="font-semibold text-slate-900">{ageGender}</span>
                            </div>
                          )}
                          {pItem.phone && (
                            <div>
                              <span className="font-bold text-slate-700">Contact: </span>
                              <span className="font-semibold text-slate-900">{pItem.phone}</span>
                            </div>
                          )}
                          {medNotes && medNotes !== "None" && (
                            <div className="col-span-2 mt-1 pt-1 border-t border-slate-200">
                              <span className="font-bold text-red-700">Medical Notes / Allergies: </span>
                              <span className="font-semibold text-slate-900">{medNotes}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Diagnosis Notes */}
                    {prescDiagnosis.trim() && (
                      <div className="space-y-1.5 print:break-inside-avoid">
                        <h3 className="font-bold text-sm text-blue-900 uppercase tracking-wide border-b border-slate-200 pb-1">Diagnosis / Clinical Notes</h3>
                        <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed pl-1">{prescDiagnosis.trim()}</p>
                      </div>
                    )}

                    {/* Medicines Prescribed Table */}
                    {prescMeds.length > 0 && (
                      <div className="space-y-2 print:break-inside-avoid">
                        <h3 className="font-bold text-sm text-blue-900 uppercase tracking-wide border-b border-slate-200 pb-1">Medicines Prescribed</h3>
                        <table className="w-full border-collapse border border-slate-300 text-xs">
                          <thead>
                            <tr className="bg-blue-900 text-white">
                              <th className="border border-slate-300 px-2.5 py-1.5 text-center w-8">#</th>
                              <th className="border border-slate-300 px-3 py-1.5 text-left font-bold">Medicine Name</th>
                              <th className="border border-slate-300 px-3 py-1.5 text-left">Dosage / Frequency</th>
                              <th className="border border-slate-300 px-3 py-1.5 text-left">Meal Timing</th>
                              <th className="border border-slate-300 px-3 py-1.5 text-left">Duration</th>
                              <th className="border border-slate-300 px-3 py-1.5 text-left">Special Instructions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prescMeds.map((med, idx) => {
                              const parsed = parseDosageString(med.dosage);
                              const times: string[] = [];
                              if (parsed.morning) times.push("Morning");
                              if (parsed.afternoon) times.push("Afternoon");
                              if (parsed.night) times.push("Night");

                              const timeStr = times.join(", ") || "-";
                              let mealStr = "-";
                              if (parsed.beforeMeals) mealStr = "Before Meals";
                              else if (parsed.afterMeals) mealStr = "After Meals";

                              return (
                                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/80"} style={{ pageBreakInside: "avoid" }}>
                                  <td className="border border-slate-300 px-2.5 py-2 text-center font-medium">{idx + 1}</td>
                                  <td className="border border-slate-300 px-3 py-2 font-bold text-slate-900">{med.name.trim() || "-"}</td>
                                  <td className="border border-slate-300 px-3 py-2 text-slate-800">{timeStr}</td>
                                  <td className="border border-slate-300 px-3 py-2 text-slate-800">{mealStr}</td>
                                  <td className="border border-slate-300 px-3 py-2 text-slate-800">{med.duration.trim() || "-"}</td>
                                  <td className="border border-slate-300 px-3 py-2 text-slate-800">{med.instructions.trim() || "-"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Doctor Advice / Instructions */}
                    {prescAdvice.trim() && (
                      <div className="space-y-1.5 print:break-inside-avoid">
                        <h3 className="font-bold text-sm text-blue-900 uppercase tracking-wide border-b border-slate-200 pb-1">Doctor Advice / Instructions</h3>
                        <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed pl-1">{prescAdvice.trim()}</p>
                      </div>
                    )}

                    {/* Doctor Signature Block */}
                    <div className="pt-8 flex justify-end print:break-inside-avoid">
                      <div className="text-right space-y-6">
                        <p className="text-xs font-bold text-slate-900">
                          Doctor: {prescDoctor || (doctors[0]?.name || clinicConfig.doctor.name)}
                        </p>
                        <p className="text-xs text-slate-700">
                          Signature: __________________________
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {profileSubTab === "Files" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Mock Upload Form */}
                <form onSubmit={handleUploadFile} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 text-xs">
                  <span className="font-bold text-sm block border-b pb-2 mb-2">Attach Patient Scanning File</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label>File Name</Label>
                      <Input value={newFileName} onChange={e => setNewFileName(e.target.value)} placeholder="e.g. panorex_xray_final.png" required />
                    </div>
                    <div>
                      <Label>File Type Category</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                        value={newFileType}
                        onChange={e => setNewFileType(e.target.value)}
                      >
                        <option value="X-Ray Scan">X-Ray Scan</option>
                        <option value="Intraoral Photo">Intraoral Photo</option>
                        <option value="Prescription PDF">Prescription PDF</option>
                        <option value="Clinical PDF">Clinical Report</option>
                        <option value="Billing Statement">Billing Statement</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" className="h-9 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded">
                        Upload Scan
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Uploaded Files Table list */}
                <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs font-semibold space-y-3">
                  <span className="font-bold text-sm block mb-2 border-b pb-2">Patient Files Uploads</span>
                  {patientItem.files.length > 0 ? (
                    patientItem.files.map((file, idx) => (
                      <div key={idx} className="p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <span className="font-bold block text-slate-850 dark:text-slate-100">{file.name}</span>
                            <p className="text-[10px] text-slate-400">{file.size || "1.8 MB"} • {file.type || "PNG Scan File"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => showToast(`Downloading file: ${file.name}`, "success")} className="text-[10px] text-blue-650 hover:underline font-bold cursor-pointer">Download</button>
                          <button
                            onClick={async () => {
                              const updatedFiles = patientItem.files.filter((_, i) => i !== idx);
                              const { error: fileErr } = await supabase
                                .from("patients")
                                .update({ files: updatedFiles })
                                .eq("patient_id", selectedPatientId);

                              if (fileErr) {
                                showToast("Failed to delete file from database.", "error");
                                return;
                              }

                              setPatients(prev => prev.map(p => p.id === selectedPatientId ? { ...p, files: updatedFiles } : p));
                              showToast("File deleted successfully.", "success");
                            }}
                            className="text-[10px] text-red-500 hover:underline font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 py-2 text-center">No attachments uploaded.</p>
                  )}
                </div>
              </div>
            )}

            {profileSubTab === "Media" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Header Title */}
                <div className="flex justify-between items-center border-b pb-3 mb-4 shrink-0">
                  <span className="text-[18px] font-semibold text-slate-900 dark:text-white">Patient Media Gallery</span>
                </div>

                {/* Patient Consent Video Recorder Card */}
                <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                  {/* Card Header & Title */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-blue-600" />
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Patient Consent Video</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${cameraActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}></span>
                        {cameraActive ? "Camera Ready" : "Camera Off"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mic className={`h-3.5 w-3.5 ${micActive ? "text-emerald-500" : "text-slate-400"}`} />
                        {micActive ? "Mic Active" : "Mic Muted"}
                      </span>
                      {availableCameras.length > 1 && (
                        <select
                          value={selectedCameraId}
                          onChange={(e) => {
                            setSelectedCameraId(e.target.value);
                            startWebcam(e.target.value);
                          }}
                          className="h-7 px-2 rounded-lg border border-slate-200 bg-white text-[10px] font-medium focus:outline-none dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {availableCameras.map((cam, i) => (
                            <option key={cam.deviceId || i} value={cam.deviceId}>
                              {cam.label || `Camera ${i + 1}`}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Patient Metadata Info Header */}
                  {(() => {
                    const activePat = patients.find(p => p.id === selectedPatientId);
                    const docName = prescDoctor || (doctors[0]?.name || "Dr. Deepa Kodali");
                    const todayDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Patient Name</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate block mt-0.5">{activePat?.name || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Patient ID</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate block mt-0.5">{activePat?.id || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Doctor Name</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate block mt-0.5">{docName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Date</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate block mt-0.5">{todayDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Time</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate block mt-0.5">{timeStr}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Live Timer</span>
                          <span className={`font-extrabold text-sm truncate block mt-0.5 ${recorderState === "recording" ? "text-red-600 animate-pulse" : "text-blue-600 dark:text-blue-400"}`}>
                            {formatTimer(recordingSeconds)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Live Webcam Preview Container or Review Video Player */}
                  <div className="relative aspect-video max-h-[360px] w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
                    {recorderState === "review" && recordedVideoUrl ? (
                      <video
                        ref={previewVideoRef}
                        src={recordedVideoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <video
                        ref={webcamVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${!cameraActive ? "hidden" : ""}`}
                      />
                    )}

                    {/* Video Overlay Badge Indicators */}
                    {!cameraActive && recorderState !== "review" && (
                      <div className="flex flex-col items-center gap-3 text-slate-400 p-6 text-center">
                        <Camera className="h-12 w-12 text-slate-500" />
                        <span className="text-xs font-semibold">Camera is currently inactive</span>
                        <Button
                          onClick={() => startWebcam(selectedCameraId)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-8 px-4 rounded-lg cursor-pointer"
                        >
                          Enable Camera & Mic
                        </Button>
                      </div>
                    )}

                    {recorderState === "recording" && (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs flex items-center gap-2 shadow-md">
                        <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
                        REC • {formatTimer(recordingSeconds)} / 01:30
                      </div>
                    )}

                    {recorderState === "paused" && (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs flex items-center gap-2 shadow-md">
                        PAUSED • {formatTimer(recordingSeconds)}
                      </div>
                    )}

                    {recorderState === "review" && (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs flex items-center gap-2 shadow-md">
                        ✓ REVIEW PREVIEW ({formatTimer(recordingSeconds)})
                      </div>
                    )}
                  </div>

                  {/* Rules & Helper Message Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {recordingSeconds < 20
                        ? "Please record at least 20 seconds of patient consent."
                        : recordingSeconds >= 90
                        ? "Maximum recording time (90 seconds) reached."
                        : "Minimum consent duration reached. You may review and save your recording."}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 shrink-0">
                      Min 20s • Max 90s
                    </span>
                  </div>

                  {/* Control Buttons Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {recorderState === "idle" && (
                        <Button
                          onClick={handleStartRecording}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs h-9 rounded-lg px-4 flex items-center gap-2 shadow-xs cursor-pointer"
                        >
                          <Circle className="h-3 w-3 fill-current text-white animate-pulse" /> Start Recording
                        </Button>
                      )}

                      {recorderState === "recording" && (
                        <>
                          <Button
                            onClick={handlePauseRecording}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-9 rounded-lg px-4 flex items-center gap-2 shadow-xs cursor-pointer"
                          >
                            <Pause className="h-4 w-4" /> Pause
                          </Button>
                          <Button
                            onClick={handleStopRecording}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs h-9 rounded-lg px-4 flex items-center gap-2 shadow-xs cursor-pointer"
                          >
                            <Square className="h-4 w-4" /> Stop
                          </Button>
                        </>
                      )}

                      {recorderState === "paused" && (
                        <>
                          <Button
                            onClick={handleResumeRecording}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-lg px-4 flex items-center gap-2 shadow-xs cursor-pointer"
                          >
                            <Play className="h-4 w-4" /> Resume
                          </Button>
                          <Button
                            onClick={handleStopRecording}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs h-9 rounded-lg px-4 flex items-center gap-2 shadow-xs cursor-pointer"
                          >
                            <Square className="h-4 w-4" /> Stop
                          </Button>
                        </>
                      )}

                      {recorderState === "review" && (
                        <Button
                          onClick={handleRetakeRecording}
                          variant="outline"
                          className="h-9 px-4 rounded-lg font-semibold text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="h-4 w-4" /> Retake
                        </Button>
                      )}
                    </div>

                    {recorderState === "review" && (
                      <Button
                        onClick={handleSaveConsentRecording}
                        disabled={recordingSeconds < 20}
                        className={`h-9 px-5 rounded-lg font-bold text-xs flex items-center gap-2 cursor-pointer ${
                          recordingSeconds >= 20
                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <Check className="h-4 w-4" /> Save Recording
                      </Button>
                    )}
                  </div>
                </div>

                {/* Media Filter Tabs & Photo Upload */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 shrink-0">
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-semibold">
                    {["All", "Clinical Photos", "Consent Video Recordings"].map((cat) => {
                      const active = mediaFilter === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setMediaFilter(cat)}
                          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                            active
                              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                              : "text-slate-500 hover:text-slate-805 hover:bg-slate-100 dark:hover:bg-slate-900"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="photo-upload-input"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleMockMediaUpload}
                    />
                    <Button
                      onClick={() => document.getElementById("photo-upload-input")?.click()}
                      variant="outline"
                      className="h-8 px-3 text-[11px] font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-blue-600 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload Photo
                    </Button>
                  </div>
                </div>

                {/* Media Cards Grid or Empty State */}
                {patientMedia.filter(m => m.patientId === selectedPatientId && (mediaFilter === "All" || m.category === mediaFilter)).length === 0 ? (
                  <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-10 shadow-xs flex flex-col items-center justify-center text-center">
                    <div className="text-3xl mb-3">🦷</div>
                    <span className="font-bold text-slate-850 dark:text-white text-sm block mb-1">No Clinical Media Available</span>
                    <p className="max-w-md text-xs text-slate-400 dark:text-slate-550 mb-4 leading-normal font-medium">
                      Record a patient consent video or add clinical photographs.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {patientMedia
                      .filter(m => m.patientId === selectedPatientId && (mediaFilter === "All" || m.category === mediaFilter))
                      .slice()
                      .reverse()
                      .map((media) => (
                        <div key={media.id} className="group bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                          {/* Thumbnail Area */}
                          <div
                            onClick={() => setSelectedMediaForPreview(media)}
                            className="relative aspect-video bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 flex items-center justify-center overflow-hidden cursor-pointer"
                          >
                            {media.type.startsWith("image/") ? (
                              <img src={media.url} alt={media.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                            ) : (
                              <div className="flex flex-col items-center gap-1.5 text-slate-400">
                                <Play className="h-8 w-8 text-blue-500 animate-pulse" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider">Consent Video</span>
                              </div>
                            )}

                            {/* Category Badge Overlay */}
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-[4px] bg-slate-900/80 text-white text-[8.5px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                              {media.category}
                            </span>
                          </div>

                          {/* Info Area */}
                          <div className="p-4 flex-1 flex flex-col justify-between gap-3 text-xs font-semibold">
                            <div className="space-y-1">
                              <span
                                onClick={() => setSelectedMediaForPreview(media)}
                                className="font-bold text-slate-855 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer block truncate text-xs"
                                title={media.name}
                              >
                                {media.name}
                              </span>
                              <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                <span>{media.uploadDate}</span>
                                <span>By {media.uploadedBy}</span>
                              </div>
                            </div>

                            {/* Linked Associations Tags */}
                            {(media.toothNumber || media.treatment || media.appointment || media.prescription) && (
                              <div className="pt-2.5 border-t border-slate-50 dark:border-slate-905 flex flex-wrap gap-1">
                                {media.toothNumber && (
                                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-705 dark:bg-blue-955/30 dark:text-blue-400 text-[9px] font-extrabold">
                                    Tooth #{media.toothNumber}
                                  </span>
                                )}
                                {media.treatment && (
                                  <span className="px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-705 dark:bg-cyan-955/30 dark:text-cyan-400 text-[9px] font-extrabold truncate max-w-[120px]" title={media.treatment}>
                                    {media.treatment}
                                  </span>
                                )}
                                {media.appointment && (
                                  <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-705 dark:bg-purple-955/30 dark:text-purple-400 text-[9px] font-extrabold truncate max-w-[120px]" title={media.appointment}>
                                    {media.appointment}
                                  </span>
                                )}
                                {media.prescription && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-705 dark:bg-emerald-955/30 dark:text-emerald-400 text-[9px] font-extrabold truncate max-w-[120px]" title={media.prescription}>
                                    {media.prescription}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Actions Footer */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              <button
                                onClick={() => setSelectedMediaForPreview(media)}
                                className="hover:text-slate-800 dark:hover:text-white"
                              >
                                View
                              </button>
                              <a
                                href={media.url}
                                download={media.name}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-slate-800 dark:hover:text-white"
                              >
                                Download
                              </a>
                              <button
                                onClick={() => setMediaToEdit(media)}
                                className="hover:text-slate-800 dark:hover:text-white"
                              >
                                Rename
                              </button>
                              <button
                                onClick={() => {
                                  setPatientMedia(prev => prev.filter(m => m.id !== media.id));
                                  showToast("Clinical media file deleted.", "success");
                                }}
                                className="text-red-505 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Media Preview Modal */}
                {selectedMediaForPreview && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
                      {/* Modal Header */}
                      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-850 shrink-0">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-855 dark:text-white text-sm">{selectedMediaForPreview.name}</span>
                          <span className="text-[10px] text-slate-405 dark:text-slate-500 font-medium">
                            Uploaded on {selectedMediaForPreview.uploadDate} by {selectedMediaForPreview.uploadedBy}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedMediaForPreview(null)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-lg font-bold"
                        >
                          ×
                        </button>
                      </div>

                      {/* Modal Content */}
                      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/40 flex justify-center items-center">
                        {selectedMediaForPreview.type.startsWith("image/") ? (
                          <img src={selectedMediaForPreview.url} alt={selectedMediaForPreview.name} className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-sm" />
                        ) : (
                          <video src={selectedMediaForPreview.url} controls className="max-w-full max-h-[60vh] rounded-lg shadow-sm" autoPlay />
                        )}
                      </div>

                      {/* Modal Metadata / Footer */}
                      <div className="px-6 py-4 border-t border-slate-105 dark:border-slate-850 bg-white dark:bg-slate-955 flex justify-between items-center shrink-0 flex-wrap gap-3">
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                          {selectedMediaForPreview.toothNumber && (
                            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-955/40 dark:text-blue-405">
                              Tooth #{selectedMediaForPreview.toothNumber}
                            </span>
                          )}
                          {selectedMediaForPreview.treatment && (
                            <span className="px-2 py-1 rounded bg-cyan-50 text-cyan-700 dark:bg-cyan-955/40 dark:text-cyan-405">
                              {selectedMediaForPreview.treatment}
                            </span>
                          )}
                          {selectedMediaForPreview.appointment && (
                            <span className="px-2 py-1 rounded bg-purple-50 text-purple-700 dark:bg-purple-955/40 dark:text-purple-405">
                              Appt: {selectedMediaForPreview.appointment}
                            </span>
                          )}
                          {selectedMediaForPreview.prescription && (
                            <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-705 dark:bg-emerald-955/40 dark:text-emerald-405">
                              Rx: {selectedMediaForPreview.prescription}
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={() => setSelectedMediaForPreview(null)}
                          className="h-9 px-4 rounded bg-slate-905 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold"
                        >
                          Close Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Media Rename / Association Edit Modal */}
                {mediaToEdit && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <form
                      onSubmit={handleSaveMediaMetadata}
                      className="bg-white dark:bg-slate-955 border border-slate-205 dark:border-slate-850 rounded-2xl w-full max-w-md overflow-hidden shadow-xl flex flex-col p-6 space-y-4 text-xs font-semibold"
                    >
                      <div className="flex justify-between items-center border-b pb-3 mb-2 shrink-0">
                        <span className="font-bold text-slate-850 dark:text-white text-sm">Edit Media Details</span>
                        <button
                          type="button"
                          onClick={() => setMediaToEdit(null)}
                          className="text-slate-405 hover:text-slate-700 dark:hover:text-white text-lg font-bold"
                        >
                          ×
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label>File Name</Label>
                          <Input value={editMediaName} onChange={e => setEditMediaName(e.target.value)} required />
                        </div>

                        <div>
                          <Label>Category</Label>
                          <select
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            value={editMediaCategory}
                            onChange={e => setEditMediaCategory(e.target.value as any)}
                          >
                            <option value="Clinical Photos">Clinical Photos</option>
                            <option value="Consent Video Recordings">Consent Video Recordings</option>
                          </select>
                        </div>

                        <div>
                          <Label>Link Tooth Number (Optional)</Label>
                          <Input value={editMediaTooth} onChange={e => setEditMediaTooth(e.target.value)} placeholder="e.g. 16, 28" />
                        </div>

                        <div>
                          <Label>Link Treatment (Optional)</Label>
                          <Input value={editMediaTreatment} onChange={e => setEditMediaTreatment(e.target.value)} placeholder="e.g. Root Canal Therapy" />
                        </div>

                        <div>
                          <Label>Link Appointment Date (Optional)</Label>
                          <Input value={editMediaAppointment} onChange={e => setEditMediaAppointment(e.target.value)} placeholder="e.g. 12 Aug 2026" />
                        </div>

                        <div>
                          <Label>Link Prescription (Optional)</Label>
                          <Input value={editMediaPrescription} onChange={e => setEditMediaPrescription(e.target.value)} placeholder="e.g. Amoxicillin 500mg" />
                        </div>

                        <div>
                          <Label>Uploaded By</Label>
                          <select
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            value={editMediaUploadedBy}
                            onChange={e => setEditMediaUploadedBy(e.target.value)}
                          >
                            {doctors.map(d => (
                              <option key={d.name} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-slate-850">
                        <Button
                          type="button"
                          onClick={() => setMediaToEdit(null)}
                          className="h-9 px-4 rounded border font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="h-9 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fadeIn">
        {activeSubTab === "All Patients" && (
          <>
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 max-w-xs w-full">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  placeholder="Filter directory by name, ID, or mobile number..."
                  value={patientsDirectoryQuery}
                  onChange={(e) => setPatientsDirectoryQuery(e.target.value)}
                  className="w-full text-xs font-semibold outline-none bg-transparent dark:text-slate-200"
                />
              </div>
              <div className="flex gap-3 shrink-0">
                <Button onClick={() => setActiveSubTab("Add Patient")} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 rounded-lg px-4">
                  <Plus className="h-4 w-4 mr-1.5" /> Register Patient
                </Button>
              </div>
            </div>
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[760px] text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-450 uppercase tracking-wider font-bold">
                  <th className="py-3 px-3 whitespace-nowrap min-w-[170px]">Patient Name</th>
                  <th className="py-3 px-3 whitespace-nowrap min-w-[140px]">Phone</th>
                  <th className="py-3 px-3 whitespace-nowrap min-w-[120px]">Age</th>
                  <th className="py-3 px-3 whitespace-nowrap min-w-[110px]">Last Visit</th>
                  <th className="py-3 px-3 whitespace-nowrap min-w-[100px]">Balance</th>
                  <th className="py-3 px-3 whitespace-nowrap min-w-[100px]">Status</th>
                  <th className="py-3 px-3 whitespace-nowrap text-center min-w-[120px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-705">
                {patients
                  .filter(pat => {
                    if (!patientsDirectoryQuery.trim()) return true;
                    const q = patientsDirectoryQuery.toLowerCase();
                    return pat.name.toLowerCase().includes(q) || pat.id.toLowerCase().includes(q) || pat.phone.includes(q);
                  })
                  .map((pat) => (
                    <tr key={pat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        <button onClick={() => setSelectedPatientId(pat.id)} className="hover:underline text-left text-[16px] sm:text-[17px] font-semibold cursor-pointer">
                          {pat.name}
                        </button>
                      </td>
                      <td className="py-3.5 px-3 text-[14px] sm:text-[15px] font-normal text-slate-500 whitespace-nowrap">{pat.phone}</td>
                      <td className="py-3.5 px-3 text-[14px] sm:text-[15px] font-normal whitespace-nowrap">{pat.age} Years ({pat.gender[0]})</td>
                      <td className="py-3.5 px-3 text-[13px] font-normal text-slate-455 whitespace-nowrap">{pat.visit}</td>
                      <td className="py-3.5 px-3 text-[14px] sm:text-[15px] font-semibold text-red-600 whitespace-nowrap">{pat.balance}</td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[12px] sm:text-[13px] font-medium inline-block ${
                          pat.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>{pat.status}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button onClick={() => setSelectedPatientId(pat.id)} className="text-blue-605 hover:underline text-[14px] sm:text-[15px] font-semibold cursor-pointer">
                          Open Profile
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        {activeSubTab === "Add Patient" && (
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs max-w-xl text-xs font-semibold">
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => setActiveSubTab("All Patients")}
                className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-bold text-sm">Patient Intake File Registration</span>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const saved = await registerPatient({
                name: newPatName,
                phone: newPatPhone,
                age: newPatAge,
                gender: newPatGender,
                address: newPatAddress,
                medicalNotes: newPatAllergies
              });
              if (saved) {
                setNewPatName("");
                setNewPatPhone("+91 ");
                setNewPatAddress("");
                setNewPatAllergies("None");
                setNewPatAge("");
                setActiveSubTab("All Patients");
              }
            }} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPatName">Patient Full Name</Label>
                <Input id="newPatName" placeholder="e.g. Aarav Mehta" value={newPatName} onChange={e => setNewPatName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="newPatPhone">Mobile Number</Label>
                  <Input id="newPatPhone" placeholder="e.g. +91 98112 09230" value={newPatPhone} onChange={e => setNewPatPhone(formatPhoneInput(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPatAge">Age</Label>
                  <Input
                    id="newPatAge"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g. 30"
                    value={newPatAge}
                    onChange={e => setNewPatAge(e.target.value.replace(/[^0-9]/g, ""))}
                    onKeyDown={e => { if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault(); }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="newPatGender">Gender</Label>
                  <select id="newPatGender" className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none dark:bg-slate-950 dark:border-slate-800" value={newPatGender} onChange={e => setNewPatGender(e.target.value as "Male" | "Female")}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPatAllergies">Medical Warnings / Allergies</Label>
                  <Input id="newPatAllergies" placeholder="e.g. Penicillin Allergy" value={newPatAllergies} onChange={e => setNewPatAllergies(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPatAddress">Address</Label>
                <Input id="newPatAddress" placeholder="e.g. Indiranagar, Bengaluru" value={newPatAddress} onChange={e => setNewPatAddress(e.target.value)} />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-4 rounded-lg mt-2">
                Register Intake File
              </Button>
            </form>
          </div>
        )}

        {activeSubTab === "Dental Chart" && (
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs font-semibold">
            <span className="font-bold text-sm block mb-3">Global Tooth Chart Visualizer</span>
            <Odontogram
              chartData={{}}
              onSelectTooth={(toothNum) => {
                const tooth = ALL_TEETH.find(t => t.index === toothNum);
                alert(`Tooth #${tooth?.fdi || toothNum} status: Healthy / Normal.`);
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderTreatmentDetailsSection = (tr: TreatmentItem, onBack?: () => void) => {
    const pat = patients.find(p => p.name === tr.patient || p.id === tr.patient);
    const patName = tr.patient || "Patient";
    const patId = pat?.id || "DS-1001";
    const cost = tr.cost || (tr.name.includes("Implant") ? 35000 : tr.name.includes("Crown") ? 12000 : tr.name.includes("Orthodontic") ? 45000 : tr.name.includes("Scaling") ? 2500 : tr.name.includes("Extraction") ? 3500 : 8500);
    const paid = tr.stage === "Completed" ? cost : Math.round(cost * 0.6);
    const remaining = cost - paid;
    const invId = `INV-${tr.id.replace(/\D/g, '') || '1001'}`;

    const timelineNodes = getPatientVisitsList(tr, treatments, appointments);
    const totalVisits = timelineNodes.length;
    const completedVisits = timelineNodes.filter(n => n.isCompleted).length;
    const progressPct = totalVisits > 0 ? Math.min(100, Math.round((completedVisits / totalVisits) * 100)) : 0;

    return (
      <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-200">
        {/* Top Back Navigation Bar */}
        {onBack && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-[12px] font-normal text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Active Treatments
            </button>
          </div>
        )}

        {/* 1. Compact Patient Header Card */}
        <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex justify-between items-center">
          <div>
            <h1 className="text-base font-semibold leading-6 text-slate-900 dark:text-white tracking-tight">
              {tr.name}
            </h1>
            <p className="text-[12px] font-normal text-slate-400 dark:text-slate-500 mt-1">
              Patient: <span className="text-[14px] font-medium text-slate-800 dark:text-slate-200">{patName}</span>
              <span className="mx-2 text-slate-300 dark:text-slate-700">•</span>
              ID: <span className="text-[14px] font-medium text-slate-800 dark:text-slate-200">{patId}</span>
            </p>
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl font-light leading-none cursor-pointer p-1"
            >
              ×
            </button>
          )}
        </div>

        {/* 2. Horizontal Treatment Progress Timeline Card */}
        <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-semibold leading-6 text-slate-900 dark:text-white tracking-tight">Treatment Progress</h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPhaseTreatment(tr);
                    const activeNode = timelineNodes.find(n => n.isCurrent);
                    setSelectedPhaseStage(activeNode ? activeNode.title : (tr.stage || "In Progress"));
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-955/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Update Treatment Phase"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Update Phase</span>
                </button>
              </div>
              <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {completedVisits} of {totalVisits} Phases Completed
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50/80 dark:bg-slate-900/50 p-2.5 px-4 rounded-xl border border-slate-100 dark:border-slate-800/80 shrink-0">
              <div className="text-right">
                <span className="text-[12px] font-medium uppercase tracking-wider text-slate-400 block">Overall</span>
                <span className="text-[14px] font-medium text-blue-600 dark:text-blue-400">{progressPct}% Complete</span>
              </div>
              <div className="w-24 bg-slate-200/80 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[12px] font-normal text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span> ✓ Completed</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-600 inline-block"></span> ● Current Phase</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700 inline-block"></span> ○ Upcoming</span>
          </div>

          {/* Horizontal Nodes Grid */}
          <div className="overflow-x-auto scrollbar-thin pb-1">
            <div className="grid grid-cols-6 min-w-[720px] gap-3 pt-1">
              {timelineNodes.map((node) => (
                <div
                  key={node.num}
                  className={`p-3 rounded-xl border transition-all ${
                    node.isCurrent
                      ? "bg-blue-50/70 dark:bg-blue-955/40 border-blue-100 dark:border-blue-900/40 text-blue-700 dark:text-blue-300"
                      : node.isCompleted
                      ? "bg-slate-50/60 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/80 text-slate-800 dark:text-slate-200"
                      : "bg-slate-50/30 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800/40 opacity-60 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Phase {node.num}
                    </span>
                    {node.isCompleted && <span className="h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>}
                    {node.isCurrent && <span className="h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-blue-200 dark:ring-blue-900">●</span>}
                    {!node.isCompleted && !node.isCurrent && <span className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px] text-slate-400">○</span>}
                  </div>
                  <span className="text-[14px] font-medium block truncate">{node.title}</span>
                  <span className="text-[12px] font-normal text-slate-400 dark:text-slate-500 block mt-0.5 truncate">{node.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Two Main Cards Side-by-Side (Treatment Plan & Cost Summary) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

          {/* Card 1: Treatment Plan (Left) */}
          <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full space-y-6">
            <div className="space-y-6">
              <h2 className="text-base font-semibold leading-6 text-slate-900 dark:text-white tracking-tight">Treatment Plan</h2>

              {/* Vertical Timeline / Checklist */}
              <div className="relative pl-7 space-y-5 text-sm before:absolute before:left-3 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-slate-200/80 dark:before:bg-slate-800">
                {timelineNodes.map((node) => {
                  if (node.isCompleted) {
                    return (
                      <div key={node.num} className="relative">
                        <span className="absolute -left-7 top-0.5 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">✓</span>
                        <div className="space-y-0.5">
                          <span className="text-[14px] font-medium text-slate-900 dark:text-white block">{node.title}</span>
                          <span className="text-[12px] font-normal text-slate-400 dark:text-slate-500 block">{node.date}</span>
                        </div>
                      </div>
                    );
                  }
                  if (node.isCurrent) {
                    return (
                      <div key={node.num} className="relative">
                        <span className="absolute -left-7 top-0.5 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-4 ring-blue-100 dark:ring-blue-955">●</span>
                        <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-955/40 border border-blue-100 dark:border-blue-900/40 space-y-0.5">
                          <span className="text-[14px] font-semibold text-blue-700 dark:text-blue-300 block">{node.title} (Current)</span>
                          <span className="text-[12px] font-normal text-blue-600 dark:text-blue-400 block">{node.subtitle || "Active Treatment Phase"}</span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={node.num} className="relative opacity-60">
                      <span className="absolute -left-7 top-0.5 h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 flex items-center justify-center text-xs font-medium">○</span>
                      <div className="space-y-0.5">
                        <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300 block">{node.title}</span>
                        <span className="text-[12px] font-normal text-slate-400 block">{node.subtitle || "Upcoming Phase"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
              <div className="flex justify-between items-center text-[12px] font-medium text-slate-400 dark:text-slate-500">
                <span>Total Planned Phases:</span>
                <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">{totalVisits} Phases</span>
              </div>

              <Button
                onClick={() => {
                  const pat = patients.find(p => p.name === tr.patient || p.id === tr.patient);
                  if (pat) {
                    setApptPatientId(pat.id);
                  }
                  if (tr.doctor) {
                    setApptDoctor(tr.doctor);
                  }
                  setApptTreatment(tr.name);
                  setApptDate(new Date().toISOString().split("T")[0]);
                  setApptTime("10:00 AM");
                  setActiveModal("addAppointment");
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <CalendarPlus className="h-4 w-4" /> Schedule Next Visit
              </Button>
            </div>
          </div>

          {/* Card 2: Cost Summary (Right) */}
          <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full space-y-6">
            <div className="space-y-6">
              <h2 className="text-base font-semibold leading-6 text-slate-900 dark:text-white tracking-tight">Cost Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[12px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Estimated Cost</span>
                  <span className="text-[14px] font-medium text-slate-900 dark:text-white">₹{cost.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-955/20 border border-emerald-100/60 dark:border-emerald-900/30">
                  <span className="text-[12px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Paid Amount</span>
                  <span className="text-[14px] font-medium text-emerald-700 dark:text-emerald-400">₹{paid.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-955/20 border border-amber-100/60 dark:border-amber-900/30">
                  <span className="text-[12px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">Remaining Balance</span>
                  <span className="text-[14px] font-medium text-amber-700 dark:text-amber-400">₹{remaining.toLocaleString()}</span>
                </div>

                <div className="pt-3 space-y-2.5">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="font-medium text-slate-400 dark:text-slate-500">Last Payment</span>
                    <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">₹2,500 on 12 Aug 2026 (Cash)</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="font-medium text-slate-400 dark:text-slate-500">Payment Status</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                      remaining === 0
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-955/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40"
                    }`}>
                      {remaining === 0 ? "Paid" : "Partially Paid"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="font-medium text-slate-400 dark:text-slate-500">Invoice Number</span>
                    <span className="text-[14px] font-medium text-blue-600 dark:text-blue-400">{invId}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <Button
                onClick={() => {
                  const inv: InvoiceItem = {
                    id: `INV-${Date.now().toString().slice(-4)}`,
                    patientId: tr.patient,
                    patientName: tr.patient,
                    doctor: tr.doctor,
                    treatment: tr.name,
                    items: [{ description: tr.name, amount: cost }],
                    discount: 0,
                    tax: 0,
                    subtotal: cost,
                    total: cost,
                    paidAmount: paid,
                    status: remaining === 0 ? "Paid" : "Partially Paid",
                    paymentDate: "12 Aug 2026",
                    paymentLogs: []
                  };
                  setSelectedInvoiceForPayment(inv);
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Receipt className="h-4 w-4" /> Generate Invoice
              </Button>
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderTreatmentsModule = () => {
    if (selectedTreatmentDetail) {
      return renderTreatmentDetailsSection(selectedTreatmentDetail, () => setSelectedTreatmentDetail(null));
    }

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[760px] text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3 whitespace-nowrap min-w-[180px]">Treatment Name</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[160px]">Patient</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[160px]">Doctor</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[110px]">Phases</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[120px]">Status</th>
                <th className="py-3 px-3 whitespace-nowrap text-right min-w-[130px]">Estimated Cost (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-705">
              {treatments.map((tr) => {
                  const pTreatments = treatments.filter(t => t.patient && tr.patient && t.patient.toLowerCase() === tr.patient.toLowerCase());
                  const pAppts = appointments.filter(a => a.patientName && tr.patient && a.patientName.toLowerCase() === tr.patient.toLowerCase() && a.status !== "Cancelled");
                  const visits = getPatientVisitsList(tr, pTreatments, pAppts);
                  const total = visits.length;
                  const completed = visits.filter(v => v.isCompleted).length;
                  const planName = tr.treatmentPlan || tr.name;
                  const costVal = tr.cost !== undefined && tr.cost > 0 ? tr.cost : (planName.includes("Implant") ? 35000 : planName.includes("Crown") ? 12000 : planName.includes("Orthodontic") ? 45000 : planName.includes("Scaling") ? 2500 : planName.includes("Extraction") ? 3500 : 8500);
                  const isCompleted = tr.stage === "Completed" || (total > 0 && completed === total);

                  return (
                    <tr
                      key={tr.id}
                      onClick={() => setSelectedTreatmentDetail(tr)}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-900/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap group-hover:text-blue-600 dark:group-hover:text-blue-400">{tr.name}</td>
                      <td className="py-3.5 px-3 whitespace-nowrap">{tr.patient}</td>
                      <td className="py-3.5 px-3 whitespace-nowrap">{tr.doctor}</td>
                      <td className="py-3.5 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {completed} / {total} Phases
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {isCompleted ? (
                          <span className="h-[22px] px-2.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                            <span className="text-[9px]">⚪</span> Completed
                          </span>
                        ) : (
                          <span className="h-[22px] px-2.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                            <span className="text-[9px]">🟢</span> Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        ₹{costVal.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBillingModule = () => (
    <div className="space-y-6 animate-fadeIn">
      {activeSubTab === "Invoices" && (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[760px] text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3 whitespace-nowrap min-w-[130px]">Invoice Number</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[160px]">Patient</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[110px]">Subtotal</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[120px]">Total Payable</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[120px]">Paid Amount</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[110px]">Status</th>
                <th className="py-3 px-3 whitespace-nowrap text-center min-w-[150px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-705">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    <button onClick={() => setLastGeneratedReceipt(inv)} className="text-blue-600 hover:underline cursor-pointer">{inv.id}</button>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">{inv.patientName}</td>
                  <td className="py-3.5 px-3 whitespace-nowrap">₹{inv.subtotal.toLocaleString()}</td>
                  <td className="py-3.5 px-3 font-black whitespace-nowrap">₹{inv.total.toLocaleString()}</td>
                  <td className="py-3.5 px-3 text-emerald-600 font-extrabold whitespace-nowrap">₹{inv.paidAmount.toLocaleString()}</td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                      inv.status === "Paid" ? "bg-emerald-50 text-emerald-700" :
                      inv.status === "Partially Paid" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                    }`}>{inv.status}</span>
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2 shrink-0">
                      <button
                        type="button"
                        title="Generate Invoice"
                        onClick={() => setLastGeneratedReceipt(inv)}
                        className="h-9 w-9 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-955/40 dark:text-blue-400 dark:hover:bg-blue-900/60 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Edit Invoice"
                        onClick={() => handleEditInvoice(inv)}
                        className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </button>
                      {inv.status !== "Paid" && (
                        <button
                          type="button"
                          title="Collect Payment"
                          onClick={() => {
                            setSelectedInvoiceForPayment(inv);
                            setPaymentCollectAmt(inv.total - inv.paidAmount);
                            setPaymentMethod("Cash");
                            setPayDiscountType(inv.discountType || "percentage");
                            setPayDiscountValue(inv.discountValue || inv.discount);
                            setPayDiscountPercent(inv.discount);
                            setPayTaxPercent(inv.tax);
                            setPayCustomItems([]);
                          }}
                          className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0"
                        >
                          <CreditCard className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === "Payments" && (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold space-y-4">
          <span className="font-bold text-sm block">Payments transaction logs</span>
          <div className="overflow-x-auto scrollbar-thin">
            <div className="divide-y min-w-[550px]">
              {invoices.flatMap(inv => inv.paymentLogs.map((log, idx) => ({ ...log, patient: inv.patientName, invId: inv.id, doctor: inv.doctor, key: `${inv.id}-${idx}` }))).map((pay) => (
                <div key={pay.key} className="py-3.5 flex justify-between items-center whitespace-nowrap">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">{pay.patient}</span>
                    <p className="text-slate-450 mt-0.5 text-[10px]">Method: {pay.method} • Invoice: {pay.invId} • Doctor: {pay.doctor} • Date: {pay.date}</p>
                  </div>
                  <span className="font-black text-slate-900 dark:text-white">₹{pay.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReportsModule = () => {
    // Current active sub-tab inside Reports (defaults to Revenue if invalid)
    const currentSubTab = ["Revenue", "Patients", "Treatments", "Appointments", "Medicine Stock"].includes(activeSubTab)
      ? activeSubTab
      : "Revenue";

    // Helper calculation for Reports -> Patients Analytics
    const getPatientAnalyticsData = () => {
      const { start, end } = getReportsDateRange(reportsFilter, customStartDate, customEndDate);
      const filteredPatients = patients.filter(p => isDateInRange(p.visit, start, end));
      const targetPatients = filteredPatients;

      let newCount = 0;
      let returningCount = 0;

      targetPatients.forEach(p => {
        const apptCount = appointments.filter(a => a.patientId === p.id || a.patientName === p.name).length;
        if (apptCount > 1) {
          returningCount++;
        } else {
          newCount++;
        }
      });

      const filteredInvoices = invoices.filter(inv => isDateInRange(inv.paymentDate || (inv.paymentLogs && inv.paymentLogs[0]?.date), start, end));
      const targetInvoices = filteredInvoices;

      let newRev = 0;
      let returningRev = 0;

      targetInvoices.forEach(inv => {
        const pat = targetPatients.find(p => p.id === inv.patientId || p.name === inv.patientName);
        const apptCount = pat ? appointments.filter(a => a.patientId === pat.id || a.patientName === pat.name).length : 1;
        const amt = Number(inv.paidAmount) || Number(inv.total) || 0;
        if (apptCount > 1) {
          returningRev += amt;
        } else {
          newRev += amt;
        }
      });

      const totalRev = newRev + returningRev;
      const totalPts = newCount + returningCount;
      const avgRevPerPt = totalPts > 0 ? Math.round(totalRev / totalPts) : 0;
      const returningRate = totalPts > 0 ? ((returningCount / totalPts) * 100).toFixed(1) + "%" : "0%";
      const avgRevPerNew = newCount > 0 ? Math.round(newRev / newCount) : 0;
      const avgRevPerReturning = returningCount > 0 ? Math.round(returningRev / returningCount) : 0;

      // Group patient trends by timeframe buckets
      const buckets = getReportBuckets(reportsFilter, start, end);
      const monthlyPatientTrends = buckets.map(b => {
        const mPts = targetPatients.filter(p => {
          const d = parseToDate(p.visit);
          return d && d >= b.start && d <= b.end;
        });

        let mNew = 0;
        let mRet = 0;
        mPts.forEach(p => {
          const apptCount = appointments.filter(a => a.patientId === p.id || a.patientName === p.name).length;
          if (apptCount > 1) mRet++;
          else mNew++;
        });

        return {
          month: b.label,
          newPts: mNew,
          returningPts: mRet,
          newRev: mNew * (avgRevPerNew || 1000),
          returningRev: mRet * (avgRevPerReturning || 1500)
        };
      });

      return {
        newCount,
        returningCount,
        totalPts,
        newRev,
        returningRev,
        totalRev,
        avgRevPerPt,
        returningRate,
        avgRevPerNew,
        avgRevPerReturning,
        newGrowth: "+0.0%",
        returningGrowth: "+0.0%",
        highestRevMonth: "Current Period",
        highestAcquisitionMonth: "Current Period",
        monthlyPatientTrends
      };
    };

    // Helper calculation for Reports -> Treatments Analytics
    const getTreatmentAnalyticsData = () => {
      const { start, end } = getReportsDateRange(reportsFilter, customStartDate, customEndDate);
      const filteredTr = treatments.filter(t => isDateInRange(t.date, start, end));
      const targetTr = filteredTr;

      const totalTr = targetTr.length;
      const activeTr = targetTr.filter(t => t.stage === "Planned" || t.stage === "In Progress").length;
      const completedTr = targetTr.filter(t => t.stage === "Completed").length;
      const totalRev = targetTr.reduce((sum, t) => sum + (Number(t.cost) || 0), 0);
      const completionRate = totalTr > 0 ? ((completedTr / totalTr) * 100).toFixed(1) + "%" : "0%";

      // Group performance by timeframe buckets
      const buckets = getReportBuckets(reportsFilter, start, end);
      const monthlyPerformance = buckets.map(b => {
        const mTreatments = targetTr.filter(t => {
          const d = parseToDate(t.date);
          return d && d >= b.start && d <= b.end;
        });

        const started = mTreatments.length;
        const completed = mTreatments.filter(t => t.stage === "Completed").length;
        return { month: b.label, started, completed };
      });

      // Group most performed treatments by treatment name
      const trCountsByName: Record<string, number> = {};
      targetTr.forEach(t => {
        const name = t.name || "Consultation";
        trCountsByName[name] = (trCountsByName[name] || 0) + 1;
      });

      const maxTrCount = Math.max(...Object.values(trCountsByName), 1);
      const mostPerformed = Object.entries(trCountsByName)
        .map(([name, count]) => ({
          name,
          count,
          pct: Math.round((count / maxTrCount) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      if (mostPerformed.length === 0) {
        mostPerformed.push(
          { name: "Consultation", count: 0, pct: 0 },
          { name: "Root Canal Therapy", count: 0, pct: 0 },
          { name: "Scaling & Polishing", count: 0, pct: 0 }
        );
      }

      // Revenue by treatment
      const trRevByName: Record<string, number> = {};
      targetTr.forEach(t => {
        const name = t.name || "Consultation";
        const cost = Number(t.cost) || 0;
        trRevByName[name] = (trRevByName[name] || 0) + cost;
      });

      const revenueByTreatment = Object.entries(trRevByName)
        .map(([name, rev]) => ({ name, rev }))
        .sort((a, b) => b.rev - a.rev)
        .slice(0, 5);

      if (revenueByTreatment.length === 0) {
        revenueByTreatment.push(
          { name: "Consultation", rev: 0 },
          { name: "Root Canal Therapy", rev: 0 }
        );
      }

      return {
        totalTr,
        activeTr,
        completedTr,
        completionRate,
        totalRev,
        monthlyPerformance,
        mostPerformed,
        revenueByTreatment
      };
    };

    // Helper calculation for Reports -> Appointments Analytics
    const getAppointmentAnalyticsData = () => {
      const { start, end } = getReportsDateRange(reportsFilter, customStartDate, customEndDate);
      const filteredAppts = appointments.filter(a => isDateInRange(a.date, start, end));
      const targetAppts = filteredAppts;

      const totalAppts = targetAppts.length;
      const completedAppts = targetAppts.filter(a => a.status === "Completed").length;
      const upcomingAppts = targetAppts.filter(a => a.status === "Scheduled" || a.status === "Waiting" || a.status === "Checked In" || a.status === "In Procedure" || a.status === "In Consultation").length;
      const cancelledAppts = targetAppts.filter(a => a.status === "Cancelled").length;
      const noshowAppts = targetAppts.filter(a => a.status === "No Show" || (a.status as string) === "No-show").length;
      const cancellationRate = totalAppts > 0 ? ((cancelledAppts / totalAppts) * 100).toFixed(1) + "%" : "0%";

      // Performance bars by timeframe buckets
      const buckets = getReportBuckets(reportsFilter, start, end);
      const performanceBars = buckets.map(b => {
        const dayAppts = targetAppts.filter(a => {
          const d = parseToDate(a.date);
          return d && d >= b.start && d <= b.end;
        });

        return {
          label: b.label,
          scheduled: dayAppts.length,
          completed: dayAppts.filter(a => a.status === "Completed").length,
          cancelled: dayAppts.filter(a => a.status === "Cancelled").length
        };
      });

      // Status Distribution
      const statusDistribution = [
        { name: "Completed", count: completedAppts, pct: Math.round((completedAppts / Math.max(1, totalAppts)) * 100), color: "bg-emerald-500", text: "text-emerald-600" },
        { name: "Scheduled / Upcoming", count: upcomingAppts, pct: Math.round((upcomingAppts / Math.max(1, totalAppts)) * 100), color: "bg-blue-600", text: "text-blue-600" },
        { name: "Cancelled", count: cancelledAppts, pct: Math.round((cancelledAppts / Math.max(1, totalAppts)) * 100), color: "bg-rose-500", text: "text-rose-600" },
        { name: "No-show", count: noshowAppts, pct: Math.round((noshowAppts / Math.max(1, totalAppts)) * 100), color: "bg-amber-500", text: "text-amber-600" }
      ];

      // Schedule Utilization
      const totalSlots = Math.round(totalAppts * 1.35) || 0;
      const bookedSlots = totalAppts;
      const availableSlots = Math.max(0, totalSlots - bookedSlots);
      const utilizationRate = totalSlots > 0 ? ((bookedSlots / totalSlots) * 100).toFixed(1) + "%" : "0%";

      const scheduleUtilization = {
        busiestDay: totalAppts > 0 ? "Active Practice" : "No Appointments",
        busiestSlot: "09:00 AM – 05:00 PM",
        totalSlots,
        availableSlots,
        utilizationRate
      };

      // Doctor Appointment Performance
      const docApptCounts: Record<string, { total: number; completed: number; cancelled: number; noshow: number }> = {};
      targetAppts.forEach(a => {
        const docName = a.doctor || "Unassigned";
        if (!docApptCounts[docName]) {
          docApptCounts[docName] = { total: 0, completed: 0, cancelled: 0, noshow: 0 };
        }
        docApptCounts[docName].total++;
        if (a.status === "Completed") docApptCounts[docName].completed++;
        if (a.status === "Cancelled") docApptCounts[docName].cancelled++;
        if (a.status === "No Show" || (a.status as string) === "No-show") docApptCounts[docName].noshow++;
      });

      const doctorPerformance = Object.entries(docApptCounts).map(([doctor, counts]) => ({
        doctor,
        ...counts
      }));

      if (doctorPerformance.length === 0) {
        doctors.forEach(d => {
          doctorPerformance.push({ doctor: d.name, total: 0, completed: 0, cancelled: 0, noshow: 0 });
        });
      }

      // Appointments by Type
      const apptTypeCounts: Record<string, number> = {};
      targetAppts.forEach(a => {
        const type = a.treatment || "Consultation";
        apptTypeCounts[type] = (apptTypeCounts[type] || 0) + 1;
      });

      const maxApptType = Math.max(...Object.values(apptTypeCounts), 1);
      const appointmentsByType = Object.entries(apptTypeCounts)
        .map(([type, count]) => ({
          type,
          count,
          pct: Math.round((count / maxApptType) * 100)
        }))
        .sort((a, b) => b.count - a.count);

      if (appointmentsByType.length === 0) {
        appointmentsByType.push({ type: "Consultation", count: 0, pct: 0 });
      }

      return {
        totalAppts,
        completedAppts,
        upcomingAppts,
        cancellationRate,
        performanceBars,
        statusDistribution,
        scheduleUtilization,
        doctorPerformance,
        appointmentsByType
      };
    };

    // Helper calculation for Reports -> Medicine Stock Analytics
    const getMedicineAnalyticsData = () => {
      const { start, end } = getReportsDateRange(reportsFilter, customStartDate, customEndDate);
      const filteredTransactions = stockTransactions.filter(t => {
        const dStr = t.created_at || t.transaction_date || (t as any).date;
        return isDateInRange(dStr, start, end);
      });

      let totalReceivedInPeriod = 0;
      let totalDispensedInPeriod = 0;

      filteredTransactions.forEach(t => {
        if (t.transaction_type === "received") {
          totalReceivedInPeriod += Math.abs(t.quantity || 0);
        } else if (t.transaction_type === "dispensed") {
          totalDispensedInPeriod += Math.abs(t.quantity || 0);
        }
      });

      const totalTracked = medicines.length;
      const lowStockCount = medicines.filter(m => getMedicineStockStatus(m) === "low_stock").length;
      const outOfStockCount = medicines.filter(m => getMedicineStockStatus(m) === "out_of_stock").length;
      const notConfiguredCount = medicines.filter(m => getMedicineStockStatus(m) === "not_configured").length;

      return {
        totalTracked,
        totalReceivedInPeriod,
        totalDispensedInPeriod,
        lowStockCount,
        outOfStockCount,
        notConfiguredCount,
        filteredTransactions
      };
    };

    const patientStats = getPatientAnalyticsData();
    const trStats = getTreatmentAnalyticsData();
    const apptStats = getAppointmentAnalyticsData();
    const medStats = getMedicineAnalyticsData();

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* CUSTOM DATE RANGE MODAL FOR ALL REPORTS SUB-TABS */}
        {customRangeModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl max-w-md w-full space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Select Custom Date Range</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomRangeModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-slate-500 dark:text-slate-400 block">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500 dark:text-slate-400 block">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomRangeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (customStartDate && customEndDate) {
                      if (new Date(customEndDate) < new Date(customStartDate)) {
                        showToast("End Date cannot be earlier than Start Date.", "error");
                        return;
                      }
                      const startFmt = new Date(customStartDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                      const endFmt = new Date(customEndDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                      setAppliedCustomLabel(`${startFmt} – ${endFmt}`);
                      setReportsFilter("Custom");
                      setCustomRangeModalOpen(false);
                    } else {
                      showToast("Please select both Start Date and End Date.", "error");
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 1: REVENUE */}
        {currentSubTab === "Revenue" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Timeframe selector filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs">
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <TrendingUp className="h-4 w-4 text-blue-600 animate-pulse" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reports Timeframe:</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto">
                {(["Today", "Week", "Month", "Year"] as const).map((tf) => {
                  const active = reportsFilter === tf;
                  return (
                    <button
                      key={tf}
                      onClick={() => {
                        setReportsFilter(tf);
                        setAppliedCustomLabel(null);
                      }}
                      className={`text-[11.5px] sm:text-xs font-bold py-2 sm:py-1.5 px-1 sm:px-3 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center min-w-0 ${
                        active ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      {tf}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCustomRangeModalOpen(true)}
                className={`hidden sm:flex text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer items-center gap-1.5 ${
                  reportsFilter === "Custom" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {reportsFilter === "Custom" && appliedCustomLabel ? appliedCustomLabel : "Custom"}
              </button>
            </div>

            {/* Analytics KPI reporting grid */}
            <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
              {[
                { title: "Total Revenue", count: `₹${reportStats.revenue.toLocaleString()}`, desc: "Collected earnings", icon: <span className="font-extrabold text-blue-500 text-sm">₹</span> },
                { title: "Patient Directory", count: reportStats.patients, desc: "Active clinical files", icon: <Users className="h-4 w-4 text-cyan-500" /> },
                { title: "Treatments Completed", count: reportStats.treatments, desc: "Finished checkouts", icon: <Stethoscope className="h-4 w-4 text-purple-500" /> },
                { title: "Appointments logged", count: reportStats.appointments, desc: "Total scheduled units", icon: <Calendar className="h-4 w-4 text-amber-500" /> }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">{stat.title}</span>
                    {stat.icon}
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{stat.count}</span>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{stat.desc}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* Dynamic Revenue Performance Chart */}
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm block text-slate-900 dark:text-white">Revenue Performance Chart</span>
                <span className="text-xs text-slate-400 font-medium">
                  {reportsFilter === "Today" ? "Hourly Breakdown" : reportsFilter === "Week" ? "Daily Breakdown" : reportsFilter === "Month" ? "Weekly Breakdown" : "Monthly Breakdown"}
                </span>
              </div>
              <div className="h-56 w-full flex items-end justify-between gap-2 sm:gap-4 pt-10 pb-2">
                {(() => {
                  const { start, end } = getReportsDateRange(reportsFilter, customStartDate, customEndDate);
                  const filteredInvoices = invoices.filter(inv => isDateInRange(inv.paymentDate || (inv.paymentLogs && inv.paymentLogs[0]?.date), start, end));
                  const buckets = getReportBuckets(reportsFilter, start, end);

                  const bucketRevs = buckets.map(b => {
                    return filteredInvoices.reduce((sum, inv) => {
                      const d = parseToDate(inv.paymentDate || (inv.paymentLogs && inv.paymentLogs[0]?.date));
                      if (d && d >= b.start && d <= b.end) {
                        return sum + (Number(inv.paidAmount) || Number(inv.total) || 0);
                      }
                      return sum;
                    }, 0);
                  });

                  const maxRev = Math.max(...bucketRevs, 1);

                  return buckets.map((b, i) => {
                    const val = bucketRevs[i];
                    const heightPct = val > 0 ? Math.max(14, Math.round((val / maxRev) * 100)) : 8;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative h-full justify-end">
                        {/* Tooltip */}
                        <div className="absolute -top-10 z-20 hidden group-hover:flex flex-col items-center pointer-events-none transition-all duration-150">
                          <div className="bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-lg shadow-lg font-medium whitespace-nowrap">
                            ₹{val.toLocaleString()}
                          </div>
                          <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                        </div>
                        {/* Direct Visible Numerical Label (Only when val > 0) */}
                        {val > 0 && (
                          <span className="text-[10px] sm:text-[11px] font-extrabold text-blue-600 dark:text-blue-400 whitespace-nowrap mb-0.5">
                            ₹{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toLocaleString()}
                          </span>
                        )}
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full max-w-[36px] rounded-t-lg transition-all cursor-pointer ${
                            val > 0 ? "bg-blue-600 hover:bg-blue-500 shadow-xs" : "bg-slate-200 dark:bg-slate-800"
                          }`}
                        />
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold truncate max-w-full text-center mt-1">{b.label}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: PATIENTS (DEDICATED PATIENT ANALYTICS DASHBOARD) */}
        {currentSubTab === "Patients" && (
          <div className="space-y-6 animate-fadeIn">
            {/* 2. TOP FILTER */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs">
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <TrendingUp className="h-4 w-4 text-blue-600 animate-pulse" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reports Timeframe:</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto">
                {(["Today", "Week", "Month", "Year"] as const).map((tf) => {
                  const active = reportsFilter === tf;
                  return (
                    <button
                      key={tf}
                      onClick={() => setReportsFilter(tf as any)}
                      className={`text-[11.5px] sm:text-xs font-bold py-2 sm:py-1.5 px-1 sm:px-3 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center min-w-0 ${
                        active ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      {tf}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCustomRangeModalOpen(true)}
                className={`hidden sm:flex text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer items-center gap-1.5 ${
                  reportsFilter === "Custom" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {reportsFilter === "Custom" && appliedCustomLabel ? appliedCustomLabel : "Custom"}
              </button>
            </div>

            {/* 3. SUMMARY CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">NEW PATIENTS</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">{patientStats.newCount}</span>
                <span className="text-[11px] text-slate-400 font-medium block">New patients</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">RETURNING PATIENTS</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block">{patientStats.returningCount}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Returning patients</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">AVERAGE REVENUE / PATIENT</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block">₹{patientStats.avgRevPerPt.toLocaleString()}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Average revenue</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">RETURNING PATIENT RATE</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">{patientStats.returningRate}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Repeat patient ratio</span>
              </div>
            </div>

            {/* 4. NEW VS RETURNING PATIENTS CHART */}
            <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
                    New vs Returning Patients
                  </h2>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Compare patient visits and revenue generated by new and returning patients.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[12px] font-medium shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-blue-600 inline-block" />
                    <span className="text-slate-700 dark:text-slate-300">New Patients</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-indigo-600 inline-block" />
                    <span className="text-slate-700 dark:text-slate-300">Returning Patients</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">PATIENT VISITS COMPARISON</span>
                  <div className="flex justify-between items-baseline pt-1 text-sm font-semibold">
                    <span className="text-blue-600">New: {patientStats.newCount}</span>
                    <span className="text-indigo-600">Returning: {patientStats.returningCount}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 flex overflow-hidden">
                    <div style={{ width: `${(patientStats.newCount / Math.max(1, patientStats.totalPts)) * 100}%` }} className="bg-blue-600" />
                    <div style={{ width: `${(patientStats.returningCount / Math.max(1, patientStats.totalPts)) * 100}%` }} className="bg-indigo-600" />
                  </div>
                </div>

                <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">PATIENT SHARE RATIO</span>
                  <div className="flex justify-between items-baseline pt-1 text-sm font-semibold">
                    <span className="text-blue-600">New Share: {((patientStats.newCount / Math.max(1, patientStats.totalPts)) * 100).toFixed(1)}%</span>
                    <span className="text-indigo-600">Returning Share: {patientStats.returningRate}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 flex overflow-hidden">
                    <div style={{ width: `${(patientStats.newCount / Math.max(1, patientStats.totalPts)) * 100}%` }} className="bg-blue-600" />
                    <div style={{ width: `${(patientStats.returningCount / Math.max(1, patientStats.totalPts)) * 100}%` }} className="bg-indigo-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. REVENUE COMPARISON */}
            <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
                  Revenue by Patient Type
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Detailed earnings breakdown and average spend comparison.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-blue-50/30 dark:bg-slate-900/40 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">NEW PATIENT REVENUE</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400 block">₹{patientStats.newRev.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-500 font-normal">From {patientStats.newCount} new registrations</span>
                </div>

                <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-indigo-50/30 dark:bg-slate-900/40 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">RETURNING PATIENT REVENUE</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 block">₹{patientStats.returningRev.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-500 font-normal">From {patientStats.returningCount} repeat visits</span>
                </div>

                <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">AVG REVENUE / NEW PATIENT</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400 block">₹{patientStats.avgRevPerNew.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-500 font-normal">Average spend per new patient</span>
                </div>

                <div className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">AVG REVENUE / RETURNING</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 block">₹{patientStats.avgRevPerReturning.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-500 font-normal">Average spend per returnee</span>
                </div>
              </div>
            </div>

            {/* 6. MONTHLY PATIENT TREND */}
            <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div>
                  <h2 className="text-[16px] sm:text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
                    Monthly Patient Trends
                  </h2>
                  <p className="hidden sm:block text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Month-by-month new vs returning patient volume.
                  </p>
                </div>
                <div className="flex items-center gap-3.5 sm:gap-4 text-[11px] sm:text-[12px] font-medium shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-blue-600 inline-block" />
                    <span className="text-slate-700 dark:text-slate-300">New Patients</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-indigo-600 inline-block" />
                    <span className="text-slate-700 dark:text-slate-300">Returning Patients</span>
                  </div>
                </div>
              </div>

              {/* Grouped Bar Chart */}
              <div className="pt-2">
                <div className="h-60 w-full flex items-end justify-between gap-3 sm:gap-6 pt-10 px-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  {patientStats.monthlyPatientTrends.map((m, i) => {
                    const maxCount = Math.max(...patientStats.monthlyPatientTrends.map(b => Math.max(b.newPts, b.returningPts))) || 1;
                    const newPct = m.newPts > 0 ? Math.max(14, Math.round((m.newPts / maxCount) * 100)) : 8;
                    const returnPct = m.returningPts > 0 ? Math.max(14, Math.round((m.returningPts / maxCount) * 100)) : 8;

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center pointer-events-none transition-all duration-150">
                          <div className="bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-lg font-medium whitespace-nowrap space-y-0.5">
                            <span className="font-semibold block text-slate-300 border-b border-slate-800 pb-0.5 mb-0.5">{m.month} Patients</span>
                            <span className="text-blue-300 block">New: {m.newPts} Patients</span>
                            <span className="text-indigo-300 block">Returning: {m.returningPts} Patients</span>
                          </div>
                          <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                        </div>

                        <div className="w-full flex items-end justify-center gap-1.5 h-full">
                          {/* New Patients Bar Column */}
                          <div className="w-1/2 max-w-[24px] sm:max-w-[28px] flex flex-col items-center justify-end h-full">
                            {m.newPts > 0 && (
                              <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 mb-0.5 leading-none">
                                {m.newPts}
                              </span>
                            )}
                            <div
                              style={{ height: `${newPct}%` }}
                              className={`w-full rounded-t-md transition-all duration-300 ${
                                m.newPts > 0 ? "bg-blue-600 hover:bg-blue-500 shadow-xs" : "bg-slate-200 dark:bg-slate-800"
                              }`}
                            />
                          </div>

                          {/* Returning Patients Bar Column */}
                          <div className="w-1/2 max-w-[24px] sm:max-w-[28px] flex flex-col items-center justify-end h-full">
                            {m.returningPts > 0 && (
                              <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 mb-0.5 leading-none">
                                {m.returningPts}
                              </span>
                            )}
                            <div
                              style={{ height: `${returnPct}%` }}
                              className={`w-full rounded-t-md transition-all duration-300 ${
                                m.returningPts > 0 ? "bg-indigo-600 hover:bg-indigo-500 shadow-xs" : "bg-slate-200 dark:bg-slate-800"
                              }`}
                            />
                          </div>
                        </div>

                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2.5 text-center truncate max-w-full">
                          {m.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 3: TREATMENTS (REFINED TREATMENT ANALYTICS DASHBOARD) */}
        {currentSubTab === "Treatments" && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. TIMEFRAME FILTER */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs">
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <TrendingUp className="h-4 w-4 text-blue-600 animate-pulse" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reports Timeframe:</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto">
                {(["Today", "Week", "Month", "Year"] as const).map((tf) => {
                  const active = reportsFilter === tf;
                  return (
                    <button
                      key={tf}
                      onClick={() => {
                        setReportsFilter(tf);
                        setAppliedCustomLabel(null);
                      }}
                      className={`text-[11.5px] sm:text-xs font-bold py-2 sm:py-1.5 px-1 sm:px-3 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center min-w-0 ${
                        active ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      {tf}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCustomRangeModalOpen(true)}
                className={`hidden sm:flex text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer items-center gap-1.5 ${
                  reportsFilter === "Custom" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {reportsFilter === "Custom" && appliedCustomLabel ? appliedCustomLabel : "Custom"}
              </button>
            </div>

            {/* 2. SUMMARY CARDS (ONLY 4) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">TOTAL TREATMENTS</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block">{trStats.totalTr}</span>
                <span className="text-[11px] text-slate-400 font-medium block">All logged procedures</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">ACTIVE TREATMENTS</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">{trStats.activeTr}</span>
                <span className="text-[11px] text-slate-400 font-medium block">In progress</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">COMPLETED TREATMENTS</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">{trStats.completedTr}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Finished procedures</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">COMPLETION RATE</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block">{trStats.completionRate}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Completion ratio</span>
              </div>
            </div>

            {/* 3. TREATMENT PERFORMANCE */}
            <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
                    Treatment Performance
                  </h2>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Monthly comparison between treatments started and completed.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[12px] font-medium shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-blue-600 inline-block" />
                    <span className="text-slate-700 dark:text-slate-300">Started</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-slate-700 dark:text-slate-300">Completed</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="h-60 w-full flex items-end justify-between gap-3 sm:gap-6 pt-10 px-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  {trStats.monthlyPerformance.map((m, i) => {
                    const maxVal = Math.max(...trStats.monthlyPerformance.map(b => Math.max(b.started, b.completed))) || 1;
                    const startedPct = m.started > 0 ? Math.max(14, Math.round((m.started / maxVal) * 100)) : 8;
                    const completedPct = m.completed > 0 ? Math.max(14, Math.round((m.completed / maxVal) * 100)) : 8;

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center pointer-events-none transition-all duration-150">
                          <div className="bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-lg font-medium whitespace-nowrap space-y-0.5">
                            <span className="font-semibold block text-slate-300 border-b border-slate-800 pb-0.5 mb-0.5">{m.month} Procedures</span>
                            <span className="text-blue-300 block">Started: {m.started}</span>
                            <span className="text-emerald-300 block">Completed: {m.completed}</span>
                          </div>
                          <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                        </div>

                        <div className="w-full flex items-end justify-center gap-1.5 h-full">
                          {/* Started Bar Column */}
                          <div className="w-1/2 max-w-[24px] sm:max-w-[28px] flex flex-col items-center justify-end h-full">
                            {m.started > 0 && (
                              <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 mb-0.5 leading-none">
                                {m.started}
                              </span>
                            )}
                            <div
                              style={{ height: `${startedPct}%` }}
                              className={`w-full rounded-t-md transition-all duration-300 ${
                                m.started > 0 ? "bg-blue-600 hover:bg-blue-500 shadow-xs" : "bg-slate-200 dark:bg-slate-800"
                              }`}
                            />
                          </div>

                          {/* Completed Bar Column */}
                          <div className="w-1/2 max-w-[24px] sm:max-w-[28px] flex flex-col items-center justify-end h-full">
                            {m.completed > 0 && (
                              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 mb-0.5 leading-none">
                                {m.completed}
                              </span>
                            )}
                            <div
                              style={{ height: `${completedPct}%` }}
                              className={`w-full rounded-t-md transition-all duration-300 ${
                                m.completed > 0 ? "bg-emerald-500 hover:bg-emerald-400 shadow-xs" : "bg-slate-200 dark:bg-slate-800"
                              }`}
                            />
                          </div>
                        </div>

                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2.5 text-center truncate max-w-full">
                          {m.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. MOST PERFORMED TREATMENTS & REVENUE BY TREATMENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MOST PERFORMED TREATMENTS */}
              <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
                    Most Performed Treatments
                  </h2>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Ranked by frequency of clinical records.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {trStats.mostPerformed.map((item, idx) => (
                    <div key={idx} className="space-y-1 text-xs font-semibold">
                      <div className="flex justify-between items-center text-slate-800 dark:text-slate-200">
                        <span>{idx + 1}. {item.name}</span>
                        <span className="font-mono text-slate-500">{item.count} records</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div style={{ width: `${item.pct}%` }} className="bg-blue-600 h-full rounded-full transition-all duration-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* REVENUE BY TREATMENT */}
              <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
                    Revenue by Treatment
                  </h2>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Financial generation by procedure type.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {trStats.revenueByTreatment.map((item, idx) => {
                    const maxRev = Math.max(...trStats.revenueByTreatment.map(r => r.rev)) || 1;
                    const pct = Math.round((item.rev / maxRev) * 100);
                    return (
                      <div key={idx} className="space-y-1 text-xs font-semibold">
                        <div className="flex justify-between items-center text-slate-800 dark:text-slate-200">
                          <span>{item.name}</span>
                          <span className="font-mono text-blue-600 dark:text-blue-400">₹{item.rev.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div style={{ width: `${pct}%` }} className="bg-indigo-600 h-full rounded-full transition-all duration-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SUB-TAB 4: APPOINTMENTS (DEDICATED APPOINTMENT ANALYTICS DASHBOARD) */}
        {currentSubTab === "Appointments" && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. TIMEFRAME FILTER */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs">
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <TrendingUp className="h-4 w-4 text-blue-600 animate-pulse" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reports Timeframe:</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto">
                {(["Today", "Week", "Month", "Year"] as const).map((tf) => {
                  const active = reportsFilter === tf;
                  return (
                    <button
                      key={tf}
                      onClick={() => {
                        setReportsFilter(tf);
                        setAppliedCustomLabel(null);
                      }}
                      className={`text-[11.5px] sm:text-xs font-bold py-2 sm:py-1.5 px-1 sm:px-3 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center min-w-0 ${
                        active ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      {tf}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCustomRangeModalOpen(true)}
                className={`hidden sm:flex text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer items-center gap-1.5 ${
                  reportsFilter === "Custom" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {reportsFilter === "Custom" && appliedCustomLabel ? appliedCustomLabel : "Custom"}
              </button>
            </div>

            {/* 2. SUMMARY CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">TOTAL APPOINTMENTS</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block">{apptStats.totalAppts}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Total in selected period</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">COMPLETED</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">{apptStats.completedAppts}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Successfully completed</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">UPCOMING</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">{apptStats.upcomingAppts}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Scheduled future bookings</span>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">CANCELLATION RATE</span>
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400 block">{apptStats.cancellationRate}</span>
                <span className="text-[11px] text-slate-400 font-medium block">Cancelled ratio</span>
              </div>
            </div>

            {/* 3. APPOINTMENT STATUS */}
            <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
                  Appointment Status
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Distribution across appointment lifecycle states.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {apptStats.statusDistribution.map((st, idx) => (
                  <div key={idx} className="space-y-1 text-xs font-semibold">
                    <div className="flex justify-between items-center text-slate-800 dark:text-slate-200">
                      <span>{st.name}</span>
                      <span className={`font-mono ${st.text}`}>{st.count} ({st.pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div style={{ width: `${st.pct}%` }} className={`${st.color} h-full rounded-full transition-all duration-500`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. APPOINTMENT VOLUME BREAKDOWN */}
            <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
                    Appointment Volume Breakdown
                  </h2>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Scheduled vs Completed appointments across the selected period.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[12px] font-medium shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-blue-600 inline-block" />
                    <span className="text-slate-700 dark:text-slate-300">Scheduled</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-slate-700 dark:text-slate-300">Completed</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="h-60 w-full flex items-end justify-between gap-3 sm:gap-6 pt-10 px-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  {apptStats.performanceBars.map((b, i) => {
                    const maxVal = Math.max(...apptStats.performanceBars.map(bar => Math.max(bar.scheduled, bar.completed))) || 1;
                    const schedPct = b.scheduled > 0 ? Math.max(14, Math.round((b.scheduled / maxVal) * 100)) : 8;
                    const compPct = b.completed > 0 ? Math.max(14, Math.round((b.completed / maxVal) * 100)) : 8;

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center pointer-events-none transition-all duration-150">
                          <div className="bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-lg font-medium whitespace-nowrap space-y-0.5">
                            <span className="font-semibold block text-slate-300 border-b border-slate-800 pb-0.5 mb-0.5">{b.label} Appointments</span>
                            <span className="text-blue-300 block">Scheduled: {b.scheduled}</span>
                            <span className="text-emerald-300 block">Completed: {b.completed}</span>
                          </div>
                          <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                        </div>

                        <div className="w-full flex items-end justify-center gap-1.5 h-full">
                          {/* Scheduled Bar Column */}
                          <div className="w-1/2 max-w-[24px] sm:max-w-[28px] flex flex-col items-center justify-end h-full">
                            {b.scheduled > 0 && (
                              <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 mb-0.5 leading-none">
                                {b.scheduled}
                              </span>
                            )}
                            <div
                              style={{ height: `${schedPct}%` }}
                              className={`w-full rounded-t-md transition-all duration-300 ${
                                b.scheduled > 0 ? "bg-blue-600 hover:bg-blue-500 shadow-xs" : "bg-slate-200 dark:bg-slate-800"
                              }`}
                            />
                          </div>

                          {/* Completed Bar Column */}
                          <div className="w-1/2 max-w-[24px] sm:max-w-[28px] flex flex-col items-center justify-end h-full">
                            {b.completed > 0 && (
                              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 mb-0.5 leading-none">
                                {b.completed}
                              </span>
                            )}
                            <div
                              style={{ height: `${compPct}%` }}
                              className={`w-full rounded-t-md transition-all duration-300 ${
                                b.completed > 0 ? "bg-emerald-500 hover:bg-emerald-400 shadow-xs" : "bg-slate-200 dark:bg-slate-800"
                              }`}
                            />
                          </div>
                        </div>

                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2.5 text-center truncate max-w-full">
                          {b.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 5: MEDICINE STOCK */}
        {currentSubTab === "Medicine Stock" && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. TIMEFRAME FILTER & METRIC HEADER */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs">
              <div className="flex items-center gap-2">
                <Boxes className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Medicine Stock Analytics & Audit Logs</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Inventory levels, dispensing history, and stock movement logs</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl self-start sm:self-auto overflow-x-auto">
                {(["Today", "Week", "Month", "Custom"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => {
                      if (filter === "Custom") {
                        setCustomRangeModalOpen(true);
                      } else {
                        setReportsFilter(filter);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      reportsFilter === filter
                        ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {filter === "Custom" && appliedCustomLabel ? appliedCustomLabel : filter === "Week" ? "This Week" : filter === "Month" ? "This Month" : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. METRIC SUMMARY CARDS */}
            {(() => {
              const medAnalytics = medStats;
              return (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
                    <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Tracked</span>
                        <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                          <Pill className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{medAnalytics.totalTracked}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Catalogue Medicines</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Stock Received</span>
                        <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                          <Package className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+{medAnalytics.totalReceivedInPeriod}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Units Added in Period</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Stock Dispensed</span>
                        <div className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
                          <Pill className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">-{medAnalytics.totalDispensedInPeriod}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Units Dispensed in Period</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Low Stock Alert</span>
                        <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{medAnalytics.lowStockCount}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Below Threshold</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Out of Stock</span>
                        <div className="h-8 w-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{medAnalytics.outOfStockCount}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">0 Units Remaining</p>
                      </div>
                    </div>
                  </div>

                  {/* 3. MEDICINE STOCK SUMMARY TABLE */}
                  <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Current Stock Levels</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Real-time catalogue stock status</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto scrollbar-thin">
                      <table className="w-full text-left border-collapse text-xs font-semibold min-w-[650px]">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                            <th className="py-3 px-3">Medicine Name</th>
                            <th className="py-3 px-3">Stock Unit</th>
                            <th className="py-3 px-3">Available Quantity</th>
                            <th className="py-3 px-3">Low Threshold</th>
                            <th className="py-3 px-3">Status</th>
                            <th className="py-3 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {medicines.map((med) => (
                            <tr key={med.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                              <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{med.name}</td>
                              <td className="py-3 px-3 text-slate-600 dark:text-slate-300 capitalize">{med.stock_unit}</td>
                              <td className="py-3 px-3 font-bold">
                                {med.available_quantity === null || med.available_quantity === undefined ? (
                                  <span className="text-slate-400 font-normal">-- (Unset)</span>
                                ) : (
                                  <span className={med.available_quantity === 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}>
                                    {med.available_quantity} {med.stock_unit}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{med.low_stock_threshold} {med.stock_unit}</td>
                              <td className="py-3 px-3">{renderStockStatusBadge(getMedicineStockStatus(med))}</td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setHistoryMedicine(med);
                                    setHistoryModalOpen(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold cursor-pointer"
                                >
                                  Movement History
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  const renderSettingsModule = () => {
    const settingsNavItems = [
      { name: "Clinic", icon: Building2 },
      { name: "Doctors", icon: Stethoscope },
      { name: "Staff", icon: Users },
      ...(isOwner ? [{ name: "Stock / Medicine", icon: Pill }] : []),
      { name: "Backup", icon: Database },
    ];
    const settingsTabs = settingsNavItems.map(i => i.name);
    const currentTab = settingsTabs.includes(activeSubTab) ? activeSubTab : "Clinic";

    // Helper handlers for Doctor Add/Edit/Delete
    const handleOpenAddDoctor = () => {
      setEditingDoctor(null);
      setDocFormName("");
      setDocFormSpeciality("General Dentist");
      setDocFormPhone("+91 ");
      setDocFormStatus("Available");
      setDoctorModalOpen(true);
    };

    const handleOpenEditDoctor = (doc: Doctor) => {
      setEditingDoctor(doc);
      setDocFormName(doc.name);
      setDocFormSpeciality(doc.speciality);
      setDocFormPhone(formatPhoneInput(doc.phone || ""));
      setDocFormStatus(doc.status);
      setDoctorModalOpen(true);
    };

    const handleSaveClinicSettings = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!clinicName.trim()) {
        showToast("Please enter a clinic name.", "error");
        return;
      }
      if (!receptionistUser.trim()) {
        showToast("Please enter a receptionist user name.", "error");
        return;
      }
      if (!clinicAddress.trim()) {
        showToast("Please enter a clinic address.", "error");
        return;
      }

      try {
        const settingsObj = {
          clinicName: clinicName.trim(),
          receptionistUser: receptionistUser.trim(),
          clinicAddress: clinicAddress.trim()
        };
        localStorage.setItem("clinic_settings", JSON.stringify(settingsObj));
        showToast("Clinic configurations saved.", "success");
      } catch (err) {
        showToast("Failed to save clinic configurations.", "error");
      }
    };

    const handleSaveDoctor = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!docFormName.trim()) return;
      if (docFormPhone && !validate10DigitPhone(docFormPhone)) {
        showToast("Doctor phone number must contain exactly 10 digits after +91.", "error");
        return;
      }

      const formattedName = docFormName.startsWith("Dr.") ? docFormName.trim() : `Dr. ${docFormName.trim()}`;

      if (editingDoctor) {
        let updateId = editingDoctor.id;
        if (!updateId) {
          const match = doctors.find(d => d.name === editingDoctor.name);
          if (match) updateId = match.id;
        }

        let query = supabase.from("doctors").update({
          name: formattedName,
          specialty: docFormSpeciality,
          phone: docFormPhone.trim() || "+91 98765 43210",
          status: docFormStatus
        });

        if (updateId) {
          query = query.eq("id", updateId);
        } else {
          query = query.eq("name", editingDoctor.name);
        }

        const { data, error } = await query.select().maybeSingle();
        if (error) {
          console.error("Failed to update doctor in database:", error.message);
          showToast(error.message || "Failed to update doctor details in database.", "error");
          return;
        }

        setDoctors(prev =>
          prev.map(d =>
            (updateId && d.id === updateId) || d.name === editingDoctor.name
              ? {
                  id: data?.id || d.id,
                  name: data?.name || formattedName,
                  speciality: data?.specialty || docFormSpeciality,
                  phone: data?.phone || docFormPhone.trim(),
                  status: data?.status || docFormStatus
                }
              : d
          )
        );
        showToast("Doctor details updated successfully.", "success");
      } else {
        const { data, error } = await supabase
          .from("doctors")
          .insert({
            name: formattedName,
            specialty: docFormSpeciality,
            phone: docFormPhone.trim() || "+91 98765 43210",
            status: docFormStatus
          })
          .select()
          .maybeSingle();

        if (error || !data) {
          console.error("Failed to register doctor in database:", error?.message);
          showToast(error?.message || "Failed to register doctor in database.", "error");
          return;
        }

        const newDoc: Doctor = {
          id: data.id,
          name: data.name,
          speciality: data.specialty || docFormSpeciality,
          phone: data.phone || "+91 98765 43210",
          status: data.status || docFormStatus
        };
        setDoctors(prev => [...prev, newDoc]);
        showToast("New doctor registered successfully.", "success");
      }
      setDoctorModalOpen(false);
    };

    const handleDeleteDoctor = async () => {
      if (!deleteDoctorConfirm) return;

      let deleteId = deleteDoctorConfirm.id;
      if (!deleteId) {
        const match = doctors.find(d => d.name === deleteDoctorConfirm.name);
        if (match) deleteId = match.id;
      }

      let query = supabase.from("doctors").delete();
      if (deleteId) {
        query = query.eq("id", deleteId);
      } else {
        query = query.eq("name", deleteDoctorConfirm.name);
      }

      const { error } = await query;
      if (error) {
        console.error("Failed to delete doctor from database:", error.message);
        if (error.code === "23503") {
          showToast(`Cannot delete ${deleteDoctorConfirm.name} because active appointments or clinical records exist.`, "error");
        } else {
          showToast(error.message || "Failed to remove doctor from database.", "error");
        }
        setDeleteDoctorConfirm(null);
        return;
      }

      setDoctors(prev => prev.filter(d => (deleteId ? d.id !== deleteId : d.name !== deleteDoctorConfirm.name)));
      showToast(`${deleteDoctorConfirm.name} removed from clinic records.`, "success");
      setDeleteDoctorConfirm(null);
    };

    // Helper handlers for Staff Add/Edit/Delete
    const handleOpenAddStaff = () => {
      setEditingStaff(null);
      setStaffFormName("");
      setStaffFormEmail("");
      setStaffFormRole("Desk Operations");
      setStaffFormPhone("+91 ");
      setStaffFormStatus("Active");
      setStaffModalOpen(true);
    };

    const handleOpenEditStaff = (st: Staff) => {
      setEditingStaff(st);
      setStaffFormName(st.name);
      setStaffFormEmail("");
      setStaffFormRole(st.role);
      setStaffFormPhone(formatPhoneInput(st.phone || ""));
      setStaffFormStatus(st.status);
      setStaffModalOpen(true);
    };

    const handleSaveStaff = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!staffFormName.trim()) {
        showToast("Please enter staff full name.", "error");
        return;
      }
      if (staffFormPhone && !validate10DigitPhone(staffFormPhone)) {
        showToast("Staff phone number must contain exactly 10 digits after +91.", "error");
        return;
      }

      if (editingStaff) {
        if (userRole !== "owner") {
          showToast("Only clinic owners can edit staff profiles.", "error");
          return;
        }

        if (editingStaff.id && !editingStaff.id.startsWith("st-")) {
          const { error } = await supabase
            .from("profiles")
            .update({
              full_name: staffFormName.trim(),
              custom_title: staffFormRole.trim(),
              phone: staffFormPhone.trim(),
              status: staffFormStatus
            })
            .eq("id", editingStaff.id);

          if (error) {
            console.error("Failed to update staff profile in database:", error.message);
            showToast(error.message || "Failed to update staff member in database.", "error");
            return;
          }
        }

        setStaffList(prev =>
          prev.map(s =>
            s.id === editingStaff.id
              ? { ...s, name: staffFormName.trim(), role: staffFormRole.trim(), phone: staffFormPhone.trim(), status: staffFormStatus }
              : s
          )
        );
        showToast("Staff member updated successfully.", "success");
      } else {
        const cleanName = staffFormName.trim();
        const cleanEmail = staffFormEmail.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!cleanEmail || !emailRegex.test(cleanEmail)) {
          showToast("Please enter a valid email address.", "error");
          return;
        }

        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
          const staffEndpoint = `${supabaseUrl}/functions/v1/staff`;

          const { data: { session } } = await supabase.auth.getSession();
          const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
          if (session?.access_token) {
            authHeaders["Authorization"] = `Bearer ${session.access_token}`;
          }

          const res = await fetch(staffEndpoint, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({
              email: cleanEmail,
              fullName: cleanName,
              role: "receptionist",
              customTitle: staffFormRole.trim(),
              phone: staffFormPhone.trim(),
              status: staffFormStatus
            })
          });

          const resData = await res.json();
          if (!res.ok) {
            showToast(resData.error || "Failed to persist staff record.", "error");
            return;
          } else {
            const newStaff: Staff = {
              id: resData.profile?.id || `st-${Date.now()}`,
              name: cleanName,
              role: staffFormRole.trim(),
              phone: staffFormPhone.trim() || "+91 98765 00000",
              status: staffFormStatus
            };
            setStaffList(prev => [...prev, newStaff]);
            setCreatedCredentials({
              name: cleanName,
              email: cleanEmail,
              pass: resData.temporaryPassword
            });
            showToast("Staff account created successfully!", "success");
          }
        } catch (err: any) {
          showToast("Error connecting to staff persistence API.", "error");
          return;
        }
      }
      setStaffModalOpen(false);
    };

    const handleDeleteStaff = async () => {
      if (!deleteStaffConfirm) return;

      if (userRole !== "owner") {
        showToast("Only clinic owners can delete staff accounts.", "error");
        setDeleteStaffConfirm(null);
        return;
      }

      if (deleteStaffConfirm.id && !deleteStaffConfirm.id.startsWith("st-")) {
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
          const staffEndpoint = `${supabaseUrl}/functions/v1/staff?id=${encodeURIComponent(deleteStaffConfirm.id)}`;

          const { data: { session } } = await supabase.auth.getSession();
          const authHeaders: Record<string, string> = {};
          if (session?.access_token) {
            authHeaders["Authorization"] = `Bearer ${session.access_token}`;
          }

          const res = await fetch(staffEndpoint, {
            method: "DELETE",
            headers: authHeaders
          });

          const resData = await res.json();
          if (!res.ok) {
            showToast(resData.error || "Failed to remove staff account.", "error");
            setDeleteStaffConfirm(null);
            return;
          }

          setStaffList(prev => prev.filter(s => s.id !== deleteStaffConfirm.id));
          showToast(`${deleteStaffConfirm.name} removed from staff records.`, "success");
        } catch (err: any) {
          showToast("Error connecting to staff deletion API.", "error");
        }
      } else {
        setStaffList(prev => prev.filter(s => s.id !== deleteStaffConfirm.id));
        showToast(`${deleteStaffConfirm.name} removed from staff records.`, "success");
      }
      setDeleteStaffConfirm(null);
    };

    // Backup Action
    const handleBackupNow = async () => {
      if (isBackingUp) return;
      setIsBackingUp(true);

      try {
        const supabase = createClient();
        const { data, error } = await supabase.functions.invoke("backup", {
          body: {},
        });

        if (error || !data?.success) {
          showToast("Unable to start backup. Please try again.", "error");
        } else {
          showToast("Backup started successfully.", "success");
          await fetchBackupHistory();
        }
      } catch (_err) {
        showToast("Unable to start backup. Please try again.", "error");
      } finally {
        setIsBackingUp(false);
      }
    };

    return (
      <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto text-slate-800 dark:text-slate-200">
        {/* NO DUPLICATE SETTINGS HEADING - Begins directly with Settings Container Box */}
        <div className="bg-white dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[560px] overflow-hidden">

          {/* DESKTOP LEFT NAVIGATION COLUMN (hidden on mobile, visible md+) */}
          <div className="hidden md:block md:col-span-3 lg:col-span-3 border-r border-slate-100 dark:border-slate-800/80 p-4 space-y-1.5 bg-slate-50/30 dark:bg-slate-950/20">
            {settingsNavItems.map(({ name, icon: Icon }) => {
              const isActive = currentTab === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setActiveSubTab(name)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-[14px] transition-all duration-150 cursor-pointer flex items-center gap-2.5 ${
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-955/50 dark:text-blue-400 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white font-medium"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                  <span>{name}</span>
                </button>
              );
            })}
          </div>

          {/* MOBILE BLOCK CARDS NAVIGATION (visible on mobile, hidden md+) */}
          <div className="block md:hidden border-b border-slate-100 dark:border-slate-800/80 p-3 bg-slate-50/40 dark:bg-slate-950/30">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {settingsNavItems.map(({ name, icon: Icon }) => {
                const isActive = currentTab === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setActiveSubTab(name)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-blue-50/90 border-blue-200 text-blue-600 dark:bg-blue-955/60 dark:border-blue-800 dark:text-blue-400 font-bold shadow-xs"
                        : "bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 font-semibold"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-1 shrink-0 ${
                      isActive
                        ? "bg-blue-600 text-white dark:bg-blue-500"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] leading-tight truncate w-full">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Settings Content Column */}
          <div className="md:col-span-9 lg:col-span-9 p-6 sm:p-8 space-y-6">

            {/* 1. CLINIC */}
            {currentTab === "Clinic" && (
              <div className="space-y-6 max-w-xl">
                <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">Clinic Profile Settings</h2>

                <form onSubmit={handleSaveClinicSettings} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Clinic Name</Label>
                      <Input
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        className="h-10 rounded-xl border-slate-200 dark:border-slate-800 text-[14px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Receptionist User</Label>
                      <Input
                        value={receptionistUser}
                        onChange={(e) => setReceptionistUser(e.target.value)}
                        className="h-10 rounded-xl border-slate-200 dark:border-slate-800 text-[14px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Address</Label>
                    <Input
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      className="h-10 rounded-xl border-slate-200 dark:border-slate-800 text-[14px]"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-5 rounded-xl text-xs cursor-pointer shadow-xs"
                    >
                      Save Settings
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. DOCTORS */}
            {currentTab === "Doctors" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div>
                    <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">Doctors</h2>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Manage practitioner profiles, specialties, and active statuses.</p>
                  </div>
                  <Button
                    onClick={handleOpenAddDoctor}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold h-10 px-4 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus className="h-4 w-4" /> Add Doctor
                  </Button>
                </div>

                <div className="space-y-3">
                  {doctors.map(doc => (
                    <div key={doc.id || doc.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-sm flex items-center justify-center shrink-0">
                          {doc.name.replace("Dr. ", "")[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-slate-900 dark:text-white">{doc.name}</span>
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 rounded-full font-medium text-[11px]">
                              {doc.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                            <span>Specialty: <strong className="font-medium text-slate-700 dark:text-slate-300">{doc.speciality}</strong></span>
                            <span>Phone: <strong className="font-medium text-slate-700 dark:text-slate-300">{doc.phone || "+91 98765 43210"}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          variant="outline"
                          onClick={() => handleOpenEditDoctor(doc)}
                          className="h-8 px-3 text-[12px] font-medium rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setDeleteDoctorConfirm(doc)}
                          className="h-8 px-3 text-[12px] font-medium rounded-lg border-slate-200 dark:border-slate-700 text-red-600 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-955/30 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-600" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. STAFF */}
            {currentTab === "Staff" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div>
                    <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">Staff</h2>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Manage clinic nurses, hygienists, desk operations, and support staff.</p>
                  </div>
                  <Button
                    onClick={handleOpenAddStaff}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold h-10 px-4 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus className="h-4 w-4" /> Add Staff
                  </Button>
                </div>

                <div className="space-y-3">
                  {staffList.map(st => (
                    <div key={st.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center justify-center shrink-0">
                          {st.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-slate-900 dark:text-white">{st.name}</span>
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full font-medium text-[11px]">
                              {st.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                            <span>Role: <strong className="font-medium text-slate-700 dark:text-slate-300">{st.role}</strong></span>
                            <span>Phone: <strong className="font-medium text-slate-700 dark:text-slate-300">{st.phone}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          variant="outline"
                          onClick={() => handleOpenEditStaff(st)}
                          className="h-8 px-3 text-[12px] font-medium rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setDeleteStaffConfirm(st)}
                          className="h-8 px-3 text-[12px] font-medium rounded-lg border-slate-200 dark:border-slate-700 text-red-600 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-955/30 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-600" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. BACKUP */}
            {currentTab === "Backup" && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">Backup</h2>
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 rounded-full font-medium text-[11px]">
                        Up to date
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Protect your clinic data with secure backups and restore options.</p>
                  </div>

                  {/* Primary Action Button */}
                  <Button
                    onClick={handleBackupNow}
                    disabled={isBackingUp}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold h-10 px-5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBackingUp ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Starting Backup...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4" /> Backup Now
                      </>
                    )}
                  </Button>
                </div>

                {/* Backup Information Stats */}
                {(() => {
                  const latestBackup = backupHistory[0];
                  const latestStatusLower = latestBackup?.status?.toLowerCase() || "";

                  let displayLastBackup = "--";
                  let displayBackupSize = "--";
                  let displayBackupStatus = "--";
                  let statusTextColor = "text-slate-900 dark:text-white";

                  if (latestBackup) {
                    displayLastBackup = latestBackup.date;

                    if (latestStatusLower === "triggered") {
                      displayBackupStatus = "Triggered";
                      displayBackupSize = "--";
                      statusTextColor = "text-amber-600 dark:text-amber-400";
                    } else if (latestStatusLower === "completed") {
                      displayBackupStatus = "Encrypted";
                      displayBackupSize = latestBackup.size || "--";
                      statusTextColor = "text-emerald-600 dark:text-emerald-400";
                    } else if (latestStatusLower === "failed") {
                      displayBackupStatus = "Failed";
                      displayBackupSize = "--";
                      statusTextColor = "text-rose-600 dark:text-rose-400";
                    } else {
                      displayBackupStatus = latestBackup.status;
                      displayBackupSize = latestBackup.size || "--";
                    }
                  }

                  return (
                    <div className="space-y-2">
                      <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Backup Information</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block">Last Backup</span>
                          <span className="text-[14px] font-semibold text-slate-900 dark:text-white block mt-1">{displayLastBackup}</span>
                        </div>
                        <div className="p-3.5 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block">Backup Size</span>
                          <span className="text-[14px] font-semibold text-slate-900 dark:text-white block mt-1">{displayBackupSize}</span>
                        </div>
                        <div className="p-3.5 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block">Backup Status</span>
                          <span className={`text-[14px] font-semibold block mt-1 ${statusTextColor}`}>{displayBackupStatus}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Backup History Table */}
                <div className="space-y-3 pt-2">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Backup History</span>
                  <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-x-auto scrollbar-thin">
                    <table className="w-full min-w-[620px] text-left text-[13px]">
                      <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-medium">
                        <tr>
                          <th className="py-2.5 px-4 whitespace-nowrap min-w-[180px]">Date & Time</th>
                          <th className="py-2.5 px-4 whitespace-nowrap min-w-[110px]">Backup Size</th>
                          <th className="py-2.5 px-4 whitespace-nowrap min-w-[110px]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {backupHistory.map(item => {
                          const statusLower = item.status?.toLowerCase() || "";
                          const badgeStyle =
                            statusLower === "triggered"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/40"
                              : statusLower === "failed"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-100 dark:border-rose-900/40"
                              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40";

                          return (
                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                              <td className="py-3 px-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                {item.date} • {item.time}
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{item.size}</td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className={`px-2.5 py-0.5 border rounded-full text-[11px] font-medium inline-block ${badgeStyle}`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* 5. STOCK / MEDICINE INVENTORY (Owner Only) */}
            {currentTab === "Stock / Medicine" && isOwner && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">Medicine Stock Management</h2>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Configure stock units, thresholds, incoming inventory shipments and adjustments.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleOpenAddMedicine}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-9 px-4 rounded-xl text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  >
                    <Plus className="h-4 w-4" /> Add Medicine
                  </Button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto scrollbar-none">
                    {(["All", "In Stock", "Low Stock", "Not Configured"] as const).map(st => {
                      const isActive = stockStatusFilter === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStockStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                            isActive
                              ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search medicine name..."
                      value={stockSearchQuery}
                      onChange={e => setStockSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs rounded-xl"
                    />
                  </div>
                </div>

                {/* Inventory Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Medicine Name</th>
                        <th className="py-3 px-4">Stock Unit</th>
                        <th className="py-3 px-4">Available Qty</th>
                        <th className="py-3 px-4">Low-Stock Threshold</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-800 dark:text-slate-200">
                      {(() => {
                        const filtered = medicines.filter(m => {
                          const matchesSearch = m.name.toLowerCase().includes(stockSearchQuery.toLowerCase());
                          const status = getMedicineStockStatus(m);
                          if (!matchesSearch) return false;
                          if (stockStatusFilter === "In Stock") return status === "in_stock";
                          if (stockStatusFilter === "Low Stock") return status === "low_stock";
                          if (stockStatusFilter === "Not Configured") return status === "not_configured";
                          return true;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400">
                                No medicines found matching criteria.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map(m => {
                          const status = getMedicineStockStatus(m);
                          return (
                            <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                              <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                                {m.name}
                                {!m.is_active && <span className="ml-2 text-[10px] text-red-500 font-normal">(Inactive)</span>}
                              </td>
                              <td className="py-3 px-4 capitalize">{m.stock_unit}</td>
                              <td className="py-3 px-4 font-mono font-bold">
                                {m.available_quantity !== null && m.available_quantity !== undefined ? `${m.available_quantity} ${m.stock_unit}` : <span className="text-slate-400 font-normal">--</span>}
                              </td>
                              <td className="py-3 px-4 font-mono">{m.low_stock_threshold} {m.stock_unit}</td>
                              <td className="py-3 px-4">{renderStockStatusBadge(status)}</td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAddStock(m)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                                    title="Add Stock"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAdjustStock(m)}
                                    className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                                    title="Stock Adjustment"
                                  >
                                    <SlidersHorizontal className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditMedicine(m)}
                                    className="p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Medicine Details"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenMedicineHistory(m)}
                                    className="p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                    title="View Stock History"
                                  >
                                    <Clock className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* --- DOCTOR ADD/EDIT MODAL --- */}
        {doctorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 animate-scaleIn">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">
                  {editingDoctor ? "Edit Doctor Information" : "Add New Doctor"}
                </h3>
                <button onClick={() => setDoctorModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDoctor} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Doctor Name</Label>
                  <Input
                    required
                    placeholder="e.g. Dr. Ramesh Kumar"
                    value={docFormName}
                    onChange={(e) => setDocFormName(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Specialty</Label>
                  <select
                    value={docFormSpeciality}
                    onChange={(e) => setDocFormSpeciality(e.target.value)}
                    className="w-full h-10 px-3 text-[13px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="General Dentist">General Dentist</option>
                    <option value="Endodontist">Endodontist</option>
                    <option value="Orthodontist">Orthodontist</option>
                    <option value="Periodontist">Periodontist</option>
                    <option value="Pedodontist">Pedodontist</option>
                    <option value="Prosthodontist">Prosthodontist</option>
                    <option value="Oral Surgeon">Oral Surgeon</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Contact Number</Label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={docFormPhone}
                    onChange={(e) => setDocFormPhone(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Status</Label>
                  <select
                    value={docFormStatus}
                    onChange={(e) => setDocFormStatus(e.target.value as any)}
                    className="w-full h-10 px-3 text-[13px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="Available">Available</option>
                    <option value="In Consultation">In Consultation</option>
                    <option value="On Break">On Break</option>
                    <option value="Finished Today">Finished Today</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDoctorModalOpen(false)} className="h-10 px-4 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-5 text-xs">
                    {editingDoctor ? "Save Changes" : "Add Doctor"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- DOCTOR DELETE CONFIRMATION MODAL --- */}
        {deleteDoctorConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 text-center animate-scaleIn">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-955/50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Remove Doctor?</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to remove <strong className="font-semibold text-slate-900 dark:text-white">{deleteDoctorConfirm.name}</strong> from clinic records?
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDeleteDoctorConfirm(null)} className="h-10 px-4 text-xs">
                  Cancel
                </Button>
                <Button type="button" onClick={handleDeleteDoctor} className="bg-red-600 hover:bg-red-500 text-white font-bold h-10 px-5 text-xs">
                  Remove Doctor
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- STAFF ADD/EDIT MODAL --- */}
        {staffModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 animate-scaleIn">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">
                  {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
                </h3>
                <button onClick={() => setStaffModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStaff} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Full Name</Label>
                  <Input
                    required
                    placeholder="e.g. Sneha Rao"
                    value={staffFormName}
                    onChange={(e) => setStaffFormName(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>

                {!editingStaff && (
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium">Email Address</Label>
                    <Input
                      type="email"
                      required
                      placeholder="e.g. sneha@clinic.com"
                      value={staffFormEmail}
                      onChange={(e) => setStaffFormEmail(e.target.value)}
                      className="h-10 text-[13px]"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Role</Label>
                  <Input
                    required
                    placeholder="e.g. Senior Nurse / Desk Operations"
                    value={staffFormRole}
                    onChange={(e) => setStaffFormRole(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Contact Number</Label>
                  <Input
                    placeholder="+91 98765 11223"
                    value={staffFormPhone}
                    onChange={(e) => setStaffFormPhone(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Status</Label>
                  <select
                    value={staffFormStatus}
                    onChange={(e) => setStaffFormStatus(e.target.value as any)}
                    className="w-full h-10 px-3 text-[13px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStaffModalOpen(false)} className="h-10 px-4 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-5 text-xs">
                    {editingStaff ? "Save Changes" : "Add Staff"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- CREATED STAFF CREDENTIALS MODAL --- */}
        {createdCredentials && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 animate-scaleIn">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">
                    Staff Account Created
                  </h3>
                </div>
                <button onClick={() => setCreatedCredentials(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3 text-xs text-amber-800 dark:text-amber-300">
                <strong>Important:</strong> This temporary password is shown only once. Please copy or share these credentials securely with the staff member.
              </div>

              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5 font-medium">Staff Name:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{createdCredentials.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5 font-medium">Login Email:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 text-sm">{createdCredentials.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5 font-medium">Temporary Password:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{createdCredentials.pass}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    const textToCopy = `Login Email: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.pass}`;
                    navigator.clipboard.writeText(textToCopy);
                    showToast("Credentials copied to clipboard!", "success");
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-4 text-xs flex items-center gap-1.5"
                >
                  <Copy className="h-4 w-4" /> Copy Credentials
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreatedCredentials(null)}
                  className="h-10 px-4 text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- STAFF DELETE CONFIRMATION MODAL --- */}
        {deleteStaffConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 text-center animate-scaleIn">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-955/50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Remove Staff Member?</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to remove <strong className="font-semibold text-slate-900 dark:text-white">{deleteStaffConfirm.name}</strong> from staff records?
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDeleteStaffConfirm(null)} className="h-10 px-4 text-xs">
                  Cancel
                </Button>
                <Button type="button" onClick={handleDeleteStaff} className="bg-red-600 hover:bg-red-500 text-white font-bold h-10 px-5 text-xs">
                  Remove Staff
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  // Active Consultation Workspace page
  const renderActiveConsultationWorkspace = () => {
    const appt = appointments.find(a => a.id === activeConsultationApptId);
    if (!appt) return null;

    const patientItem = patients.find(p => p.id === appt.patientId);
    if (!patientItem) return null;

    return (
      <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {patientItem.name[0]}
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block">ACTIVE CONSULTATION WORKSPACE</span>
              <span className="text-base font-bold text-slate-900 dark:text-white block mt-0.5">{patientItem.name} ({appt.treatment})</span>
            </div>
          </div>
          <button
            onClick={() => setActiveConsultationApptId(null)}
            className="text-xs font-bold text-slate-500 hover:underline"
          >
            Cancel Consult
          </button>
        </div>

        {/*Penicillin Warning alert */}
        {patientItem.medicalNotes && patientItem.medicalNotes.toLowerCase().includes("penicillin") && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-xs text-red-800 font-semibold animate-pulse">
            <Shield className="h-5 w-5 text-red-650 shrink-0" />
            <div>
              <span className="font-extrabold block uppercase text-[10px]">CRITICAL ALLERGY ALERT</span>
              <p className="mt-1">This patient is allergic to penicillin derivatives. Avoid prescribing Amoxicillin or surgical antibiotics.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleCompleteConsultation} className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {/* Clinical logs fields */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 text-xs font-semibold">
              <span className="font-bold text-sm block">Treatment Diagnosis Notes</span>

              <div className="space-y-1.5">
                <Label>Clinical Notes</Label>
                <textarea
                  className="w-full min-h-24 border rounded-xl bg-transparent p-3 outline-none focus:border-blue-500"
                  placeholder="Describe treatment observations, tooth decay levels, fillings, crown placements..."
                  value={consultNotes}
                  onChange={e => setConsultNotes(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Prescribe Medication</Label>
                <textarea
                  className="w-full min-h-16 border rounded-xl bg-transparent p-3 outline-none focus:border-blue-500"
                  placeholder="e.g. Paracetamol 650mg - 2 times daily for 3 days"
                  value={consultPrescription}
                  onChange={e => setConsultPrescription(e.target.value)}
                />
              </div>
            </div>

            {/* Simulated X-Ray and files uploads */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs font-semibold space-y-3">
              <span className="font-bold text-sm block">Diagnostic File Uploads</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const newXray = { name: `xray_scan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.png`, size: "2.4 MB", type: "image/png" };
                    setConsultUploadedXrays(prev => [...prev, newXray]);
                    alert("Mock X-Ray scanner triggered and image attached.");
                  }}
                  className="flex-1 p-4 rounded-xl border border-dashed hover:bg-slate-50 flex flex-col items-center justify-center text-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="h-6 w-6 text-amber-500" />
                  <span>Attach X-Ray Scan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newFile = { name: `intraoral_photo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.png`, size: "1.8 MB", type: "image/png" };
                    setConsultUploadedXrays(prev => [...prev, newFile]);
                    alert("Intraoral camera snapshot captured and attached.");
                  }}
                  className="flex-1 p-4 rounded-xl border border-dashed hover:bg-slate-50 flex flex-col items-center justify-center text-center gap-1.5 transition-colors"
                >
                  <FileText className="h-6 w-6 text-blue-500" />
                  <span>Intraoral Photo</span>
                </button>
              </div>

              {consultUploadedXrays.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 block">ATTACHMENTS PENDING FILE SAVE</span>
                  {consultUploadedXrays.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg text-[10px]">
                      <span>{file.name} ({file.size})</span>
                      <button type="button" onClick={() => setConsultUploadedXrays(prev => prev.filter((_, i) => i !== idx))} className="text-red-500">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Tooth Grid panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs font-semibold space-y-4">
              <span className="font-bold text-sm block">Tooth Diagnostic Map</span>
              <p className="text-slate-405 text-[10px]">Select a tooth outline to log override overrides:</p>

              <Odontogram
                chartData={consultChart}
                selectedTooth={consultSelectedTooth}
                onSelectTooth={(toothNum) => setConsultSelectedTooth(toothNum)}
              />

              {consultSelectedTooth !== null && (
                <div className="p-3 border rounded-xl bg-slate-50/50 space-y-2">
                  <span className="font-bold text-[10px] block">Override Tooth #{consultSelectedTooth} status:</span>
                  <select
                    className="w-full h-8 border rounded-lg bg-white px-2 focus:outline-none text-[11px]"
                    value={consultToothStatus}
                    onChange={e => setConsultToothStatus(e.target.value)}
                  >
                    <option value="Decayed">Decayed</option>
                    <option value="Filling Needed">Filling Needed</option>
                    <option value="Missing">Missing</option>
                    <option value="Healthy">Healthy</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setConsultChart(prev => ({ ...prev, [consultSelectedTooth]: consultToothStatus }));
                      setConsultSelectedTooth(null);
                    }}
                    className="w-full h-7 rounded-lg bg-blue-600 text-white font-bold text-[10px] mt-1"
                  >
                    Apply Tooth Status
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <span className="font-bold text-xs text-slate-400 uppercase tracking-wider block">Procedure Cost Summary</span>
              <div className="text-xs font-semibold space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span>Base treatment:</span>
                  <span>{appt.treatment}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Meds subtotal:</span>
                  <span>₹{consultPrescription ? "800" : "0"}</span>
                </div>
                <div className="flex justify-between font-black text-sm">
                  <span>Subtotal:</span>
                  <span>₹{consultPrescription ? "800" : "0"}</span>
                </div>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 rounded-xl mt-3 flex items-center justify-center gap-1.5 shadow-md">
                <Check className="h-4 w-4" /> Complete Treatment
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  };

  // Helper search matching
  const getFilteredSearchResults = () => {
    if (!globalSearchQuery) return null;
    const q = globalSearchQuery.toLowerCase();

    return {
      patients: patients.filter(p => p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.id.toLowerCase().includes(q)),
      appointments: appointments.filter(a => a.patientName.toLowerCase().includes(q) || a.treatment.toLowerCase().includes(q)),
      treatments: treatments.filter(t => t.name.toLowerCase().includes(q) || t.patient.toLowerCase().includes(q)),
      invoices: invoices.filter(i => i.id.toLowerCase().includes(q) || i.patientName.toLowerCase().includes(q))
    };
  };

  const searchResults = getFilteredSearchResults();
  const hasSearchResults = searchResults && (
    searchResults.patients.length > 0 ||
    searchResults.appointments.length > 0 ||
    searchResults.treatments.length > 0 ||
    searchResults.invoices.length > 0
  );

  if (loadingSession) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-505 mt-4 dark:text-slate-400 font-medium">
          Loading DentPro OS clinical workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-805 dark:bg-slate-900 dark:text-slate-100 flex font-sans antialiased overflow-hidden">

      {/* 1. Sidebar Left Navigation */}
      <aside
        className={`sticky top-0 left-0 h-screen bg-white dark:bg-slate-955 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col justify-between z-40 shrink-0 overflow-x-hidden transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-[68px]" : "w-[200px]"
        }`}
      >
        <div className={`border-b border-slate-200 dark:border-slate-800 flex items-center shrink-0 transition-all duration-300 ease-in-out h-20 ${
          sidebarCollapsed
            ? "px-0 justify-center py-2"
            : "px-4 py-5 justify-start"
        }`}>
          <DentalLogo
            showText={!sidebarCollapsed}
            collapsed={sidebarCollapsed}
            onLogoClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            onTextClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        <div className="flex flex-col flex-grow overflow-y-auto overflow-x-hidden">
          <nav className={`space-y-2 flex-grow mt-3 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "px-0 py-3" : "p-3"
          }`}>
            {menuItems.filter(item => isReceptionist ? (item.name !== "Reports" && item.name !== "Settings") : true).map((item) => {
              const active = activeTab === item.name && !activeConsultationApptId;
              return (
                <div key={item.name} className="relative flex justify-center">
                  <button
                    onClick={() => selectTab(item.name)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredItem(item.name);
                      setHoveredItemTop(rect.top + rect.height / 2);
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`h-[42px] flex items-center rounded-[10px] text-[14px] transition-all duration-300 ease-in-out group ${
                      active ? "font-semibold bg-blue-600 text-white shadow-sm" : "font-medium text-[#334155] hover:bg-blue-50/50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                    } ${
                      sidebarCollapsed ? "w-11 justify-center px-0 mx-auto" : "w-full justify-between px-3"
                    }`}
                  >
                    <div className={`flex items-center ${sidebarCollapsed ? "justify-center gap-0 w-full" : "gap-2.5"}`}>
                      <div className="relative flex items-center justify-center h-[22px] w-[22px] shrink-0">
                        <span className={active ? "text-white" : "text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-white transition-colors"}>
                          {React.cloneElement(item.icon, { className: "h-[22px] w-[22px]" })}
                        </span>
                        {item.badge && sidebarCollapsed && (
                          <span className="absolute -top-1.5 -right-1.5 text-[10px] font-medium h-4 min-w-4 px-1 rounded-full bg-red-650 text-white border-2 border-white dark:border-slate-955 flex items-center justify-center shadow-xs">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <span className={`transition-all duration-300 ease-in-out whitespace-nowrap text-left ${
                        sidebarCollapsed ? "opacity-0 w-0 scale-90 overflow-hidden pointer-events-none" : "opacity-100 w-auto"
                      }`}>
                        {item.name}
                      </span>
                    </div>

                    {item.badge && !sidebarCollapsed && (
                      <span
                        className={`text-[12px] font-medium px-2 py-0.5 rounded-full transition-all duration-300 ${
                          active ? "bg-white/20 text-white" : "bg-red-100 text-red-600 dark:bg-red-955/40 dark:text-red-400"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        <div className={`border-t border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-955 shrink-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "px-0 py-4 flex flex-col items-center justify-center gap-3" : "p-4"
        }`}>
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <button
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem("profile");
                  setHoveredItemTop(rect.top + rect.height / 2);
                }}
                onMouseLeave={() => setHoveredItem(null)}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0 cursor-pointer mx-auto active:scale-95 transition-transform"
              >
                {(clinicName || "Clinic").split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "DC"}
              </button>

              <button
                onClick={handleLogout}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem("logout");
                  setHoveredItemTop(rect.top + rect.height / 2);
                }}
                onMouseLeave={() => setHoveredItem(null)}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-red-650 hover:bg-red-50 hover:text-red-500 dark:text-red-405 dark:hover:bg-red-955/20 transition-colors mx-auto active:scale-[0.97]"
              >
                <LogOut className="h-[22px] w-[22px]" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                  {(clinicName || "Clinic").split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "DC"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-bold text-slate-900 dark:text-slate-202 truncate">{clinicName}</span>
                  <span className="text-[12px] font-medium text-slate-505 truncate">
                    {currentUserName || (isOwner ? "Owner / Dentist" : "Receptionist")} ({isOwner ? "Owner" : "Receptionist"})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-start border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-655 hover:text-red-500 hover:underline transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto transition-all duration-300 ease-in-out">
        {/* Top Navbar */}
        <header className="h-16 sm:h-20 bg-white dark:bg-slate-955 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 shrink-0 gap-2">

          <div className="flex items-center gap-2 sm:gap-7 flex-grow min-w-0">
            {sidebarCollapsed && (
              <span className="text-[18px] sm:text-[22px] font-bold text-slate-900 dark:text-white shrink-0 hidden md:inline-block">
                {activeTab}
              </span>
            )}
            <div className="flex items-center gap-2 sm:gap-3 flex-grow max-w-[540px] w-full relative min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-1.5 text-slate-500 hover:text-slate-808 dark:text-slate-400 dark:hover:text-white shrink-0 cursor-pointer"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Global Search input */}
              <div className="relative w-full flex items-center">
                <Search className="absolute left-3 sm:left-4 h-4 w-4 sm:h-4.5 sm:w-4.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search patients, appointments..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  className="h-9 sm:h-11 w-full pl-9 sm:pl-[46px] pr-3 rounded-[11px] bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 text-xs sm:text-[14px] font-medium text-slate-808 dark:text-slate-200 outline-none hover:border-slate-350 dark:hover:border-slate-700 focus:bg-white dark:focus:bg-slate-955 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition-all duration-150 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />

                {/* Global search dropdown */}
                {globalSearchQuery && (
                  <div className="absolute top-12 left-0 w-full sm:w-[480px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-100 bg-white shadow-xl dark:bg-slate-955 dark:border-slate-900/60 p-3 z-50 text-xs font-semibold max-h-80 overflow-y-auto">
                  <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <span className="text-[10px] text-slate-405 uppercase">Grouped Search Results</span>
                    <button onClick={() => setGlobalSearchQuery("")} className="text-slate-400 hover:text-slate-600 text-[10px]">Clear</button>
                  </div>

                  {hasSearchResults ? (
                    <div className="space-y-3">
                      {searchResults.patients.length > 0 && (
                        <div>
                          <span className="text-[9px] text-blue-500 font-bold uppercase block mb-1">Patients</span>
                          {searchResults.patients.map(p => (
                            <button
                              key={p.id}
                              onClick={() => { setSelectedPatientId(p.id); setActiveTab("Patients"); setGlobalSearchQuery(""); }}
                              className="w-full text-left py-1 hover:bg-slate-50 px-2 rounded block"
                            >
                              {p.name} ({p.id}) • {p.phone}
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.appointments.length > 0 && (
                        <div>
                          <span className="text-[9px] text-cyan-500 font-bold uppercase block mb-1">Appointments</span>
                          {searchResults.appointments.map(a => (
                            <button
                              key={a.id}
                              onClick={() => { setActiveTab("Appointments"); setActiveSubTab("Today"); setGlobalSearchQuery(""); }}
                              className="w-full text-left py-1 hover:bg-slate-50 px-2 rounded block"
                            >
                              {a.patientName} • {a.treatment} ({a.status})
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.treatments.length > 0 && (
                        <div>
                          <span className="text-[9px] text-purple-500 font-bold uppercase block mb-1">Treatments</span>
                          {searchResults.treatments.map(t => (
                            <button
                              key={t.id}
                              onClick={() => { setActiveTab("Treatments"); setActiveSubTab("Active Treatments"); setGlobalSearchQuery(""); }}
                              className="w-full text-left py-1 hover:bg-slate-50 px-2 rounded block"
                            >
                              {t.name} for {t.patient} ({t.stage})
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.invoices.length > 0 && (
                        <div>
                          <span className="text-[9px] text-red-500 font-bold uppercase block mb-1">Invoices</span>
                          {searchResults.invoices.map(i => (
                            <button
                              key={i.id}
                              onClick={() => { setLastGeneratedReceipt(i); setGlobalSearchQuery(""); }}
                              className="w-full text-left py-1 hover:bg-slate-50 px-2 rounded block"
                            >
                              {i.id} • {i.patientName} • {i.total.toLocaleString()} ({i.status})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400 py-4 text-center">No matching records found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

          <div className="flex items-center gap-1.5 sm:gap-3.5 shrink-0">
            {/* + Quick Add Dropdown */}
            <div ref={quickAddRef} className="relative">
              <button
                onClick={() => setQuickAddOpen(!quickAddOpen)}
                className="h-8 sm:h-9 flex items-center gap-1 px-2.5 sm:px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Quick Add</span>
                <span className="sm:hidden">Add</span>
              </button>

              <div className={`absolute right-0 mt-2 w-52 sm:w-60 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-xl dark:bg-slate-955 dark:border-slate-800 p-1.5 z-50 text-[13px] sm:text-[14px] font-semibold text-left transition-all duration-200 origin-top-right transform ${
                quickAddOpen
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              }`}>
                <button
                  onClick={() => { setActiveModal("addPatient"); setQuickAddOpen(false); }}
                  className="w-full h-10 sm:h-11 flex items-center gap-2.5 px-3 rounded-lg text-slate-700 hover:bg-blue-50/50 hover:text-blue-750 dark:text-slate-300 dark:hover:bg-blue-955/20 dark:hover:text-blue-400 transition-all duration-150"
                >
                  <UserPlus className="h-[18px] w-[18px] text-blue-500 shrink-0" />
                  <span className="truncate">New Patient</span>
                </button>
                <button
                  onClick={() => {
                    if (patients.length > 0) {
                      setApptPatientId(patients[0].id);
                    }
                    setActiveModal("addAppointment");
                    setQuickAddOpen(false);
                  }}
                  className="w-full h-10 sm:h-11 flex items-center gap-2.5 px-3 rounded-lg text-slate-700 hover:bg-blue-50/50 hover:text-blue-750 dark:text-slate-300 dark:hover:bg-blue-955/20 dark:hover:text-blue-400 transition-all duration-150"
                >
                  <CalendarDays className="h-[18px] w-[18px] text-cyan-500 shrink-0" />
                  <span className="truncate">New Appointment</span>
                </button>
                <button
                  onClick={() => { selectTab("Billing"); setActiveSubTab("Invoices"); setQuickAddOpen(false); }}
                  className="w-full h-10 sm:h-11 flex items-center gap-2.5 px-3 rounded-lg text-slate-700 hover:bg-blue-50/50 hover:text-blue-750 dark:text-slate-300 dark:hover:bg-blue-955/20 dark:hover:text-blue-400 transition-all duration-150"
                >
                  <FileText className="h-[18px] w-[18px] text-red-500 shrink-0" />
                  <span className="truncate">Invoice List</span>
                </button>
                <button
                  onClick={() => { selectTab("Billing"); setActiveSubTab("Payments"); setQuickAddOpen(false); }}
                  className="w-full h-10 sm:h-11 flex items-center gap-2.5 px-3 rounded-lg text-slate-700 hover:bg-blue-50/50 hover:text-blue-750 dark:text-slate-300 dark:hover:bg-blue-955/20 dark:hover:text-blue-400 transition-all duration-150"
                >
                  <Receipt className="h-[18px] w-[18px] text-emerald-500 shrink-0" />
                  <span className="truncate">Payment Logs</span>
                </button>
              </div>
            </div>

            {/* Clinic Date */}
            <div className="hidden lg:block text-right text-[12px] border-r pr-3.5 border-slate-200 dark:border-slate-800 leading-none">
              <span className="font-semibold text-slate-700 dark:text-slate-300" suppressHydrationWarning>
                {currentHeaderDate}
              </span>
            </div>

            {/* Notifications Alert Dropdown */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 relative cursor-pointer"
              >
                <div className="relative inline-flex items-center justify-center">
                  <Bell className="h-4 w-4" />
                  {notifications?.some(n => n.unread) && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 shrink-0" />
                  )}
                </div>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-xl dark:bg-slate-955 dark:border-slate-800 p-2 z-50 text-xs">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <span className="font-bold">Clinic Notifications</span>
                    <button
                      onClick={async () => {
                        const { error } = await supabase
                          .from("notifications")
                          .update({ is_read: true })
                          .eq("is_read", false);

                        if (error) {
                          console.error("Failed to mark notifications as read:", error);
                          return;
                        }

                        setNotifications(prev =>
                          prev.map(notification => ({
                            ...notification,
                            unread: false,
                            is_read: true
                          }))
                        );
                      }}
                      className="text-[10px] text-blue-605 hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto font-semibold">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-lg flex items-start gap-2.5 text-[11px] transition-colors ${
                          item.unread ? "bg-blue-50/50 dark:bg-blue-955/20" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="h-2 w-2 rounded-full mt-1.5 shrink-0 bg-blue-500" />
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{item.msg}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Inner Sub-tabs Bar (hidden if in active consultation mode) */}
        {!activeConsultationApptId && !selectedPatientId && activeTab !== "Dashboard" && activeTab !== "Treatments" && activeTab !== "Settings" && (
          <div className="bg-white dark:bg-slate-955 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none sticky top-16 sm:top-20 z-20 shrink-0 max-w-full">
            {moduleSubTabs[activeTab]?.map((subTab) => {
              const active = activeSubTab === subTab;
              return (
                <button
                  key={subTab}
                  onClick={() => setActiveSubTab(subTab)}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-blue-50 text-blue-705 dark:bg-blue-955/40 dark:text-blue-400"
                      : "text-slate-505 hover:text-slate-850 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"
                  }`}
                >
                  {subTab}
                </button>
              );
            })}
          </div>
        )}

        {/* Dashboard inner panels switcher */}
        <main className="p-3 sm:p-5 space-y-4 max-w-7xl w-full mx-auto flex-grow min-w-0 overflow-x-hidden">
          {activeConsultationApptId ? (
            renderActiveConsultationWorkspace()
          ) : (
            <>
              {activeTab === "Dashboard" && renderDashboardModule()}
              {activeTab === "Appointments" && renderAppointmentsModule()}
              {activeTab === "Patients" && renderPatientsModule()}
              {activeTab === "Treatments" && renderTreatmentsModule()}
              {activeTab === "Billing" && renderBillingModule()}
              {activeTab === "Reports" && renderReportsModule()}
              {activeTab === "Settings" && renderSettingsModule()}
            </>
          )}
        </main>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="relative w-64 bg-white dark:bg-slate-955 h-full p-4 flex flex-col justify-between shadow-2xl z-10"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <DentalLogo
                    showText={true}
                    onLogoClick={() => {
                      selectTab("Dashboard");
                      setMobileMenuOpen(false);
                    }}
                  />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 hover:bg-slate-100 rounded-md dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {menuItems.filter(item => isReceptionist ? (item.name !== "Reports" && item.name !== "Settings") : true).map((item) => {
                    const active = activeTab === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          selectTab(item.name);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                          active
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-655 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col gap-2.5">
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-red-655 flex items-center gap-2 text-left p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-955/20 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </motion.div>

            <div className="flex-grow" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Global Collapsed Sidebar Tooltip */}
      <AnimatePresence>
        {sidebarCollapsed && hoveredItem && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed bg-slate-900 dark:bg-slate-800 text-white rounded-lg shadow-md whitespace-nowrap p-3 z-55 -translate-y-1/2 text-left pointer-events-none"
            style={{
              left: "88px",
              top: hoveredItemTop,
            }}
          >
            {hoveredItem === "profile" ? (
              <div className="flex flex-col gap-0.5 text-xs font-semibold">
                <span className="font-bold text-[13px] text-white">{clinicName}</span>
                <span className="text-slate-300 font-normal">{currentUserName || (isOwner ? "Owner / Dentist" : "Receptionist")}</span>
                <span className="text-[10px] text-blue-405 font-bold uppercase tracking-wider mt-1 block">{isOwner ? "Owner" : "Receptionist"}</span>
              </div>
            ) : hoveredItem === "logout" ? (
              <span className="text-xs font-semibold px-1 py-0.5 block">Logout</span>
            ) : (
              <span className="text-xs font-semibold px-1 py-0.5 block">{hoveredItem}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DIALOG MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] flex flex-col bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-xs font-semibold"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <span className="font-bold text-base text-slate-900 dark:text-white">
                {activeModal === "addPatient" && "Register New Patient File"}
                {activeModal === "addAppointment" && "Book Clinic Appointment"}
              </span>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-650">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* Register Patient Modal */}
              {activeModal === "addPatient" && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const saved = await registerPatient({
                    name: newPatName,
                    phone: newPatPhone,
                    age: newPatAge,
                    gender: newPatGender,
                    address: newPatAddress,
                    medicalNotes: newPatAllergies
                  });
                  if (saved) {
                    setNewPatName("");
                    setNewPatPhone("+91 ");
                    setNewPatAddress("");
                    setNewPatAllergies("None");
                    setNewPatAge("");
                    setActiveModal(null);
                  }
                }} className="flex flex-col min-h-0 h-full">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-1">
                    <div className="space-y-1.5">
                      <Label htmlFor="newPatName">Patient Full Name</Label>
                      <Input id="newPatName" placeholder="e.g. Aarav Mehta" value={newPatName} onChange={e => setNewPatName(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="newPatPhone">Mobile Number</Label>
                        <Input id="newPatPhone" placeholder="e.g. +91 98112 09230" value={newPatPhone} onChange={e => setNewPatPhone(formatPhoneInput(e.target.value))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="newPatAge">Age</Label>
                        <Input
                          id="newPatAge"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="e.g. 30"
                          value={newPatAge}
                          onChange={e => setNewPatAge(e.target.value.replace(/[^0-9]/g, ""))}
                          onKeyDown={e => { if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault(); }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="newPatGender">Gender</Label>
                        <select id="newPatGender" className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-808 focus:outline-none dark:bg-slate-950 dark:border-slate-800" value={newPatGender} onChange={e => setNewPatGender(e.target.value as "Male" | "Female")}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="newPatAllergies">Medical Warnings</Label>
                        <Input id="newPatAllergies" placeholder="e.g. Penicillin Allergy" value={newPatAllergies} onChange={e => setNewPatAllergies(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="newPatAddress">Address</Label>
                      <Input id="newPatAddress" placeholder="e.g. Indiranagar, Bengaluru" value={newPatAddress} onChange={e => setNewPatAddress(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 shrink-0">
                    <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">Register Patient</Button>
                  </div>
                </form>
              )}

              {/* Book Appointment Modal */}
              {activeModal === "addAppointment" && (
                <form onSubmit={handleGlobalBookAppointment} className="flex flex-col min-h-0 h-full">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-1">
                    <div className="space-y-1.5">
                      <Label htmlFor="apptPatientId">Select Patient</Label>
                      <select
                        id="apptPatientId"
                        className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-808 focus:outline-none dark:bg-slate-955 dark:border-slate-800"
                        value={apptPatientId}
                        onChange={e => setApptPatientId(e.target.value)}
                        required
                      >
                        <option value="">-- Pick Patient Record --</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="apptDoctor">Doctor</Label>
                        <select id="apptDoctor" className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-808 focus:outline-none dark:bg-slate-950 dark:border-slate-800" value={apptDoctor} onChange={e => setApptDoctor(e.target.value)}>
                          {doctors.map(d => (
                            <option key={d.name} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="apptTime">Time Slot</Label>
                        <select
                          id="apptTime"
                          className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-808 focus:outline-none dark:bg-slate-950 dark:border-slate-800"
                          value={apptTime}
                          onChange={e => setApptTime(e.target.value)}
                          required
                        >
                          <option value="">-- Select Time Slot --</option>
                          {TIME_SLOTS.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="apptTreatment">Treatment Category</Label>
                        <select id="apptTreatment" className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-808 focus:outline-none dark:bg-slate-955 dark:border-slate-800" value={apptTreatment} onChange={e => setApptTreatment(e.target.value)}>
                          {ALL_TREATMENTS.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="apptDate">Date</Label>
                        <Input
                          id="apptDate"
                          type="date"
                          value={apptDate}
                          onChange={e => setApptDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="apptNotes">Notes</Label>
                      <Input id="apptNotes" placeholder="e.g. Needs consultation review" value={apptNotes} onChange={e => setApptNotes(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 shrink-0">
                    <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">Book Slot</Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Collect Payment Modal (Discount, Tax, Split billing logs) */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-xs font-semibold"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <span className="font-bold text-base text-slate-900">
                Collect Payment & Apply Discount: Invoice {selectedInvoiceForPayment.id}
              </span>
              <button onClick={() => setSelectedInvoiceForPayment(null)} className="text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCollectPayment} className="p-5 grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-3">
                <span className="font-bold block uppercase text-[10px] text-slate-400">Invoice Items Summary</span>

                {/* Pre-existing base items */}
                <div className="border rounded-xl p-3 bg-slate-50/50 space-y-2">
                  {selectedInvoiceForPayment.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px]">
                      <span>{item.description}</span>
                      <span className="font-bold">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}

                  {payCustomItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] text-blue-605">
                      <span className="flex items-center gap-1">
                        <button type="button" onClick={() => removeCustomBillingItem(idx)} className="text-red-500"><Trash2 className="h-3 w-3" /></button>
                        {item.description}
                      </span>
                      <span className="font-bold">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Add Customized item inside modal */}
                <div className="p-3 border rounded-xl bg-slate-50/10 space-y-2">
                  <span className="font-bold text-[10px] block">Add Custom Item Line</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Item Description" value={newCustomDesc} onChange={e => setNewCustomDesc(e.target.value)} />
                    <Input type="number" placeholder="Cost" value={newCustomAmt || ""} onChange={e => setNewCustomAmt(parseInt(e.target.value) || 0)} />
                  </div>
                  <button type="button" onClick={addCustomBillingItem} className="w-full h-8 rounded-lg border border-dashed border-blue-500 text-blue-600 font-bold cursor-pointer">
                    Add custom item
                  </button>
                </div>
              </div>

              {/* Billing computations & Payment details */}
              <div className="space-y-4">
                <span className="font-bold block uppercase text-[10px] text-slate-400">Total Calculation & Discounts</span>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="space-y-1">
                    <Label>Discount Type</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white dark:bg-slate-905 px-3 py-1 text-xs focus:outline-none dark:border-slate-800 text-slate-808 dark:text-slate-200"
                      value={payDiscountType}
                      onChange={e => setPayDiscountType(e.target.value as "percentage" | "fixed")}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Discount Value</Label>
                    <Input
                      type="number"
                      value={payDiscountValue || ""}
                      onChange={e => setPayDiscountValue(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                </div>

                <div className="p-3 border rounded-xl bg-blue-50/30 dark:bg-slate-900/30 text-xs space-y-1.5 font-bold">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{calculateInvoiceSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Discount:</span>
                    <span>- ₹{calculateInvoiceDiscountAmount().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-1.5 border-t border-slate-200 dark:border-slate-800">
                    <span>Total:</span>
                    <span>₹{calculateInvoiceTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <span>Paid Amount (So Far):</span>
                    <span>₹{selectedInvoiceForPayment.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-blue-650 dark:text-blue-400 font-extrabold">
                    <span>Remaining Balance:</span>
                    <span>₹{Math.max(0, calculateInvoiceTotal() - selectedInvoiceForPayment.paidAmount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-[10px] block uppercase text-slate-400">Payment Collection Details</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label>Amount to Collect (₹)</Label>
                      <Input
                        type="number"
                        value={paymentCollectAmt || ""}
                        max={calculateInvoiceTotal() - selectedInvoiceForPayment.paidAmount}
                        onChange={e => setPaymentCollectAmt(Math.max(0, parseInt(e.target.value) || 0))}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Payment Method</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white dark:bg-slate-905 px-3 py-1 text-xs focus:outline-none dark:border-slate-800 text-slate-808 dark:text-slate-200"
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Credit/Debit Card">Credit/Debit Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 rounded-xl mt-2 flex items-center justify-center gap-1.5 shadow-md cursor-pointer">
                  Collect ₹{paymentCollectAmt.toLocaleString()} ({paymentMethod})
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Receipt Modal (Design printer-friendly print logs) */}
      {lastGeneratedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/50 backdrop-blur-xs p-3 sm:p-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[calc(100dvh-24px)] sm:max-h-[calc(100vh-48px)] flex flex-col bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-xs my-auto"
          >
            {/* Header - Not printed */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0 no-print bg-white dark:bg-slate-950">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Professional Dental Invoice Preview</span>
              <button onClick={() => setLastGeneratedReceipt(null)} className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 cursor-pointer p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Printable Content Section */}
            <div id="print-area" className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 bg-white text-slate-900 border-x border-slate-300 print:overflow-visible print:p-0 print:border-none scrollbar-thin">

              {/* Clinic details header (Centered) */}
              <div className="text-center space-y-1 pb-2">
                <h1 className="text-xl font-extrabold text-blue-900 tracking-tight">
                  {clinicName || clinicConfig.name}
                </h1>
                <p className="text-[11px] text-slate-700 font-medium max-w-md mx-auto leading-tight">
                  {clinicAddress || clinicConfig.contact.address.full}
                </p>
                <p className="text-[11px] font-bold text-slate-800">
                  PH: {clinicConfig.contact.phone}
                </p>
              </div>
              <hr className="border-slate-400 my-2" />

              {/* Invoice Header Information & Patient Info */}
              {(() => {
                const patientObj = patients.find(p => p.id === lastGeneratedReceipt.patientId || p.name === lastGeneratedReceipt.patientName);
                const ageGenderStr = patientObj ? `${patientObj.age} ${patientObj.gender}` : "";
                const rawDate = lastGeneratedReceipt.paymentDate || new Date().toISOString().split("T")[0];
                const formattedDate = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate.split(" ")[0];

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3 sm:gap-6 print:gap-6 text-xs font-semibold py-1 text-slate-900">
                      {/* Left column */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="w-24 sm:w-28 print:w-28 shrink-0 font-bold text-slate-900">Invoice No :</span>
                          <span className="font-semibold text-slate-800">{lastGeneratedReceipt.id}</span>
                        </div>
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="w-24 sm:w-28 print:w-28 shrink-0 font-bold text-slate-900">Date :</span>
                          <span className="font-semibold text-slate-800">{formattedDate}</span>
                        </div>
                      </div>

                      {/* Right column */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="w-24 sm:w-28 print:w-28 shrink-0 font-bold text-slate-900">Patient Name :</span>
                          <span className="font-semibold text-slate-800">{lastGeneratedReceipt.patientName}</span>
                        </div>
                        {ageGenderStr ? (
                          <div className="flex flex-wrap items-baseline gap-x-2">
                            <span className="w-24 sm:w-28 print:w-28 shrink-0 font-bold text-slate-900">Age/Gender :</span>
                            <span className="font-semibold text-slate-800">{ageGenderStr}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <hr className="border-slate-400 my-2" />
                  </>
                );
              })()}

              {/* Treatment Details Table */}
              <div className="min-h-[140px] pt-1 overflow-x-auto print:overflow-visible scrollbar-thin">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-400 text-slate-900">
                      <th className="py-2 px-2 font-bold w-14">Sl No.</th>
                      <th className="py-2 px-2 font-bold">Treatment Details</th>
                      <th className="py-2 px-2 font-bold text-right w-32">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {lastGeneratedReceipt.items && lastGeneratedReceipt.items.length > 0 ? (
                      lastGeneratedReceipt.items.map((item, idx) => (
                        <tr key={idx} className="text-slate-800">
                          <td className="py-2.5 px-2 font-bold">{idx + 1}</td>
                          <td className="py-2.5 px-2 font-medium break-words">{item.description}</td>
                          <td className="py-2.5 px-2 text-right font-bold font-mono">
                            {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="text-slate-800">
                        <td className="py-2.5 px-2 font-bold">1</td>
                        <td className="py-2.5 px-2 font-medium break-words">{lastGeneratedReceipt.treatment || "Dental Treatment"}</td>
                        <td className="py-2.5 px-2 text-right font-bold font-mono">
                          {lastGeneratedReceipt.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <hr className="border-slate-400 my-3" />

              {/* Financial Summary (Right Aligned) */}
              <div className="flex justify-end my-3">
                <div className="w-full sm:w-64 print:w-64 space-y-1.5 text-xs font-bold text-slate-900">
                  <div className="flex justify-between">
                    <span>Gross amount :</span>
                    <span className="font-mono">
                      {lastGeneratedReceipt.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount paid :</span>
                    <span className="font-mono">
                      {lastGeneratedReceipt.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-300 pt-1">
                    <span>Balance :</span>
                    <span className="font-mono">
                      {(lastGeneratedReceipt.total - lastGeneratedReceipt.paidAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details Section Box */}
              <div className="border border-slate-400 rounded-none p-0 my-3 overflow-hidden">
                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-400 font-bold text-xs text-slate-900">
                  Payment Details
                </div>
                <div className="overflow-x-auto print:overflow-visible scrollbar-thin">
                  <table className="w-full min-w-[500px] sm:min-w-full print:min-w-full text-center border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-50 text-slate-800 font-bold">
                        <th className="py-1.5 px-2 border-r border-slate-300">Receipt No</th>
                        <th className="py-1.5 px-2 border-r border-slate-300">Amt Received</th>
                        <th className="py-1.5 px-2 border-r border-slate-300">Amt.Refund</th>
                        <th className="py-1.5 px-2 border-r border-slate-300">Mode</th>
                        <th className="py-1.5 px-2 border-r border-slate-300">Date</th>
                        <th className="py-1.5 px-2 border-r border-slate-300">NO</th>
                        <th className="py-1.5 px-2">Bank Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lastGeneratedReceipt.paymentLogs && lastGeneratedReceipt.paymentLogs.length > 0 ? (
                        lastGeneratedReceipt.paymentLogs.map((log, idx) => (
                          <tr key={idx} className="border-b border-slate-200 text-slate-800 font-medium">
                            <td className="py-1.5 px-2 border-r border-slate-300 font-mono">10{idx + 1}</td>
                            <td className="py-1.5 px-2 border-r border-slate-300 font-mono font-bold">
                              {log.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-1.5 px-2 border-r border-slate-300 font-mono">0.00</td>
                            <td className="py-1.5 px-2 border-r border-slate-300">{log.method}</td>
                            <td className="py-1.5 px-2 border-r border-slate-300">{log.date || lastGeneratedReceipt.paymentDate}</td>
                            <td className="py-1.5 px-2 border-r border-slate-300">-</td>
                            <td className="py-1.5 px-2">-</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="text-slate-800 font-medium">
                          <td className="py-1.5 px-2 border-r border-slate-300 font-mono">101</td>
                          <td className="py-1.5 px-2 border-r border-slate-300 font-mono font-bold">
                            {lastGeneratedReceipt.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-300 font-mono">0.00</td>
                          <td className="py-1.5 px-2 border-r border-slate-300">Cash</td>
                          <td className="py-1.5 px-2 border-r border-slate-300">{lastGeneratedReceipt.paymentDate}</td>
                          <td className="py-1.5 px-2 border-r border-slate-300">-</td>
                          <td className="py-1.5 px-2">-</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dynamic Amount in Words & Signatory Block */}
              <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-end print:items-end gap-4 sm:gap-0 pt-4 my-2 text-xs">
                <div className="font-extrabold text-slate-900 uppercase tracking-wide max-w-full sm:max-w-xs print:max-w-xs break-words">
                  {numberToWords(lastGeneratedReceipt.paidAmount || lastGeneratedReceipt.total)}
                </div>

                <div className="text-left sm:text-right print:text-right space-y-1 text-slate-900 shrink-0 self-end sm:self-auto">
                  <div className="font-bold">Authorised Signatory</div>
                  <div className="text-[11px] font-semibold text-slate-800">{clinicName || clinicConfig.name}</div>
                  <div className="text-[10px] font-bold tracking-wider uppercase text-slate-900">{clinicConfig.doctor.title.toUpperCase()}</div>
                </div>
              </div>

            </div>

            {/* Action buttons footer - Not printed */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5 shrink-0 no-print">
              <button
                onClick={() => {
                  window.print();
                }}
                className="h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 font-bold shadow-xs cursor-pointer"
              >
                <Printer className="h-4 w-4" /> Print Invoice
              </button>
              <button
                onClick={() => setLastGeneratedReceipt(null)}
                className="h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </motion.div>
        </div>
      )}
      {/* RESCHEDULE APPOINTMENT MODAL DIALOG */}
      <AnimatePresence>
        {rescheduleModalAppt && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-md space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-955/40 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Reschedule Appointment</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {rescheduleModalAppt.patientName} • {rescheduleModalAppt.treatment}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRescheduleModalAppt(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 w-full min-w-0 overflow-hidden">
                <div className="w-full min-w-0">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Select New Date
                  </label>
                  <input
                    type="date"
                    value={reschedulePickerDate}
                    onChange={(e) => setReschedulePickerDate(e.target.value)}
                    className="w-full max-w-full min-w-0 box-border bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                  />
                </div>

                <div className="w-full min-w-0">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                    Select Time
                  </label>

                  {/* DESKTOP TIME SPINNER (hidden sm:block) */}
                  <div className="hidden sm:block">
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5">
                      <div className="flex items-center justify-center gap-4">
                        {/* Hours Spinner */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const hours = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
                              const idx = hours.indexOf(rescheduleHour);
                              setRescheduleHour(hours[(idx + 1) % hours.length]);
                            }}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="Increase Hour"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <div className="h-10 w-14 rounded-xl bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-sm font-bold text-slate-900 dark:text-white shadow-xs">
                            {rescheduleHour}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const hours = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
                              const idx = hours.indexOf(rescheduleHour);
                              setRescheduleHour(hours[(idx - 1 + hours.length) % hours.length]);
                            }}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="Decrease Hour"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>

                        <span className="text-base font-black text-slate-400 dark:text-slate-500 pb-0.5">:</span>

                        {/* Minutes Spinner */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const mins = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
                              const idx = mins.indexOf(rescheduleMinute);
                              setRescheduleMinute(mins[(idx + 1) % mins.length]);
                            }}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="Increase Minutes"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <div className="h-10 w-14 rounded-xl bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-sm font-bold text-slate-900 dark:text-white shadow-xs">
                            {rescheduleMinute}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const mins = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
                              const idx = mins.indexOf(rescheduleMinute);
                              setRescheduleMinute(mins[(idx - 1 + mins.length) % mins.length]);
                            }}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="Decrease Minutes"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>

                        {/* AM / PM Toggle */}
                        <div className="flex flex-col gap-1 pl-3 border-l border-slate-200 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setRescheduleAmPm("AM")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              rescheduleAmPm === "AM"
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                : "bg-white dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            AM
                          </button>
                          <button
                            type="button"
                            onClick={() => setRescheduleAmPm("PM")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              rescheduleAmPm === "PM"
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                : "bg-white dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            PM
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MOBILE APPLE/IOS SCROLLING WHEEL (block sm:hidden) */}
                  <div className="block sm:hidden w-full min-w-0 overflow-hidden">
                    <div className="relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 h-36 overflow-hidden w-full max-w-full touch-pan-y">
                      {/* Center Highlight Band */}
                      <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-9 bg-blue-50/80 dark:bg-blue-955/40 border-y border-blue-200 dark:border-blue-800/80 rounded-lg pointer-events-none z-0" />

                      <div className="relative z-10 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center h-full w-full min-w-0 overflow-hidden touch-pan-y">
                        {/* Hour Wheel */}
                        <div className="h-full w-full overflow-y-auto overflow-x-hidden scrollbar-none snap-y snap-mandatory py-12 space-y-1 text-center touch-pan-y min-w-0">
                          {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((h) => {
                            const isSelected = rescheduleHour === h;
                            return (
                              <div
                                key={h}
                                onClick={() => setRescheduleHour(h)}
                                className={`snap-center h-7 flex items-center justify-center transition-all cursor-pointer select-none ${
                                  isSelected
                                    ? "text-blue-600 dark:text-blue-400 font-bold text-sm scale-110"
                                    : "text-slate-400 dark:text-slate-500 text-xs opacity-50 hover:opacity-100"
                                }`}
                              >
                                {h}
                              </div>
                            );
                          })}
                        </div>

                        <span className="text-xs font-black text-slate-400 dark:text-slate-500 px-1 select-none flex items-center justify-center shrink-0">:</span>

                        {/* Minute Wheel */}
                        <div className="h-full w-full overflow-y-auto overflow-x-hidden scrollbar-none snap-y snap-mandatory py-12 space-y-1 text-center touch-pan-y min-w-0">
                          {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => {
                            const isSelected = rescheduleMinute === m;
                            return (
                              <div
                                key={m}
                                onClick={() => setRescheduleMinute(m)}
                                className={`snap-center h-7 flex items-center justify-center transition-all cursor-pointer select-none ${
                                  isSelected
                                    ? "text-blue-600 dark:text-blue-400 font-bold text-sm scale-110"
                                    : "text-slate-400 dark:text-slate-500 text-xs opacity-50 hover:opacity-100"
                                }`}
                              >
                                {m}
                              </div>
                            );
                          })}
                        </div>

                        <span className="text-xs font-black text-slate-400 dark:text-slate-500 px-1 select-none flex items-center justify-center shrink-0 opacity-0">•</span>

                        {/* AM/PM Wheel */}
                        <div className="h-full w-full overflow-y-auto overflow-x-hidden scrollbar-none snap-y snap-mandatory py-12 space-y-1 text-center touch-pan-y min-w-0">
                          {["AM", "PM"].map((period) => {
                            const isSelected = rescheduleAmPm === period;
                            return (
                              <div
                                key={period}
                                onClick={() => setRescheduleAmPm(period)}
                                className={`snap-center h-7 flex items-center justify-center transition-all cursor-pointer select-none ${
                                  isSelected
                                    ? "text-blue-600 dark:text-blue-400 font-bold text-sm scale-110"
                                    : "text-slate-400 dark:text-slate-500 text-xs opacity-50 hover:opacity-100"
                                }`}
                              >
                                {period}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setRescheduleModalAppt(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!reschedulePickerDate) {
                      showToast("Please select a valid date.", "error");
                      return;
                    }
                    const formattedUiDate = convertToUiDate(reschedulePickerDate);
                    const formattedTime = `${rescheduleHour}:${rescheduleMinute} ${rescheduleAmPm}`;

                    const { error } = await supabase
                      .from("appointments")
                      .update({ appointment_date: convertToDbDate(formattedUiDate), time_slot: formattedTime })
                      .eq("id", rescheduleModalAppt.id);

                    if (error) {
                      console.error("Appointment operation failed:", error.message, error.code);
                      showToast("Failed to reschedule appointment in database.", "error");
                      return;
                    }

                    setAppointments(prev => prev.map(a => a.id === rescheduleModalAppt.id ? { ...a, date: formattedUiDate, time: formattedTime } : a));
                    pushActivity("Appointment", `Rescheduled ${rescheduleModalAppt.patientName} to ${formattedUiDate} at ${formattedTime}.`);
                    showToast(`Appointment rescheduled to ${formattedUiDate} at ${formattedTime}.`, "success");
                    setRescheduleModalAppt(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Confirm Reschedule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Calendar Slot Details / Action Modal */}
      {selectedSlotData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[680px] bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden text-xs font-semibold"
          >
            <div className="flex items-start justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col text-slate-900 dark:text-white">
                <span className="text-[18px] font-bold leading-tight">Slot Management:</span>
                <span className="text-[16px] font-semibold text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  {selectedSlotData.date} at {formatTo12h(selectedSlotData.time)}
                </span>
              </div>
              <button onClick={() => setSelectedSlotData(null)} className="text-slate-400 hover:text-slate-650 shrink-0 mt-0.5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-8">
              {selectedSlotData.appointment ? (
                // Booked Slot
                <div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8">
                    <div>
                      <span className="text-[13px] text-slate-450 dark:text-slate-500 block mb-1 uppercase tracking-wider font-semibold">Patient</span>
                      <strong className="text-[16px] text-slate-850 dark:text-slate-100 font-semibold block leading-tight">{selectedSlotData.appointment.patientName}</strong>
                    </div>
                    <div>
                      <span className="text-[13px] text-slate-450 dark:text-slate-500 block mb-1 uppercase tracking-wider font-semibold">Doctor</span>
                      <strong className="text-[16px] text-slate-850 dark:text-slate-100 font-semibold block leading-tight">{selectedSlotData.appointment.doctor}</strong>
                    </div>
                    <div>
                      <span className="text-[13px] text-slate-455 dark:text-slate-500 block mb-1 uppercase tracking-wider font-semibold">Treatment</span>
                      <strong className="text-[16px] text-slate-850 dark:text-slate-100 font-semibold block leading-tight">{selectedSlotData.appointment.treatment}</strong>
                    </div>
                    <div>
                      <span className="text-[13px] text-slate-455 dark:text-slate-500 block mb-1 uppercase tracking-wider font-semibold">Status</span>
                      <div className="mt-0.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                          selectedSlotData.appointment.status === "Scheduled" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400" :
                          selectedSlotData.appointment.status === "Checked In" || selectedSlotData.appointment.status === "Waiting" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400" :
                          selectedSlotData.appointment.status === "In Procedure" ? "bg-orange-100 text-orange-850 dark:bg-orange-950/40 dark:text-orange-400" :
                          selectedSlotData.appointment.status === "Completed" ? "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-400" :
                          "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                        }`}>
                          {selectedSlotData.appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Action Row */}
                  <div className="flex items-center gap-3 w-full mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    {/* Primary Status-based Action Button */}
                    {selectedSlotData.appointment.status === "Scheduled" && (
                      <button
                        type="button"
                        onClick={() => handleApptCheckIn(selectedSlotData.appointment!.id)}
                        className="h-12 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        Check In
                      </button>
                    )}
                    {(selectedSlotData.appointment.status === "Checked In" || selectedSlotData.appointment.status === "Waiting") && (
                      <button
                        type="button"
                        onClick={() => handleApptStartProcedure(selectedSlotData.appointment!.id)}
                        className="h-12 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        Start Procedure
                      </button>
                    )}
                    {selectedSlotData.appointment.status === "In Procedure" && (
                      <button
                        type="button"
                        onClick={() => handleApptCompleteProcedure(selectedSlotData.appointment!.id)}
                        className="h-12 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        Complete Procedure
                      </button>
                    )}
                    {selectedSlotData.appointment.status === "Completed" && (
                      (() => {
                        const hasInvoice = invoices.some(i => i.patientId === selectedSlotData.appointment!.patientId);
                        return (
                          <button
                            type="button"
                            onClick={() => handleApptGenerateBill(selectedSlotData.appointment!.id)}
                            className="h-12 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                          >
                            {hasInvoice ? "Collect Payment" : "Generate Bill"}
                          </button>
                        );
                      })()
                    )}

                    <button
                      type="button"
                      onClick={async () => {
                        const { error } = await supabase
                          .from("appointments")
                          .update({ status: "Cancelled" })
                          .eq("id", selectedSlotData.appointment!.id);
                        if (error) {
                          console.error("Appointment operation failed:", error.message, error.code);
                          showToast("Failed to block slot: cancel existing appointment failed.", "error");
                          return;
                        }
                        setBlockedSlots(prev => {
                          const copy = { ...prev };
                          const key = `${selectedSlotData.date}_${selectedSlotData.time}`;
                          copy[key] = true;
                          return copy;
                        });
                        setAppointments(prev => prev.map(a => a.id === selectedSlotData.appointment!.id ? { ...a, status: "Cancelled" } : a));
                        setSelectedSlotData(null);
                      }}
                      className="h-12 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      Block Slot
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const { error } = await supabase
                          .from("appointments")
                          .update({ status: "Cancelled" })
                          .eq("id", selectedSlotData.appointment!.id);
                        if (error) {
                          console.error("Appointment operation failed:", error.message, error.code);
                          showToast("Failed to cancel appointment in database.", "error");
                          return;
                        }
                        setAppointments(prev => prev.map(a => a.id === selectedSlotData.appointment!.id ? { ...a, status: "Cancelled" } : a));
                        setSelectedSlotData(null);
                      }}
                      className="h-12 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] border border-red-200 text-red-655 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-955/20 transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : blockedSlots[`${selectedSlotData.date}_${selectedSlotData.time}`] ? (
                // Blocked Slot
                <div className="space-y-6 text-center py-1">
                  <p className="text-slate-500 font-medium">This slot is currently blocked for clinical maintenance.</p>
                  <div className="flex items-center gap-3 w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleBlockSlotToggle(selectedSlotData.date, selectedSlotData.time)}
                      className="h-12 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      Unblock Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSlotData(null)}
                      className="h-12 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                // Empty Slot - Allow Booking or Blocking
                 <form onSubmit={handleSlotBookingSubmit} className="space-y-4">
                  {(() => {
                    const selectedPatient = patients.find(p => p.id === slotPatientId);
                    const filteredPatientsForSlot = patients.filter(p => {
                      const query = slotPatientSearchQuery.toLowerCase().trim();
                      if (!query) return true;
                      return (
                        p.name.toLowerCase().includes(query) ||
                        p.id.toLowerCase().includes(query) ||
                        (p.phone && p.phone.toLowerCase().includes(query))
                      );
                    });

                    return (
                      <div className="space-y-1.5">
                        <Label>Select Patient Record</Label>

                        {/* Hidden select for HTML5 required validation */}
                        <select
                          value={slotPatientId}
                          onChange={e => setSlotPatientId(e.target.value)}
                          required
                          className="absolute w-0 h-0 opacity-0 pointer-events-none"
                        >
                          <option value="">-- Choose Patient --</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>

                        <div className="relative" ref={slotPatientDropdownRef}>
                          <div
                            onClick={() => setSlotPatientDropdownOpen(!slotPatientDropdownOpen)}
                            className="flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 cursor-pointer"
                          >
                            <span className="truncate">
                              {selectedPatient ? `${selectedPatient.name} (${selectedPatient.id})` : "-- Choose Patient --"}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          </div>

                          {slotPatientDropdownOpen && (
                            <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-850 shadow-lg z-50 flex flex-col">
                              {/* Search input field inside the dropdown */}
                              <div className="sticky top-0 bg-white dark:bg-slate-955 p-1.5 border-b border-slate-100 dark:border-slate-850">
                                <input
                                  type="text"
                                  placeholder="Search by name, ID, or mobile..."
                                  value={slotPatientSearchQuery}
                                  onChange={e => setSlotPatientSearchQuery(e.target.value)}
                                  className="h-8 w-full rounded-md border border-slate-150 bg-slate-50/50 dark:bg-slate-900 dark:border-slate-800 px-2.5 py-1 text-xs outline-none focus:bg-white dark:text-slate-350"
                                  onClick={e => e.stopPropagation()}
                                  autoFocus
                                />
                              </div>

                              {/* List of matching patient records */}
                              <div className="overflow-y-auto flex-1 max-h-48 scrollbar-thin">
                                {filteredPatientsForSlot.length > 0 ? (
                                  filteredPatientsForSlot.map(p => (
                                    <div
                                      key={p.id}
                                      onClick={() => {
                                        setSlotPatientId(p.id);
                                        setSlotPatientDropdownOpen(false);
                                      }}
                                      className={`px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer border-b border-slate-50/50 dark:border-slate-900/50 last:border-b-0 text-left ${
                                        slotPatientId === p.id ? "bg-blue-50/30 dark:bg-blue-955/20" : ""
                                      }`}
                                    >
                                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{p.name}</p>
                                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                        {p.id} • {p.phone || "+91 99000 11000"}
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                                    No patients found
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label>Assign Doctor</Label>
                      <select
                        className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                        value={slotDoctor}
                        onChange={e => setSlotDoctor(e.target.value)}
                      >
                        {doctors.map(d => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Treatment Category</Label>
                      <select
                        className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                        value={slotTreatment}
                        onChange={e => setSlotTreatment(e.target.value)}
                      >
                        {ALL_TREATMENTS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleBlockSlotToggle(selectedSlotData.date, selectedSlotData.time)}
                      className="h-11 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      Block Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSlotData(null)}
                      className="h-11 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-11 flex-1 min-w-0 flex items-center justify-center font-semibold text-[15px] bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer select-none rounded-lg whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-55 animate-slideLeft">
          <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-bold transition-all ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/30 dark:text-emerald-300"
              : "bg-red-50 border-red-100 text-red-800 dark:bg-red-950/40 dark:border-red-900/30 dark:text-red-300"
          }`}>
            <div className={`h-2 w-2 rounded-full ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`} />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {hoveredApptDay && (
        <>
          {/* Mobile and Pinned backdrop for easy dismissal */}
          <div
            className={`fixed inset-0 z-[9998] bg-slate-900/40 backdrop-blur-xs ${
              hoveredApptDay.isPinned ? "block" : "block sm:hidden"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setHoveredApptDay(null);
            }}
          />
          <div
            style={
              typeof window !== "undefined"
                ? {
                    top: Math.min(hoveredApptDay.rect.top, Math.max(16, window.innerHeight - 340)),
                    left: (hoveredApptDay.rect.left + hoveredApptDay.rect.width + 8 + 320 > window.innerWidth)
                      ? Math.max(16, hoveredApptDay.rect.left - 328)
                      : hoveredApptDay.rect.left + hoveredApptDay.rect.width + 8,
                  }
                : undefined
            }
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={handlePopoverMouseEnter}
            onMouseLeave={handlePopoverMouseLeave}
            className="animate-scaleIn bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 text-xs font-semibold text-slate-700 flex flex-col gap-3 z-[9999] max-h-[85vh] overflow-y-auto max-sm:fixed! max-sm:top-1/2! max-sm:left-1/2! max-sm:-translate-x-1/2! max-sm:-translate-y-1/2! max-sm:w-[calc(100vw-32px)]! max-sm:max-w-[360px]! max-sm:m-0! sm:fixed sm:w-[320px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
              <span className="font-bold text-slate-800 dark:text-white text-[13px]">
                Appointments — {hoveredApptDay.dateStr}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-955/30 dark:text-blue-400 px-1.5 py-0.5 rounded font-extrabold">
                  {hoveredApptDay.appointments.length}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHoveredApptDay(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer flex items-center justify-center"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

          {/* List */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto scrollbar-thin pr-1">
            {hoveredApptDay.appointments.map(appt => (
              <div
                key={appt.id}
                onClick={() => {
                  setSelectedApptDetail(appt);
                  setHoveredApptDay(null);
                }}
                className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex flex-col gap-1 transition-all hover:border-slate-200 dark:hover:border-slate-800 shadow-3xs"
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                    {appt.patientName}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-550 shrink-0 font-extrabold">
                    {appt.time}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-550 dark:text-slate-400 font-medium">
                  <span className="truncate">{appt.treatment}</span>
                  <span className="shrink-0">{appt.doctor}</span>
                </div>

                <div className="mt-1 flex justify-between items-center">
                  <span className="text-[9px] text-slate-455 dark:text-slate-500">
                    {appt.patientId}
                  </span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[8px] font-extrabold uppercase tracking-wider ${
                    appt.status === "Scheduled" ? "bg-blue-100 text-blue-808 dark:bg-blue-900/40 dark:text-blue-400" :
                    appt.status === "Checked In" || appt.status === "Waiting" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400" :
                    appt.status === "In Procedure" ? "bg-orange-100 text-orange-850 dark:bg-orange-950/40 dark:text-orange-400" :
                    appt.status === "Completed" ? "bg-slate-100 text-slate-808 dark:bg-slate-900/40 dark:text-slate-400" :
                    "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                  }`}>
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
      )}

      {/* Floating Hover Popover Card for Booked Calendar Slots */}
      {hoveredSlotPopover && (() => {
        const { appointment: app, rect } = hoveredSlotPopover;
        const pat = patients.find(p => p.id === app.patientId);
        const patPhone = pat?.phone || "+91 99000 11000";
        const patId = pat?.id || app.patientId || "DS-1001";

        const popoverWidth = 270;
        const popoverHeight = 220;

        let left = rect.left + rect.width + 10;
        if (typeof window !== "undefined" && left + popoverWidth > window.innerWidth - 20) {
          left = Math.max(10, rect.left - popoverWidth - 10);
        }

        let top = rect.top;
        if (typeof window !== "undefined" && top + popoverHeight > window.innerHeight - 20) {
          top = Math.max(10, window.innerHeight - popoverHeight - 20);
        }

        return (
          <div
            style={{ top: `${top}px`, left: `${left}px`, width: `${popoverWidth}px`, zIndex: 9999 }}
            onMouseEnter={() => {
              if (slotHoverTimeoutRef.current) {
                clearTimeout(slotHoverTimeoutRef.current);
                slotHoverTimeoutRef.current = null;
              }
            }}
            onMouseLeave={() => {
              if (slotHoverTimeoutRef.current) clearTimeout(slotHoverTimeoutRef.current);
              slotHoverTimeoutRef.current = setTimeout(() => {
                setHoveredSlotPopover(null);
              }, 200);
            }}
            onClick={() => {
              setHoveredSlotPopover(null);
              setSlotPatientId("");
              setSelectedSlotData({ date: app.date, time: app.time, appointment: app });
            }}
            className="fixed bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xl text-xs space-y-2.5 animate-fadeIn cursor-pointer"
          >
            {/* Header: Patient Name & Status Badge */}
            <div className="flex justify-between items-start gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="min-w-0 flex-1">
                <span className="font-bold text-sm text-slate-900 dark:text-white block leading-snug truncate">{app.patientName}</span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block mt-0.5">ID: {patId}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                app.status === "Scheduled" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300" :
                app.status === "Checked In" || app.status === "Waiting" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300" :
                app.status === "In Procedure" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300" :
                app.status === "Completed" ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" : "bg-slate-100 text-slate-600"
              }`}>
                {app.status}
              </span>
            </div>

            {/* Details List */}
            <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-400 font-normal">Appt Time:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatTo12h(app.time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-normal">Doctor:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{app.doctor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-normal">Treatment:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[140px]">{app.treatment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-normal">Mobile:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{patPhone}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-[10px] text-blue-600 dark:text-blue-400 font-bold">
              <span>Click slot to manage details</span>
              <span>→</span>
            </div>
          </div>
        );
      })()}

      {/* EDIT INVOICE MODAL */}
      {editingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl max-w-lg w-full space-y-5 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Edit Billing Record — {editingInvoice.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingInvoice(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEditInvoice} className="space-y-4 text-xs font-semibold">
              {/* Row 1: Patient Name & Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block font-medium">Patient Name</label>
                  <Input
                    type="text"
                    value={editInvoicePatientName}
                    onChange={(e) => setEditInvoicePatientName(e.target.value)}
                    required
                    className="text-[13px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block font-medium">Doctor Assigned</label>
                  <select
                    value={editInvoiceDoctor}
                    onChange={(e) => setEditInvoiceDoctor(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-[13px] focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                  >
                    {doctors.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Treatment & Payment Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block font-medium">Treatment Procedure</label>
                  <Input
                    type="text"
                    value={editInvoiceTreatment}
                    onChange={(e) => setEditInvoiceTreatment(e.target.value)}
                    required
                    className="text-[13px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block font-medium">Payment Date</label>
                  <Input
                    type="text"
                    value={editInvoicePaymentDate}
                    onChange={(e) => setEditInvoicePaymentDate(e.target.value)}
                    className="text-[13px]"
                    placeholder="e.g. 12 Aug 2026"
                  />
                </div>
              </div>

              {/* Row 3: Subtotal, Discount %, Tax % */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block font-medium">Subtotal (₹)</label>
                  <Input
                    type="number"
                    value={editInvoiceSubtotal}
                    onChange={(e) => {
                      const sub = Number(e.target.value);
                      setEditInvoiceSubtotal(sub);
                      const discAmt = (sub * editInvoiceDiscount) / 100;
                      const afterDisc = sub - discAmt;
                      const taxAmt = (afterDisc * editInvoiceTax) / 100;
                      setEditInvoiceTotal(Math.round(afterDisc + taxAmt));
                    }}
                    min={0}
                    required
                    className="text-[13px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block font-medium">Discount (%)</label>
                  <Input
                    type="number"
                    value={editInvoiceDiscount}
                    onChange={(e) => {
                      const disc = Number(e.target.value);
                      setEditInvoiceDiscount(disc);
                      const discAmt = (editInvoiceSubtotal * disc) / 100;
                      const afterDisc = editInvoiceSubtotal - discAmt;
                      const taxAmt = (afterDisc * editInvoiceTax) / 100;
                      setEditInvoiceTotal(Math.round(afterDisc + taxAmt));
                    }}
                    min={0}
                    max={100}
                    className="text-[13px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block font-medium">Tax (%)</label>
                  <Input
                    type="number"
                    value={editInvoiceTax}
                    onChange={(e) => {
                      const taxVal = Number(e.target.value);
                      setEditInvoiceTax(taxVal);
                      const discAmt = (editInvoiceSubtotal * editInvoiceDiscount) / 100;
                      const afterDisc = editInvoiceSubtotal - discAmt;
                      const taxAmt = (afterDisc * taxVal) / 100;
                      setEditInvoiceTotal(Math.round(afterDisc + taxAmt));
                    }}
                    min={0}
                    max={100}
                    className="text-[13px]"
                  />
                </div>
              </div>

              {/* Row 4: Total Payable, Paid Amount, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block font-medium">Total Payable (₹)</label>
                  <Input
                    type="number"
                    value={editInvoiceTotal}
                    onChange={(e) => setEditInvoiceTotal(Number(e.target.value))}
                    min={0}
                    required
                    className="text-[13px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block font-medium">Paid Amount (₹)</label>
                  <Input
                    type="number"
                    value={editInvoicePaidAmount}
                    onChange={(e) => {
                      const paid = Number(e.target.value);
                      setEditInvoicePaidAmount(paid);
                      if (paid >= editInvoiceTotal && editInvoiceTotal > 0) {
                        setEditInvoiceStatus("Paid");
                      } else if (paid > 0) {
                        setEditInvoiceStatus("Partially Paid");
                      }
                    }}
                    min={0}
                    className="text-[13px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 block font-medium">Payment Status</label>
                  <select
                    value={editInvoiceStatus}
                    onChange={(e) => setEditInvoiceStatus(e.target.value as any)}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-[13px] focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  onClick={() => setEditingInvoice(null)}
                  className="h-9 px-4 rounded border font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingInvoice}
                  className="h-9 px-5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2 cursor-pointer"
                >
                  {savingInvoice ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE TREATMENT PHASE MODAL */}
      {editingPhaseTreatment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl max-w-md w-full space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Update Clinical Phase – {editingPhaseTreatment.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPhaseTreatment(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveTreatmentPhase} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300">Patient</Label>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{editingPhaseTreatment.patient}</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="selectPhaseStage" className="text-slate-700 dark:text-slate-300">
                  Select Active Clinical Treatment Phase
                </Label>
                <select
                  id="selectPhaseStage"
                  value={selectedPhaseStage}
                  onChange={(e) => setSelectedPhaseStage(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {getPatientVisitsList(editingPhaseTreatment, treatments, appointments).map((node) => (
                    <option key={node.num} value={node.title}>
                      Phase {node.num}: {node.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  onClick={() => setEditingPhaseTreatment(null)}
                  className="h-9 px-4 rounded border font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingPhase}
                  className="h-9 px-5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2 cursor-pointer"
                >
                  {savingPhase ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Phase"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEDICINE ADD / EDIT MODAL */}
      {medicineModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl max-w-md w-full space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingMedicine ? "Edit Medicine Catalogue Item" : "Add New Medicine to Catalogue"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMedicineModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <Label htmlFor="medFormName" className="text-slate-700 dark:text-slate-300">
                  Medicine Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="medFormName"
                  placeholder="e.g. Paracetamol 500mg"
                  value={medFormName}
                  onChange={(e) => setMedFormName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="medFormUnit" className="text-slate-700 dark:text-slate-300">
                  Stock Unit <span className="text-rose-500">*</span>
                </Label>
                {editingMedicine && stockTransactions.some(t => t.medicine_id === editingMedicine.id) ? (
                  <div>
                    <input
                      type="text"
                      disabled
                      value={medFormUnit}
                      className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-2 text-sm text-slate-500 cursor-not-allowed capitalize"
                    />
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-normal">
                      Unit cannot be changed because stock transactions exist for this medicine.
                    </p>
                  </div>
                ) : (
                  <select
                    id="medFormUnit"
                    value={medFormUnit}
                    onChange={(e) => setMedFormUnit(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="tablets">tablets</option>
                    <option value="capsules">capsules</option>
                    <option value="bottles">bottles</option>
                    <option value="tubes">tubes</option>
                    <option value="sachets">sachets</option>
                    <option value="vials">vials</option>
                    <option value="strips">strips</option>
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="medFormThreshold" className="text-slate-700 dark:text-slate-300">
                  Low-Stock Threshold <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="medFormThreshold"
                  type="number"
                  min="1"
                  placeholder="e.g. 5"
                  value={medFormThreshold}
                  onChange={(e) => setMedFormThreshold(e.target.value)}
                  required
                />
                <p className="text-[10px] text-slate-400 font-normal">
                  Alert badge will show "Low Stock" when inventory drops below this number.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="medFormOpeningStock" className="text-slate-700 dark:text-slate-300">
                  Opening Stock Quantity <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="medFormOpeningStock"
                  type="number"
                  min="0"
                  placeholder="Leave empty if stock count is not yet configured"
                  value={medFormOpeningStock}
                  onChange={(e) => setMedFormOpeningStock(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 font-normal">
                  If left empty, status remains "Not Configured" until opening stock is set.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMedicineModalOpen(false)}
                  className="h-9 px-4 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2 cursor-pointer"
                >
                  {editingMedicine ? "Update Medicine" : "Save Medicine"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STOCK MODAL */}
      {addStockModalOpen && selectedStockMedicine && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl max-w-md w-full space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Stock – {selectedStockMedicine.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddStockModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddStockSubmit} className="space-y-4 text-xs font-semibold">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Current Stock:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedStockMedicine.available_quantity === null ? "Not Configured" : `${selectedStockMedicine.available_quantity} ${selectedStockMedicine.stock_unit}`}
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addStockQty" className="text-slate-700 dark:text-slate-300">
                  Quantity Received <span className="text-rose-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="addStockQty"
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={addStockQty}
                    onChange={(e) => setAddStockQty(e.target.value)}
                    required
                  />
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400 capitalize shrink-0">
                    {selectedStockMedicine.stock_unit}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addStockDate" className="text-slate-700 dark:text-slate-300">
                  Date Received
                </Label>
                <Input
                  id="addStockDate"
                  type="date"
                  value={addStockDate}
                  onChange={(e) => setAddStockDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addStockSupplier" className="text-slate-700 dark:text-slate-300">
                  Supplier / Vendor / Batch Ref <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="addStockSupplier"
                  placeholder="e.g. Apex Pharma Ltd - Batch #4910"
                  value={addStockSupplier}
                  onChange={(e) => setAddStockSupplier(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addStockNotes" className="text-slate-700 dark:text-slate-300">
                  Notes / Remarks <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="addStockNotes"
                  placeholder="Additional stock entry details..."
                  value={addStockNotes}
                  onChange={(e) => setAddStockNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddStockModalOpen(false)}
                  className="h-9 px-4 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2 cursor-pointer"
                >
                  Confirm & Receive Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {adjustStockModalOpen && adjustStockMedicine && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl max-w-md w-full space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Stock Adjustment – {adjustStockMedicine.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustStockModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAdjustStockSubmit} className="space-y-4 text-xs font-semibold">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Current Stock in System:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {adjustStockMedicine.available_quantity === null ? "Not Configured" : `${adjustStockMedicine.available_quantity} ${adjustStockMedicine.stock_unit}`}
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adjustStockNewQty" className="text-slate-700 dark:text-slate-300">
                  New Actual Count <span className="text-rose-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="adjustStockNewQty"
                    type="number"
                    min="0"
                    placeholder="Enter physical count"
                    value={adjustStockNewQty}
                    onChange={(e) => setAdjustStockNewQty(e.target.value)}
                    required
                  />
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400 capitalize shrink-0">
                    {adjustStockMedicine.stock_unit}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adjustStockReason" className="text-slate-700 dark:text-slate-300">
                  Adjustment Reason <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="adjustStockReason"
                  placeholder="e.g. Expiry, Damaged bottle, Audit correction"
                  value={adjustStockReason}
                  onChange={(e) => setAdjustStockReason(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAdjustStockModalOpen(false)}
                  className="h-9 px-4 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-5 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-2 cursor-pointer"
                >
                  Save Stock Adjustment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK MOVEMENT HISTORY MODAL */}
      {historyModalOpen && historyMedicine && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl w-full space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Stock Movement History – {historyMedicine.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="overflow-x-auto max-h-96 scrollbar-thin">
              {stockTransactions.filter(t => t.medicine_id === historyMedicine.id).length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium text-xs">
                  No stock movement transactions recorded yet for this medicine.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider sticky top-0 bg-white dark:bg-slate-955">
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Quantity</th>
                      <th className="py-2.5 px-3">Stock Change</th>
                      <th className="py-2.5 px-3">Notes / Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {stockTransactions
                      .filter(t => t.medicine_id === historyMedicine.id)
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(tx.created_at || tx.transaction_date || (tx as any).date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                              tx.transaction_type === "received" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                              tx.transaction_type === "dispensed" ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" :
                              tx.transaction_type === "adjustment" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                              "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            }`}>
                              {tx.transaction_type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold">
                            {tx.transaction_type === "received" ? `+${tx.quantity}` :
                             tx.transaction_type === "dispensed" ? `-${tx.quantity}` :
                             tx.quantity > 0 ? `+${tx.quantity}` : `${tx.quantity}`} {historyMedicine.stock_unit}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {tx.previous_quantity !== null && tx.previous_quantity !== undefined ? tx.previous_quantity : "--"} → {tx.previous_quantity !== null && tx.previous_quantity !== undefined ? (
                              tx.transaction_type === "received" ? tx.previous_quantity + tx.quantity :
                              tx.transaction_type === "dispensed" ? tx.previous_quantity - tx.quantity :
                              tx.previous_quantity + tx.quantity
                            ) : "--"}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                            {tx.notes || tx.reference || "--"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="h-9 px-4 rounded font-semibold cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DISPENSE CONFIRMATION MODAL */}
      {dispenseConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl max-w-md w-full space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm Dispensing Medicine
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDispenseConfirmModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <p className="text-slate-600 dark:text-slate-300">
                You are about to dispense <strong className="text-slate-900 dark:text-white">{dispenseConfirmModal.dispensingQty} {dispenseConfirmModal.stockUnit}</strong> of <strong className="text-purple-600 dark:text-purple-400">{dispenseConfirmModal.medicineName}</strong> for patient <strong className="text-slate-900 dark:text-white">{dispenseConfirmModal.patientName}</strong>.
              </p>
              <div className="p-3 bg-purple-50 dark:bg-purple-955 border border-purple-100 dark:border-purple-900/40 rounded-xl text-[11px] text-purple-900 dark:text-purple-300 font-medium">
                This action will deduct {dispenseConfirmModal.dispensingQty} {dispenseConfirmModal.stockUnit} from the active inventory and mark this prescription item as dispensed.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDispenseConfirmModal(null)}
                className="h-9 px-4 rounded font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDispenseItem}
                className="h-9 px-5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-2 cursor-pointer"
              >
                Dispense Medicine
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
