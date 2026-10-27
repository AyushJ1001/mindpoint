"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type Profile = {
  _id: Id<"facultyProfiles">;
  name: string;
  role?: string | null;
  qualifications: string[];
  experience?: string | null;
  registrationBody?: string | null;
  registrationNumber?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  published: boolean;
};

export default function AdminFacultyPage() {
  const profiles = useQuery(api.facultyProfiles.listForAdmin, {});
  const [editing, setEditing] = useState<Profile | null>(null);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Faculty"
        description="Profiles stay unpublished until you add verified qualifications and publish them individually."
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profiles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profiles === undefined ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : profiles.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No profiles yet. Nothing is shown publicly until you publish
                one.
              </p>
            ) : (
              profiles.map((profile) => (
                <div
                  key={profile._id}
                  className="border-border flex items-start justify-between gap-3 border-b py-3 last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {profile.qualifications.join(" · ") || "No qualifications yet"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={profile.published ? "default" : "outline"}>
                      {profile.published ? "Published" : "Unpublished"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(profile as Profile)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <ProfileEditor
          key={editing?._id ?? "new"}
          profile={editing}
          onDone={() => setEditing(null)}
        />
      </div>
    </div>
  );
}

function ProfileEditor({
  profile,
  onDone,
}: {
  profile: Profile | null;
  onDone: () => void;
}) {
  const saveProfile = useMutation(api.facultyProfiles.saveProfile);
  const generatePhotoUploadUrl = useMutation(
    api.facultyProfiles.generatePhotoUploadUrl,
  );

  const [name, setName] = useState(profile?.name ?? "");
  const [role, setRole] = useState(profile?.role ?? "");
  const [qualifications, setQualifications] = useState(
    (profile?.qualifications ?? []).join("\n"),
  );
  const [experience, setExperience] = useState(profile?.experience ?? "");
  const [registrationBody, setRegistrationBody] = useState(
    profile?.registrationBody ?? "",
  );
  const [registrationNumber, setRegistrationNumber] = useState(
    profile?.registrationNumber ?? "",
  );
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [published, setPublished] = useState(profile?.published ?? false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      let photoStorageId: Id<"_storage"> | undefined;
      if (photo) {
        const postUrl = await generatePhotoUploadUrl({});
        const response = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": photo.type || "image/jpeg" },
          body: photo,
        });
        if (!response.ok) throw new Error("Photo upload failed");
        photoStorageId = ((await response.json()) as { storageId: Id<"_storage"> })
          .storageId;
      }

      const result = await saveProfile({
        profileId: profile?._id,
        name,
        role,
        qualifications: qualifications
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        experience,
        registrationBody,
        registrationNumber,
        bio,
        photoStorageId,
        published,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(published ? "Profile published" : "Profile saved unpublished");
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{profile ? "Edit profile" : "New profile"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="faculty-name">Name</Label>
          <Input
            id="faculty-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="faculty-role">Role</Label>
            <Input
              id="faculty-role"
              value={role ?? ""}
              onChange={(event) => setRole(event.target.value)}
              placeholder="Clinical psychologist"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="faculty-photo">Photograph</Label>
            <Input
              id="faculty-photo"
              type="file"
              accept="image/*"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="faculty-qualifications">
            Qualifications (one per line)
          </Label>
          <Textarea
            id="faculty-qualifications"
            rows={3}
            value={qualifications}
            onChange={(event) => setQualifications(event.target.value)}
            placeholder={"M.A. Psychology (…)\nPG Diploma in …"}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="faculty-experience">Experience</Label>
          <Input
            id="faculty-experience"
            value={experience ?? ""}
            onChange={(event) => setExperience(event.target.value)}
            placeholder="12 years of clinical practice"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="faculty-body">Registration body</Label>
            <Input
              id="faculty-body"
              value={registrationBody ?? ""}
              onChange={(event) => setRegistrationBody(event.target.value)}
              placeholder="RCI (where applicable)"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="faculty-number">Registration number</Label>
            <Input
              id="faculty-number"
              value={registrationNumber ?? ""}
              onChange={(event) => setRegistrationNumber(event.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="faculty-bio">Short biography</Label>
          <Textarea
            id="faculty-bio"
            rows={3}
            value={bio ?? ""}
            onChange={(event) => setBio(event.target.value)}
          />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <Checkbox
            checked={published}
            onCheckedChange={(checked) => setPublished(checked === true)}
          />
          <span>
            Publish this profile. Only do this once every detail above has been
            verified; publishing requires at least one qualification.
          </span>
        </label>
        <div className="flex gap-2">
          <Button disabled={busy} onClick={submit}>
            Save
          </Button>
          <Button variant="ghost" disabled={busy} onClick={onDone}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
