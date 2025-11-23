const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '30mb' }));
// Serve static files (index.html at repo root will be served)
app.use(express.static(path.join(__dirname)));

const finalsDir = path.join(__dirname, 'finales');
if (!fs.existsSync(finalsDir)) fs.mkdirSync(finalsDir);

app.post('/save-image', (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'No imageBase64 provided' });
  const matches = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) return res.status(400).json({ error: 'Invalid data URL' });
  const ext = matches[1].split('/')[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');
  const filename = `final_${Date.now()}.${ext}`;
  const filepath = path.join(finalsDir, filename);
  fs.writeFile(filepath, buffer, (err) => {
    if (err) { console.error('Error saving file', err); return res.status(500).json({ error: 'Failed to save' }); }
    res.json({ ok: true, url: `/finales/${filename}` });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));