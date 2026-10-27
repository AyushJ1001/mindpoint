"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Download,
  FileText,
  Loader2,
  PlayCircle,
  ShieldCheck,
  Upload,
} from "lucide-react";

type Role = "student" | "faculty" | "admin";

function weekLabel(week?: number | null) {
  return week ? `Week ${week}` : "General";
}

/**
 * One course's materials, recordings and certificate. The server decides what
 * this component may see: a learner gets published rows for a course they are
 * enrolled in, faculty and admins also get drafts and the upload controls.
 */
export function CourseResources({ courseId }: { courseId: Id<"courses"> }) {
  const resources = useQuery(api.lmsCourseContent.getCourseResources, {
    courseId,
  });

  if (resources === undefined) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-10">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your course…
      </div>
    );
  }

  if (resources === null) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            This course is not available on your account.
          </p>
        </CardContent>
      </Card>
    );
  }

  const canManage = resources.role !== "student";

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
          {resources.course.code}
        </p>
        <h1 className="font-display text-3xl tracking-tight">
          {resources.course.name}
        </h1>
        <p className="text-muted-foreground text-sm">
          Notes, recordings and your certificate. Only you and your faculty can
          open these.
        </p>
      </header>

      <Materials
        courseId={courseId}
        role={resources.role}
        materials={resources.materials}
      />

      <Recordings
        courseId={courseId}
        role={resources.role}
        recordings={resources.recordings}
      />

      {canManage ? (
        <CertificateDesk courseId={courseId} />
      ) : (
        <CertificateCard file={resources.certificateFile} />
      )}
    </div>
  );
}

