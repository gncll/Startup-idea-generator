import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { problem, solution, targetAudience, validationPlatforms, timeline } = req.body;

  if (!problem || !solution || !targetAudience || !validationPlatforms?.length || !timeline) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const prompt = `Create a detailed startup idea based on these inputs:
- Problem: ${problem}
- Solution: ${solution}
- Target Audience: ${targetAudience}
- Validation Platforms: ${validationPlatforms.join(', ')}
- Development Timeline: ${timeline} weeks

Return ONLY a valid JSON object with this exact structure:
{
  "name": "Creative and memorable startup name",
  "description": "2-3 sentence compelling business description",
  "sector": "Industry category (e.g., FinTech, HealthTech, EdTech)",
  "revenueModel": "Detailed revenue model with specific pricing tiers",
  "marketSize": "Market size estimation with realistic data and growth potential",
  "competition": "Competition analysis with differentiation opportunities",
  "mvpFeatures": ["Essential feature 1", "Essential feature 2", "Essential feature 3", "Essential feature 4"],
  "tools": {
    "development": ["AI coding tool + cost (e.g., Cursor AI $20/month)", "deployment platform + cost", "version control tool", "database/backend solution"],
    "design": ["design tool + cost (e.g., Figma $12/month)", "analytics tool + cost", "user feedback/testing tool"],
    "operations": ["project management + cost", "communication tool + cost", "business operations tool"]
  },
  "validation": {
    "platforms": ${JSON.stringify(validationPlatforms)},
    "metrics": ["Platform-specific success metrics for each selected platform"],
    "strategy": "Detailed content strategy tailored to the selected platforms, focusing on problem validation before solution promotion. Include specific tactics for each platform."
  },
  "roadmap": [
    ${timeline <= 4 ? `
    {
      "phase": "Week 1: Rapid Validation", 
      "description": "Lightning customer interviews, quick landing page, problem validation",
      "focus": "Validation (80%), basic setup (20%)",
      "budget": "50% of total budget"
    },
    {
      "phase": "Weeks 2-3: Sprint Development",
      "description": "Build core MVP features, basic user testing", 
      "focus": "Development (90%), testing (10%)",
      "budget": "40% of total budget"
    },
    {
      "phase": "Week 4: Launch",
      "description": "Public launch, immediate user feedback, quick iterations",
      "focus": "Launch (60%), optimization (40%)",
      "budget": "10% of total budget"
    }` : `
    {
      "phase": "Weeks 1-${Math.floor(timeline * 0.25)}: Foundation & Validation",
      "description": "Validate problem, build landing page, conduct customer interviews",
      "focus": "Customer research (60%), basic website (20%), competitive analysis (20%)",
      "budget": "40% of total budget"
    },
    {
      "phase": "Weeks ${Math.floor(timeline * 0.25) + 1}-${Math.floor(timeline * 0.5)}: Build & Test",
      "description": "Develop MVP, implement core features, alpha testing with early users",
      "focus": "Product development (70%), user testing (20%), iterations (10%)",
      "budget": "35% of total budget"
    },
    {
      "phase": "Weeks ${Math.floor(timeline * 0.5) + 1}-${Math.floor(timeline * 0.75)}: Scale & Optimize",
      "description": "Beta launch, gather feedback, optimize user experience and onboarding",
      "focus": "Product optimization (40%), marketing content (30%), operations setup (30%)",
      "budget": "20% of total budget"
    },
    {
      "phase": "Weeks ${Math.floor(timeline * 0.75) + 1}-${timeline}: Launch & Growth",
      "description": "Public launch, marketing campaigns, customer acquisition",
      "focus": "Marketing & sales (50%), customer success (30%), product iterations (20%)",
      "budget": "5% of total budget"
    }`}
  ],
  "goToMarket": "Go-to-market strategy focusing on customer acquisition, tailored to the ${timeline}-week timeline",
  "fundingNeeds": "Estimated funding requirements based on ${timeline}-week development timeline"
}

IMPORTANT GUIDELINES:
1. Tailor tool recommendations to the business type and timeline
2. Customize validation strategy specifically for the selected platforms: ${validationPlatforms.join(', ')}
3. Adjust roadmap complexity based on ${timeline}-week timeline
4. Include platform-specific content strategies (e.g., Twitter threads, Instagram visual content, TikTok videos, YouTube tutorials, Reddit discussions, Discord community building)
5. Provide realistic budget allocations that match the timeline
6. Make funding needs proportional to timeline length (shorter = bootstrap friendly, longer = more funding needed)

Make it realistic, actionable, and investable. Focus on practical business insights with specific tools and costs.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Failed to generate idea' });
  }
}
