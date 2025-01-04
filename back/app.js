const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('MOVIE APP!');
});

app.listen(port, () => {
  console.log(`Serverul rulează la http://localhost:${port}`);
});
