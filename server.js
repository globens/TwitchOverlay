
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8080;
const dataFile = path.join(__dirname, "kary.json");

let kary = [];

function loadFromFile() {
  try {
    const raw = fs.readFileSync(dataFile);
    kary = JSON.parse(raw);
  } catch {
    kary = [];
  }
}

function saveToFile() {
  fs.writeFileSync(dataFile, JSON.stringify(kary, null, 2));
}

// Co sekundę aktualizujemy czas
setInterval(() => {
  const now = Date.now();
  let changed = false;

  kary = kary.map(k => {
    if (!k.paused && k.endTime && k.endTime > now) {
      return k;
    }
    if (!k.paused && k.endTime <= now) {
      changed = true;
      return { ...k, endTime: 0 }; // kara się skończyła
    }
    return k;
  });

  if (changed) saveToFile();
}, 1000);

loadFromFile();

app.use(express.static(__dirname));
app.use(express.json());

app.get("/data", (req, res) => {
  res.json(kary);
});

app.post("/save", (req, res) => {
  kary = req.body;
  saveToFile();
  res.send("ok");
});

app.listen(PORT, () => {
  console.log("✅ Serwer działa na http://localhost:" + PORT);
});
