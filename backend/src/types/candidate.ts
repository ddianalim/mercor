import { Document } from 'mongoose';

export interface WorkExperience {
  company: string;
  roleName: string;
}

export interface Degree {
  degree: string;
  subject: string;
  school: string;
  gpa: string;
  startDate: string;
  endDate: string;
  originalSchool: string;
  isTop50: boolean;
}

export interface Education {
  highest_level: string;
  degrees: Degree[];
}

export interface SalaryExpectation {
  full_time: string;
}

export interface CandidateDocument extends Document {
  name: string;
  email: string;
  phone: string;
  location: string;
  submitted_at: Date;
  work_availability: string[];
  annual_salary_expectation: SalaryExpectation;
  work_experiences: WorkExperience[];
  education: Education;
  skills: string[];
  selected: boolean;
  scores?: {
    relevant_skills: number;
    work_experience: number;
    work_diversity: number;
    education: number;
    salary_fit: number;
    location_diversity: number;
    total: number;
    llm_analysis?: string;
  };
}