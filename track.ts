import { createFileRoute } from "@tanstack/react-router";

const API_KEY = "a7k3m9x2p4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/track")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const trackUrl = url.searchParams.get("url");
        if (!trackUrl) {
          return new Response(
            JSON.stringify({ error: true, message: "URL Spotify wajib diisi" }),
            { status: 400, headers: { "Content-Type": "application/json", ...cors } },
          );
        }
        const re = /^(https?:\/\/)?(open\.spotify\.com|spotify\.com)\/(track|playlist|album)\/[a-zA-Z0-9]+/;
        if (!re.test(trackUrl)) {
          return new Response(
            JSON.stringify({ error: true, message: "URL Spotify tidak valid" }),
            { status: 400, headers: { "Content-Type": "application/json", ...cors } },
          );
        }
        try {
          const upstream = `https://api.neoxr.eu/api/spotify?url=${encodeURIComponent(trackUrl)}&apikey=${API_KEY}`;
          const r = await fetch(upstream);
          const data = await r.json();
          const t = data.data || data.result || data;
          const audioUrl = t.url || t.download_url || t.audio || t.mp3;
          if (!audioUrl) {
            return new Response(
              JSON.stringify({ error: true, message: "Link download tidak ditemukan", detail: data }),
              { status: 404, headers: { "Content-Type": "application/json", ...cors } },
            );
          }
          return new Response(
            JSON.stringify({
              success: true,
              data: {
                title: t.title || t.name || "Unknown",
                artist: t.artist || t.artists || "Unknown Artist",
                duration: t.duration || "—",
                thumbnail: t.thumbnail || t.image || t.cover || "",
                audioUrl,
                spotifyUrl: trackUrl,
              },
            }),
            { headers: { "Content-Type": "application/json", ...cors } },
          );
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "unknown";
          return new Response(
            JSON.stringify({ error: true, message: "Gagal memproses track", detail: msg }),
            { status: 500, headers: { "Content-Type": "application/json", ...cors } },
          );
        }
      },
    },
  },
});
