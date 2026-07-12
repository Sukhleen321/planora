import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Planora API is running' });
});



// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
