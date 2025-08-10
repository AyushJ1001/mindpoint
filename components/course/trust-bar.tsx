"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Users, Award } from "lucide-react";

export default function TrustBar() {
  return (
    <div className="border-primary bg-primary/5 relative overflow-hidden rounded-xl border-2 p-6">
      <div className="bg-primary/20 absolute top-[-50%] right-[-25%] h-64 w-64 rotate-12 rounded-full blur-3xl" />
      <div className="bg-primary/15 absolute bottom-[-50%] left-[-15%] h-56 w-56 -rotate-12 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="bg-background/70 text-foreground ring-primary/20 flex items-center justify-center gap-3 rounded-lg px-4 py-3 shadow-sm ring-2 transition-shadow hover:shadow-md">
            <CheckCircle className="text-primary h-5 w-5" />
            <span className="text-sm font-medium">Certified</span>
          </div>
          <div className="bg-background/70 text-foreground ring-primary/20 flex items-center justify-center gap-3 rounded-lg px-4 py-3 shadow-sm ring-2 transition-shadow hover:shadow-md">
            <Shield className="text-primary h-5 w-5" />
            <span className="text-sm font-medium">Secure</span>
          </div>
          <div className="bg-background/70 text-foreground ring-primary/20 flex items-center justify-center gap-3 rounded-lg px-4 py-3 shadow-sm ring-2 transition-shadow hover:shadow-md">
            <Users className="text-primary h-5 w-5" />
            <span className="text-sm font-medium">Community</span>
          </div>
          <div className="bg-background/70 text-foreground ring-primary/20 flex items-center justify-center gap-3 rounded-lg px-4 py-3 shadow-sm ring-2 transition-shadow hover:shadow-md">
            <Award className="text-primary h-5 w-5" />
            <span className="text-sm font-medium">Quality</span>
          </div>
        </div>
      </div>
    </div>
  );
}
