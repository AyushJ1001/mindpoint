"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Briefcase,
  CirclePlay,
  FileUser,
  GraduationCap,
  LayoutGrid,
  Mic2,
  UserCheck,
  HeartHandshake,
} from "lucide-react";
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
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const courseTypes = [
  {
    name: "All Courses",
    href: "/courses",
    label: "All",
    icon: LayoutGrid,
  },
  {
    name: "Certificate",
    href: "/courses/certificate",
    label: "Certificate",
    icon: Award,
  },
  {
    name: "Internship",
    href: "/courses/internship",
    label: "Internship",
    icon: Briefcase,
  },
  {
    name: "Diploma",
    href: "/courses/diploma",
    label: "Diploma",
    icon: GraduationCap,
  },
  {
    name: "Pre-recorded",
    href: "/courses/pre-recorded",
    label: "Pre-recorded",
    icon: CirclePlay,
  },
  {
    name: "Masterclass",
    href: "/courses/masterclass",
    label: "Masterclass",
    icon: Mic2,
  },
  {
    name: "Therapy",
    href: "/courses/therapy",
    label: "Therapy",
    icon: HeartHandshake,
  },
  {
    name: "Supervised",
    href: "/courses/supervised",
    label: "Supervised",
    icon: UserCheck,
  },
  {
    name: "Resume Studio",
    href: "/courses/resume-studio",
    label: "Resume Studio",
    icon: FileUser,
  },
] as const;

function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="top-16 h-[calc(100svh-4rem)]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Course Types</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {courseTypes.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.name}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
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
          <div className="border-border bg-secondary/50 border-b shadow-sm backdrop-blur-md">
            <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:px-4">
              <SidebarTrigger className="text-foreground hover:border-lavender-200 hover:bg-accent rounded-xl border border-transparent" />
              <div className="min-w-0">
                <Link href="/courses">
                  <h1 className="font-display text-foreground truncate text-xl font-semibold tracking-tight sm:text-2xl">
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
