const express = require('express');
const app = express();
const dotenv = require('dotenv');
const serverless = require('serverless-http');

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(express.json());

const mainRouter = require('./src/routes');

app.use('/api', mainRouter);

app.get('/', (req, res) => {
  res.send('Drawtopia Backend API');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default serverless(app);