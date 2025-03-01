import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Candidate from '../models/Candidate';

async function importData() {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../../form-submissions.json'), 'utf-8'));
    await Candidate.insertMany(data);
    console.log('Data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
  }
  process.exit();
}

importData(); 