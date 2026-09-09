"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Award,
  Briefcase,
  CirclePlay,
  FileText,
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
  { name: "All Programs", href: "/courses", label: "All", icon: LayoutGrid },
  { name: "Certificate Courses", href: "/courses/certificate", label: "Certificates", icon: Award },
  { name: "Internship Programs", href: "/courses/internship", label: "Internships", icon: Briefcase },
  { name: "Diploma Programs", href: "/courses/diploma", label: "Diplomas", icon: GraduationCap },
  { name: "Pre-recorded Courses", href: "/courses/pre-recorded", label: "Self-paced", icon: CirclePlay },
  { name: "Masterclasses", href: "/courses/masterclass", label: "Masterclasses", icon: Mic2 },
  { name: "Worksheets", href: "/courses/worksheet", label: "Worksheets", icon: FileText },
  { name: "Therapy Sessions", href: "/courses/therapy", label: "Therapy", icon: HeartHandshake },
  { name: "Supervised Programs", href: "/courses/supervised", label: "Supervision", icon: UserCheck },
  { name: "Resume Studio", href: "/courses/resume-studio", label: "Resume Studio", icon: FileUser },
] as const;

function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="top-16 h-[calc(100svh-4rem)] border-r border-primary/10"
    >
      <SidebarContent className="bg-[#f8f5ee] dark:bg-[#123533]">
        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className="text-primary/65 px-2 text-[0.68rem] font-semibold tracking-[0.2em] uppercase">
            Explore Programs
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="gap-1.5">
              {courseTypes.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.name}
                      className="rounded-xl px-2.5 py-2 transition-colors data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:bg-[#deebe8] hover:text-[#173f3d] dark:hover:bg-[#245451] dark:hover:text-white"
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
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
  const pathname = usePathname();
  const current = courseTypes.find((item) => item.href === pathname);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-clip">
        <AppSidebar />
        <main className="min-w-0 flex-1">
          <div className="sticky top-16 z-30 border-b border-primary/10 bg-[#faf8f3]/90 shadow-[0_12px_35px_-30px_rgba(15,77,77,0.55)] backdrop-blur-xl dark:bg-[#102f2e]/90">
            <div className="flex min-h-16 items-center gap-3 px-3 py-2.5 sm:px-5">
              <SidebarTrigger className="text-primary hover:bg-[#deebe8] rounded-full border border-primary/10 bg-background/70" />
              <Link href="/courses" className="flex min-w-0 items-center gap-3">
                <Image
                  src="/tmp-botanical-logo.svg"
                  alt=""
                  width={34}
                  height={34}
                  className="hidden h-8 w-8 object-contain sm:block"
                />
                <div className="min-w-0">
                  <p className="text-primary/55 text-[0.62rem] font-semibold tracking-[0.18em] uppercase">
                    The Mind Point Academy
                  </p>
                  <h1 className="font-display text-foreground truncate text-xl font-medium tracking-tight sm:text-2xl">
                    {current?.name ?? "Programs"}
                  </h1>
                </div>
              </Link>
            </div>
          </div>
          <div className="px-3 pt-4 pb-20 sm:px-6 sm:pt-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
