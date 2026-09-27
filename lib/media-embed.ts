/**
 * Resolve a media URL to the right player. The LMS has no video host, so an
 * admin pastes an HTTPS URL into a `media` activity. Google Drive is the free
 * host in use: a Drive *viewer* link will not play in a `<video>` tag, so we
 * turn any Drive link (view, open?id, uc?export=download, docs) into its
 * `/preview` iframe, which streams any size without a paid host.
 */

export type MediaEmbed =
  | { kind: "video"; src: string }
  | { kind: "iframe"; src: string };

const DRIVE_ID_PATTERNS = [
  /drive\.google\.com\/file\/d\/([^/?#]+)/i,
  /drive\.google\.com\/open\?[^#]*\bid=([^&#]+)/i,
  /drive\.google\.com\/uc\?[^#]*\bid=([^&#]+)/i,
  /drive\.usercontent\.google\.com\/download\?[^#]*\bid=([^&#]+)/i,
  /docs\.google\.com\/[^/]+\/d\/([^/?#]+)/i,
];

export function googleDriveFileId(url: string): string | null {
  for (const pattern of DRIVE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function resolveMediaEmbed(url: string): MediaEmbed {
  const driveId = googleDriveFileId(url);
  if (driveId) {
    return {
      kind: "iframe",
      src: `https://drive.google.com/file/d/${driveId}/preview`,
    };
  }
  return { kind: "video", src: url };
}
