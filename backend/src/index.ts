import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Candidate from './models/Candidate';
import { calculateCandidateScore } from './services/scoring';
import { CandidateDocument } from './types/candidate';
import { getLLMAnalysis } from './services/llm';

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

// Get all candidates with optional filters
app.get('/api/candidates', async (req, res) => {
  try {
    const { skills, location } = req.query;
    let query = {};
    
    if (skills) {
      query = { ...query, skills: { $in: [skills].flat() } };
    }
    
    if (location) {
      query = { ...query, location };
    }
    
    const selectedCandidates = await Candidate.find({ selected: true }).lean();
    const candidates = await Candidate.find(query).lean();
    
    const scoredCandidates = await Promise.all(candidates.map(async (candidate) => {
      const scores = await calculateCandidateScore(candidate as any, selectedCandidates);
      return {
        ...candidate,
        scores
      };
    }));
    
    res.json(scoredCandidates.sort((a, b) => 
      (b.scores?.total || 0) - (a.scores?.total || 0)
    ));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Get selected candidates
app.get('/api/selected', async (req, res) => {
  try {
    const selected = await Candidate.find({ selected: true });
    res.json(selected);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch selected candidates' });
  }
});

// Select a candidate
app.post("/api/select/:id", async (req, res) => {
  try {
    const selectedCount = await Candidate.countDocuments({ selected: true });
    if (selectedCount >= 5) {
      return res
        .status(400)
        .json({ error: "Maximum 5 candidates can be selected" });
    }

    await Candidate.findByIdAndUpdate(req.params.id, { selected: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to select candidate" });
  }
});

// Deselect a candidate
app.post("/api/deselect/:id", async (req, res) => {
  try {
    await Candidate.findByIdAndUpdate(req.params.id, { selected: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to deselect candidate" });
  }
});

app.post('/api/analyze/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).lean();
    const { selectedCandidates } = req.body;
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const analysis = await getLLMAnalysis(candidate, selectedCandidates);
    
    // Cache the analysis in the database
    await Candidate.findByIdAndUpdate(req.params.id, {
      'scores.llm_analysis': analysis
    });

    res.json({ analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze candidate' });
  }
});

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mercor')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  });
