// server.js
const path = require('path');
const express = require('express');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

const publicDir = path.resolve(__dirname, 'public');

// GZIP / Brotli (si está detrás de proxy moderno)
app.use(compression());

// Sirve estáticos desde /public
app.use(express.static(publicDir, {
  extensions: ['html'],                 // /Login -> Login.html
  index: ['Login.html', 'index.html'],  // página por defecto
  fallthrough: true,
  setHeaders: (res, filePath) => {
    // Evitá cache agresivo de HTML mientras desarrollás
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store');
    } else {
      // Cache moderado para assets
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Home explícito (opcional)
app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'Login.html'));
});

// Alias /login (opcional)
app.get('/login', (_req, res) => {
  res.sendFile(path.join(publicDir, 'Login.html'));
});

// 404 elegante (si tenés public/404.html)
app.use((req, res) => {
  const notFound = path.join(publicDir, '404.html');
  res.status(404).sendFile(notFound, (err) => {
    if (err) res.status(404).send('Página no encontrada');
  });
});

app.listen(PORT, () => {
  console.log(`✅ Frontend servido en http://localhost:${PORT}`);
});

