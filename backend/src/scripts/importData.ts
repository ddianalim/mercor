import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Candidate from '../models/Candidate';

dotenv.config();

async function importData() {
  try {
    // Connect to MongoDB first
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB Atlas');

    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../../form-submissions.json'), 'utf-8'));
    
    // Import in batches of 100
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      await Candidate.insertMany(batch);
      console.log(`Imported ${i + batch.length} of ${data.length} candidates`);
    }

    console.log('Data import completed successfully');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

importData(); 