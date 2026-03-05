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
    <Sidebar>
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
          <div className="border-b border-blue-200/65 bg-gradient-to-r from-blue-100/70 via-white/85 to-indigo-100/70 shadow-[0_12px_24px_-20px_rgba(37,99,235,0.95)] backdrop-blur-md dark:border-blue-900/40 dark:from-slate-950/85 dark:via-blue-950/80 dark:to-slate-950/85">
            <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:px-4">
              <SidebarTrigger className="rounded-xl border border-transparent text-blue-900 hover:border-blue-200/80 hover:bg-blue-100/75 dark:text-blue-100 dark:hover:border-blue-800/70 dark:hover:bg-blue-950/70" />
              <div className="min-w-0">
                <Link href="/courses">
                  <h1 className="truncate bg-gradient-to-r from-blue-950 via-blue-800 to-indigo-700 bg-clip-text text-xl font-semibold tracking-tight text-transparent sm:text-2xl dark:from-blue-100 dark:via-blue-200 dark:to-indigo-200">
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
