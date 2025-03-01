import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  skills: [String],
  experience: String,
  location: String,
  // Add other fields based on your form-submissions.json
});

export default mongoose.model('Candidate', candidateSchema);