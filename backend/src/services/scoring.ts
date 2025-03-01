import { Candidate } from '../models/Candidate';

const STARTUP_TECH_SKILLS = [
  // Frontend
  'react', 'next js', 'angular', 'vue js', 'typescript', 'javascript', 'html/css', 'redux', 'bootstrap', 'jest',
  // Backend
  'node js', 'express', 'java', 'python', 'c#', 'php', 'rust', 'django', 'laravel', 'spring boot',
  // Data
  'mongodb', 'postgresql', 'sql', 'redis', 'hadoop', 'rabbitmq', 'pandas', 'seaborn', 'matplotlib',
  // Cloud & DevOps
  'aws', 'amazon web services', 'azure', 'google cloud platform',
  'docker', 'kubernetes', 'terraform', 'jenkins', 'circleci',
  // AI/ML
  'tensorflow', 'pytorch', 'nlp', 'machine learning', 'deep learning',
  // Data Analysis
  'power bi', 'tableau', 'excel', 'r', 'data analysis',
  // Mobile
  'react native', 'flutter', 'kotlin', 'swift', 'ios'
];

const STARTUP_DOMAIN_SKILLS = [
  // Architecture
  'microservices', 'rest apis', 'graphql', 'grpc', 'system design',
  // Development Practices
  'agile', 'ci/cd', 'devops', 'test driven development',
  // Data Engineering
  'data analysis', 'etl', 'web scraping', 'data pipeline',
  // Security
  'oauth', 'gdpr compliance', 'security',
  // IoT & Specialized
  'iot', 'blockchain', 'computer vision'
];

const LEADERSHIP_KEYWORDS = [
  'lead', 'senior', 'architect', 'founder', 'manager'
];

const SALARY_RANGES = {
  JUNIOR: [70000, 100000],
  MID: [90000, 130000],
  SENIOR: [120000, 180000]
};

const LOCATION_PREFERENCES = {
  PRIMARY: ['United States'], // Need at least one
  SECONDARY: ['United Kingdom', 'Canada', 'Australia'], // Good for timezone overlap
  TERTIARY: ['India', 'Singapore', 'Germany', 'Netherlands'] // Tech hubs
};

export function calculateCandidateScore(candidate: any) {
  const scores = {
    relevant_skills: calculateSkillsScore(candidate.skills),         // 35%
    work_experience: calculateExperienceScore(candidate.work_experiences), // 25%
    work_diversity: calculateWorkDiversityScore(candidate.work_experiences), // 15%
    education: calculateEducationScore(candidate.education),         // 10%
    salary_fit: calculateSalaryFitScore(candidate.annual_salary_expectation, candidate.work_experiences), // 10%
    location_diversity: calculateLocationScore(candidate.location),   // 5%
  };

  return {
    ...scores,
    total: (
      scores.relevant_skills * 0.35 +
      scores.work_experience * 0.25 +
      scores.work_diversity * 0.15 +
      scores.education * 0.10 +
      scores.salary_fit * 0.10 +
      scores.location_diversity * 0.05
    ) * 100
  };
}

export async function scoreCandidate(candidate) {
  const scores = {
    relevant_skills: calculateSkillsScore(candidate.skills),
    work_experience: calculateExperienceScore(candidate.work_experiences),
    work_diversity: calculateWorkDiversityScore(candidate.work_experiences),
    education: calculateEducationScore(candidate.education),
    salary_fit: calculateSalaryFitScore(candidate.annual_salary_expectation, candidate.work_experiences),
    location_diversity: calculateLocationScore(candidate.location)
  };
  
  scores.total = weightedTotal(scores);
  scores.llm_analysis = await getLLMAnalysis(candidate);
  
  return scores;
}

function calculateSkillsScore(skills: string[]): number {
  const normalizedSkills = skills.map(s => s.toLowerCase());
  
  // Calculate tech skills match (70% of skills score)
  const techSkillsCount = STARTUP_TECH_SKILLS.filter(skill => 
    normalizedSkills.some(s => s.includes(skill.toLowerCase()))
  ).length;
  const techScore = (techSkillsCount / Math.min(STARTUP_TECH_SKILLS.length, 10)) * 0.7;
  
  // Calculate domain skills match (30% of skills score)
  const domainSkillsCount = STARTUP_DOMAIN_SKILLS.filter(skill =>
    normalizedSkills.some(s => s.includes(skill.toLowerCase()))
  ).length;
  const domainScore = (domainSkillsCount / Math.min(STARTUP_DOMAIN_SKILLS.length, 5)) * 0.3;
  
  return techScore + domainScore;
}

function calculateExperienceScore(experiences: any[]): number {
  // Leadership Score (40% of experience score)
  const leadershipScore = experiences.some(exp => 
    LEADERSHIP_KEYWORDS.some(keyword => 
      exp.roleName.toLowerCase().includes(keyword)
    )
  ) ? 0.4 : 0;

  // Startup Experience (30% of experience score)
  const hasStartupExp = experiences.some(exp => 
    exp.company.toLowerCase().includes('startup') || 
    exp.company.toLowerCase().includes('tech') ||
    exp.roleName.toLowerCase().includes('founder')
  );
  const startupScore = hasStartupExp ? 0.3 : 0;

  // Years of Experience (30% of experience score)
  const experienceScore = Math.min(experiences.length / 5, 1) * 0.3;

  return leadershipScore + startupScore + experienceScore;
}

