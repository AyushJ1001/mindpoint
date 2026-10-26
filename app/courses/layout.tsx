"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
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
import { api } from "@/lib/backend/api";

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
    type: "certificate",
    label: "Certificate",
    icon: Award,
  },
  {
    name: "Internship",
    href: "/courses/internship",
    type: "internship",
    label: "Internship",
    icon: Briefcase,
  },
  {
    name: "Diploma",
    href: "/courses/diploma",
    type: "diploma",
    label: "Diploma",
    icon: GraduationCap,
  },
  {
    name: "Intro courses",
    href: "/courses/intro",
    type: "pre-recorded",
    label: "Intro courses",
    icon: CirclePlay,
  },
  {
    name: "Masterclass",
    href: "/courses/masterclass",
    type: "masterclass",
    label: "Masterclass",
    icon: Mic2,
  },
  {
    name: "Worksheets",
    href: "/courses/worksheet",
    type: "worksheet",
    label: "Worksheets",
    icon: FileText,
  },
  {
    name: "Therapy",
    href: "/courses/therapy",
    type: "therapy",
    label: "Therapy",
    icon: HeartHandshake,
  },
  {
    name: "Supervised",
    href: "/courses/supervised",
    type: "supervised",
    label: "Supervised",
    icon: UserCheck,
  },
  {
    name: "Resume Studio",
    href: "/courses/resume-studio",
    type: "resume-studio",
    label: "Resume Studio",
    icon: FileUser,
  },
] as const;

function AppSidebar() {
  const pathname = usePathname();
  const liveTypes = useQuery(api.courses.listLiveCourseTypes, {});
  // Therapy always renders its own page; other categories show only with
  // something on sale. Until the query loads, list everything.
  const visible = courseTypes.filter(
    (item) =>
      !("type" in item) ||
      item.type === "therapy" ||
      liveTypes === undefined ||
      liveTypes.includes(item.type),
  );

  return (
    <Sidebar collapsible="icon" className="top-16 h-[calc(100svh-4rem)]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="tracking-[0.2em] uppercase">
            Course Types
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visible.map((item) => {
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

const STATIC_COURSE_ROUTES = new Set<string>([
  "certificate",
  "internship",
  "diploma",
  "pre-recorded",
  "masterclass",
  "worksheet",
  "therapy",
  "supervised",
  "resume-studio",
  "cbt-rebt-cbmt",
]);

function isCourseDetail(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  return (
    segments[0] === "courses" &&
    segments.length === 2 &&
    !STATIC_COURSE_ROUTES.has(segments[1])
  );
}

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (isCourseDetail(pathname)) {
    return <div className="w-full overflow-x-clip">{children}</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-clip">
        <AppSidebar />
        <main className="min-w-0 flex-1">
          <div className="border-border bg-background/80 border-b border-dashed backdrop-blur-md">
            <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:px-4">
              <SidebarTrigger className="text-foreground hover:border-border hover:bg-accent rounded-xl border border-transparent" />
              <div className="min-w-0">
                <Link href="/courses">
                  <h1 className="text-foreground/70 truncate text-[0.72rem] font-semibold tracking-[0.22em] uppercase">
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
