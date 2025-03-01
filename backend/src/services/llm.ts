import { Groq } from 'groq-sdk';

const prompt = `Analyze this candidate for a startup:
- Key strengths
- Potential red flags
- Team fit assessment
- Growth potential

Candidate data:
`;

export async function getLLMAnalysis(candidate) {
  const groq = new Groq();
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt + JSON.stringify(candidate) }],
    model: 'mixtral-8x7b-32768',
    temperature: 0.1,
  });
  
  return completion.choices[0].message.content;
} 