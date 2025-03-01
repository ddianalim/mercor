import mongoose from 'mongoose';

interface WorkExperience {
  company: string;
  roleName: string;
}

interface Degree {
  degree: string;
  subject: string;
  school: string;
  gpa: string;
  startDate: string;
  endDate: string;
  originalSchool: string;
  isTop50: boolean;
}

const candidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  location: String,
  submitted_at: Date,
  work_availability: [String],
  annual_salary_expectation: {
    full_time: String
  },
  work_experiences: [{
    company: String,
    roleName: String
  }],
  education: {
    highest_level: String,
    degrees: [{
      degree: String,
      subject: String,
      school: String,
      gpa: String,
      startDate: String,
      endDate: String,
      originalSchool: String,
      isTop50: Boolean
    }]
  },
  skills: [String],
  selected: {
    type: Boolean,
    default: false
  },
  scores: {
    relevant_skills: Number,    // 35%
    work_experience: Number,    // 25%
    work_diversity: Number,     // 15%
    education: Number,          // 10%
    salary_fit: Number,        // 10%
    location_diversity: Number, // 5%
    total: Number,
    llm_analysis: String       // Store LLM insights
  }
});

export default mongoose.model('Candidate', candidateSchema);