import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { problem, solution, targetAudience } = req.body;

  if (!problem || !solution || !targetAudience) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const prompt = `Create a detailed startup idea based on these inputs:
- Problem: ${problem}
- Solution: ${solution}
- Target Audience: ${targetAudience}

Return ONLY a valid JSON object with this exact structure:
{
  "name": "Creative and memorable startup name",
  "description": "2-3 sentence compelling business description",
  "sector": "Industry category (e.g., FinTech, HealthTech, EdTech)",
  "revenueModel": "Detailed revenue model with specific pricing tiers",
  "marketSize": "Market size estimation with realistic data and growth potential",
  "competition": "Competition analysis with differentiation opportunities",
  "mvpFeatures": ["Essential feature 1", "Essential feature 2", "Essential feature 3", "Essential feature 4"],
  "goToMarket": "Go-to-market strategy focusing on customer acquisition",
  "fundingNeeds": "Estimated funding requirements for first 18 months"
}

Make it realistic, actionable, and investable. Focus on practical business insights.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 1500
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Failed to generate idea' });
  }
}
