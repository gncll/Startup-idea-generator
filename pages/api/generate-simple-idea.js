import OpenAI from 'openai';
import { saveUsageCount, getUsageCount } from '../../lib/database';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mock response for when OpenAI API key is not available
const generateMockResponse = (problem, solution) => {
  const sectors = ['HealthTech', 'FinTech', 'EdTech', 'SaaS', 'E-commerce', 'FoodTech', 'PropTech'];
  const randomSector = sectors[Math.floor(Math.random() * sectors.length)];
  
  return {
    name: `${solution.split(' ').slice(0, 2).join('')}Pro`,
    description: `A innovative ${randomSector.toLowerCase()} solution that addresses ${problem.toLowerCase()} through ${solution.toLowerCase()}. This platform combines modern technology with user-centric design to deliver exceptional value.`,
    sector: randomSector,
    revenueModel: "Freemium model with basic features free and premium subscriptions starting at $19/month for advanced features and analytics.",
    targetMarket: "Early adopters and tech-savvy users aged 25-45 who value efficiency and are willing to pay for quality solutions. Estimated market size of $2-5B globally.",
    nextSteps: "1) Create landing page and collect email signups 2) Build MVP with core features 3) Launch beta with 50-100 early users and gather feedback"
  };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { problem, solution, sessionId } = req.body;

  if (!problem || !solution || !sessionId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check usage limit
  try {
    const currentUsage = await getUsageCount(sessionId);
    if (currentUsage >= 10) {
      return res.status(429).json({ 
        error: 'Usage limit reached. Please sign up for unlimited access.',
        usageCount: currentUsage 
      });
    }
  } catch (error) {
    console.error('Error checking usage count:', error);
    // Continue if database check fails
  }

  // Only return mock response if OpenAI API key is completely missing
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
    console.log('No OpenAI API key found, returning mock response');
    const mockResponse = generateMockResponse(problem, solution);
    
    // Update usage count for mock response too
    try {
      const currentUsage = await getUsageCount(sessionId);
      await saveUsageCount(sessionId, currentUsage + 1);
      console.log('Usage count updated for session (mock):', sessionId);
    } catch (dbError) {
      console.error('Database usage count error (mock):', dbError);
    }
    
    return res.status(200).json(mockResponse);
  }

  try {
    console.log('Using OpenAI API with key:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');
    
    const prompt = `Create a simple startup idea based on these inputs:
- Problem: ${problem}
- Solution: ${solution}

Return ONLY a valid JSON object with this exact structure (no markdown formatting, no code blocks, just pure JSON):
{
  "name": "Creative and memorable startup name",
  "description": "2-3 sentence compelling business description",
  "sector": "Industry category (e.g., FinTech, HealthTech, EdTech, SaaS, E-commerce)",
  "revenueModel": "Simple revenue model explanation (1-2 sentences)",
  "targetMarket": "Who would use this and market size estimation (1-2 sentences)",
  "nextSteps": "3 immediate actionable next steps to validate and start this idea (1-2 sentences)"
}

Keep it concise, actionable, and realistic. Focus on essential business insights only.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800
    });

    let content = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const result = JSON.parse(content);

    // Update usage count
    try {
      const currentUsage = await getUsageCount(sessionId);
      await saveUsageCount(sessionId, currentUsage + 1);
      console.log('Usage count updated for session:', sessionId);
    } catch (dbError) {
      console.error('Database usage count error:', dbError);
      // Continue with response even if database update fails
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Return proper error instead of mock response
    return res.status(500).json({ 
      error: 'Failed to generate idea. Please check your OpenAI API key configuration.',
      details: error.message 
    });
  }
} 