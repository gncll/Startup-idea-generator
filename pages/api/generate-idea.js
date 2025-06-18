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
    "platformStrategies": [
      {
        "platform": "Platform name from selected platforms",
        "frequency": "Posting frequency (e.g., 3 videos/week, daily posts)",
        "strategy": "Detailed platform-specific strategy for this business idea",
        "contentIdeas": ["Specific content idea 1", "Specific content idea 2", "Specific content idea 3", "Specific content idea 4"]
      }
    ]
  },
   "weeklyPlan": [
      ${Array.from({length: parseInt(timeline)}, (_, i) => `
      {
        "week": ${i + 1},
        "focus": "Week ${i + 1} specific focus area for this startup idea",
        "tasks": ["Specific actionable task 1 for week ${i + 1}", "Specific actionable task 2 for week ${i + 1}", "Specific actionable task 3 for week ${i + 1}"],
        "deliverables": ["Concrete deliverable 1 for week ${i + 1}", "Concrete deliverable 2 for week ${i + 1}"],
        "metrics": "Measurable success metrics and KPIs for week ${i + 1}"
      }`).join(',\n  ')}
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

CRITICAL REQUIREMENTS:
1. Generate platformStrategies for EACH selected platform: ${validationPlatforms.join(', ')}
2. Create weeklyPlan for ALL ${timeline} weeks (each week should have specific tasks)
3. Tailor all content strategies to the specific business idea (${problem} + ${solution})
4. Include 3-4 marketingChannels appropriate for this business type
5. Provide 3-4 contentPlan types that align with selected platforms
6. Make all strategies actionable and specific to this startup idea

PLATFORM-SPECIFIC GUIDELINES:
- Twitter: Focus on threads, polls, engagement tactics
- Instagram: Visual content, stories, reels, influencer collaborations
- TikTok: Short-form videos, trending hashtags, viral potential
- YouTube: Educational content, tutorials, longer-form videos
- Facebook: Community building, groups, targeted advertising
- Reddit: Community engagement, AMA sessions, value-first approach
- Discord: Community building, real-time engagement, exclusive access

Make it realistic, actionable, and investable. Focus on practical business insights with specific tools and costs.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 3000
    });

    const result = JSON.parse(response.choices[0].message.content);

    res.status(200).json(result);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Failed to generate idea' });
  }
}
