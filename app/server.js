import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import apiRouter from './router';

// DB Setup
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/quantiteam';
mongoose.connect(mongoURI, { useMongoClient: true });

// set mongoose promises to es6 default
mongoose.Promise = global.Promise;

// initialize
const app = express();

const whitelist = [
  'https://quantiteam.com',
  'https://www.quantiteam.com',
  'https://staging.quantiteam.com',
  'https://www.staging.quantiteam.com',
  'http://localhost:7070',
  'http://127.0.0.1:7070',
  'https://d261cgekh3xv5v.cloudfront.net',
];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('This request was blocked by CORS due to an unapproved origin domain'));
    }
  },
};

app.use(cors(corsOptions));

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// prefix all routes with '/api'
app.use('/api', apiRouter);

// default index route
app.get('/', (req, res) => {
  res.send('This is the Quantiteam API');
});

module.exports = app;

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
app.listen(port);

console.log(`listening on: ${port}`);
