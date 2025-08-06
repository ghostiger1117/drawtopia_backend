const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const port = process.env.PORT | 3000;

app.use(express.json());

const mainRouter = require('./routes');
app.use('/api', mainRouter);

app.get('/', (req, res) => {
  res.send('Drawtopia Backend API');
});

app.listen(port, () => {
  console.log("Server is listening 3000 port");
})

module.exports = app; // ✅ Export the app (no listen)