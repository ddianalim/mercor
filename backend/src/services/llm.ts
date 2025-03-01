import axios from 'axios';
import dotenv from 'dotenv';
import { CandidateDocument } from '../types/candidate';

dotenv.config();

const teamAnalysisPrompt = `Analyze this candidate for a startup:
- Key strengths
- Potential red flags
- Team fit assessment (Note: Team needs at least one US-based member)
- Growth potential

Candidate data:`;

export async function getLLMAnalysis(
  candidate: Record<string, any>,
  selectedCandidates: Record<string, any>[] = []
) {
  try {
    const hasUSTeamMember = selectedCandidates.some(c => c.location === 'United States');
    
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: `${teamAnalysisPrompt}\n${JSON.stringify(candidate)}\nContext: Team currently ${hasUSTeamMember ? 'has' : 'needs'} a US-based member.`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('LLM Analysis error:', error);
    return 'Error analyzing candidate';
  }
} 