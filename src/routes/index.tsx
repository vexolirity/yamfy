import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Yamify — Spotify Downloader Futuristik" },
      { name: "description", content: "Download lagu Spotify gratis, cepat, dan berkelas. UI futuristik bertenaga API neoxr." },
    ],
  }),
});

interface SearchItem {
  title?: string;
  artist?: string;
  artists?: string;
  duration?: string;
  thumbnail?: string;
  image?: string;
  cover?: string;
  url?: string;
  link?: string;
}

interface TrackData {
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
  audioUrl: string;
  spotifyUrl: string;
}

function Index() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [track, setTrack] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState<"search" | "track" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isUrl = (s: string) => /open\.spotify\.com|spotify\.com/.test(s);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTrack(null);
    setResults([]);
    const q = query.trim();
    if (!q) return;
    if (isUrl(q)) {
      await fetchTrack(q);
    } else {
      setLoading("search");
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const j = await r.json();
        if (j.error) throw new Error(j.message);
        setResults(j.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mencari");
      } finally {
        setLoading(null);
      }
    }
  };

  const fetchTrack = async (url: string) => {
    setLoading("track");
    setError(null);
    setResults([]);
    try {
      const r = await fetch(`/api/track?url=${encodeURIComponent(url)}`);
      const j = await r.json();
      if (j.error) throw new Error(j.message);
      setTrack(j.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses track");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="pointer-events-none absolute -left-32 top-20 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-[26rem] w-[26rem] rounded-full bg-secondary/20 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      <div className="pointer-events-none absolute left-1/3 -bottom-40 h-[32rem] w-[32rem] rounded-full bg-accent/15 blur-3xl animate-float" style={{ animationDelay: "6s" }} />

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-10 sm:py-16">
        {/* Nav */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative grid h-11 w-11 place-items-center rounded-xl glass">
              <span className="absolute inset-0 rounded-xl animate-pulse-ring" />
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary" fill="currentColor">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.6 14.5a.7.7 0 01-.95.23c-2.6-1.6-5.86-1.95-9.7-1.07a.7.7 0 11-.3-1.36c4.2-.95 7.83-.55 10.74 1.25.33.2.43.66.21.95zm1.23-2.74a.87.87 0 01-1.2.29c-2.97-1.83-7.5-2.36-11.02-1.3a.87.87 0 11-.5-1.66c4-1.21 9-.62 12.4 1.47.42.26.55.81.32 1.2zm.1-2.86C14.4 8.74 8.4 8.55 5.05 9.56a1.04 1.04 0 11-.6-2c3.86-1.16 10.46-.94 14.6 1.52a1.04 1.04 0 01-1.07 1.78z" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">Yamify<span className="text-primary">.</span></div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Cyber Audio Vault</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full glass px-4 py-2 text-xs sm:flex">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-muted-foreground">API online · neoxr.eu</span>
          </div>
        </header>

        {/* Hero */}
        <section className="mt-14 sm:mt-20 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] text-primary">
            <span>★</span> kerangka bikin cuan <span>★</span>
          </div>
          <h1 className="mt-6 text-5xl sm:text-7xl font-black leading-[0.95] tracking-tight">
            Download <span className="text-gradient-cuan">Spotify</span>
            <br />tanpa drama.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-muted-foreground">
            Tempel link, atau ketik judul lagu. Yamify akan rebahin server-nya buat kamu — gratis, cepat, kualitas studio.
          </p>
        </section>

        {/* Search bar */}
        <form onSubmit={handleAction} className="relative mx-auto mt-10 max-w-2xl">
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-primary/30 via-accent/20 to-secondary/30 blur-xl" />
          <div className="glass flex items-center gap-2 rounded-2xl p-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari lagu atau tempel link Spotify…"
              className="flex-1 bg-transparent px-4 py-3 text-sm sm:text-base outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!!loading}
              className="group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ background: "var(--gradient-cuan)" }}
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
                </svg>
              )}
              <span>{loading === "track" ? "Memuat…" : loading === "search" ? "Mencari…" : "Eksekusi"}</span>
            </button>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span>Coba:</span>
            {["The Weeknd Blinding Lights", "NewJeans Super Shy", "Tulus Hati-hati di Jalan"].map((s) => (
              <button key={s} type="button" onClick={() => setQuery(s)} className="rounded-full glass px-3 py-1 hover:text-primary transition">
                {s}
              </button>
            ))}
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
            ⚠ {error}
          </div>
        )}

        {/* Track result */}
        {track && <TrackCard track={track} />}

        {/* Search results */}
        {results.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-sm uppercase tracking-[0.25em] text-muted-foreground">
              {results.length} hasil ditemukan
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((it, i) => (
                <ResultRow key={i} item={it} onPick={(url) => { setQuery(url); fetchTrack(url); }} />
              ))}
            </div>
          </section>
        )}

        {/* Features */}
        {!track && results.length === 0 && (
          <section className="mt-20 grid gap-5 sm:grid-cols-3">
            {[
              { t: "Studio Quality", d: "Audio MP3 langsung dari source resmi", i: "🎧" },
              { t: "Tanpa Iklan", d: "Murni gratis, no popup, no rugi", i: "✨" },
              { t: "Ngebut", d: "Edge runtime, balas dalam milidetik", i: "⚡" },
            ].map((f) => (
              <div key={f.t} className="glass rounded-2xl p-6 transition hover:border-primary/40 hover:-translate-y-1">
                <div className="mb-3 text-3xl">{f.i}</div>
                <div className="font-semibold">{f.t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{f.d}</div>
              </div>
            ))}
          </section>
        )}

        <footer className="mt-20 text-center text-xs text-muted-foreground">
          Built with cuan · Powered by <span className="text-primary">neoxr.eu</span>
        </footer>
      </div>
    </div>
  );
}

