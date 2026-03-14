"use client";

import { useState, useEffect, Suspense } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { BookOpen, Gift, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function AccountLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"enrollments" | "points" | "referrals">(
    (tabParam === "points"
      ? "points"
      : tabParam === "referrals"
        ? "referrals"
        : "enrollments") as "enrollments" | "points" | "referrals",
  );

  useEffect(() => {
    if (tabParam === "points") {
      setActiveTab("points");
    } else if (tabParam === "referrals") {
      setActiveTab("referrals");
    } else {
      setActiveTab("enrollments");
    }
  }, [tabParam]);

  const handleTabChange = (tab: "enrollments" | "points" | "referrals") => {
    setActiveTab(tab);
    router.push(`/account?tab=${tab}`);
  };

  return (
    <>
      <SignedIn>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="text-muted-foreground mt-2">
              Manage your enrollments and Mind Points
            </p>
          </div>

          <div className="flex flex-col gap-6 md:flex-row">
            {/* Sidebar Navigation */}
            <aside className="w-full shrink-0 md:w-64">
              <nav className="space-y-2">
                <Button
                  variant={activeTab === "enrollments" ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    activeTab === "enrollments" &&
                      "bg-primary text-primary-foreground",
                  )}
                  onClick={() => handleTabChange("enrollments")}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  My Enrollments
                </Button>
                <Button
                  variant={activeTab === "points" ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    activeTab === "points" &&
                      "bg-primary text-primary-foreground",
                  )}
                  onClick={() => handleTabChange("points")}
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Mind Points
                </Button>
                <Button
                  variant={activeTab === "referrals" ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    activeTab === "referrals" &&
                      "bg-primary text-primary-foreground",
                  )}
                  onClick={() => handleTabChange("referrals")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Referrals
                </Button>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountLayoutContent>{children}</AccountLayoutContent>
    </Suspense>
  );
}
