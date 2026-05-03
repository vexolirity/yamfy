const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.NEOXR_API_KEY || "a7k3m9x2p4";

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, ".index.html")));

// Search lagu
app.get("/api/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Query 'q' diperlukan." });

  try {
    const url = `https://api.neoxr.eu/api/spotify-search?q=${encodeURIComponent(q)}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal mencari lagu." });
  }
});

// Get track / download URL
app.get("/api/track", async (req, res) => {
  const trackUrl = req.query.url;
  if (!trackUrl) return res.status(400).json({ error: "Query 'url' diperlukan." });

  try {
    const url = `https://api.neoxr.eu/api/spotify?url=${encodeURIComponent(trackUrl)}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil track." });
  }
});

app.listen(PORT, () => {
  console.log(`Yamify backend berjalan di http://localhost:${PORT}`);
});
