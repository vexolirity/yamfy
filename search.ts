import { createFileRoute } from "@tanstack/react-router";

const API_KEY = "a7k3m9x2p4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const q = url.searchParams.get("q");
        if (!q || q.trim().length < 2) {
          return new Response(
            JSON.stringify({ error: true, message: "Query minimal 2 karakter" }),
            { status: 400, headers: { "Content-Type": "application/json", ...cors } },
          );
        }
        try {
          const upstream = `https://api.neoxr.eu/api/spotify-search?q=${encodeURIComponent(q)}&apikey=${API_KEY}`;
          const r = await fetch(upstream);
          const data = await r.json();
          const results = data.data || data.result || data.results || [];
          return new Response(
            JSON.stringify({ success: true, data: Array.isArray(results) ? results : [results] }),
            { headers: { "Content-Type": "application/json", ...cors } },
          );
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "unknown";
          return new Response(
            JSON.stringify({ error: true, message: "Gagal mencari", detail: msg }),
            { status: 500, headers: { "Content-Type": "application/json", ...cors } },
          );
        }
      },
    },
  },
});
