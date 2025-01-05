const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const port = 3000;

const app = express();

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors())


app.get('/', (req, res) => {
  res.send('MOVIE APP!');
});

app.listen(port, () => {
  console.log(`Serverul rulează la http://localhost:${port}`);
});
