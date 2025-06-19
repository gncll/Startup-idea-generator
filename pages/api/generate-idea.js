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

Return ONLY a valid JSON object with this exact structure (no markdown formatting, no code blocks, just pure JSON):
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
    "platformStrategies": [
      {
        "platform": "${validationPlatforms[0] || 'Twitter'}",
        "frequency": "Daily posts",
        "strategy": "Share problem-solution insights and user feedback",
        "contentIdeas": ["Before/after user stories", "Problem validation posts", "Solution demo videos", "User testimonials"]
      }
    ]
  },
   "weeklyPlan": [
      {
        "week": 1,
        "focus": "Research & Validation",
        "tasks": ["Customer interviews", "Market research", "Landing page"],
        "deliverables": ["Problem validation", "Basic website"],
        "metrics": "10+ customer interviews"
      },
      {
        "week": ${Math.ceil(timeline/2)},
        "focus": "Build MVP",
        "tasks": ["Core features", "Basic testing", "User feedback"],
        "deliverables": ["Working prototype", "User feedback"],
        "metrics": "MVP with 2-3 key features"
      },
      {
        "week": ${timeline},
        "focus": "Launch & Iterate",
        "tasks": ["Public launch", "Marketing", "User acquisition"],
        "deliverables": ["Live product", "First users"],
        "metrics": "First 100 users"
      }
    ],
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
  "marketingChannels": [
    {
      "channel": "Marketing channel name (e.g., Content Marketing, Influencer Partnerships)",
      "strategy": "Detailed strategy for this channel",
      "budget": "Percentage of marketing budget",
      "timeline": "When to implement (e.g., Week 1-12)"
    }
  ],
  "contentPlan": [
    {
      "type": "Content type (e.g., Educational Videos, User Success Stories)",
      "description": "Detailed description of this content type",
      "frequency": "How often to create (e.g., 3 times per week)",
      "platforms": ["Platform 1", "Platform 2"]
    }
  ],
  "goToMarket": "Comprehensive go-to-market strategy focusing on customer acquisition, tailored to the ${timeline}-week timeline",
  "fundingNeeds": "Estimated funding requirements based on ${timeline}-week development timeline"
}

Keep it concise, actionable, and realistic. Focus on essential business insights.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 2500
    });

    let content = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const result = JSON.parse(content);

    res.status(200).json(result);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Failed to generate idea' });
  }
}
