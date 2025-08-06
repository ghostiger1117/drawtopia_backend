const serverless = require('serverless-http');
const app = require('./server'); // load your real app

module.exports.handler = serverless(app); 