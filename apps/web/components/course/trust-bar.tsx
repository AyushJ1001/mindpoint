import { CheckCircle, Shield, Users, Award } from "lucide-react";

export default function TrustBar() {
  return (
    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <CheckCircle className="h-4 w-4" />
        <span>Certified</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Shield className="h-4 w-4" />
        <span>Secure</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Users className="h-4 w-4" />
        <span>Community</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Award className="h-4 w-4" />
        <span>Quality</span>
      </div>
    </div>
  );
}
