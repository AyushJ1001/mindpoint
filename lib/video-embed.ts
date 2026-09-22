export type VideoEmbed =
  | { type: "iframe"; src: string }
  | { type: "video"; src: string }
  | { type: "link"; src: string };

/**
 * Turn an admin-provided video URL into something embeddable. Supports
 * YouTube (watch/short/embed), Vimeo and direct video files; anything else is
 * shown as a plain link rather than a broken player.
 */
export function resolveVideoEmbed(url: string): VideoEmbed {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      if (id) return { type: "iframe", src: `https://www.youtube.com/embed/${id}` };
    }
    if (host.endsWith("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) {
        return { type: "iframe", src: `https://www.youtube.com/embed/${id}` };
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return { type: "iframe", src: url };
      }
    }
    if (host.endsWith("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) {
        return { type: "iframe", src: `https://player.vimeo.com/video/${id}` };
      }
    }
    if (/\.(mp4|webm|ogg|mov)$/i.test(parsed.pathname)) {
      return { type: "video", src: url };
    }
    return { type: "link", src: url };
  } catch {
    return { type: "link", src: url };
  }
}
