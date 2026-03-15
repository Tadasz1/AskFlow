/**
 * Backend entry point. Express app with CORS, JSON body parsing, and API routes.
 * Connects to MongoDB then starts listening on PORT.
 */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./src/routes/authRoutes');
const questionRoutes = require('./src/routes/questionRoutes');
const answerRoutes = require('./src/routes/answerRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check / root
app.get('/', (req, res) => {
  res.json({ message: 'Forum API running' });
});

// Mount API routes under /api
app.use('/api', authRoutes);
app.use('/api', questionRoutes);
app.use('/api', answerRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/forum_app';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

