const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.NEOXR_API_KEY || "a7k3m9x2p4";

app.use(cors());
app.use(express.json());

// Serve frontend from root folder
app.use(express.static(path.join(__dirname, "..")));

// ========== LOGGER ==========
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ========== SEARCH ENDPOINT ==========
app.get("/api/search", async (req, res) => {
  const q = req.query.q;
  
  if (!q) {
    return res.status(400).json({ 
      error: true,
      message: "Query 'q' tidak boleh kosong",
      code: "MISSING_QUERY",
      hint: "Masukkan judul lagu atau nama artis"
    });
  }

  if (q.length < 2) {
    return res.status(400).json({
      error: true,
      message: "Query terlalu pendek",
      code: "QUERY_TOO_SHORT",
      hint: "Minimal 2 karakter"
    });
  }

  try {
    const url = `https://api.neoxr.eu/api/spotify-search?q=${encodeURIComponent(q)}&apikey=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: true,
        message: `API Spotify error: ${response.status}`,
        code: "API_ERROR",
        status: response.status
      });
    }
    
    const data = await response.json();
    
    if (data.error || data.status === false) {
      return res.status(400).json({
        error: true,
        message: data.message || "API mengembalikan error",
        code: "API_RETURNED_ERROR",
        detail: data
      });
    }
    
    const results = data.result || data.data || data.results || data;
    if (!results || (Array.isArray(results) && results.length === 0)) {
      return res.status(404).json({
        error: true,
        message: "Tidak ada hasil ditemukan",
        code: "NO_RESULTS",
        suggestion: "Coba dengan kata kunci lain"
      });
    }
    
    res.json({
      success: true,
      count: Array.isArray(results) ? results.length : 1,
      data: results
    });
    
  } catch (err) {
    res.status(500).json({ 
      error: true,
      message: "Gagal mencari lagu",
      code: "FETCH_ERROR",
      detail: err.message,
      suggestion: "Periksa koneksi internet atau coba lagi nanti"
    });
  }
});

// ========== TRACK ENDPOINT ==========
app.get("/api/track", async (req, res) => {
  const trackUrl = req.query.url;
  
  if (!trackUrl) {
    return res.status(400).json({ 
      error: true,
      message: "URL Spotify tidak boleh kosong",
      code: "MISSING_URL",
      hint: "Masukkan link Spotify yang valid"
    });
  }

  const spotifyRegex = /^(https?:\/\/)?(open\.spotify\.com|spotify\.com)\/(track|playlist|album)\/[a-zA-Z0-9]+/;
  if (!spotifyRegex.test(trackUrl)) {
    return res.status(400).json({
      error: true,
      message: "URL Spotify tidak valid",
      code: "INVALID_SPOTIFY_URL",
      hint: "Contoh: https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
      suggestion: "Pastikan URL dari tombol share Spotify"
    });
  }

  try {
    const url = `https://api.neoxr.eu/api/spotify?url=${encodeURIComponent(trackUrl)}&apikey=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: true,
        message: `API Spotify error: ${response.status}`,
        code: "API_ERROR",
        status: response.status
      });
    }
    
    const data = await response.json();
    
    if (data.error || data.status === false) {
      return res.status(400).json({
        error: true,
        message: data.message || "Gagal mengambil track",
        code: "API_RETURNED_ERROR",
        detail: data
      });
    }
    
    const track = data.result || data.data || data;
    const audioUrl = track.url || track.download_url || track.audio || track.mp3;
    
    if (!audioUrl) {
      return res.status(404).json({
        error: true,
        message: "Link download tidak ditemukan",
        code: "DOWNLOAD_LINK_NOT_FOUND",
        suggestion: "Coba track lain atau periksa kembali URL"
      });
    }
    
    res.json({
      success: true,
      data: {
        title: track.title || track.name || "Unknown",
        artist: track.artist || track.artists || "Unknown Artist",
        duration: track.duration || "0:00",
        thumbnail: track.thumbnail || track.image || track.cover || "",
        audioUrl: audioUrl,
        spotifyUrl: trackUrl
      }
    });
    
  } catch (err) {
    res.status(500).json({ 
      error: true,
      message: "Gagal memproses track",
      code: "FETCH_ERROR",
      detail: err.message,
      suggestion: "Coba lagi nanti atau periksa URL"
    });
  }
});

// ========== HEALTH CHECK ==========
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "3.0.0",
    uptime: process.uptime()
  });
});

// ========== 404 HANDLER ==========
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({
      error: true,
      message: `Endpoint ${req.method} ${req.path} tidak ditemukan`,
      code: "ENDPOINT_NOT_FOUND",
      availableEndpoints: ["GET /api/search?q=", "GET /api/track?url=", "GET /api/health"]
    });
  }
});

// ========== GLOBAL ERROR HANDLER ==========
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: true,
    message: "Terjadi kesalahan internal server",
    code: "INTERNAL_SERVER_ERROR",
    suggestion: "Coba refresh halaman atau coba lagi nanti"
  });
});

// Handle SPA routing
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Export for Vercel
module.exports = app;

// Local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`✨ Yamify backend running at http://localhost:${PORT}`);
    console.log(`📀 API Ready - Search | Download | Stream`);
  });
}
