import ContentEditor from "@/components/admin/ContentEditor";

export const metadata = {
  title: "Content - MindPoint Admin",
};

export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Storefront content
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Edit the marketing copy shown on the course category pages and the CBT
          landing page. Saving writes straight to Convex. Course category pages
          subscribe live, so edits appear as soon as a visitor loads the page;
          the CBT landing page refreshes within about a minute.
        </p>
      </div>
      <ContentEditor />
    </div>
  );
}
