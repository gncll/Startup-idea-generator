import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Vercel timeout için maksimum süre
export const config = {
  maxDuration: 60, // 60 saniye
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { problem, solution, targetAudience, validationPlatforms, timeline } = req.body;

  if (!problem || !solution || !targetAudience || !validationPlatforms?.length || !timeline) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Daha kısa ve optimize edilmiş prompt
    const prompt = `Create a startup idea JSON based on these inputs:
Problem: ${problem}
Solution: ${solution}
Target Audience: ${targetAudience}
Platforms: ${validationPlatforms.join(', ')}
Timeline: ${timeline} weeks

Return ONLY valid JSON:
{
  "name": "Startup name",
  "description": "Brief business description",
  "sector": "Industry category",
  "revenueModel": "Revenue model with pricing",
  "marketSize": "Market size estimation",
  "competition": "Competition analysis",
  "mvpFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  "tools": {
    "development": ["Tool 1 + cost", "Tool 2 + cost", "Tool 3", "Tool 4"],
    "design": ["Design tool + cost", "Analytics tool", "Testing tool"],
    "operations": ["PM tool + cost", "Communication tool", "Business tool"]
  },
  "validation": {
    "platforms": ${JSON.stringify(validationPlatforms)},
    "metrics": ["Success metric 1", "Success metric 2"],
    "platformStrategies": [
      {
        "platform": "${validationPlatforms[0] || 'Twitter'}",
        "frequency": "Posting frequency",
        "strategy": "Platform strategy",
        "contentIdeas": ["Content 1", "Content 2", "Content 3"]
      }
    ]
  },
  "weeklyPlan": [
    ${Array.from({length: Math.min(parseInt(timeline), 8)}, (_, i) => `{
      "week": ${i + 1},
      "focus": "Week ${i + 1} focus",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "deliverables": ["Deliverable 1", "Deliverable 2"],
      "metrics": "Week ${i + 1} metrics"
    }`).join(', ')}
  ],
  "roadmap": [
    {
      "phase": "Phase 1: Validation",
      "description": "Validate and setup",
      "focus": "Research and validation",
      "budget": "40%"
    },
    {
      "phase": "Phase 2: Development",
      "description": "Build MVP",
      "focus": "Product development",
      "budget": "35%"
    },
    {
      "phase": "Phase 3: Launch",
      "description": "Launch and optimize",
      "focus": "Marketing and growth",
      "budget": "25%"
    }
  ],
  "marketingChannels": [
    {
      "channel": "Primary channel",
      "strategy": "Channel strategy",
      "budget": "40%",
      "timeline": "Week 1-${timeline}"
    },
    {
      "channel": "Secondary channel",
      "strategy": "Channel strategy",
      "budget": "30%",
      "timeline": "Week 2-${timeline}"
    }
  ],
  "contentPlan": [
    {
      "type": "Content type 1",
      "description": "Content description",
      "frequency": "3 times per week",
      "platforms": ["${validationPlatforms[0] || 'Twitter'}"]
    },
    {
      "type": "Content type 2",
      "description": "Content description",
      "frequency": "Weekly",
      "platforms": ["${validationPlatforms[1] || 'Instagram'}"]
    }
  ],
  "goToMarket": "Go-to-market strategy for ${timeline}-week timeline",
  "fundingNeeds": "Funding requirements for ${timeline}-week development"
}`;

    // Timeout kontrolü ile API çağrısı
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 saniye timeout

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Daha hızlı model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000, // Azaltılmış token limiti
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    let result;
    try {
      result = JSON.parse(response.choices[0].message.content);
    } catch (parseError) {
      // JSON parse hatası durumunda basit bir fallback
      result = {
        name: `${solution} Startup`,
        description: `A startup focused on solving ${problem} for ${targetAudience}`,
        sector: "Technology",
        error: "Generated content parsing failed, showing basic structure"
      };
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.name === 'AbortError') {
      return res.status(408).json({ error: 'Request timeout - please try again' });
    }
    
    // Fallback response
    const fallbackResult = {
      name: `${solution} Startup`,
      description: `A startup idea focused on ${problem} targeting ${targetAudience}`,
      sector: "Technology",
      revenueModel: "Subscription-based model with tiered pricing",
      marketSize: "Growing market with significant potential",
      competition: "Competitive landscape analysis needed",
      mvpFeatures: ["Core feature 1", "Core feature 2", "Core feature 3", "User dashboard"],
      tools: {
        development: ["Cursor AI $20/month", "Vercel $20/month", "GitHub Free", "Supabase $25/month"],
        design: ["Figma $12/month", "Google Analytics Free", "Hotjar $32/month"],
        operations: ["Notion $8/month", "Slack Free", "Stripe 2.9%"]
      },
      validation: {
        platforms: validationPlatforms,
        metrics: ["User engagement", "Conversion rate"],
        platformStrategies: validationPlatforms.map(platform => ({
          platform,
          frequency: "3 times per week",
          strategy: `Engage audience on ${platform} with valuable content`,
          contentIdeas: ["Educational content", "Behind the scenes", "User stories"]
        }))
      },
      weeklyPlan: Array.from({length: Math.min(parseInt(timeline), 4)}, (_, i) => ({
        week: i + 1,
        focus: `Week ${i + 1}: ${i === 0 ? 'Planning' : i === 1 ? 'Development' : i === 2 ? 'Testing' : 'Launch'}`,
        tasks: [`Task 1 for week ${i + 1}`, `Task 2 for week ${i + 1}`, `Task 3 for week ${i + 1}`],
        deliverables: [`Deliverable 1`, `Deliverable 2`],
        metrics: `Week ${i + 1} success metrics`
      })),
      roadmap: [
        {
          phase: "Phase 1: Foundation",
          description: "Setup and validation",
          focus: "Market research and MVP planning",
          budget: "40%"
        },
        {
          phase: "Phase 2: Development",
          description: "Build and test MVP",
          focus: "Product development and testing",
          budget: "35%"
        },
        {
          phase: "Phase 3: Launch",
          description: "Go to market",
          focus: "Marketing and user acquisition",
          budget: "25%"
        }
      ],
      marketingChannels: [
        {
          channel: "Content Marketing",
          strategy: "Create valuable content for target audience",
          budget: "40%",
          timeline: `Week 1-${timeline}`
        },
        {
          channel: "Social Media",
          strategy: "Build community on selected platforms",
          budget: "35%",
          timeline: `Week 2-${timeline}`
        }
      ],
      contentPlan: [
        {
          type: "Educational Content",
          description: "Share knowledge and insights",
          frequency: "3 times per week",
          platforms: validationPlatforms.slice(0, 2)
        }
      ],
      goToMarket: `Focus on ${validationPlatforms.join(' and ')} for initial traction over ${timeline} weeks`,
      fundingNeeds: `Estimated $5,000-15,000 for ${timeline}-week development cycle`,
      fallback: true
    };
    
    res.status(200).json(fallbackResult);
  }
}
