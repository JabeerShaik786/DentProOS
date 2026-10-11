"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

// Zod Validation Schema
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          setApiError("Invalid email or password. Please try again.");
        } else {
          setApiError("An authentication error occurred. Please check your credentials.");
        }
        setIsLoading(false);
      } else {
        setIsSuccess(true);
        setIsLoading(false);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1800);
      }
    } catch {
      setApiError("A network error occurred. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={!isSuccess ? "Welcome Back" : ""}
      subtitle={!isSuccess ? "Sign in to access your account." : ""}
    >
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {apiError && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-[14px] text-red-750 border border-red-100">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-4">
                <Label htmlFor="email" className="text-[#334155] dark:text-slate-350 font-medium text-[16px] block">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-[18px] top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@dentproos.com"
                    className={`h-[56px] pl-[52px] pr-[18px] rounded-[14px] bg-white/22 border text-[17px] font-normal text-[#0F172A] placeholder-[#64748B] ${
                      errors.email
                        ? "border-red-400 focus-visible:ring-4 focus-visible:ring-red-455/10 focus-visible:border-red-400"
                        : "border-white/28 focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500"
                    }`}
                    disabled={isLoading}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-650 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#334155] dark:text-slate-300 font-medium text-[16px] block">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-[16px] font-medium text-[#2563EB] hover:text-blue-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-[18px] top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`h-[56px] pl-[52px] pr-[50px] rounded-[14px] bg-white/22 border text-[17px] font-normal text-[#0F172A] placeholder-[#64748B] ${
                      errors.password
                        ? "border-red-400 focus-visible:ring-4 focus-visible:ring-red-455/10 focus-visible:border-red-400"
                        : "border-white/28 focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500"
                    }`}
                    disabled={isLoading}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[18px] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 focus:outline-none"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-655 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2.5 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                  disabled={isLoading}
                  {...register("rememberMe")}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-medium text-slate-500 cursor-pointer select-none dark:text-slate-400"
                >
                  Remember this clinic browser
                </Label>
              </div>

              {/* Sign In Action */}
              <Button
                type="submit"
                className="w-full h-[56px] mt-8 bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 shadow-md shadow-blue-500/10 font-semibold text-[17px] rounded-[14px] flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center text-center py-4 px-2"
          >
            {/* Green Success Circle with Smooth Animated SVG Checkmark */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-6 border border-emerald-500/20 dark:bg-emerald-950/40 dark:border-emerald-500/30"
            >
              <svg
                className="h-10 w-10 text-emerald-600 dark:text-emerald-400 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.18 }}
                />
              </svg>
            </motion.div>

            {/* Title */}
            <motion.h3
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.22 }}
              className="text-[26px] sm:text-[30px] font-bold text-[#0F172A] dark:text-white tracking-[-0.02em] leading-tight"
            >
              Authentication Successful
            </motion.h3>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.3 }}
              className="text-[16px] sm:text-[17px] font-normal text-[#64748B] dark:text-slate-400 mt-3 leading-[1.6] max-w-sm"
            >
              Redirecting you to the DentPro OS clinical workspace...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
