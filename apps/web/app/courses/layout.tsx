"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
const courseTypes = [
  { name: "All Courses", href: "/courses", label: "All" },
  { name: "Certificate", href: "/courses/certificate", label: "Certificate" },
  { name: "Internship", href: "/courses/internship", label: "Internship" },
  { name: "Diploma", href: "/courses/diploma", label: "Diploma" },
  {
    name: "Pre-recorded",
    href: "/courses/pre-recorded",
    label: "Pre-recorded",
  },
  { name: "Masterclass", href: "/courses/masterclass", label: "Masterclass" },
  { name: "Therapy", href: "/courses/therapy", label: "Therapy" },
  { name: "Supervised", href: "/courses/supervised", label: "Supervised" },
  {
    name: "Resume Studio",
    href: "/courses/resume-studio",
    label: "Resume Studio",
  },
];

function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="top-16 h-[calc(100svh-4rem)]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Course Types</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {courseTypes.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-clip">
        <AppSidebar />
        <main className="min-w-0 flex-1">
          <div className="border-b border-border bg-secondary/50 shadow-sm backdrop-blur-md">
            <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:px-4">
              <SidebarTrigger className="rounded-xl border border-transparent text-foreground hover:border-lavender-200 hover:bg-accent" />
              <div className="min-w-0">
                <Link href="/courses">
                  <h1 className="font-display truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    Courses
                  </h1>
                </Link>
              </div>
            </div>
          </div>
          <div className="px-3 pt-4 pb-20 sm:px-6 sm:pt-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
