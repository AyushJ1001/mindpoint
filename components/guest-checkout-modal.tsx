"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import {
  isPossiblePhoneNumber,
  isValidPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { X } from "lucide-react";

interface GuestCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (userData: { name: string; email: string; phone: string }) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
}

export function GuestCheckoutModal({
  isOpen,
  onClose,
  onProceed,
}: GuestCheckoutModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormData>({
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      onProceed({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
      });
    } catch (error) {
      console.error("Error processing guest checkout:", error);
      toast.error("Failed to process checkout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="mx-4 w-full max-w-md">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-center">Guest Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className={
                  errors.name ? "border-red-500 focus:ring-red-500" : ""
                }
                {...register("name", {
                  required: "Please enter your full name",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters long",
                  },
                  validate: (value) =>
                    value.trim().length > 0 || "Please enter your full name",
                })}
                autoFocus
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className={
                  errors.email ? "border-red-500 focus:ring-red-500" : ""
                }
                {...register("email", {
                  required: "Please enter your email address",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "Please enter your phone number",
                  validate: (value) => {
                    if (!value) {
                      return "Please enter your phone number";
                    }

                    if (!isPossiblePhoneNumber(value)) {
                      return "Please enter a valid phone number";
                    }

                    if (!isValidPhoneNumber(value)) {
                      return "Please enter a valid phone number";
                    }

                    return true;
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    countries={[
                      "IN",
                      "US",
                      "GB",
                      "CA",
                      "AU",
                      "DE",
                      "FR",
                      "JP",
                      "CN",
                      "BR",
                      "MX",
                      "RU",
                      "KR",
                      "IT",
                      "ES",
                      "NL",
                      "SE",
                      "CH",
                      "NO",
                      "DK",
                      "FI",
                      "PL",
                      "CZ",
                      "HU",
                      "RO",
                      "BG",
                      "HR",
                      "SI",
                      "SK",
                      "EE",
                      "LV",
                      "LT",
                      "MT",
                      "CY",
                      "LU",
                      "IE",
                      "PT",
                      "GR",
                      "AT",
                      "BE",
                      "IS",
                      "LI",
                      "MC",
                      "SM",
                      "VA",
                      "AD",
                      "FO",
                      "GI",
                      "JE",
                      "GG",
                      "IM",
                      "AX",
                      "GL",
                      "PM",
                      "YT",
                      "RE",
                      "BL",
                      "MF",
                      "GP",
                      "MQ",
                      "GF",
                      "PF",
                      "NC",
                      "WF",
                      "AI",
                      "AW",
                      "BM",
                      "IO",
                      "VG",
                      "KY",
                      "FK",
                      "TC",
                      "MS",
                      "SH",
                      "AG",
                      "DM",
                      "GD",
                      "LC",
                      "VC",
                      "BB",
                      "TT",
                      "JM",
                      "BZ",
                      "GT",
                      "SV",
                      "HN",
                      "NI",
                      "CR",
                      "PA",
                      "CO",
                      "VE",
                      "EC",
                      "PE",
                      "BO",
                      "PY",
                      "UY",
                      "AR",
                      "CL",
                      "GY",
                      "SR",
                    ]}
                    value={value}
                    onChange={onChange}
                    className={
                      errors.phone
                        ? "rounded-md border border-red-500 px-3 py-2 focus:ring-red-500"
                        : "rounded-md border px-3 py-2"
                    }
                    placeholder="Enter your phone number"
                  />
                )}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Continue to Payment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