function calculateWorkDiversityScore(experiences: any[]): number {
  const roleCategories = {
    technical: ['developer', 'engineer', 'architect', 'programmer', 'full stack'],
    data: ['data scientist', 'analyst', 'ml', 'ai'],
    management: ['lead', 'manager', 'founder', 'director'],
    product: ['product', 'project manager', 'scrum master']
  };

  // Count unique role categories
  const uniqueCategories = new Set();
  experiences.forEach(exp => {
    const roleLower = exp.roleName.toLowerCase();
    for (const [category, keywords] of Object.entries(roleCategories)) {
      if (keywords.some(keyword => roleLower.includes(keyword))) {
        uniqueCategories.add(category);
      }
    }
  });

  // Score based on diversity (max score for 3+ categories)
  return Math.min(uniqueCategories.size / 3, 1);
}

function calculateEducationScore(education: any): number {
  if (!education || !education.degrees || education.degrees.length === 0) {
    return 0;
  }

  // Degree Level Score (35%)
  const degreeScores = {
    "PhD": 1,
    "Master's Degree": 0.8,
    "Bachelor's Degree": 0.6,
    "Associate's Degree": 0.4
  };
  const highestDegreeScore = Math.max(...education.degrees.map(
    deg => degreeScores[deg.degree] || 0
  )) * 0.35;

  // Relevant Subject Score (35%)
  const relevantSubjects = [
    'computer science', 'software engineering', 'data science',
    'information technology', 'electrical engineering', 'computer engineering'
  ];
  const hasRelevantSubject = education.degrees.some(
    deg => relevantSubjects.some(subject => 
      deg.subject.toLowerCase().includes(subject.toLowerCase())
    )
  );
  const subjectScore = hasRelevantSubject ? 0.35 : 0;

  // School Ranking Score (30%)
  const schoolScore = education.degrees.reduce((score, deg) => {
    if (deg.isTop25) return 0.30;  // Top 25 school
    if (deg.isTop50) return 0.20;  // Top 50 school
    return score;
  }, 0);

  return highestDegreeScore + subjectScore + schoolScore;
}

function calculateSalaryFitScore(salaryExpectation: any, workExperiences: any[]): number {
  if (!salaryExpectation?.full_time) return 0;
  
  // Clean the salary string and convert to number
  const expectedSalary = Number(salaryExpectation.full_time.replace(/[^0-9]/g, ''));
  
  // Determine level based on experience
  const yearsOfExperience = workExperiences.length;
  let range;
  if (yearsOfExperience > 7) {
    range = SALARY_RANGES.SENIOR;
  } else if (yearsOfExperience > 3) {
    range = SALARY_RANGES.MID;
  } else {
    range = SALARY_RANGES.JUNIOR;
  }

  // Perfect score if within range
  if (expectedSalary >= range[0] && expectedSalary <= range[1]) {
    return 1;
  }
  
  // Slightly lower score if below range (potential bargain)
  if (expectedSalary < range[0]) {
    return 0.8;
  }
  
  // Penalty if significantly above range
  if (expectedSalary > range[1]) {
    const overagePercent = (expectedSalary - range[1]) / range[1];
    return Math.max(0, 1 - overagePercent);
  }
  
  return 0;
}

function calculateLocationScore(location: string, selectedCandidates: Candidate[] = []): number {
  if (!location) return 0;
  
  // Check if we need a US candidate
  const hasUSCandidate = selectedCandidates.some(c => c.location === 'United States');
  
  if (!hasUSCandidate && location === 'United States') {
    return 1; // Prioritize US candidates if we don't have one
  }

  // Score based on location tiers
  if (LOCATION_PREFERENCES.PRIMARY.includes(location)) return 0.9;
  if (LOCATION_PREFERENCES.SECONDARY.includes(location)) return 0.7;
  if (LOCATION_PREFERENCES.TERTIARY.includes(location)) return 0.5;
  
  return 0.3; // Other locations
}

// Update the LLM prompt to consider US requirement
const teamAnalysisPrompt = `
Analyze this candidate for a startup:
- Key strengths
- Potential red flags
- Team fit assessment (Note: Team needs at least one US-based member)
- Growth potential
- Location impact (timezone collaboration, visa requirements)

Candidate data:
`;

export async function getLLMAnalysis(candidate: any, selectedCandidates: Candidate[] = []) {
  const hasUSTeamMember = selectedCandidates.some(c => c.location === 'United States');
  
  const groq = new Groq();
  const completion = await groq.chat.completions.create({
    messages: [{ 
      role: 'user', 
      content: teamAnalysisPrompt + 
        JSON.stringify(candidate) + 
        `\nContext: Team currently ${hasUSTeamMember ? 'has' : 'needs'} a US-based member.`
    }],
    model: 'mixtral-8x7b-32768',
    temperature: 0.1,
  });
  
  return completion.choices[0].message.content;
} 