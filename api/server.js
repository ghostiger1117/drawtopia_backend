const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(express.json());

const mainRouter = require('./routes');
app.use('/api', mainRouter);

app.get('/', (req, res) => {
  res.send('Drawtopia Backend API');
});

module.exports = app; // ✅ Export the app (no listen)