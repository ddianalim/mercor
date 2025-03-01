import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Candidate from './models/Candidate';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Basic route
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find({});
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

app.post('/api/hire', async (req, res) => {
  try {
    const { selectedCandidates } = req.body;
    // Add logic to store selected candidates
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process hiring' });
  }
});

app.get('/api/test', async (req, res) => {
  try {
    const count = await Candidate.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to count candidates' });
  }
});

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mercor')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
  });
