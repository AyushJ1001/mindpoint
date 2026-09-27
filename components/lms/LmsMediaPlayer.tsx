import { resolveMediaEmbed } from "@/lib/media-embed";

/**
 * Plays a `media` activity. Google Drive links render as an embedded preview
 * iframe (they will not play in a `<video>`); everything else is a plain video.
 */
export function LmsMediaPlayer({ url, title }: { url: string; title: string }) {
  const embed = resolveMediaEmbed(url);

  if (embed.kind === "iframe") {
    return (
      <div className="lms-live-media">
        <iframe
          src={embed.src}
          title={title || "Course video"}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="aspect-video w-full rounded-lg border"
        />
      </div>
    );
  }

  return (
    <div className="lms-live-media">
      <video
        controls
        preload="metadata"
        src={embed.src}
        className="w-full rounded-lg border"
      >
        Your browser cannot play this video.{" "}
        <a href={embed.src} target="_blank" rel="noreferrer">
          Open it in a new tab
        </a>
        .
      </video>
    </div>
  );
}
