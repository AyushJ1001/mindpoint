"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Plus, RotateCcw, Save, Trash2 } from "lucide-react";

import { api } from "@/lib/backend/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  SITE_CONTENT_OPTIONS,
  type CbtLandingOverride,
  type ContentFaq,
  type ContentItem,
  type CourseTypeContentOverride,
  type SiteContentOption,
} from "@/lib/site-content";
import { getDefaultCourseTypeContent } from "@/lib/course-type-content";
import { cbtRebtCbmt } from "@/lib/cbt-rebt-cbmt-content";

type EditorValue = CourseTypeContentOverride &
  CbtLandingOverride & {
    whoShouldDo?: {
      title?: string;
      description?: string;
      items?: ContentItem[];
    };
    whoItsFor?: ContentItem[];
  };

function defaultFor(option: SiteContentOption): EditorValue {
  if (option.kind === "courseType") {
    const base = getDefaultCourseTypeContent(option.slug);
    return {
      title: base.title,
      tagline: base.tagline,
      description: base.description,
      proof: [...base.proof],
      painPoints: [...base.painPoints],
      outcomes: [...base.outcomes],
      whoShouldDo: {
        title: base.whoShouldDo.title,
        description: base.whoShouldDo.description,
        items: base.whoShouldDo.items.map((item) => ({ ...item })),
      },
      whyChoose: {
        title: base.whyChoose.title,
        description: base.whyChoose.description,
        items: base.whyChoose.items.map((item) => ({
          title: item.title,
          description: item.description,
        })),
      },
      faqs: base.faqs.map((faq) => ({ ...faq })),
      closing: { ...base.closing },
    };
  }

  return {
    name: cbtRebtCbmt.name,
    eyebrow: cbtRebtCbmt.eyebrow,
    tagline: cbtRebtCbmt.tagline,
    description: cbtRebtCbmt.description,
    proof: [...cbtRebtCbmt.proof],
    painPoints: [...cbtRebtCbmt.painPoints],
    outcomes: [...cbtRebtCbmt.outcomes],
    learningOutcomes: [...cbtRebtCbmt.learningOutcomes],
    whyDifferent: [...cbtRebtCbmt.whyDifferent],
    modules: cbtRebtCbmt.modules.map((module) => ({ ...module })),
    whoItsFor: cbtRebtCbmt.whoItsFor.map((item) => ({ ...item })),
    faqs: cbtRebtCbmt.faqs.map((faq) => ({ ...faq })),
    closing: { ...cbtRebtCbmt.closing },
  };
}

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => stripUndefined(entry)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (entry === undefined) continue;
      out[key] = stripUndefined(entry);
    }
    return out as T;
  }
  return value;
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {multiline ? (
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
        />
      ) : (
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}

function StringListEditor({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...values, ""])}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {values.map((entry, index) => (
          <div key={index} className="flex items-start gap-2">
            <Textarea
              value={entry}
              rows={2}
              onChange={(event) => {
                const next = [...values];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove ${label} item ${index + 1}`}
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {values.length === 0 && (
          <p className="text-xs text-slate-500">No entries yet.</p>
        )}
      </div>
    </div>
  );
}

function ItemListEditor({
  label,
  items,
  onChange,
  withIcon,
}: {
  label: string;
  items: ContentItem[];
  onChange: (items: ContentItem[]) => void;
  withIcon?: boolean;
}) {
  const update = (index: number, patch: Partial<ContentItem>) => {
    const next = items.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    );
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([
              ...items,
              withIcon
                ? { icon: "", title: "", description: "" }
                : { title: "", description: "" },
            ])
          }
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="space-y-2 rounded-md border border-slate-200 p-3"
          >
            <div className="flex items-center gap-2">
              {withIcon && (
                <Input
                  className="w-16"
                  value={item.icon ?? ""}
                  placeholder="🙂"
                  aria-label={`${label} icon ${index + 1}`}
                  onChange={(event) =>
                    update(index, { icon: event.target.value })
                  }
                />
              )}
              <Input
                value={item.title}
                placeholder="Title"
                onChange={(event) =>
                  update(index, { title: event.target.value })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${label} item ${index + 1}`}
                onClick={() =>
                  onChange(items.filter((_, i) => i !== index))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={item.description}
              rows={2}
              placeholder="Description"
              onChange={(event) =>
                update(index, { description: event.target.value })
              }
            />
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-slate-500">No entries yet.</p>
        )}
      </div>
    </div>
  );
}

function FaqListEditor({
  faqs,
  onChange,
}: {
  faqs: ContentFaq[];
  onChange: (faqs: ContentFaq[]) => void;
}) {
  const update = (index: number, patch: Partial<ContentFaq>) => {
    onChange(faqs.map((faq, i) => (i === index ? { ...faq, ...patch } : faq)));
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">FAQs</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...faqs, { question: "", answer: "" }])}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="space-y-2 rounded-md border border-slate-200 p-3"
          >
            <div className="flex items-start gap-2">
              <Input
                value={faq.question}
                placeholder="Question"
                onChange={(event) =>
                  update(index, { question: event.target.value })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove FAQ ${index + 1}`}
                onClick={() => onChange(faqs.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={faq.answer}
              rows={2}
              placeholder="Answer"
              onChange={(event) =>
                update(index, { answer: event.target.value })
              }
            />
          </div>
        ))}
        {faqs.length === 0 && (
          <p className="text-xs text-slate-500">No FAQs yet.</p>
        )}
      </div>
    </div>
  );
}

export default function ContentEditor() {
  const [selectedKey, setSelectedKey] = useState(SITE_CONTENT_OPTIONS[0].key);
  const [initializedKey, setInitializedKey] = useState<string | null>(null);
  const [value, setValue] = useState<EditorValue | null>(null);
  const [saving, setSaving] = useState(false);

  const selected =
    SITE_CONTENT_OPTIONS.find((option) => option.key === selectedKey) ??
    SITE_CONTENT_OPTIONS[0];

  const remote = useQuery(api.siteContent.getSiteContent, {
    key: selected.key,
  });
  const overrides = useQuery(api.siteContent.listSiteContentOverrides, {});
  const saveContent = useMutation(api.siteContent.upsertSiteContent);
  const resetContent = useMutation(api.siteContent.resetSiteContent);

  useEffect(() => {
    if (remote === undefined) return;
    if (initializedKey === selected.key) return;
    setValue((remote as EditorValue | null) ?? defaultFor(selected));
    setInitializedKey(selected.key);
  }, [remote, initializedKey, selected]);

  const customisedKeys = new Set((overrides ?? []).map((row) => row.key));

  const update = (patch: Partial<EditorValue>) => {
    setValue((current) => ({ ...(current ?? {}), ...patch }));
  };

  async function handleSave() {
    if (!value) return;
    setSaving(true);
    try {
      await saveContent({ key: selected.key, data: stripUndefined(value) });
      toast.success("Content saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save content",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    try {
      await resetContent({ key: selected.key });
      setValue(defaultFor(selected));
      toast.success("Reverted to the built-in copy");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reset content",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selected.key}
          onChange={(event) => setSelectedKey(event.target.value)}
          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
        >
          {SITE_CONTENT_OPTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
              {customisedKeys.has(option.key) ? "  •  edited" : ""}
            </option>
          ))}
        </select>
        <span className="text-muted-foreground text-sm">
          {customisedKeys.has(selected.key)
            ? "Showing your edited copy."
            : "Showing the built-in copy."}
        </span>
        <div className="ml-auto flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!customisedKeys.has(selected.key)}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Revert to default
          </Button>
          <Button type="button" onClick={handleSave} disabled={!value || saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {!value ? (
        <p className="text-muted-foreground text-sm">Loading content…</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selected.kind === "cbtLanding" ? (
                <>
                  <Field
                    label="Course name (heading)"
                    value={value.name ?? ""}
                    onChange={(next) => update({ name: next })}
                  />
                  <Field
                    label="Eyebrow label"
                    value={value.eyebrow ?? ""}
                    onChange={(next) => update({ eyebrow: next })}
                  />
                </>
              ) : (
                <Field
                  label="Page title (heading)"
                  value={value.title ?? ""}
                  onChange={(next) => update({ title: next })}
                />
              )}
              <Field
                label="Tagline"
                value={value.tagline ?? ""}
                onChange={(next) => update({ tagline: next })}
              />
              <Field
                label="Description"
                multiline
                value={value.description ?? ""}
                onChange={(next) => update({ description: next })}
              />
              <StringListEditor
                label="Proof points"
                values={value.proof ?? []}
                onChange={(next) => update({ proof: next })}
              />
              <StringListEditor
                label="Pain points"
                values={value.painPoints ?? []}
                onChange={(next) => update({ painPoints: next })}
              />
              <StringListEditor
                label="Outcomes"
                values={value.outcomes ?? []}
                onChange={(next) => update({ outcomes: next })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Body</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {selected.kind === "courseType" ? (
                <>
                  <div className="space-y-3 rounded-md border border-slate-200 p-3">
                    <span className="text-sm font-medium text-slate-700">
                      Who should do it
                    </span>
                    <Field
                      label="Section title"
                      value={value.whoShouldDo?.title ?? ""}
                      onChange={(next) =>
                        update({
                          whoShouldDo: { ...value.whoShouldDo, title: next },
                        })
                      }
                    />
                    <Field
                      label="Section description"
                      multiline
                      value={value.whoShouldDo?.description ?? ""}
                      onChange={(next) =>
                        update({
                          whoShouldDo: {
                            ...value.whoShouldDo,
                            description: next,
                          },
                        })
                      }
                    />
                    <ItemListEditor
                      label="Audience items"
                      withIcon
                      items={value.whoShouldDo?.items ?? []}
                      onChange={(items) =>
                        update({ whoShouldDo: { ...value.whoShouldDo, items } })
                      }
                    />
                  </div>
                  <div className="space-y-3 rounded-md border border-slate-200 p-3">
                    <span className="text-sm font-medium text-slate-700">
                      Why choose us
                    </span>
                    <Field
                      label="Section title"
                      value={value.whyChoose?.title ?? ""}
                      onChange={(next) =>
                        update({
                          whyChoose: { ...value.whyChoose, title: next },
                        })
                      }
                    />
                    <Field
                      label="Section description"
                      multiline
                      value={value.whyChoose?.description ?? ""}
                      onChange={(next) =>
                        update({
                          whyChoose: {
                            ...value.whyChoose,
                            description: next,
                          },
                        })
                      }
                    />
                    <ItemListEditor
                      label="Reason items"
                      items={value.whyChoose?.items ?? []}
                      onChange={(items) =>
                        update({ whyChoose: { ...value.whyChoose, items } })
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  <StringListEditor
                    label="What you'll learn"
                    values={value.learningOutcomes ?? []}
                    onChange={(next) => update({ learningOutcomes: next })}
                  />
                  <ItemListEditor
                    label="Curriculum modules"
                    items={value.modules ?? []}
                    onChange={(next) => update({ modules: next })}
                  />
                  <ItemListEditor
                    label="Who it's for"
                    items={value.whoItsFor ?? []}
                    onChange={(next) => update({ whoItsFor: next })}
                  />
                  <StringListEditor
                    label="Why it's different"
                    values={value.whyDifferent ?? []}
                    onChange={(next) => update({ whyDifferent: next })}
                  />
                </>
              )}

              <FaqListEditor
                faqs={value.faqs ?? []}
                onChange={(next) => update({ faqs: next })}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Closing call to action</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Headline"
                value={value.closing?.headline ?? ""}
                onChange={(next) =>
                  update({ closing: { ...value.closing, headline: next } })
                }
              />
              <Field
                label="Body"
                value={value.closing?.body ?? ""}
                onChange={(next) =>
                  update({ closing: { ...value.closing, body: next } })
                }
              />
              <Field
                label="Primary button label"
                value={value.closing?.primaryLabel ?? ""}
                onChange={(next) =>
                  update({ closing: { ...value.closing, primaryLabel: next } })
                }
              />
              <Field
                label="Primary link (e.g. #courses)"
                value={value.closing?.primaryHref ?? ""}
                onChange={(next) =>
                  update({ closing: { ...value.closing, primaryHref: next } })
                }
              />
              {selected.kind === "cbtLanding" && (
                <Field
                  label="Primary fallback label (when not on sale yet)"
                  value={value.closing?.primaryFallbackLabel ?? ""}
                  onChange={(next) =>
                    update({
                      closing: {
                        ...value.closing,
                        primaryFallbackLabel: next,
                      },
                    })
                  }
                />
              )}
              <Field
                label="Secondary link label"
                value={value.closing?.secondaryLabel ?? ""}
                onChange={(next) =>
                  update({ closing: { ...value.closing, secondaryLabel: next } })
                }
              />
              <Field
                label="Secondary link href"
                value={value.closing?.secondaryHref ?? ""}
                onChange={(next) =>
                  update({ closing: { ...value.closing, secondaryHref: next } })
                }
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
