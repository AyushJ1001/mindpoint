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
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { X, MessageCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (whatsappNumber: string) => void;
  clerkUserId: string;
}

interface FormData {
  whatsappNumber: string;
}

export function WhatsAppModal({
  isOpen,
  onClose,
  onComplete,
  clerkUserId,
}: WhatsAppModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveWhatsappNumber = useMutation(api.myFunctions.saveUserWhatsappNumber);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      whatsappNumber: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      await saveWhatsappNumber({
        clerkUserId,
        whatsappNumber: data.whatsappNumber.trim(),
      });

      toast.success("WhatsApp number saved successfully!");
      onComplete(data.whatsappNumber.trim());
    } catch (error) {
      console.error("Error saving WhatsApp number:", error);
      toast.error("Failed to save WhatsApp number. Please try again.");
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
          <div className="flex items-center justify-center gap-2">
            <MessageCircle className="h-6 w-6 text-green-500" />
            <CardTitle className="text-center">WhatsApp Number</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-center text-sm">
            Please provide your WhatsApp number for important course updates and
            communications.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
              <Controller
                name="whatsappNumber"
                control={control}
                rules={{
                  required: "Please enter your WhatsApp number",
                  validate: (value) => {
                    if (!value) {
                      return "Please enter your WhatsApp number";
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
                      errors.whatsappNumber
                        ? "rounded-md border border-red-500 px-3 py-2 focus:ring-red-500"
                        : "rounded-md border px-3 py-2"
                    }
                    placeholder="Enter your WhatsApp number"
                  />
                )}
              />
              {errors.whatsappNumber && (
                <p className="text-sm text-red-600">
                  {errors.whatsappNumber.message}
                </p>
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
                Skip for now
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Continue"}
              </Button>
            </div>

            <p className="text-muted-foreground text-center text-xs">
              Your WhatsApp number will only be used for course-related
              communications.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


