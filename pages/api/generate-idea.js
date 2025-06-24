import OpenAI from 'openai';
import { getAuth } from '@clerk/nextjs/server';
import { saveStartupIdea } from '../../lib/database';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'fake-key',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if user is authenticated
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { problem, solution, targetAudience, validationPlatforms, timeline } = req.body;

  if (!problem || !solution || !targetAudience || !validationPlatforms?.length || !timeline) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Only return mock response if OpenAI API key is completely missing
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
    console.log('No OpenAI API key found, returning mock response');
    const mockResponse = {
      "name": "InnovateTech Solutions",
      "description": "A revolutionary platform that transforms how people approach everyday challenges through intelligent automation and user-centric design. Our solution bridges the gap between complex problems and simple, actionable solutions.",
      "sector": "Technology",
      "revenueModel": "Freemium model with basic features free, Pro plan at $29/month, Enterprise at $99/month with custom integrations and priority support",
      "marketSize": "Total addressable market of $15B with 12% annual growth, targeting initial segment of $500M in the first 3 years",
      "competition": "Main competitors include established players, but we differentiate through superior user experience, AI-powered personalization, and 50% faster implementation time",
      "mvpFeatures": ["Core problem-solving engine", "User dashboard and analytics", "Mobile-responsive interface", "Basic integration capabilities"],
      "tools": {
        "development": ["Cursor AI $20/month", "Vercel Pro $20/month", "GitHub Pro $4/month", "Supabase Pro $25/month"],
        "design": ["Figma Professional $12/month", "Google Analytics Free", "Hotjar $32/month"],
        "operations": ["Notion Team $8/month", "Slack Pro $7.25/month", "Stripe 2.9% + 30¢ per transaction"]
      },
      "validation": {
        "platforms": validationPlatforms,
        "metrics": ["Engagement rate >5%", "Sign-up conversion >2%", "User retention >40% week 1"],
        "platformStrategies": [
          {
            "platform": validationPlatforms[0] || "Twitter",
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
          "week": Math.ceil(timeline/2),
          "focus": "Build MVP",
          "tasks": ["Core features", "Basic testing", "User feedback"],
          "deliverables": ["Working prototype", "User feedback"],
          "metrics": "MVP with 2-3 key features"
        },
        {
          "week": timeline,
          "focus": "Launch & Iterate",
          "tasks": ["Public launch", "Marketing", "User acquisition"],
          "deliverables": ["Live product", "First users"],
          "metrics": "First 100 users"
        }
      ],
      "roadmap": [
        {
          "phase": "Week 1: Foundation & Validation",
          "description": "Validate problem, build landing page, conduct customer interviews",
          "focus": "Customer research (60%), basic website (20%), competitive analysis (20%)",
          "budget": "40% of total budget"
        },
        {
          "phase": `Weeks 2-${Math.floor(timeline * 0.7)}: Build & Test`,
          "description": "Develop MVP, implement core features, alpha testing with early users",
          "focus": "Product development (70%), user testing (20%), iterations (10%)",
          "budget": "35% of total budget"
        },
        {
          "phase": `Weeks ${Math.floor(timeline * 0.7) + 1}-${timeline}: Launch & Growth`,
          "description": "Public launch, marketing campaigns, customer acquisition",
          "focus": "Marketing & sales (50%), customer success (30%), product iterations (20%)",
          "budget": "25% of total budget"
        }
      ],
      "marketingChannels": [
        {
          "channel": "Content Marketing",
          "strategy": "Create valuable content addressing target audience pain points",
          "budget": "40% of marketing budget",
          "timeline": "Week 1-12"
        },
        {
          "channel": "Social Media Marketing",
          "strategy": "Build community and engage with potential customers daily",
          "budget": "30% of marketing budget", 
          "timeline": "Week 2-12"
        }
      ],
      "contentPlan": [
        {
          "type": "Educational Videos",
          "description": "Short-form videos explaining key concepts and solutions",
          "frequency": "3 times per week",
          "platforms": ["YouTube", "TikTok", "Instagram"]
        },
        {
          "type": "User Success Stories",
          "description": "Case studies and testimonials from early adopters",
          "frequency": "2 times per week",
          "platforms": ["LinkedIn", "Twitter", "Blog"]
        }
      ],
      "goToMarket": `Comprehensive ${timeline}-week go-to-market strategy focusing on organic growth through content marketing, strategic partnerships, and community building. Phase 1: Build awareness through thought leadership content. Phase 2: Convert audience through free tools and valuable resources. Phase 3: Scale through referrals and strategic partnerships.`,
      "fundingNeeds": `Estimated $${15000 + (timeline * 2000)} needed for ${timeline}-week development cycle, covering development tools, marketing budget, and operational expenses`
    };

    // Add user inputs to mock response
    mockResponse.userInputs = {
      problem,
      solution,
      targetAudience,
      validationPlatforms,
      timeline
    };

    return res.status(200).json(mockResponse);
  }

  try {
    console.log('Using OpenAI API with key:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');
    
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

    // Add user inputs to the response for context
    result.userInputs = {
      problem,
      solution,
      targetAudience,
      validationPlatforms,
      timeline
    };

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