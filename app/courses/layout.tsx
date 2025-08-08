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
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="border-b">
            <div className="flex h-16 items-center px-4">
              <SidebarTrigger />
              <div className="ml-4">
                <Link href="/courses">
                  <h1 className="text-2xl font-semibold">Courses</h1>
                </Link>
              </div>
            </div>
          </div>
          <div className="p-6 pb-20">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
