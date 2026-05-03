const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.NEOXR_API_KEY || "a7k3m9x2p4";

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "..")));

// ========== ERROR HANDLER SPESIFIK ==========

// Search lagu dengan error detail
app.get("/api/search", async (req, res) => {
  const q = req.query.q;
  
  if (!q) {
    return res.status(400).json({ 
      error: true,
      message: "Query 'q' diperlukan.",
      code: "MISSING_QUERY"
    });
  }

  try {
    const url = `https://api.neoxr.eu/api/spotify-search?q=${encodeURIComponent(q)}&apikey=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: true,
        message: `API Spotify error: ${response.status} ${response.statusText}`,
        code: "API_ERROR",
        status: response.status
      });
    }
    
    const data = await response.json();
    
    // Cek apakah data dari API mengandung error
    if (data.error || data.status === false) {
      return res.status(400).json({
        error: true,
        message: data.message || "API mengembalikan error",
        code: "API_RETURNED_ERROR",
        detail: data
      });
    }
    
    res.json(data);
    
  } catch (err) {
    res.status(500).json({ 
      error: true,
      message: "Gagal mencari lagu.",
      code: "FETCH_ERROR",
      detail: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
});

// Get track dengan error detail
app.get("/api/track", async (req, res) => {
  const trackUrl = req.query.url;
  
  if (!trackUrl) {
    return res.status(400).json({ 
      error: true,
      message: "Query 'url' diperlukan.",
      code: "MISSING_URL"
    });
  }

  // Validasi URL Spotify
  const spotifyRegex = /^(https?:\/\/)?(open\.spotify\.com|spotify\.com)\/(track|playlist|album)\/[a-zA-Z0-9]+/;
  if (!spotifyRegex.test(trackUrl)) {
    return res.status(400).json({
      error: true,
      message: "URL tidak valid. Harus URL Spotify (track, playlist, atau album).",
      code: "INVALID_SPOTIFY_URL"
    });
  }

  try {
    const url = `https://api.neoxr.eu/api/spotify?url=${encodeURIComponent(trackUrl)}&apikey=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: true,
        message: `API Spotify error: ${response.status} ${response.statusText}`,
        code: "API_ERROR",
        status: response.status
      });
    }
    
    const data = await response.json();
    
    // Cek apakah data dari API mengandung error
    if (data.error || data.status === false) {
      return res.status(400).json({
        error: true,
        message: data.message || "API mengembalikan error",
        code: "API_RETURNED_ERROR",
        detail: data
      });
    }
    
    // Cek apakah ada download URL
    if (!data.data || !data.data.link) {
      return res.status(404).json({
        error: true,
        message: "Link download tidak ditemukan.",
        code: "DOWNLOAD_LINK_NOT_FOUND"
      });
    }
    
    res.json(data);
    
  } catch (err) {
    res.status(500).json({ 
      error: true,
      message: "Gagal mengambil track.",
      code: "FETCH_ERROR",
      detail: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
});

// ========== GLOBAL ERROR HANDLER ==========
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: `Endpoint ${req.method} ${req.path} tidak ditemukan`,
    code: "ENDPOINT_NOT_FOUND"
  });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: true,
    message: "Terjadi kesalahan pada server.",
    code: "INTERNAL_SERVER_ERROR",
    detail: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Handle semua request non-API ke index.html
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "..", "index.html"), (err) => {
    if (err) {
      res.status(404).json({
        error: true,
        message: "File index.html tidak ditemukan",
        code: "INDEX_HTML_NOT_FOUND"
      });
    }
  });
});

// Export untuk Vercel
module.exports = app;

// Untuk running lokal
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Yamify backend berjalan di http://localhost:${PORT}`);
  });
}