function TrackCard({ track }: { track: TrackData }) {
  return (
    <section className="mx-auto mt-10 max-w-3xl">
      <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8 glow">
        <div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-60"
          style={{ background: "var(--gradient-cuan)", maskImage: "linear-gradient(black, transparent 40%)", WebkitMaskImage: "linear-gradient(black, transparent 40%)" }}
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-primary to-secondary opacity-50 blur-xl" />
            {track.thumbnail ? (
              <img src={track.thumbnail} alt={track.title} className="relative h-44 w-44 rounded-2xl object-cover" />
            ) : (
              <div className="relative grid h-44 w-44 place-items-center rounded-2xl bg-muted">🎵</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-[0.25em] text-primary">Ready to download</div>
            <h3 className="mt-2 text-2xl sm:text-3xl font-bold leading-tight truncate">{track.title}</h3>
            <p className="mt-1 text-muted-foreground truncate">{track.artist}</p>
            <p className="mt-1 text-sm text-muted-foreground">⏱ {track.duration}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={track.audioUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02]"
                style={{ background: "var(--gradient-cuan)" }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
                </svg>
                Download MP3
              </a>
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 text-sm font-medium text-foreground hover:text-primary transition"
              >
                Buka di Spotify
              </a>
            </div>
            <audio controls src={track.audioUrl} className="mt-5 w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultRow({ item, onPick }: { item: SearchItem; onPick: (url: string) => void }) {
  const url = item.url || item.link || "";
  const img = item.thumbnail || item.image || item.cover || "";
  const artist = typeof item.artist === "string" ? item.artist : item.artists || "";
  return (
    <button
      onClick={() => url && onPick(url)}
      className="glass group flex items-center gap-4 rounded-xl p-3 text-left transition hover:border-primary/40 hover:-translate-y-0.5"
    >
      {img ? (
        <img src={img} alt={item.title} className="h-14 w-14 rounded-lg object-cover" />
      ) : (
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-muted">🎵</div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{item.title}</div>
        <div className="truncate text-sm text-muted-foreground">{artist}</div>
      </div>
      <div className="shrink-0 text-xs text-muted-foreground group-hover:text-primary transition">
        {item.duration || "→"}
      </div>
    </button>
  );
}
