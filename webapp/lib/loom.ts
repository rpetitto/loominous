import { extractLoomId, formatDuration } from "./utils";
import type { LoomMeta } from "./types";

export async function fetchLoomMeta(url: string): Promise<LoomMeta> {
  const videoId = extractLoomId(url);
  if (!videoId) throw new Error("Invalid Loom URL");

  const oembedUrl = `https://www.loom.com/v1/oembed?url=${encodeURIComponent(url)}&maxwidth=800`;

  const res = await fetch(oembedUrl, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(
      `Could not fetch Loom metadata (${res.status}). Make sure the video is publicly accessible.`
    );
  }

  const data = await res.json();

  return {
    title: data.title ?? "Untitled Loom",
    author: data.author_name ?? "Unknown",
    duration: formatDuration(data.duration),
    thumbnail:
      data.thumbnail_url ??
      `https://cdn.loom.com/sessions/thumbnails/${videoId}-00001.gif`,
    videoUrl: url,
    videoId,
  };
}
