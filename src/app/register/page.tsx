"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getAssetPath } from "@/lib/getAssetPath";
import { DentalLogo } from "@/components/dental-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Zod Validation Schemas
const stepOneSchema = z.object({
  clinicName: z.string().min(1, "Clinic name is required"),
  registrationNumber: z.string().optional(),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "ZIP Code is required"),
});

const stepTwoSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    mobileNumber: z.string().min(1, "Mobile number is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const stepThreeSchema = z.object({
  workingDays: z.array(z.string()).min(1, "Select at least one working day"),
  workingHoursStart: z.string(),
  workingHoursEnd: z.string(),
  defaultAppointmentDuration: z.string(),
  currency: z.string(),
  timeFormat: z.string(),
});

type StepOneSchemaType = z.infer<typeof stepOneSchema>;
type StepTwoSchemaType = z.infer<typeof stepTwoSchema>;
type StepThreeSchemaType = z.infer<typeof stepThreeSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Logo upload state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states data store
  const [clinicData, setClinicData] = useState<Partial<StepOneSchemaType>>({});
  const [ownerData, setOwnerData] = useState<Partial<StepTwoSchemaType>>({});

  // Step 1 Form Hook
  const stepOneForm = useForm<StepOneSchemaType>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      clinicName: "",
      registrationNumber: "",
      phoneNumber: "",
      email: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      zipCode: "",
    },
  });

  // Step 2 Form Hook
  const stepTwoForm = useForm<StepTwoSchemaType>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Step 3 Form Hook
  const stepThreeForm = useForm<StepThreeSchemaType>({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: {
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      workingHoursStart: "09:00",
      workingHoursEnd: "17:00",
      defaultAppointmentDuration: "30",
      currency: "INR (₹)",
      timeFormat: "12-Hour",
    },
  });

  // Logo upload simulation
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
  };

  // Submit Step 1
  const onStepOneSubmit = (data: StepOneSchemaType) => {
    setClinicData(data);
    setCurrentStep(2);
  };

  // Submit Step 2
  const onStepTwoSubmit = (data: StepTwoSchemaType) => {
    setOwnerData(data);
    setCurrentStep(3);
  };

  // Submit Step 3 (Finalizing Setup)
  const onStepThreeSubmit = async (data: StepThreeSchemaType) => {
    setIsLoading(true);
    
    // Simulate API registration delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setIsSuccess(true);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepProgress = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;

  // Clean Inputs styling helper (matching requested specifications)
  const inputClass = (hasError: boolean) => 
    `h-[56px] px-[18px] rounded-[14px] bg-white/35 border text-[17px] font-normal leading-[1.5] text-[#0F172A] placeholder-[#64748B] transition-all ${
      hasError 
        ? "border-red-400 focus-visible:ring-4 focus-visible:ring-red-455/10 focus-visible:border-red-400" 
        : "border-white/35 focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500"
    }`;

  const selectClass = "flex h-[56px] w-full rounded-[14px] border border-white/35 bg-white/35 px-[18px] py-2 text-[17px] font-normal text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all";

  return (
    <div className="relative min-h-screen w-full font-sans flex items-center justify-center p-4 overflow-hidden text-slate-800">
      
      {/* Background Image Layer */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-left sm:bg-center bg-no-repeat pointer-events-none" 
        style={{ backgroundImage: `url('${getAssetPath("/dental-bg.png")}')` }}
      />
      {/* White Overlay Gradient Layer */}
      <div className="fixed inset-0 z-0 bg-white/50 pointer-events-none" />

      {/* Premium Centered Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[740px] rounded-[30px] border flex flex-col p-12 my-8"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.10)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          borderColor: "rgba(255, 255, 255, 0.20)",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)"
        }}
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              {/* Header Logo */}
              <div className="flex flex-col items-center justify-center text-center mb-8">
                <div className="scale-95 mb-6">
                  <DentalLogo showText={true} />
                </div>
                <h1 className="text-[44px] font-bold tracking-[-0.03em] text-[#0F172A] leading-[1.2]">
                  Register Your Clinic
                </h1>
              </div>

              {/* Progress bar and text */}
              <div className="space-y-4 mb-10">
                <div className="flex items-center justify-between text-[14px] font-semibold text-[#64748B] uppercase tracking-[0.1em]">
                  <span>
                    {currentStep === 1 && "STEP 1 OF 3 • Clinic Information"}
                    {currentStep === 2 && "STEP 2 OF 3 • Administrator Information"}
                    {currentStep === 3 && "STEP 3 OF 3 • Review & Confirm"}
                  </span>
                  <span>{stepProgress}% COMPLETE</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${stepProgress}%` }}
                  />
                </div>
              </div>

              {/* Forms Setup */}
              <div>
                
                {/* STEP 1: CLINIC PROFILE */}
                {currentStep === 1 && (
                  <form onSubmit={stepOneForm.handleSubmit(onStepOneSubmit)} className="space-y-8">
                    
                    <div>
                      <h2 className="text-[24px] font-semibold leading-[1.4] text-[#0F172A] mb-6">
                        Clinic Details
                      </h2>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <Label htmlFor="clinicName" className="text-[#334155] font-medium text-[16px] block">
                            Clinic Name
                          </Label>
                          <Input
                            id="clinicName"
                            placeholder="Apex Dental Care"
                            className={inputClass(!!stepOneForm.formState.errors.clinicName)}
                            {...stepOneForm.register("clinicName")}
                          />
                          {stepOneForm.formState.errors.clinicName && (
                            <p className="text-xs text-red-655 font-bold mt-1.5 flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5" />
                              {stepOneForm.formState.errors.clinicName.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-4">
                          <Label htmlFor="registrationNumber" className="text-[#334155] font-medium text-[16px] block">
                            Registration Number (Optional)
                          </Label>
                          <Input
                            id="registrationNumber"
                            placeholder="REG-991283"
                            className={inputClass(false)}
                            {...stepOneForm.register("registrationNumber")}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label htmlFor="phoneNumber" className="text-[#334155] font-medium text-[16px] block">
                          Clinic Phone
                        </Label>
                        <Input
                          id="phoneNumber"
                          placeholder="+91 98765 43210"
                          className={inputClass(!!stepOneForm.formState.errors.phoneNumber)}
                          {...stepOneForm.register("phoneNumber")}
                        />
                        {stepOneForm.formState.errors.phoneNumber && (
                          <p className="text-xs text-red-655 font-bold mt-1.5 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {stepOneForm.formState.errors.phoneNumber.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="email" className="text-[#334155] font-medium text-[16px] block">
                          Clinic Email
                        </Label>
                        <Input
                          id="email"
                          placeholder="contact@apexdental.com"
                          type="email"
                          className={inputClass(!!stepOneForm.formState.errors.email)}
                          {...stepOneForm.register("email")}
                        />
                        {stepOneForm.formState.errors.email && (
                          <p className="text-xs text-red-655 font-bold mt-1.5 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {stepOneForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="address" className="text-[#334155] font-medium text-[16px] block">
                        Complete Address
                      </Label>
                      <Input
                        id="address"
                        placeholder="12, MG Road, Landmark Block C"
                        className={inputClass(!!stepOneForm.formState.errors.address)}
                        {...stepOneForm.register("address")}
                      />
                      {stepOneForm.formState.errors.address && (
                        <p className="text-xs text-red-655 font-bold mt-1.5 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {stepOneForm.formState.errors.address.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label htmlFor="city" className="text-[#334155] font-medium text-[16px] block">City</Label>
                        <Input
                          id="city"
                          placeholder="Bengaluru"
                          className={inputClass(!!stepOneForm.formState.errors.city)}
                          {...stepOneForm.register("city")}
                        />
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="state" className="text-[#334155] font-medium text-[16px] block">State</Label>
                        <Input
                          id="state"
                          placeholder="Karnataka"
                          className={inputClass(!!stepOneForm.formState.errors.state)}
                          {...stepOneForm.register("state")}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label htmlFor="country" className="text-[#334155] font-medium text-[16px] block">Country</Label>
                        <Input
                          id="country"
                          placeholder="India"
                          className={inputClass(!!stepOneForm.formState.errors.country)}
                          {...stepOneForm.register("country")}
                        />
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="zipCode" className="text-[#334155] font-medium text-[16px] block">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          placeholder="560001"
                          className={inputClass(!!stepOneForm.formState.errors.zipCode)}
                          {...stepOneForm.register("zipCode")}
                        />
                      </div>
                    </div>

                    {/* Clinic Logo Upload */}
                    <div className="space-y-4 pt-1">
                      <Label className="text-[#334155] font-medium text-[16px] block">Clinic Logo</Label>
                      <div className="flex items-center gap-4">
                        {logoPreview ? (
                          <div className="relative h-[56px] w-[220px] rounded-[14px] border border-white/35 bg-white/35 flex items-center justify-center gap-2.5 px-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={logoPreview} alt="Logo" className="h-9 w-9 rounded-lg object-cover border border-white/20 shrink-0" />
                            <div className="flex flex-col text-left overflow-hidden w-24">
                              <span className="text-[12px] font-semibold text-[#0F172A] truncate">logo_uploaded</span>
                              <span className="text-[9px] font-medium text-emerald-600">Ready</span>
                            </div>
                            <button
                              type="button"
                              onClick={removeLogo}
                              className="p-1 bg-red-650 text-white rounded-md hover:bg-red-500 focus:outline-none shrink-0"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex h-[56px] w-220px cursor-pointer items-center justify-center rounded-[14px] border border-white/35 bg-white/35 px-4 hover:border-blue-500/50 hover:bg-white/40 transition-all select-none gap-2">
                            <Upload className="h-5 w-5 text-[#64748B] shrink-0" />
                            <div className="flex flex-col text-left">
                              <span className="text-[13px] font-semibold text-[#0F172A] leading-tight">Upload Logo</span>
                              <span className="text-[10px] font-medium text-slate-500 mt-0.5 leading-none">PNG, JPG (Optional)</span>
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                          </label>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-[56px] rounded-[14px] bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 shadow-md shadow-blue-500/10 font-semibold text-[17px] transition-all duration-200 flex items-center justify-center gap-1 mt-8"
                    >
                      Next Step <ArrowRight className="h-5 w-5" />
                    </Button>
                  </form>
                )}

                {/* STEP 2: ADMINISTRATOR ACCOUNT FORM */}
                {currentStep === 2 && (
                  <form onSubmit={stepTwoForm.handleSubmit(onStepTwoSubmit)} className="space-y-8">
                    
                    <div>
                      <h2 className="text-[24px] font-semibold leading-[1.4] text-[#0F172A] mb-6">
                        Administrator Information
                      </h2>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <Label htmlFor="fullName" className="text-[#334155] font-medium text-[16px] block">
                            Owner Full Name
                          </Label>
                          <Input
                            id="fullName"
                            placeholder="Dr. Abhishek Sharma"
                            className={inputClass(!!stepTwoForm.formState.errors.fullName)}
                            {...stepTwoForm.register("fullName")}
                          />
                          {stepTwoForm.formState.errors.fullName && (
                            <p className="text-xs text-red-655 font-bold mt-1.5 flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5" />
                              {stepTwoForm.formState.errors.fullName.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-4">
                          <Label htmlFor="ownerEmail" className="text-[#334155] font-medium text-[16px] block">
                            Owner Email Address
                          </Label>
                          <Input
                            id="ownerEmail"
                            placeholder="abhishek@apexdental.com"
                            type="email"
                            className={inputClass(!!stepTwoForm.formState.errors.email)}
                            {...stepTwoForm.register("email")}
                          />
                          {stepTwoForm.formState.errors.email && (
                            <p className="text-xs text-red-655 font-bold mt-1.5 flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5" />
                              {stepTwoForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label htmlFor="mobileNumber" className="text-[#334155] font-medium text-[16px] block">
                          Owner Mobile Number
                        </Label>
                        <Input
                          id="mobileNumber"
                          placeholder="+91 99000 11000"
                          className={inputClass(!!stepTwoForm.formState.errors.mobileNumber)}
                          {...stepTwoForm.register("mobileNumber")}
                        />
                        {stepTwoForm.formState.errors.mobileNumber && (
                          <p className="text-xs text-red-655 font-bold mt-1.5 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {stepTwoForm.formState.errors.mobileNumber.message}
                          </p>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className="space-y-4">
                        <Label htmlFor="ownerPassword" className="text-[#334155] font-medium text-[16px] block">
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="ownerPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={inputClass(!!stepTwoForm.formState.errors.password)}
                            {...stepTwoForm.register("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-[18px] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 focus:outline-none"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {stepTwoForm.formState.errors.password && (
                          <p className="text-xs text-red-655 font-bold mt-1.5 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {stepTwoForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-4">
                      <Label htmlFor="ownerConfirmPassword" className="text-[#334155] font-medium text-[16px] block">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="ownerConfirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={inputClass(!!stepTwoForm.formState.errors.confirmPassword)}
                          {...stepTwoForm.register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-[18px] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 focus:outline-none"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {stepTwoForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-red-655 font-bold mt-1.5 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {stepTwoForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-6 pt-4 mt-8">
                      <Button
                        type="button"
                        className="w-1/3 h-[56px] rounded-[14px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[17px] transition-all duration-200 flex items-center justify-center gap-1.5"
                        onClick={handlePrevStep}
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                      <Button
                        type="submit"
                        className="w-2/3 h-[56px] rounded-[14px] bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 shadow-md shadow-blue-500/10 font-semibold text-[17px] transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        Next Step <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* STEP 3: CLINIC PREFERENCES / REVIEW FORM */}
                {currentStep === 3 && (
                  <form onSubmit={stepThreeForm.handleSubmit(onStepThreeSubmit)} className="space-y-8">
                    <div>
                      <h2 className="text-[24px] font-semibold leading-[1.4] text-[#0F172A] mb-6">
                        Review & Confirm
                      </h2>
                      
                      {/* Working Days */}
                      <div className="space-y-4">
                        <Label className="text-[#334155] font-medium text-[16px] block">Working Days</Label>
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                            const currentDays = stepThreeForm.watch("workingDays") || [];
                            const isChecked = currentDays.includes(day);
                            return (
                              <label
                                key={day}
                                className={`flex items-center justify-center py-3.5 px-2 text-center rounded-[10px] border text-[11px] font-bold cursor-pointer select-none transition-all ${
                                  isChecked
                                    ? "bg-blue-50/70 text-blue-700 border-blue-200/50"
                                    : "bg-white/20 border-white/20 text-slate-600 hover:bg-white/30"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  value={day}
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (e.target.checked) {
                                      stepThreeForm.setValue("workingDays", [...currentDays, val]);
                                    } else {
                                      stepThreeForm.setValue(
                                        "workingDays",
                                        currentDays.filter((d) => d !== val)
                                      );
                                    }
                                  }}
                                />
                                {day.slice(0, 3)}
                              </label>
                            );
                          })}
                        </div>
                        {stepThreeForm.formState.errors.workingDays && (
                          <p className="text-xs text-red-655 font-bold mt-1.5 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {stepThreeForm.formState.errors.workingDays.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label htmlFor="workingHoursStart" className="text-[#334155] font-medium text-[16px] block">
                          Start Hour
                        </Label>
                        <Input
                          id="workingHoursStart"
                          type="time"
                          className={inputClass(false)}
                          {...stepThreeForm.register("workingHoursStart")}
                        />
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="workingHoursEnd" className="text-[#334155] font-medium text-[16px] block">
                          End Hour
                        </Label>
                        <Input
                          id="workingHoursEnd"
                          type="time"
                          className={inputClass(false)}
                          {...stepThreeForm.register("workingHoursEnd")}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label htmlFor="defaultAppointmentDuration" className="text-[#334155] font-medium text-[16px] block">
                          Appointment Duration
                        </Label>
                        <select
                          id="defaultAppointmentDuration"
                          className={selectClass}
                          {...stepThreeForm.register("defaultAppointmentDuration")}
                        >
                          <option value="15">15 Minutes</option>
                          <option value="30">30 Minutes</option>
                          <option value="45">45 Minutes</option>
                          <option value="60">60 Minutes</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="timeFormat" className="text-[#334155] font-medium text-[16px] block">
                          Time Format
                        </Label>
                        <select
                          id="timeFormat"
                          className={selectClass}
                          {...stepThreeForm.register("timeFormat")}
                        >
                          <option>12-Hour</option>
                          <option>24-Hour</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="currency" className="text-[#334155] font-medium text-[16px] block">
                        Default Currency
                      </Label>
                      <select
                        id="currency"
                        className={selectClass}
                        {...stepThreeForm.register("currency")}
                      >
                        <option value="INR (₹)">INR (₹) - Indian Rupee (Default)</option>
                        <option value="USD ($)">USD ($) - US Dollar</option>
                        <option value="EUR (€)">EUR (€) - Euro</option>
                        <option value="GBP (£)">GBP (£) - British Pound</option>
                      </select>
                    </div>

                    <div className="flex gap-6 pt-4 border-t border-white/20 mt-8">
                      <Button
                        type="button"
                        className="w-1/3 h-[56px] rounded-[14px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[17px] transition-all duration-200 flex items-center justify-center gap-1.5"
                        onClick={handlePrevStep}
                        disabled={isLoading}
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                      <Button
                        type="submit"
                        className="w-2/3 h-[56px] rounded-[14px] bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 shadow-md shadow-blue-500/10 font-semibold text-[17px] transition-all duration-200 flex items-center justify-center"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Footer Login Link */}
              <div className="text-center pt-6 border-t border-white/20 mt-8">
                <p className="text-[15px] font-normal text-[#64748B]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-[16px] text-[#2563EB] hover:text-blue-500 hover:underline transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </motion.div>
          ) : (
            /* SUCCESS CARD SCREEN (Centered max-w-md visual overlay) */
            <motion.div
              key="success-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-6">
                <CheckCircle2 className="h-8 w-8 animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Clinic Created Successfully!</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Welcome to **DentPro OS**! Your practice workspace for <span className="font-bold text-slate-800">{clinicData.clinicName}</span> has been provisioned. We've automatically authenticated your owner credentials.
              </p>
              
              <Button
                onClick={() => router.push("/")}
                className="mt-6 w-full h-[56px] bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 shadow-md shadow-blue-500/10 font-semibold text-[17px] transition-all duration-200 rounded-[14px]"
              >
                Go to Dashboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