function Materials({
  courseId,
  role,
  materials,
}: {
  courseId: Id<"courses">;
  role: Role;
  materials: Array<{
    _id: Id<"lmsMaterials">;
    title: string;
    week?: number | null;
    fileName: string;
    published: boolean;
  }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-4 w-4" aria-hidden="true" /> Study notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {materials.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No notes have been published yet.
          </p>
        ) : (
          <ul className="divide-border divide-y">
            {materials.map((material) => (
              <li
                key={material._id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-medium">{material.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {weekLabel(material.week)} · {material.fileName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!material.published ? (
                    <Badge variant="outline">Draft</Badge>
                  ) : null}
                  <MaterialDownload materialId={material._id} />
                  {role !== "student" ? (
                    <PublishToggle
                      kind="material"
                      id={material._id}
                      published={material.published}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        {role !== "student" ? <MaterialUpload courseId={courseId} /> : null}
      </CardContent>
    </Card>
  );
}

function MaterialDownload({ materialId }: { materialId: Id<"lmsMaterials"> }) {
  const [requested, setRequested] = useState(false);
  const url = useQuery(
    api.lmsCourseContent.getMaterialUrl,
    requested ? { materialId } : "skip",
  );

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => setRequested(true)}
      disabled={requested && url === undefined}
    >
      <Download className="mr-2 h-4 w-4" aria-hidden="true" />
      {url ? (
        <a href={url} target="_blank" rel="noreferrer">
          Download
        </a>
      ) : (
        "Download"
      )}
    </Button>
  );
}

function MaterialUpload({ courseId }: { courseId: Id<"courses"> }) {
  const generateUploadUrl = useMutation(api.lmsCourseContent.generateUploadUrl);
  const saveMaterial = useMutation(api.lmsCourseContent.saveMaterial);
  const [title, setTitle] = useState("");
  const [week, setWeek] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (publish: boolean) => {
    if (!file) {
      toast.error("Choose a PDF first");
      return;
    }
    setBusy(true);
    try {
      const postUrl = await generateUploadUrl({ courseId });
      const response = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/pdf" },
        body: file,
      });
      if (!response.ok) throw new Error("Upload failed");
      const { storageId } = (await response.json()) as {
        storageId: Id<"_storage">;
      };
      await saveMaterial({
        courseId,
        week: week ? Number(week) : undefined,
        title: title || file.name.replace(/\.pdf$/i, ""),
        fileName: file.name,
        mimeType: file.type,
        storageId,
        published: publish,
      });
      setTitle("");
      setWeek("");
      setFile(null);
      toast.success(publish ? "Notes published" : "Notes saved as draft");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-border space-y-3 rounded border border-dashed p-4">
      <p className="text-sm font-medium">Add notes (PDF)</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="material-title">Title</Label>
          <Input
            id="material-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Week 3 — Working with beliefs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="material-week">Week</Label>
          <Input
            id="material-week"
            inputMode="numeric"
            value={week}
            onChange={(event) => setWeek(event.target.value)}
            placeholder="3"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="material-file">PDF</Label>
          <Input
            id="material-file"
            type="file"
            accept="application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={busy}
          onClick={() => upload(false)}
          variant="outline"
        >
          Save draft
        </Button>
        <Button size="sm" disabled={busy} onClick={() => upload(true)}>
          <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
          Publish notes
        </Button>
      </div>
    </div>
  );
}

function PublishToggle({
  kind,
  id,
  published,
}: {
  kind: "material" | "recording";
  id: Id<"lmsMaterials"> | Id<"lmsRecordings">;
  published: boolean;
}) {
  const setMaterialPublished = useMutation(
    api.lmsCourseContent.setMaterialPublished,
  );
  const setRecordingPublished = useMutation(
    api.lmsCourseContent.setRecordingPublished,
  );
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      if (kind === "material") {
        await setMaterialPublished({
          materialId: id as Id<"lmsMaterials">,
          published: !published,
        });
      } else {
        await setRecordingPublished({
          recordingId: id as Id<"lmsRecordings">,
          published: !published,
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button size="sm" variant="ghost" disabled={busy} onClick={toggle}>
      {published ? "Unpublish" : "Publish"}
    </Button>
  );
}

function Recordings({
  courseId,
  role,
  recordings,
}: {
  courseId: Id<"courses">;
  role: Role;
  recordings: Array<{
    _id: Id<"lmsRecordings">;
    sessionLabel: string;
    week?: number | null;
    driveUrl: string;
    published: boolean;
  }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PlayCircle className="h-4 w-4" aria-hidden="true" /> Recordings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recordings.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No recordings have been published yet.
          </p>
        ) : (
          <ul className="divide-border divide-y">
            {recordings.map((recording) => (
              <li
                key={recording._id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-medium">{recording.sessionLabel}</p>
                  <p className="text-muted-foreground text-xs">
                    {weekLabel(recording.week)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!recording.published ? (
                    <Badge variant="outline">Draft</Badge>
                  ) : null}
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={recording.driveUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Watch
                    </a>
                  </Button>
                  {role !== "student" ? (
                    <PublishToggle
                      kind="recording"
                      id={recording._id}
                      published={recording.published}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        {role !== "student" ? <RecordingUpload courseId={courseId} /> : null}
      </CardContent>
    </Card>
  );
}

function RecordingUpload({ courseId }: { courseId: Id<"courses"> }) {
  const saveRecording = useMutation(api.lmsCourseContent.saveRecording);
  const [label, setLabel] = useState("");
  const [week, setWeek] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (publish: boolean) => {
    setBusy(true);
    try {
      await saveRecording({
        courseId,
        sessionLabel: label,
        week: week ? Number(week) : undefined,
        driveUrl: url,
        published: publish,
      });
      setLabel("");
      setWeek("");
      setUrl("");
      toast.success(publish ? "Recording published" : "Recording saved as draft");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-border space-y-3 rounded border border-dashed p-4">
      <p className="text-sm font-medium">Add a recording</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="recording-label">Session</Label>
          <Input
            id="recording-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Week 2, session 2"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="recording-week">Week</Label>
          <Input
            id="recording-week"
            inputMode="numeric"
            value={week}
            onChange={(event) => setWeek(event.target.value)}
            placeholder="2"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="recording-url">Google Drive link</Label>
          <Input
            id="recording-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://drive.google.com/…"
          />
        </div>
      </div>
      <p className="text-muted-foreground text-xs">
        Share the Drive file with the course Google account only. An unlisted
        link is not access control.
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => submit(false)}
        >
          Save draft
        </Button>
        <Button size="sm" disabled={busy} onClick={() => submit(true)}>
          Publish recording
        </Button>
      </div>
    </div>
  );
}

function CertificateCard({
  file,
}: {
  file: { _id: Id<"lmsCertificateFiles">; fileName: string; uploadedAt: number } | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" /> My certificate
        </CardTitle>
      </CardHeader>
      <CardContent>
        {file ? (
          <CertificateDownload fileId={file._id} fileName={file.fileName} />
        ) : (
          <p className="text-muted-foreground text-sm">
            Your certificate will appear here once your faculty issues it.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function CertificateDownload({
  fileId,
  fileName,
}: {
  fileId: Id<"lmsCertificateFiles">;
  fileName: string;
}) {
  const [requested, setRequested] = useState(false);
  const url = useQuery(
    api.lmsCourseContent.getCertificateFileUrl,
    requested ? { fileId } : "skip",
  );
  return (
    <Button size="sm" variant="outline" onClick={() => setRequested(true)}>
      <Download className="mr-2 h-4 w-4" aria-hidden="true" />
      {url ? (
        <a href={url} target="_blank" rel="noreferrer">
          {fileName}
        </a>
      ) : (
        fileName
      )}
    </Button>
  );
}

function CertificateDesk({ courseId }: { courseId: Id<"courses"> }) {
  const rows = useQuery(api.lmsCourseContent.listCertificatesForCourse, {
    courseId,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Certificates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows === undefined ? (
          <p className="text-muted-foreground text-sm">Loading students…</p>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No enrolments on this course yet.
          </p>
        ) : (
          <ul className="divide-border divide-y">
            {rows.map((row) => (
              <li
                key={row.enrollmentId}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-medium">
                    {row.userName ?? "Student"} · {row.enrollmentNumber}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {row.certificate
                      ? `Issued: ${row.certificate.fileName}`
                      : "No certificate yet"}
                  </p>
                </div>
                <CertificateUpload
                  enrollmentId={row.enrollmentId}
                  hasFile={Boolean(row.certificate)}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function CertificateUpload({
  enrollmentId,
  hasFile,
}: {
  enrollmentId: Id<"enrollments">;
  hasFile: boolean;
}) {
  const generateCertificateUploadUrl = useMutation(
    api.lmsCourseContent.generateCertificateUploadUrl,
  );
  const uploadCertificateFile = useMutation(
    api.lmsCourseContent.uploadCertificateFile,
  );
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!file) {
      toast.error("Choose the student's certificate PDF");
      return;
    }
    setBusy(true);
    try {
      const postUrl = await generateCertificateUploadUrl({ enrollmentId });
      const response = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/pdf" },
        body: file,
      });
      if (!response.ok) throw new Error("Upload failed");
      const { storageId } = (await response.json()) as {
        storageId: Id<"_storage">;
      };
      await uploadCertificateFile({
        enrollmentId,
        storageId,
        fileName: file.name,
      });
      setFile(null);
      toast.success("Certificate published to the student's account");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="file"
        accept="application/pdf"
        className="max-w-[220px]"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      <Button size="sm" disabled={busy} onClick={submit}>
        {hasFile ? "Replace" : "Upload"}
      </Button>
    </div>
  );
}
