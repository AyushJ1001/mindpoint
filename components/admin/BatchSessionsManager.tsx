"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Video } from "lucide-react";

import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Draft {
  meetingUrl: string;
  meetingNote: string;
}

export default function BatchSessionsManager({
  courseId,
}: {
  courseId: string;
}) {
  const id = courseId as Id<"courses">;
  const batches = useQuery(api.adminCourses.listCourseBatches, {
    courseId: id,
  });
  const setLink = useMutation(api.adminCourses.setBatchMeetingLink);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!batches) return;
    setDrafts((current) => {
      const next = { ...current };
      for (const batch of batches) {
        if (!next[batch._id]) {
          next[batch._id] = {
            meetingUrl: batch.meetingUrl ?? "",
            meetingNote: batch.meetingNote ?? "",
          };
        }
      }
      return next;
    });
  }, [batches]);

  async function save(batchId: string) {
    const draft = drafts[batchId];
    if (!draft) return;
    setSavingId(batchId);
    try {
      await setLink({
        batchId: batchId as Id<"courseBatches">,
        meetingUrl: draft.meetingUrl,
        meetingNote: draft.meetingNote,
      });
      toast.success("Meeting link saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save meeting link",
      );
    } finally {
      setSavingId(null);
    }
  }

  if (batches === undefined) {
    return <p className="text-sm text-slate-500">Loading batches…</p>;
  }

  if (batches.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-slate-500">
          This course has no batches yet. Add a batch first, then set its live
          class link here.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {batches.map((batch) => {
        const draft = drafts[batch._id] ?? {
          meetingUrl: batch.meetingUrl ?? "",
          meetingNote: batch.meetingNote ?? "",
        };
        return (
          <Card key={batch._id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Video className="h-4 w-4" />
                {batch.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-500">
                {batch.startDate} → {batch.endDate} · {batch.startTime}–
                {batch.endTime} · {batch.daysOfWeek.join(", ") || "No days set"}
              </p>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Live class link (Zoom, Google Meet, etc.)
                </label>
                <Input
                  value={draft.meetingUrl}
                  placeholder="https://zoom.us/j/…"
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [batch._id]: { ...draft, meetingUrl: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Note for learners (optional)
                </label>
                <Input
                  value={draft.meetingNote}
                  placeholder="e.g. Join 5 minutes early; recording shared after."
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [batch._id]: { ...draft, meetingNote: event.target.value },
                    }))
                  }
                />
              </div>
              <Button
                type="button"
                onClick={() => save(batch._id)}
                disabled={savingId === batch._id}
              >
                {savingId === batch._id ? "Saving…" : "Save link"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
