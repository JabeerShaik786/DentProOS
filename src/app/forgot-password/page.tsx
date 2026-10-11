"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, ArrowLeft, MailCheck, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { createClient } from "@/lib/supabase/client";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordSchemaType) => {
    setIsLoading(true);
    setApiError(null);
    setSubmittedEmail(data.email);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        setApiError(error.message || "Failed to send reset link. Please check the email address.");
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setIsSuccess(true);
      }
    } catch {
      setApiError("A network error occurred. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={!isSuccess ? "Forgot Password?" : ""}
      subtitle={!isSuccess ? "Enter your email address and we'll send you instructions to reset your password." : ""}
    >
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-6"
          >
            <div className="mb-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[16px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {apiError && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-[14px] text-red-750 border border-red-100">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              <div className="space-y-4">
                <Label htmlFor="email" className="text-[#334155] dark:text-slate-300 font-medium text-[16px] block">
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

              <Button
                type="submit"
                className="w-full h-[56px] mt-8 bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 shadow-md shadow-blue-500/10 font-semibold text-[17px] rounded-[14px] flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

            <div className="text-center mt-6 text-[15px] font-normal text-[#64748B]">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-medium text-[16px] text-[#2563EB] hover:text-blue-500 hover:underline transition-colors"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center text-center p-4"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-6 dark:bg-blue-950/30">
              <MailCheck className="h-8 w-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Check Your Email</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed dark:text-slate-400">
              We have sent password reset instructions to:
            </p>
            <p className="text-sm font-bold text-slate-800 mt-1 dark:text-slate-200">{submittedEmail}</p>
            <p className="text-[11px] text-slate-400 mt-5 leading-relaxed dark:text-slate-500">
              Didn't receive the email? Check your spam folder or try again in a few minutes.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
