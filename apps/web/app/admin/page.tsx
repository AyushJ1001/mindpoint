"use client";

import { useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminDashboardPage() {
  const data = useQuery(api.adminDashboard.getDashboardSummary, {});

  return (
    <div>
      <AdminPageHeader
        title="Operations Dashboard"
        description="High-signal overview for courses, enrollments, and admin activity."
      />

      {!data ? (
        <p className="text-sm text-slate-600">Loading dashboard...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-slate-600">
                  Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>
                  Published: <strong>{data.lifecycleCounts.published}</strong>
                </p>
                <p>
                  Draft: <strong>{data.lifecycleCounts.draft}</strong>
                </p>
                <p>
                  Archived: <strong>{data.lifecycleCounts.archived}</strong>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-slate-600">
                  Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>
                  Active: <strong>{data.statusCounts.active}</strong>
                </p>
                <p>
                  Cancelled: <strong>{data.statusCounts.cancelled}</strong>
                </p>
                <p>
                  Transferred: <strong>{data.statusCounts.transferred}</strong>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-slate-600">Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {data.totalUsersApprox}
                </p>
                <p className="text-xs text-slate-600">
                  Distinct users observed in enrollments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-slate-600">
                  Active Coupons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{data.activeCoupons}</p>
                <p className="text-xs text-slate-600">Unused loyalty coupons</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Urgent Courses (next 7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                {data.urgentCourses.length === 0 ? (
                  <p className="text-sm text-slate-600">No urgent courses.</p>
                ) : (
                  <div className="space-y-2">
                    {data.urgentCourses.map((course) => (
                      <div
                        key={course._id}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{course.name}</p>
                          <p className="text-xs text-slate-600">
                            {course.startDate} • Seats left: {course.seatsLeft}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {course.type || "course"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Admin Actions</CardTitle>
              </CardHeader>
              <CardContent>
                {data.recentAuditLogs.length === 0 ? (
                  <p className="text-sm text-slate-600">No audit events yet.</p>
                ) : (
                  <div className="space-y-2">
                    {data.recentAuditLogs.map((event) => (
                      <div
                        key={event._id}
                        className="rounded-md border p-2 text-sm"
                      >
                        <p className="font-medium">{event.action}</p>
                        <p className="text-xs text-slate-600">
                          {event.entityType} • {event.entityId}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
