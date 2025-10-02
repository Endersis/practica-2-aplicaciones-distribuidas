
const express = require('express');


const app = express();

const PORT = 3000;

app.get('/temperatura', (req, res) => {
  console.log('¡Recibí una solicitud de temperatura!');


  const min = 15;
  const max = 45;
const temperatura = 42; // Forzamos una temperatura alta


  res.json({ temperatura: temperatura });
});

app.listen(PORT, () => {
  console.log(`Servidor de temperaturas iniciado. Escuchando en http://localhost:${PORT}`);
  console.log(`Punto de acceso para la temperatura: http://localhost:${PORT}/temperatura`);
});