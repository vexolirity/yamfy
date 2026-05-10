// api/index.js (moved from backend/index.js and fixed)
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const API_KEY = process.env.NEOXR_API_KEY || "a7k3m9x2p4";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Search endpoint
app.get("/api/search", async (req, res) => {
  const q = req.query.q?.trim();
  
  if (!q || q.length < 2) {
    return res.status(400).json({ 
      error: "Query minimal 2 karakter",
      results: [] 
    });
  }

  try {
    const url = `https://api.neoxr.eu/api/spotify-search?q=${encodeURIComponent(q)}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    let results = data.result || data.data || [];
    if (!Array.isArray(results)) results = [];
    
    const formatted = results.map(item => ({
      id: item.id || Math.random().toString(),
      title: item.title || item.name || "Unknown",
      artist: item.artist || item.artists || "Unknown",
      duration: item.duration || "3:30",
      cover: item.thumbnail || item.image || "",
      url: item.url || item.link || ""
    }));
    
    res.json({ results: formatted });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Gagal mencari lagu", results: [] });
  }
});

// Track endpoint
app.get("/api/track", async (req, res) => {
  const url = req.query.url;
  
  if (!url || !url.includes("spotify.com/track/")) {
    return res.status(400).json({ error: "URL Spotify tidak valid" });
  }

  try {
    const apiUrl = `https://api.neoxr.eu/api/spotify?url=${encodeURIComponent(url)}&apikey=${API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    const track = data.result || data.data;
    if (!track || !track.url) {
      return res.status(404).json({ error: "Track tidak ditemukan" });
    }
    
    res.json({
      title: track.title || "Unknown",
      artist: track.artist || "Unknown Artist",
      duration: track.duration || "0:00",
      cover: track.thumbnail || "",
      audioUrl: track.url
    });
  } catch (err) {
    console.error("Track error:", err);
    res.status(500).json({ error: "Gagal mengambil track" });
  }
});

// SPA fallback
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Endpoint tidak ditemukan" });
  }
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

module.exports = app;
